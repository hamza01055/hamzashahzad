// Portfolio chatbot endpoint: POST /api/chat
// Runs on the server (a Vercel serverless function in production, and the
// Vite dev server locally via vite.config.js), so secrets never reach the browser.
//
// Environment variables:
//   ANTHROPIC_API_KEY    required for AI replies
//   INQUIRY_WEBHOOK_URL  optional; when set, the assistant can submit project
//                        inquiries to this URL (for example a Formspree form,
//                        or an n8n, Zapier, Make, or Slack webhook)
//
// Request body: { messages: [{ role: 'user' | 'assistant', content: string }] }
// Response: the assistant's reply as a stream of plain text.
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '../src/chat/knowledge.js'

const MODEL = 'claude-opus-5'
const MAX_TOKENS = 4096 // cost cap for a public endpoint; replies are short
const MAX_MESSAGES = 30 // recent turns sent to the model; enough for a full inquiry
const MAX_CHARS = 1000 // per message
const MAX_TOOL_ROUNDS = 2
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 30 } // chat messages per IP, per server instance
const SUBMIT_LIMIT = { windowMs: 60 * 60 * 1000, max: 3 } // inquiries per IP, per server instance

const INQUIRY_WEBHOOK_URL = process.env.INQUIRY_WEBHOOK_URL || ''

const INQUIRY_FIELDS = {
  name: 'Visitor name',
  preferred_contact: 'Email address or other contact method the visitor chose',
  project_goal: 'What the visitor wants to build or improve, and the problem it solves',
  essential_features: 'Essential features and integrations',
  existing_product: 'Whether this is a new project or an existing product, and any current technology',
  target_deadline: 'Target deadline, if given',
  budget: 'Approximate budget, only if the visitor provided one',
  questions_for_hamza: 'Questions the visitor has for Hamza',
}
const REQUIRED_FIELDS = ['name', 'preferred_contact', 'project_goal']

const SUBMIT_TOOL = {
  name: 'submit_inquiry',
  description: 'Send the visitor\'s project inquiry to Hamza. Call it only after showing the visitor the full summary and receiving their explicit confirmation to submit it, and only once per confirmed summary. Use the details exactly as confirmed; leave out fields the visitor did not provide. Returns whether the inquiry was delivered.',
  input_schema: {
    type: 'object',
    properties: Object.fromEntries(Object.entries(INQUIRY_FIELDS).map(([key, description]) => [key, { type: 'string', description }])),
    required: REQUIRED_FIELDS,
    additionalProperties: false,
  },
  eager_input_streaming: true,
}
const TOOLS = INQUIRY_WEBHOOK_URL ? [SUBMIT_TOOL] : []

// Built once so every request shares an identical, cacheable prompt prefix.
const SYSTEM_PROMPT = buildSystemPrompt({ canSubmitInquiries: TOOLS.length > 0 })

let client
const getClient = () => {
  client ??= new Anthropic()
  return client
}

const limiter = ({ windowMs, max }) => {
  const hits = new Map()
  return (key) => {
    const now = Date.now()
    const recent = (hits.get(key) || []).filter((time) => now - time < windowMs)
    recent.push(now)
    hits.set(key, recent)
    if (hits.size > 5000) hits.clear()
    return recent.length > max
  }
}
const chatLimited = limiter(RATE_LIMIT)
const submitLimited = limiter(SUBMIT_LIMIT)

const sendJson = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('X-Chat-Api', '1')
  res.end(JSON.stringify(body))
}

// Keeps only well-formed text turns, trimmed and capped, starting with a user turn.
const cleanMessages = (input) => {
  if (!Array.isArray(input)) return null
  const messages = input
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .slice(-MAX_MESSAGES)
  while (messages.length && messages[0].role !== 'user') messages.shift()
  if (!messages.length || messages[messages.length - 1].role !== 'user') return null
  return messages
}

const readBody = (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return null
    }
  }
  return null
}

// After a mid-output fallback, blocks from the declined attempt (before the last
// fallback marker) must not be sent back, except text.
const blocksToKeep = (content) => {
  const lastFallback = content.map((b) => b.type).lastIndexOf('fallback')
  return content.filter((block, index) => block.type !== 'fallback' && (index > lastFallback || block.type === 'text'))
}

// ---------- submit_inquiry ----------
const validateInquiry = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Input must be an object.' }
  const problems = []
  const inquiry = {}
  for (const [key, value] of Object.entries(input)) {
    if (!(key in INQUIRY_FIELDS)) problems.push(`Unknown field "${key}".`)
    else if (typeof value !== 'string') problems.push(`"${key}" must be a string.`)
    else if (value.length > 2000) problems.push(`"${key}" is too long.`)
    else if (value.trim()) inquiry[key] = value.trim()
  }
  for (const key of REQUIRED_FIELDS) if (!inquiry[key]) problems.push(`"${key}" is required.`)
  return problems.length ? { error: problems.join(' ') } : { inquiry }
}

const inquirySummary = (inquiry) => [
  ['Name', inquiry.name],
  ['Preferred contact', inquiry.preferred_contact],
  ['Project goal', inquiry.project_goal],
  ['Essential features', inquiry.essential_features],
  ['Existing product or technology', inquiry.existing_product],
  ['Target deadline', inquiry.target_deadline],
  ['Budget', inquiry.budget],
  ['Questions for Hamza', inquiry.questions_for_hamza],
].filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join('\n')

const submitInquiry = async (inquiry) => {
  const summary = inquirySummary(inquiry)
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.preferred_contact) ? inquiry.preferred_contact : undefined
  const payload = {
    _subject: `New project inquiry from ${inquiry.name}`,
    subject: `New project inquiry from ${inquiry.name}`,
    ...inquiry,
    ...(email ? { email } : {}),
    message: summary,
    text: `New project inquiry from the portfolio chat assistant\n\n${summary}`,
    source: 'Portfolio chat assistant',
    submitted_at: new Date().toISOString(),
  }
  const response = await fetch(INQUIRY_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`webhook responded with status ${response.status}`)
}

const runTool = async (block, ip) => {
  const result = (content, isError = false) => ({ type: 'tool_result', tool_use_id: block.id, content, ...(isError ? { is_error: true } : {}) })
  if (block.name !== SUBMIT_TOOL.name || !INQUIRY_WEBHOOK_URL) return result(`Unknown tool "${block.name}".`, true)

  const { inquiry, error } = validateInquiry(block.input)
  if (error) return result(JSON.stringify({ INVALID_INPUT: error, received: block.input ?? null }), true)
  if (submitLimited(ip)) return result('Submission limit reached for this visitor. The inquiry was NOT sent; share the email and WhatsApp contact instead.', true)

  try {
    await submitInquiry(inquiry)
    return result('Success: the inquiry was delivered to Hamza.')
  } catch (err) {
    console.error('[chat] Inquiry submission failed:', err?.message || err)
    return result('Submission failed. The inquiry was NOT sent; share the email and WhatsApp contact instead.', true)
  }
}

// The SDK reports tool input it cannot parse as a plain AnthropicError (not an APIError).
const isToolJsonError = (error) => error instanceof Anthropic.AnthropicError
  && !(error instanceof Anthropic.APIError)
  && /Unable to parse tool parameter JSON/.test(error.message)

// ---------- handler ----------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return sendJson(res, 405, { error: 'method_not_allowed' })
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  if (chatLimited(ip)) {
    return sendJson(res, 429, { error: 'rate_limited', message: 'Too many messages. Please wait a few minutes and try again.' })
  }

  const messages = cleanMessages(readBody(req)?.messages)
  if (!messages) return sendJson(res, 400, { error: 'invalid_messages' })

  let started = false
  let needsBreak = false // separates text from consecutive model turns
  let activeStream = null
  let clientGone = false
  res.on('close', () => {
    if (!res.writableEnded) {
      clientGone = true
      activeStream?.abort()
    }
  })

  const write = (text) => {
    if (!started) {
      started = true
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.setHeader('X-Accel-Buffering', 'no')
      res.setHeader('X-Chat-Api', '1')
    }
    if (needsBreak) {
      res.write('\n\n')
      needsBreak = false
    }
    res.write(text)
  }

  // Streams one model turn to the visitor and returns the final message.
  const streamTurn = async (conversation) => {
    let wroteText = false
    try {
      activeStream = getClient().beta.messages.stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        // Short chat answers: low effort keeps replies fast and inexpensive.
        output_config: { effort: 'low' },
        // If a safety classifier declines, the API retries on its recommended fallback model.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        ...(TOOLS.length ? { tools: TOOLS } : {}),
        messages: conversation,
      })
      for await (const event of activeStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          wroteText = true
          write(event.delta.text)
        }
      }
      return await activeStream.finalMessage()
    } catch (error) {
      if (isToolJsonError(error) && !wroteText) return null // caller re-issues the turn
      throw error
    }
  }

  try {
    const conversation = [...messages]
    let final = null
    for (let round = 0, retries = 0; round <= MAX_TOOL_ROUNDS; round++) {
      final = await streamTurn(conversation)
      if (final === null) {
        if (++retries > 1) throw new Error('tool input could not be parsed twice')
        round--
        continue
      }
      // Run tools only on a clean tool_use stop: a max_tokens stop can leave a
      // truncated input, and a refusal can cut a tool call off mid-input.
      const content = blocksToKeep(final.content)
      const toolUses = content.filter((block) => block.type === 'tool_use')
      if (final.stop_reason !== 'tool_use' || !toolUses.length || round === MAX_TOOL_ROUNDS) break
      conversation.push({ role: 'assistant', content })
      conversation.push({ role: 'user', content: await Promise.all(toolUses.map((block) => runTool(block, ip))) })
      if (started) needsBreak = true
    }

    if (!started) {
      write(final?.stop_reason === 'refusal'
        ? "Sorry, I can't help with that one. Feel free to ask about Hamza's projects, services, or how to get in touch."
        : "Sorry, I couldn't come up with an answer. Try rephrasing, or contact Hamza directly at contact@hamzashahzad.com.")
    }
    res.end()
  } catch (error) {
    if (clientGone || error instanceof Anthropic.APIUserAbortError) return
    if (started) {
      // Headers are already sent: end the reply with a short note.
      res.end('\n\n(The reply was interrupted. Please try again.)')
      return
    }
    if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
      return sendJson(res, 503, { error: 'busy', message: 'The assistant is busy right now. Please try again shortly.' })
    }
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      console.error('[chat] API credentials rejected:', error.message)
      return sendJson(res, 503, { error: 'not_configured' })
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`[chat] API error ${error.status}:`, error.message)
      return sendJson(res, 502, { error: 'upstream_error' })
    }
    // Includes missing credentials, which the SDK reports before sending a request.
    console.error('[chat] Failed to reach the API:', error?.message || error)
    return sendJson(res, 503, { error: 'not_configured' })
  }
}
