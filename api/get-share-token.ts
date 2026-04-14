import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

const supabaseUrl    = process.env.VITE_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const shareToken     = process.env.SHARE_TOKEN ?? ''

export default async function handler(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authHeader.slice(7)
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return new Response('Unauthorized', { status: 401 })

  return new Response(JSON.stringify({ token: shareToken }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
