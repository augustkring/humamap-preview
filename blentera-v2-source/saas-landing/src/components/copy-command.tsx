'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

export function CopyCommand({ command, highlight }: { command: string; highlight?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  const start = highlight ? command.lastIndexOf(highlight) : -1

  return (
    <div className="flex w-fit max-w-full items-center gap-2 rounded-lg border bg-linear-to-br from-muted to-background py-1 pr-1 pl-3 font-mono text-xs">
      <span aria-hidden="true" className="text-muted-foreground select-none">
        $
      </span>
      <code className="min-w-0 flex-1 text-left wrap-break-word">
        {highlight && start > -1 ? (
          <>
            <span className="text-muted-foreground">{command.slice(0, start)}</span>
            {/* On a narrow screen the line breaks before the name, never inside it. */}
            <wbr />
            {/* shimmer comes from shadcn's stylesheet and already stops under reduced motion. */}
            <span className="shimmer font-bold whitespace-nowrap shimmer-color-muted-foreground">
              {highlight}
            </span>
            {command.slice(start + highlight.length)}
          </>
        ) : (
          command
        )}
      </code>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={copied ? 'Copied' : 'Copy Command'}
        onClick={() => {
          // The clipboard API is missing outside secure contexts, and a refused write has nothing to show.
          navigator.clipboard?.writeText(command).then(
            () => setCopied(true),
            () => {},
          )
        }}
      >
        {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
      </Button>
      <span role="status" className="sr-only">
        {copied ? 'Copied' : ''}
      </span>
    </div>
  )
}
