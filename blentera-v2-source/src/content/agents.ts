import {
  BookOpenCheckIcon,
  BotIcon,
  GitPullRequestArrowIcon,
  type LucideIcon,
  ShieldCheckIcon,
} from 'lucide-react'

export const agents = {
  eyebrow: { icon: BotIcon, lead: 'Built For', emphasis: 'Coding Agents' },
  title: 'Your Agent Already Knows The Rules',
  description:
    'Claude Code, Codex and Cursor read the same conventions, so a page they add is prerendered, complete and tested like the rest.',
  points: [
    {
      icon: BookOpenCheckIcon,
      title: 'One Rulebook',
      description:
        '`CLAUDE.md` holds every convention, from content files to motion, and `AGENTS.md` points every other agent to it.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Checks That Catch Drift',
      description:
        'Lint and format run on every commit and the full suite on every push, so a slip fails fast.',
    },
    {
      icon: GitPullRequestArrowIcon,
      title: 'The Same Gate In CI',
      description:
        'Every pull request runs the full suite before it can merge, whoever or whatever wrote it.',
    },
  ] satisfies { icon: LucideIcon; title: string; description: string }[],
}
