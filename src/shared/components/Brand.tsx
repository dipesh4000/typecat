import type { AnchorHTMLAttributes } from 'react'

export function Brand({ className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`brand ${className}`} {...props}>
      <img src="/favicon.svg" alt="" width="36" height="36" />
      <span>TypeCat</span>
    </a>
  )
}
