// Content store for the portfolio and admin panel.
// The source files in src/data are the defaults. Edits made in /admin are
// saved to this browser's localStorage and override those defaults here only.
// Use Export in the admin panel to back up or move the data.
import { projects as defaultProjects, normalizeProject } from './projects'
import { team as defaultTeam } from './team'

const PREFIX = 'hs-admin:'
const KEYS = { projects: 'projects', team: 'team', settings: 'settings', tasks: 'tasks' }

export const defaultSettings = {
  availabilityText: 'available for AI & software projects',
  showAvailability: true,
  contactEmail: 'contact@hamzashahzad.com',
  whatsappNumber: '923264936138',
  showChatbot: true,
}

const read = (key) => {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const write = (key, value) => {
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

const remove = (key) => {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore storage errors
  }
}

const stripProject = ({ tags: _tags, stack: _stack, caseStudy: _caseStudy, ...rest }) => rest

// Projects
export const getProjects = () => {
  const stored = read(KEYS.projects)
  return Array.isArray(stored) ? stored.map(normalizeProject) : defaultProjects
}
export const saveProjects = (list) => write(KEYS.projects, list.map(stripProject))

// Team: built-in photos are bundled assets whose URLs change on each build,
// so a member that still uses its default photo is stored with a flag instead.
export const getTeam = () => {
  const stored = read(KEYS.team)
  if (!Array.isArray(stored)) return defaultTeam
  return stored.map((member) => {
    if (!member.defaultImage) return member
    const original = defaultTeam.find((item) => item.id === member.id)
    const { defaultImage: _flag, ...rest } = member
    return { ...rest, image: original?.image || '' }
  })
}
export const saveTeam = (list) => write(KEYS.team, list.map((member) => {
  const original = defaultTeam.find((item) => item.id === member.id)
  return original && member.image === original.image ? { ...member, image: '', defaultImage: true } : member
}))

// Settings
export const getSettings = () => ({ ...defaultSettings, ...(read(KEYS.settings) || {}) })
export const saveSettings = (settings) => write(KEYS.settings, settings)

// Private tasks and notes (admin only)
export const getTasks = () => read(KEYS.tasks) || []
export const saveTasks = (tasks) => write(KEYS.tasks, tasks)

export const isCustomized = (section) => read(KEYS[section]) !== null
export const resetSection = (section) => remove(KEYS[section])

export const exportAll = () => ({
  exportedAt: new Date().toISOString(),
  projects: getProjects().map(stripProject),
  team: read(KEYS.team) || defaultTeam.map((member) => ({ ...member, image: '', defaultImage: true })),
  settings: getSettings(),
  tasks: getTasks(),
})

export const importAll = (data) => {
  if (!data || typeof data !== 'object') throw new Error('The file is not a valid backup.')
  if (Array.isArray(data.projects)) write(KEYS.projects, data.projects)
  if (Array.isArray(data.team)) write(KEYS.team, data.team)
  if (data.settings && typeof data.settings === 'object') write(KEYS.settings, data.settings)
  if (Array.isArray(data.tasks)) write(KEYS.tasks, data.tasks)
}

// Admin authentication. This is a client-side lock only: it keeps casual
// visitors out of the admin screen but is not server-side security.
const AUTH_KEY = 'auth-hash'
const SESSION_KEY = PREFIX + 'session'

const sha256 = async (text) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(bytes)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const hasAdminPassword = () => Boolean(read(AUTH_KEY))
export const setAdminPassword = async (password) => write(AUTH_KEY, await sha256(password))
export const checkAdminPassword = async (password) => read(AUTH_KEY) === (await sha256(password))
export const isLoggedIn = () => {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}
export const setLoggedIn = (value) => {
  try {
    if (value) window.sessionStorage.setItem(SESSION_KEY, '1')
    else window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore storage errors
  }
}
