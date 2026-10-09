import { describe, expect, it } from 'vitest'

import { agents } from '@/content/agents'
import { appStarter } from '@/content/app-starter'
import { cta } from '@/content/cta'
import { faq } from '@/content/faq'
import { features } from '@/content/features'
import { hero, stack } from '@/content/hero'
import { footerColumns, footerNote, headerAction, mobileNav } from '@/content/navigation'
import { notFound } from '@/content/not-found'
import { steps } from '@/content/steps'

// Built from code points, so the rule against dashes holds in this file too.
const DASHES = new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`)

// Every string in a piece of content, however deeply it is nested.
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

const sections = [hero, stack, features, steps, agents, appStarter, faq, cta, notFound]

const labels = [
  ...sections.flatMap((section) => ('title' in section ? [section.title] : [])),
  ...sections.flatMap((section) =>
    'eyebrow' in section ? [section.eyebrow.lead, section.eyebrow.emphasis] : [],
  ),
  headerAction.label,
  notFound.action.label,
  appStarter.action.label,
  cta.primaryAction.label,
  cta.secondaryAction.label,
  steps.primaryAction.label,
  steps.secondaryAction.label,
  faq.contact.action.label,
  ...features.items.map((item) => item.title),
  ...features.extras.map((item) => item.title),
  ...steps.items.map((step) => step.title),
  ...agents.points.map((point) => point.title),
  ...mobileNav.map((link) => link.label),
  ...footerColumns.flatMap((column) => [column.title, ...column.links.map((link) => link.label)]),
].filter((label) => label !== hero.title)

describe('content', () => {
  it('never uses an em dash or an en dash', () => {
    const offenders = strings([
      ...sections,
      headerAction,
      mobileNav,
      footerColumns,
      footerNote,
    ]).filter((text) => DASHES.test(text))
    expect(offenders).toEqual([])
  })

  it('writes every label in Title Case', () => {
    const offenders = labels.filter((label) => label.split(' ').some((word) => /^[a-z]/.test(word)))
    expect(offenders).toEqual([])
  })

  // Questions read as sentences, the way a visitor would ask them, on this site and starter.7ovr.com alike.
  it('asks every FAQ question as a sentence', () => {
    const offenders = faq.items
      .map((item) => item.question)
      .filter((question) => {
        const titleCase = question.split(' ').every((word) => !/^[a-z]/.test(word))
        return titleCase || !question.endsWith('?')
      })
    expect(offenders).toEqual([])
  })

  it('emphasises words that are really in the hero headline', () => {
    expect(hero.title).toContain(hero.titleEmphasis)
  })

  it('keeps FAQ questions unique, because each one is its accordion value', () => {
    const questions = faq.items.map((item) => item.question)
    expect(new Set(questions).size).toBe(questions.length)
  })
})
