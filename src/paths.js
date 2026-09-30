// The site is served under Vite's `base` (vite.config.js), e.g. /hamzashahzad/ on GitHub Pages.
// Code uses site paths like '/work' or '/#contact'; these helpers add or strip the base.
const base = import.meta.env.BASE_URL.replace(/\/$/, '')

// '/work' -> '/hamzashahzad/work', '/#contact' -> '/hamzashahzad/#contact'
export const sitePath = (path) => `${base}${path}`

// The current route without the base or a trailing slash: '/hamzashahzad/work/' -> '/work'
export const currentRoute = () => {
  const { pathname } = window.location
  const route = pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  return route.replace(/\/+$/, '') || '/'
}
