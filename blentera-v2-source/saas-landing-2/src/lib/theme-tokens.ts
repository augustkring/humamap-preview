// The light theme's tokens as written in globals.css, for code that cannot read CSS variables, like the share card.
export function readRootTokens(css: string): Record<string, string> {
  const root = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? ''
  return Object.fromEntries(
    [...root.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
  )
}

// Satori reads no oklch(), so a token becomes sRGB hex; a colour it cannot convert comes back as null.
export function toHex(color: string): string | null {
  if (/^#[\da-f]{6}$/i.test(color)) return color.toLowerCase()

  const match = color.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/)
  if (!match) return null

  // Oklab to linear sRGB, as in the CSS Color 4 reference code.
  const lightness = Number(match[1]) / (match[2] ? 100 : 1)
  const hue = (Number(match[4]) * Math.PI) / 180
  const a = Number(match[3]) * Math.cos(hue)
  const b = Number(match[3]) * Math.sin(hue)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]

  const channels = linear.map((value) => {
    const encoded = value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055
    return Math.round(Math.min(1, Math.max(0, encoded)) * 255)
  })
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}
