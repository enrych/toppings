export interface WebAppURL {
  href: string
  origin: string
  protocol: string
  route: string[]
  searchParams: URLSearchParams
}

export function parseWebAppURL (href: string): WebAppURL {
  const url = new URL(href)
  const pathname = url.pathname.substring(1)
  const route = pathname.split('/')

  return {
    href: url.href,
    origin: url.origin,
    protocol: url.protocol,
    route,
    searchParams: url.searchParams
  }
}
