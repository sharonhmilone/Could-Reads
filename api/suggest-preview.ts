export const config = { runtime: 'edge' }

export default function handler(req: Request): Response {
  const url   = new URL(req.url)
  const name  = url.searchParams.get('for') ?? ''
  const token = url.searchParams.get('t')   ?? ''

  const dest = new URL(url.origin)
  dest.searchParams.set('suggest', '1')
  if (token) dest.searchParams.set('t', token)
  if (name)  dest.searchParams.set('for', name)

  return Response.redirect(dest.toString(), 302)
}
