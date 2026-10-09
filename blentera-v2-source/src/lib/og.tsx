import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { getSiteUrl } from '@/lib/site-url'
import { readRootTokens, toHex } from '@/lib/theme-tokens'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

// The card's typeface. A preset that changes the font in src/app/layout.tsx needs it changed here too.
const FONT = 'Oxanium'

// The light theme of preset b4Wm, for a token that is missing or cannot be converted.
const FALLBACK = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  'muted-foreground': '#737373',
  border: '#e5e5e5',
  primary: '#171717',
  'primary-foreground': '#fafafa',
}

type Palette = {
  background: string
  foreground: string
  muted: string
  border: string
  primary: string
  primaryForeground: string
  radius: number
}

// Satori resolves no CSS variables, so the card reads the light theme from globals.css and follows a preset like the page.
let palettePromise: Promise<Palette> | null = null

function getPalette(): Promise<Palette> {
  palettePromise ??= readFile(join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8').then(
    (css) => {
      const tokens = readRootTokens(css)
      const colour = (name: keyof typeof FALLBACK) => toHex(tokens[name] ?? '') ?? FALLBACK[name]
      const radius = Number.parseFloat(tokens.radius ?? '')

      return {
        background: colour('background'),
        foreground: colour('foreground'),
        muted: colour('muted-foreground'),
        border: colour('border'),
        primary: colour('primary'),
        primaryForeground: colour('primary-foreground'),
        // The page's radius at 16px a rem, a fifth larger on the 1200px card.
        radius: Number.isFinite(radius) ? Math.round(radius * 19.2) : 12,
      }
    },
  )
  return palettePromise
}

function withAlpha(hex: string, alpha: number): string {
  const [red, green, blue] = [1, 3, 5].map((start) =>
    Number.parseInt(hex.slice(start, start + 2), 16),
  )
  return `rgba(${red},${green},${blue},${alpha})`
}

// An error page is not a font, so a failed response throws and the fonts fall back.
async function fetchOk(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, init)
  if (!response.ok) throw new Error(`${response.status} from ${url}`)
  return response
}

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetchOk(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    // An old user agent gets a TTF, which Satori reads; newer ones get WOFF2, which it does not.
    {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)' },
    },
  ).then((response) => response.text())
  const src = css.match(/src:\s*url\((https:[^)]+)\)/)?.[1]
  if (!src) throw new Error(`Font not found: ${family} ${weight}`)
  return fetchOk(src).then((response) => response.arrayBuffer())
}

type LoadedFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }

let fontsPromise: Promise<LoadedFont[]> | null = null

function getFonts(): Promise<LoadedFont[]> {
  fontsPromise ??= (async () => {
    try {
      const [heading, brand, regular] = await Promise.all([
        loadGoogleFont(FONT, 700),
        loadGoogleFont('Syne', 700),
        loadGoogleFont(FONT, 400),
      ])
      return [
        { name: FONT, data: heading, weight: 700, style: 'normal' },
        { name: 'Syne', data: brand, weight: 700, style: 'normal' },
        { name: FONT, data: regular, weight: 400, style: 'normal' },
      ] satisfies LoadedFont[]
    } catch {
      // A failed font fetch must fall back to the default face, not break the build.
      return []
    }
  })()
  return fontsPromise
}

// The card is drawn at build time, before the site serves anything, so the mark is read off disk.
let markPromise: Promise<string> | null = null

function getMark(): Promise<string> {
  markPromise ??= readFile(join(process.cwd(), 'public', 'brand', '7ovr-mark.svg')).then(
    (svg) => `data:image/svg+xml;base64,${svg.toString('base64')}`,
  )
  return markPromise
}

export type OgImageOptions = {
  title: string
  eyebrow?: string
  description?: string
  cta: string
}

export async function createOgImage({ title, eyebrow, description, cta }: OgImageOptions) {
  const [fonts, mark, palette] = await Promise.all([getFonts(), getMark(), getPalette()])
  const domain = getSiteUrl().replace(/^https?:\/\//, '')

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: palette.background,
        backgroundImage: `radial-gradient(circle at 88% 6%, ${withAlpha(palette.primary, 0.07)}, transparent 42%), radial-gradient(circle at 4% 100%, ${withAlpha(palette.foreground, 0.05)}, transparent 38%)`,
        padding: 72,
        fontFamily: FONT,
        color: palette.foreground,
      }}
    >
      {/* The mark, oversized and faint, so the card reads as 7Ovr even at timeline size. */}
      <img
        src={mark}
        width={520}
        height={520}
        alt=""
        style={{ position: 'absolute', top: 120, right: -110, opacity: 0.06 }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <img src={mark} width={40} height={40} alt="" />
        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 34 }}>7Ovr</span>
        <span style={{ fontSize: 30, color: palette.border }}>/</span>
        <span style={{ fontWeight: 400, fontSize: 28, color: palette.muted }}>Landing</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {eyebrow ? (
          <span style={{ fontWeight: 400, fontSize: 22, letterSpacing: 3, color: palette.muted }}>
            {eyebrow.slice(0, 40).toUpperCase()}
          </span>
        ) : null}
        <span
          style={{
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.08,
            letterSpacing: -2.5,
            maxWidth: 1056,
          }}
        >
          {title}
        </span>
        {description ? (
          <span
            style={{
              fontWeight: 400,
              fontSize: 25,
              lineHeight: 1.45,
              color: palette.muted,
              maxWidth: 1056,
            }}
          >
            {description.slice(0, 120)}
          </span>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: palette.primary,
            color: palette.primaryForeground,
            borderRadius: palette.radius,
            padding: '16px 28px',
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          {cta.slice(0, 36)}
        </div>
        <span style={{ fontWeight: 400, fontSize: 24, color: palette.muted }}>{domain}</span>
      </div>

      {/* A rule along the bottom edge, so the card holds its shape on white timelines. */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 10,
          backgroundImage: `linear-gradient(90deg, ${palette.foreground}, ${palette.border})`,
        }}
      />
    </div>,
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) },
  )
}
