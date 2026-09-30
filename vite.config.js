import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { projects } from './src/data/projects.js'

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

// GitHub Pages is a static host with no single-page-app fallback. After the build, copy index.html
// into each route's folder so deep links like /hamzashahzad/work load with a 200, and to 404.html
// so any other path (such as a project added later in the admin panel) still boots the app.
const routePages = () => {
  const routes = ['work', 'services', 'about', 'team', 'admin', ...projects.map((project) => `work/${project.slug}`)]
  return {
    name: 'portfolio-route-pages',
    apply: 'build',
    writeBundle({ dir }) {
      const index = join(dir, 'index.html')
      for (const route of routes) {
        const page = join(dir, route, 'index.html')
        mkdirSync(dirname(page), { recursive: true })
        copyFileSync(index, page)
      }
      copyFileSync(index, join(dir, '404.html'))
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
    // Served from https://hamza01055.github.io/hamzashahzad/. Change to '/' if the site moves to
    // the root of a custom domain (e.g. hamzashahzad.com). Links go through src/paths.js, so this is the only change needed.
    base: '/hamzashahzad/',
    plugins: [react(), tailwindcss(), chatApi(), routePages()],
  }
})
