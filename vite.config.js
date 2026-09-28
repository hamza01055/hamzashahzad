import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, pathToFileURL } from 'node:url'

const chatHandlerPath = fileURLToPath(new URL('./api/chat.js', import.meta.url))

// Serves api/chat.js at /api/chat during `npm run dev` and `npm run preview`.
// In production the host runs api/chat.js as a serverless function (Vercel does this automatically).
const chatApi = () => {
  const middleware = (loadHandler) => async (req, res, next) => {
    if (req.url !== '/' && req.url !== '') return next()
    let raw = ''
    for await (const chunk of req) raw += chunk
    try {
      req.body = raw ? JSON.parse(raw) : {}
    } catch {
      req.body = null
    }
    try {
      const { default: handler } = await loadHandler()
      await handler(req, res)
    } catch (error) {
      next(error)
    }
  }
  return {
    name: 'portfolio-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', middleware(() => server.ssrLoadModule(chatHandlerPath)))
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/chat', middleware(() => import(pathToFileURL(chatHandlerPath).href)))
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make the chat handler's settings from a local .env file available to it.
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of ['ANTHROPIC_API_KEY', 'INQUIRY_WEBHOOK_URL']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [react(), tailwindcss(), chatApi()],
  }
})
