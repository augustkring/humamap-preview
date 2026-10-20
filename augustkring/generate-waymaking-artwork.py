#!/usr/bin/env python3
"""Build static ink-road assets from the repo's licensed dry-brush source.

Uses the existing MIT source, but performs pigment resampling offline instead
of warping pixels in the browser. Output PNGs are intentional release assets.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "assets/waymaking-dry-brush.png"
ORIGINAL = np.asarray(Image.open(SOURCE).convert("RGBA"), dtype=np.float32)
ALPHA = ORIGINAL[:, :, 3] / 255.0
LUMA = (ORIGINAL[:, :, :3] / 255.0).mean(axis=2)
BRUSH = np.clip(ALPHA * (1.0 - 0.74 * LUMA), 0, 1).astype("float32")

SOURCE_X0 = 38
SOURCE_X1 = 2127
SOURCE_MID_Y = 343.0


def paint(mobile: bool) -> None:
    width, height = (276, 6000) if mobile else (504, 4920)
    scale = width / (92 if mobile else 168)
    yy = np.arange(height, dtype=np.float32)[:, None]
    xx = np.arange(width, dtype=np.float32)[None, :]
    t = yy / height

    # One calm S-curve, with consistent two-lane road geometry.
    centre = (
        0.50
        + (0.125 if mobile else 0.145) * np.sin(2 * np.pi * t - 0.74)
        + 0.021 * np.sin(4 * np.pi * t + 0.18)
    ) * width
    half_road = (0.16 + 0.005 * np.sin(6 * np.pi * t)) * width
    alpha_field = np.zeros((height, width), dtype=np.float32)

    def stroke(
        curve: np.ndarray,
        start: float,
        end: float,
        sigma: float,
        opacity: float,
        reverse: bool,
        phase: float,
    ) -> None:
        nonlocal alpha_field
        progress = (t - start) / (end - start)
        active = (progress >= 0) & (progress <= 1)
        progress = np.where(active, progress, 0)

        source_x = (
            SOURCE_X1 - (SOURCE_X1 - SOURCE_X0) * progress
            if reverse
            else SOURCE_X0 + (SOURCE_X1 - SOURCE_X0) * progress
        )
        map_x = np.broadcast_to(source_x, (height, width)).astype(np.float32)

        brush_sigma = sigma * (1 + 0.09 * np.sin(t * 18.8 + phase)) * scale
        irregularity = (
            np.sin(t * 31.0 + phase) * (0.35 * scale)
            + np.sin(t * 83.0 + phase * 3) * (0.18 * scale)
        )
        map_y = (
            SOURCE_MID_Y
            + (xx - curve - irregularity) * (55.3 / brush_sigma)
        ).astype(np.float32)

        pigment = cv2.remap(
            BRUSH,
            map_x,
            map_y,
            interpolation=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=0,
        )
        pigment *= active.astype(np.float32) * opacity
        # Alpha-over compositing retains dry-brush transparency.
        alpha_field = alpha_field + pigment * (1 - alpha_field)

    for side in (-1, 1):
        edge = centre + side * half_road
        stroke(
            edge, 0, 1, 4.7 if mobile else 5.3,
            0.79, side > 0, 1.1 if side < 0 else 2.9,
        )
        stroke(
            edge + side * scale, 0, 1, 2.8,
            0.24, side < 0, 2.4 if side < 0 else 0.7,
        )

    # Deliberately different lengths, all painted using the original brush.
    centre_marks = [
        (0.069, 0.103),
        (0.187, 0.229),
        (0.319, 0.353),
        (0.453, 0.498),
        (0.590, 0.624),
        (0.731, 0.772),
        (0.858, 0.891),
    ]
    for index, (start, end) in enumerate(centre_marks):
        dash_curve = centre + 0.45 * scale * np.sin(t * 24 + index * 0.7)
        stroke(dash_curve, start, end, 1.7, 0.82, index % 2 == 0, index * 0.67)

    rgba = np.zeros((height, width, 4), dtype=np.uint8)
    rgba[:, :, :3] = (29, 35, 43)
    rgba[:, :, 3] = np.rint(np.clip(alpha_field, 0, 1) * 255).astype(np.uint8)

    filename = (
        "waymaking-ink-road-brush-mobile.png"
        if mobile else "waymaking-ink-road-brush.png"
    )
    output = ROOT / "assets" / filename
    Image.fromarray(rgba, mode="RGBA").save(output, optimize=True)
    print(f"Generated {output.name}: {width}x{height} px, {output.stat().st_size} bytes")


if __name__ == "__main__":
    paint(False)
    paint(True)
