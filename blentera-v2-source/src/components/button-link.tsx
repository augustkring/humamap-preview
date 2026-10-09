import type { VariantProps } from 'class-variance-authority'

import { SiteLink, type SiteLinkProps } from '@/components/site-link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ButtonLinkProps = Omit<SiteLinkProps, 'className'> & VariantProps<typeof buttonVariants>

// A link styled as a Button. cn resolves the variant's conflicting classes, as Button itself does.
export function ButtonLink({ variant, size, ...props }: ButtonLinkProps) {
  return <SiteLink className={cn(buttonVariants({ variant, size }))} {...props} />
}
