export const config = { runtime: 'edge' }

// Social media / messaging bots that scrape OG tags
const BOT_UAS = [
  'Twitterbot', 'facebookexternalhit', 'LinkedInBot',
  'WhatsApp', 'Slackbot', 'TelegramBot', 'Discordbot',
  'iMessage', 'Applebot', 'curl', 'python-requests',
]

export default function handler(req: Request): Response {
  const url    = new URL(req.url)
  const name   = url.searchParams.get('for') ?? ''
  const token  = url.searchParams.get('t')   ?? ''
  const ua     = req.headers.get('user-agent') ?? ''
  const origin = url.origin

  const isBot = BOT_UAS.some(b => ua.includes(b))

  if (!isBot) {
    // Regular browser — redirect to the SPA suggest view
    const dest = new URL(origin)
    dest.searchParams.set('suggest', '1')
    if (token) dest.searchParams.set('t', token)
    if (name)  dest.searchParams.set('for', name)
    return Response.redirect(dest.toString(), 302)
  }

  // Bot — serve OG preview HTML
  const title = name
    ? `Suggest a book for ${name}`
    : 'Suggest a book'
  const description = name
    ? `${name} is collecting book recommendations on Could Reads. Pin one to her stack.`
    : 'Pin a book recommendation to this reading stack on Could Reads.'
  const imageUrl = `${origin}/api/og-image`
  const pageUrl  = req.url

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <meta property="og:type"        content="website"/>
  <meta property="og:url"         content="${pageUrl}"/>
  <meta property="og:title"       content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image"       content="${imageUrl}"/>
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  <meta name="twitter:image"       content="${imageUrl}"/>
</head>
<body></body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
