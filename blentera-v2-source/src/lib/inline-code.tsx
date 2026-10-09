import { Mono } from '@/components/mono'

// Renders `backticked` spans of a plain string as inline code, so one string can feed the page and its JSON-LD.
export function withInlineCode(text: string) {
  let offset = 0
  return text.split(/(`[^`]+`)/).map((part) => {
    const start = offset
    offset += part.length
    return part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
      <Mono key={start}>{part.slice(1, -1)}</Mono>
    ) : (
      part
    )
  })
}

export function stripInlineCode(text: string) {
  return text.replaceAll('`', '')
}
