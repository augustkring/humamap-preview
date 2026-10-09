import { describe, expect, it } from 'vitest'

import { faqPageSchema } from '@/lib/structured-data'

describe('faqPageSchema', () => {
  it('gives each answer the text the page shows, without the inline-code backticks', () => {
    const schema = faqPageSchema([{ question: 'Where is the copy?', answer: 'In `src/content/`.' }])

    expect(schema.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'Where is the copy?',
        acceptedAnswer: { '@type': 'Answer', text: 'In src/content/.' },
      },
    ])
  })
})
