export const config = { runtime: 'edge' }

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default function handler(req: Request): Response {
  const url    = new URL(req.url)
  const name   = url.searchParams.get('for') ?? ''
  const token  = url.searchParams.get('t')   ?? ''
  const origin = url.origin

  const dest = new URL(origin)
  dest.searchParams.set('suggest', '1')
  if (token) dest.searchParams.set('t', token)
  if (name)  dest.searchParams.set('for', name)
  const redirectUrl  = dest.toString()
  const safeRedirect = escapeHtml(redirectUrl)

  const safeName    = escapeHtml(name)
  const title       = safeName ? `Suggest a book for ${safeName}` : 'Suggest a book'
  const description = safeName
    ? `${safeName} is collecting book recommendations on Could Reads. Pin one to her stack.`
    : 'Pin a book recommendation to this reading stack on Could Reads.'
  const imageUrl = `${origin}/og-image.png`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <meta property="og:type"         content="website"/>
  <meta property="og:url"          content="${escapeHtml(req.url)}"/>
  <meta property="og:title"        content="${title}"/>
  <meta property="og:description"  content="${description}"/>
  <meta property="og:image"        content="${imageUrl}"/>
  <meta property="og:image:type"   content="image/png"/>
  <meta property="og:image:width"  content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  <meta name="twitter:image"       content="${imageUrl}"/>
  <meta http-equiv="refresh" content="0;url=${safeRedirect}"/>
  <script>window.location.replace(${JSON.stringify(redirectUrl)})</script>
</head>
<body></body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
