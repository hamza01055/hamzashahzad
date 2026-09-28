import { useEffect, useMemo, useState } from 'react'
import { projectFilters } from '../data/projects'
import {
  getProjects, saveProjects, getTeam, saveTeam, getSettings, saveSettings, getTasks, saveTasks,
  isCustomized, resetSection, exportAll, importAll,
  hasAdminPassword, setAdminPassword, checkAdminPassword, isLoggedIn, setLoggedIn,
} from '../data/store'

const inputClass = 'w-full rounded-xl border border-[#e7e3dc] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#F2B56B] focus:ring-2 focus:ring-[#F2B56B]/30'
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6B7280]'
const btn = {
  primary: 'rounded-xl bg-[#1a1a1a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50',
  accent: 'rounded-xl bg-[#F2B56B] px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] hover:brightness-95',
  ghost: 'rounded-xl border border-[#e7e3dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:border-[#F2B56B]',
}

const toList = (text) => text.split(',').map((item) => item.trim()).filter(Boolean)
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const nextId = (list) => list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
  </label>
)

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-[#e7e3dc] bg-white p-6 shadow-sm ${className}`}>{children}</div>
)

const Toast = ({ message }) => message ? (
  <div role="status" className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#1a1a1a] px-5 py-3 text-sm font-semibold text-white shadow-xl">{message}</div>
) : null

// ---------- Login ----------
const Login = ({ onSuccess }) => {
  const [firstTime] = useState(() => !hasAdminPassword())
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (firstTime) {
      if (password.length < 8) return setError('Use at least 8 characters.')
      if (password !== confirm) return setError('The passwords do not match.')
      await setAdminPassword(password)
    } else if (!(await checkAdminPassword(password))) {
      return setError('Wrong password.')
    }
    setLoggedIn(true)
    onSuccess()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0] p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl border border-[#e7e3dc] bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#F2B56B]">Admin panel</p>
          <h1 className="mt-2 text-2xl font-black text-[#1a1a1a]">{firstTime ? 'Create your admin password' : 'Sign in'}</h1>
          {firstTime && <p className="mt-2 text-sm text-[#6B7280]">This is the first visit in this browser. Choose a password to lock the panel.</p>}
        </div>
        <Field label="Password">
          <input type="password" autoFocus autoComplete={firstTime ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
        </Field>
        {firstTime && (
          <Field label="Confirm password">
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} required />
          </Field>
        )}
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button type="submit" className={`${btn.primary} w-full`}>{firstTime ? 'Create password' : 'Sign in'}</button>
        <a href="/" className="block text-center text-xs text-gray-400 hover:text-[#1a1a1a]">Back to website</a>
      </form>
    </div>
  )
}

// ---------- Dashboard ----------
const Dashboard = ({ projects, team, tasks, go }) => {
  const today = todayISO()
  const openTasks = tasks.filter((task) => !task.done)
  const isOverdue = (task) => Boolean(task.due) && task.due < today
  const attention = openTasks.filter((task) => isOverdue(task) || task.priority === 'high')
    .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)))
  const stats = [
    ['Projects', projects.length, 'projects'],
    ['Featured projects', projects.filter((p) => p.featured).length, 'projects'],
    ['Team members', team.length, 'team'],
    ['Open tasks', openTasks.length, 'tasks'],
  ]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value, target]) => (
          <button key={label} type="button" onClick={() => go(target)} className="rounded-2xl border border-[#e7e3dc] bg-white p-5 text-left shadow-sm hover:border-[#F2B56B]">
            <p className="text-3xl font-black text-[#1a1a1a]">{value}</p>
            <p className="mt-1 text-sm text-[#6B7280]">{label}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-bold text-[#1a1a1a]">Needs attention</h3>
          {attention.length === 0 ? (
            <p className="mt-3 text-sm text-[#6B7280]">No high-priority or overdue tasks.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {attention.slice(0, 6).map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#F5F4F0] px-3 py-2 text-sm">
                  <span className="font-medium">{task.title}</span>
                  <span className={`shrink-0 text-xs font-bold ${isOverdue(task) ? 'text-red-600' : 'text-[#a36a0b]'}`}>{isOverdue(task) ? `Overdue ${task.due}` : 'High'}</span>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={() => go('tasks')} className={`${btn.ghost} mt-4`}>Open tasks</button>
        </Card>
        <Card>
          <h3 className="font-bold text-[#1a1a1a]">Quick actions</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => go('projects', 'new')} className={btn.accent}>Add project</button>
            <button type="button" onClick={() => go('team', 'new')} className={btn.ghost}>Add team member</button>
            <button type="button" onClick={() => go('settings')} className={btn.ghost}>Edit site settings</button>
            <button type="button" onClick={() => go('backup')} className={btn.ghost}>Back up data</button>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-gray-400">Edits are saved in this browser. Visitors keep seeing the content from the source files until those are updated and redeployed. Use Backup to export your changes.</p>
        </Card>
      </div>
    </div>
  )
}

// ---------- Projects ----------
const emptyProject = { title: '', slug: '', description: '', category: '', filters: [], status: 'Prototype', github: '', image: '', highlights: [], technology: [], featured: false }

const ProjectForm = ({ initial, onSave, onCancel, existingSlugs }) => {
  const [form, setForm] = useState({
    ...emptyProject,
    ...initial,
    technologyText: (initial.technology || []).join(', '),
    highlightsText: (initial.highlights || []).join(', '),
  })
  const [error, setError] = useState('')
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const toggleFilter = (item) => setForm((f) => ({ ...f, filters: f.filters.includes(item) ? f.filters.filter((x) => x !== item) : [...f.filters, item] }))

  const submit = (event) => {
    event.preventDefault()
    const slug = slugify(form.slug || form.title)
    if (!slug) return setError('A title is required.')
    if (existingSlugs.includes(slug)) return setError('Another project already uses this URL slug.')
    if (form.filters.length === 0) return setError('Pick at least one filter.')
    const { technologyText, highlightsText, tags: _tags, stack: _stack, caseStudy: _caseStudy, ...rest } = form
    const github = (form.github || '').trim()
    const project = { ...rest, slug, technology: toList(technologyText), highlights: toList(highlightsText) }
    if (github) project.github = github
    else delete project.github
    onSave(project)
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-5">
        <h3 className="text-lg font-bold">{initial.id ? `Edit ${initial.title}` : 'New project'}</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Title"><input className={inputClass} value={form.title} onChange={set('title')} required /></Field>
          <Field label="URL slug" hint={`Page: /work/${slugify(form.slug || form.title) || '...'}`}><input className={inputClass} value={form.slug} onChange={set('slug')} placeholder="auto from title" /></Field>
          <Field label="Category"><input className={inputClass} value={form.category} onChange={set('category')} placeholder="AI / Computer Vision / SaaS" /></Field>
          <Field label="Status"><input className={inputClass} value={form.status} onChange={set('status')} list="status-options" /></Field>
          <Field label="GitHub URL"><input className={inputClass} type="url" value={form.github || ''} onChange={set('github')} placeholder="https://github.com/..." /></Field>
          <Field label="Image URL"><input className={inputClass} type="url" value={form.image} onChange={set('image')} placeholder="https://..." /></Field>
        </div>
        <datalist id="status-options">{['Prototype', 'In Progress', 'Project', 'Concept', 'Live', 'Prototype / FYP', 'Research / Learning'].map((s) => <option key={s} value={s} />)}</datalist>
        <Field label="Description"><textarea className={inputClass} rows="3" value={form.description} onChange={set('description')} required /></Field>
        <Field label="Technology" hint="Comma separated"><input className={inputClass} value={form.technologyText} onChange={set('technologyText')} /></Field>
        <Field label="Highlights" hint="Comma separated"><input className={inputClass} value={form.highlightsText} onChange={set('highlightsText')} /></Field>
        <div>
          <span className={labelClass}>Filters</span>
          <div className="flex flex-wrap gap-2">
            {projectFilters.filter((f) => f !== 'All').map((item) => (
              <button key={item} type="button" aria-pressed={form.filters.includes(item)} onClick={() => toggleFilter(item)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${form.filters.includes(item) ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#e7e3dc] bg-white text-[#374151]'}`}>{item}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.featured} onChange={set('featured')} className="h-4 w-4 accent-[#F2B56B]" /> Feature on home page</label>
        {form.image && <img src={form.image} alt="" className="h-32 w-56 rounded-xl object-cover" />}
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" className={btn.primary}>Save project</button>
          <button type="button" onClick={onCancel} className={btn.ghost}>Cancel</button>
        </div>
      </form>
    </Card>
  )
}

const ProjectsManager = ({ projects, setProjects, notify, startNew }) => {
  const [editing, setEditing] = useState(startNew ? emptyProject : null)
  const [search, setSearch] = useState('')

  const commit = (list, message) => { setProjects(list); saveProjects(list); notify(message) }
  const move = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= projects.length) return
    const list = [...projects]
    ;[list[index], list[target]] = [list[target], list[index]]
    commit(list, 'Order updated')
  }

  if (editing) {
    return (
      <ProjectForm
        initial={editing}
        existingSlugs={projects.filter((p) => p.id !== editing.id).map((p) => p.slug)}
        onCancel={() => setEditing(null)}
        onSave={(project) => {
          const list = editing.id
            ? projects.map((p) => (p.id === editing.id ? { ...project, id: editing.id } : p))
            : [...projects, { ...project, id: nextId(projects) }]
          commit(list, 'Project saved')
          setEditing(null)
        }}
      />
    )
  }

  const q = search.trim().toLowerCase()
  const visible = projects.map((p, index) => ({ p, index })).filter(({ p }) => !q || `${p.title} ${p.category} ${p.status}`.toLowerCase().includes(q))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input className={inputClass} placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" onClick={() => setEditing(emptyProject)} className={`${btn.accent} shrink-0`}>Add project</button>
      </div>
      <p className="text-xs text-gray-400">The home page shows the first 6 featured projects in this order.</p>
      <div className="overflow-hidden rounded-2xl border border-[#e7e3dc] bg-white">
        {visible.map(({ p, index }) => (
          <div key={p.id} className="flex flex-col gap-3 border-b border-[#f0ede7] p-4 last:border-0 md:flex-row md:items-center">
            {p.image ? <img src={p.image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" /> : <div className="h-14 w-20 shrink-0 rounded-lg bg-[#F5F4F0]" />}
            <div className="min-w-0 flex-1">
              <p className="font-bold">{p.title}</p>
              <p className="truncate text-xs text-[#6B7280]">{p.category} · {p.status}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => commit(projects.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x)), p.featured ? 'Removed from home page' : 'Featured on home page')} className={`rounded-full px-3 py-1 text-xs font-bold ${p.featured ? 'bg-[#FDF5EB] text-[#a36a0b]' : 'bg-gray-100 text-gray-500'}`}>{p.featured ? '★ Featured' : '☆ Feature'}</button>
              {!q && <>
                <button type="button" aria-label={`Move ${p.title} up`} onClick={() => move(index, -1)} className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100">↑</button>
                <button type="button" aria-label={`Move ${p.title} down`} onClick={() => move(index, 1)} className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100">↓</button>
              </>}
              <a href={`/work/${p.slug}`} target="_blank" rel="noreferrer" className="rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100">View</a>
              <button type="button" onClick={() => setEditing(p)} className="rounded-lg px-2 py-1 text-xs font-semibold text-[#1a1a1a] hover:bg-gray-100">Edit</button>
              <button type="button" onClick={() => { if (window.confirm(`Delete "${p.title}"?`)) commit(projects.filter((x) => x.id !== p.id), 'Project deleted') }} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
        {visible.length === 0 && <p className="p-6 text-center text-sm text-[#6B7280]">No projects found.</p>}
      </div>
    </div>
  )
}

// ---------- Team ----------
const emptyMember = { name: '', role: '', bio: '', skills: [], image: '', location: '', linkedin: '', github: '', twitter: '', website: '', featured: true }

const TeamForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState({ ...emptyMember, ...initial, skillsText: (initial.skills || []).join(', ') })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const submit = (event) => {
    event.preventDefault()
    const { skillsText, ...rest } = form
    const clean = Object.fromEntries(Object.entries(rest)
      .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
      .filter(([, v]) => v !== ''))
    onSave({ ...clean, bio: clean.bio || '', image: form.image || '', skills: toList(skillsText) })
  }
  return (
    <Card>
      <form onSubmit={submit} className="space-y-5">
        <h3 className="text-lg font-bold">{initial.id ? `Edit ${initial.name}` : 'New team member'}</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name"><input className={inputClass} value={form.name} onChange={set('name')} required /></Field>
          <Field label="Role"><input className={inputClass} value={form.role} onChange={set('role')} required /></Field>
          <Field label="Photo URL" hint="Keep the current value to keep the current photo"><input className={inputClass} value={form.image} onChange={set('image')} /></Field>
          <Field label="Location"><input className={inputClass} value={form.location || ''} onChange={set('location')} /></Field>
          <Field label="LinkedIn"><input className={inputClass} type="url" value={form.linkedin || ''} onChange={set('linkedin')} /></Field>
          <Field label="GitHub"><input className={inputClass} type="url" value={form.github || ''} onChange={set('github')} /></Field>
          <Field label="Twitter / X"><input className={inputClass} type="url" value={form.twitter || ''} onChange={set('twitter')} /></Field>
          <Field label="Website"><input className={inputClass} type="url" value={form.website || ''} onChange={set('website')} /></Field>
        </div>
        <Field label="Bio"><textarea className={inputClass} rows="3" value={form.bio} onChange={set('bio')} /></Field>
        <Field label="Skills" hint="Comma separated"><input className={inputClass} value={form.skillsText} onChange={set('skillsText')} /></Field>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.featured} onChange={set('featured')} className="h-4 w-4 accent-[#F2B56B]" /> Show on home page</label>
        <div className="flex gap-3">
          <button type="submit" className={btn.primary}>Save member</button>
          <button type="button" onClick={onCancel} className={btn.ghost}>Cancel</button>
        </div>
      </form>
    </Card>
  )
}

const TeamManager = ({ team, setTeam, notify, startNew }) => {
  const [editing, setEditing] = useState(startNew ? emptyMember : null)
  const commit = (list, message) => { setTeam(list); saveTeam(list); notify(message) }

  if (editing) {
    return (
      <TeamForm
        initial={editing}
        onCancel={() => setEditing(null)}
        onSave={(member) => {
          const list = editing.id
            ? team.map((m) => (m.id === editing.id ? { ...member, id: editing.id } : m))
            : [...team, { ...member, id: nextId(team) }]
          commit(list, 'Member saved')
          setEditing(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button type="button" onClick={() => setEditing(emptyMember)} className={btn.accent}>Add member</button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m) => (
          <Card key={m.id} className="flex flex-col">
            <div className="flex items-center gap-3">
              {m.image ? <img src={m.image} alt="" className="h-12 w-12 rounded-full object-cover object-top" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F4F0] font-black text-[#F2B56B]">{m.name.slice(0, 1)}</div>}
              <div className="min-w-0">
                <p className="truncate font-bold">{m.name}</p>
                <p className="truncate text-xs text-[#6B7280]">{m.role}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => commit(team.map((x) => (x.id === m.id ? { ...x, featured: !x.featured } : x)), m.featured ? 'Hidden on home page' : 'Shown on home page')} className={`rounded-full px-3 py-1 text-xs font-bold ${m.featured ? 'bg-[#FDF5EB] text-[#a36a0b]' : 'bg-gray-100 text-gray-500'}`}>{m.featured ? 'On home page' : 'Hidden on home'}</button>
              <button type="button" onClick={() => setEditing(m)} className="rounded-lg px-2 py-1 text-xs font-semibold hover:bg-gray-100">Edit</button>
              <button type="button" onClick={() => { if (window.confirm(`Remove ${m.name}?`)) commit(team.filter((x) => x.id !== m.id), 'Member removed') }} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Remove</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------- Tasks ----------
const priorityStyle = { high: 'bg-red-50 text-red-700', medium: 'bg-[#FDF5EB] text-[#a36a0b]', low: 'bg-gray-100 text-gray-600' }
const priorityOrder = { high: 0, medium: 1, low: 2 }

const TasksManager = ({ tasks, setTasks }) => {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [due, setDue] = useState('')
  const [notes, setNotes] = useState('')
  const [view, setView] = useState('open')
  const today = todayISO()

  const commit = (list) => { setTasks(list); saveTasks(list) }
  const add = (event) => {
    event.preventDefault()
    if (!title.trim()) return
    commit([{ id: Date.now(), title: title.trim(), notes: notes.trim(), priority, due, done: false, createdAt: new Date().toISOString() }, ...tasks])
    setTitle(''); setNotes(''); setDue(''); setPriority('medium')
  }
  const visible = tasks
    .filter((t) => (view === 'all' ? true : view === 'done' ? t.done : !t.done))
    .sort((a, b) => Number(a.done) - Number(b.done)
      || priorityOrder[a.priority] - priorityOrder[b.priority]
      || (a.due || '9999').localeCompare(b.due || '9999'))

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={add} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
            <Field label="Task"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reply to client, update resume, ship project..." required /></Field>
            <Field label="Priority">
              <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </Field>
            <Field label="Due"><input type="date" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} /></Field>
          </div>
          <Field label="Notes"><textarea className={inputClass} rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <button type="submit" className={btn.primary}>Add task</button>
        </form>
      </Card>
      <div className="flex gap-2">
        {[['open', 'Open'], ['done', 'Done'], ['all', 'All']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setView(key)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${view === key ? 'bg-[#1a1a1a] text-white' : 'border border-[#e7e3dc] bg-white text-[#374151]'}`}>{label}</button>
        ))}
      </div>
      <div className="space-y-2">
        {visible.map((t) => (
          <div key={t.id} className="flex items-start gap-3 rounded-2xl border border-[#e7e3dc] bg-white p-4">
            <input type="checkbox" aria-label={`Mark ${t.title} done`} checked={t.done} onChange={() => commit(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} className="mt-1 h-4 w-4 accent-[#F2B56B]" />
            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${t.done ? 'text-gray-400 line-through' : ''}`}>{t.title}</p>
              {t.notes && <p className="mt-1 whitespace-pre-wrap text-sm text-[#6B7280]">{t.notes}</p>}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className={`rounded-full px-2 py-0.5 font-bold ${priorityStyle[t.priority] || priorityStyle.low}`}>{t.priority}</span>
                {t.due && <span className={`rounded-full px-2 py-0.5 font-semibold ${!t.done && t.due < today ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>Due {t.due}</span>}
              </div>
            </div>
            <button type="button" onClick={() => commit(tasks.filter((x) => x.id !== t.id))} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
          </div>
        ))}
        {visible.length === 0 && <p className="py-8 text-center text-sm text-[#6B7280]">Nothing here.</p>}
      </div>
    </div>
  )
}

// ---------- Settings ----------
const SettingsManager = ({ notify }) => {
  const [form, setForm] = useState(getSettings)
  const [pw, setPw] = useState({ current: '', next: '' })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const changePassword = async (event) => {
    event.preventDefault()
    if (!(await checkAdminPassword(pw.current))) return notify('Current password is wrong')
    if (pw.next.length < 8) return notify('New password needs at least 8 characters')
    await setAdminPassword(pw.next)
    setPw({ current: '', next: '' })
    notify('Password changed')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); saveSettings(form); notify('Settings saved') }} className="space-y-5">
          <h3 className="font-bold">Website settings</h3>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.showAvailability} onChange={set('showAvailability')} className="h-4 w-4 accent-[#F2B56B]" /> Show availability badge on home page</label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.showChatbot} onChange={set('showChatbot')} className="h-4 w-4 accent-[#F2B56B]" /> Show chat assistant on the website</label>
          <Field label="Availability text"><input className={inputClass} value={form.availabilityText} onChange={set('availabilityText')} /></Field>
          <Field label="Contact email"><input type="email" className={inputClass} value={form.contactEmail} onChange={set('contactEmail')} required /></Field>
          <Field label="WhatsApp number" hint="Digits with country code, no + sign"><input className={inputClass} value={form.whatsappNumber} onChange={set('whatsappNumber')} pattern="[0-9]{8,15}" required /></Field>
          <button type="submit" className={btn.primary}>Save settings</button>
        </form>
      </Card>
      <Card>
        <form onSubmit={changePassword} className="space-y-5">
          <h3 className="font-bold">Change admin password</h3>
          <Field label="Current password"><input type="password" autoComplete="current-password" className={inputClass} value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} required /></Field>
          <Field label="New password"><input type="password" autoComplete="new-password" className={inputClass} value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} required /></Field>
          <button type="submit" className={btn.primary}>Change password</button>
        </form>
      </Card>
    </div>
  )
}

// ---------- Backup ----------
const BackupManager = ({ notify, reload }) => {
  const download = () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-admin-backup-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
    notify('Backup downloaded')
  }
  const upload = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    file.text()
      .then((text) => { importAll(JSON.parse(text)); reload(); notify('Backup imported') })
      .catch((error) => notify(`Import failed: ${error.message}`))
  }
  const sections = [['projects', 'Projects'], ['team', 'Team'], ['settings', 'Settings'], ['tasks', 'Tasks']]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="font-bold">Export and import</h3>
        <p className="mt-2 text-sm text-[#6B7280]">Your admin data lives in this browser only. Download a backup regularly, and import it in another browser or computer to continue there.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={download} className={btn.primary}>Download backup</button>
          <label className={`${btn.ghost} cursor-pointer`}>Import backup<input type="file" accept="application/json,.json" onChange={upload} className="hidden" /></label>
        </div>
      </Card>
      <Card>
        <h3 className="font-bold">Reset to source files</h3>
        <p className="mt-2 text-sm text-[#6B7280]">Discard browser edits for a section and go back to the data in the project source files.</p>
        <div className="mt-5 space-y-2">
          {sections.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-xl bg-[#F5F4F0] px-4 py-2.5 text-sm">
              <span><span className="font-semibold">{label}</span> <span className="text-xs text-gray-400">{isCustomized(key) ? 'edited' : 'default'}</span></span>
              <button type="button" disabled={!isCustomized(key)} onClick={() => { if (window.confirm(`Reset ${label}? Your edits will be lost.`)) { resetSection(key); reload(); notify(`${label} reset`) } }} className="text-xs font-semibold text-red-600 disabled:text-gray-300">Reset</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ---------- Shell ----------
const NAV = [
  ['dashboard', 'Dashboard'],
  ['projects', 'Projects'],
  ['team', 'Team'],
  ['tasks', 'Tasks'],
  ['settings', 'Settings'],
  ['backup', 'Backup'],
]

export default function AdminPanel() {
  const [authed, setAuthed] = useState(isLoggedIn)
  const [section, setSection] = useState(() => {
    const hash = window.location.hash.slice(1)
    return NAV.some(([key]) => key === hash) ? hash : 'dashboard'
  })
  const [startNew, setStartNew] = useState(false)
  const [projects, setProjects] = useState(getProjects)
  const [team, setTeam] = useState(getTeam)
  const [tasks, setTasks] = useState(getTasks)
  const [toast, setToast] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    document.title = 'Admin | Hamza Shahzad'
    let robots = document.head.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.setAttribute('name', 'robots')
      document.head.appendChild(robots)
    }
    robots.setAttribute('content', 'noindex, nofollow')
  }, [])

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.slice(1)
      if (NAV.some(([key]) => key === hash)) { setStartNew(false); setSection(hash); setVersion((v) => v + 1) }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const openCount = useMemo(() => tasks.filter((t) => !t.done).length, [tasks])
  const go = (target, mode) => {
    setStartNew(mode === 'new')
    setSection(target)
    setVersion((v) => v + 1)
    window.history.replaceState(null, '', `#${target}`)
  }
  const reload = () => { setProjects(getProjects()); setTeam(getTeam()); setTasks(getTasks()); setVersion((v) => v + 1) }
  const signOut = () => { setLoggedIn(false); setAuthed(false) }

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  const title = NAV.find(([key]) => key === section)?.[1]
  const content = {
    dashboard: <Dashboard projects={projects} team={team} tasks={tasks} go={go} />,
    projects: <ProjectsManager projects={projects} setProjects={setProjects} notify={setToast} startNew={startNew} />,
    team: <TeamManager team={team} setTeam={setTeam} notify={setToast} startNew={startNew} />,
    tasks: <TasksManager tasks={tasks} setTasks={setTasks} />,
    settings: <SettingsManager notify={setToast} />,
    backup: <BackupManager notify={setToast} reload={reload} />,
  }[section]

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#1a1a1a] md:flex">
      <aside className="flex flex-col border-b border-[#e7e3dc] bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F2B56B]">Admin</p>
          <p className="text-lg font-black">Hamza Shahzad</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible" aria-label="Admin sections">
          {NAV.map(([key, label]) => (
            <button key={key} type="button" aria-current={section === key ? 'page' : undefined} onClick={() => go(key)} className={`flex shrink-0 items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-semibold ${section === key ? 'bg-[#1a1a1a] text-white' : 'text-[#374151] hover:bg-[#F5F4F0]'}`}>
              {label}
              {key === 'tasks' && openCount > 0 && <span className={`ml-2 rounded-full px-2 text-xs ${section === key ? 'bg-white/20' : 'bg-[#FDF5EB] text-[#a36a0b]'}`}>{openCount}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-1 p-3 md:block">
          <a href="/" target="_blank" rel="noreferrer" className="block rounded-xl px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F5F4F0]">View website ↗</a>
          <button type="button" onClick={signOut} className="block w-full rounded-xl px-4 py-2 text-left text-sm text-[#6B7280] hover:bg-[#F5F4F0]">Sign out</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-black">{title}</h1>
          <button type="button" onClick={signOut} className={`${btn.ghost} md:hidden`}>Sign out</button>
        </div>
        <div key={`${section}-${version}`}>{content}</div>
      </main>
      <Toast message={toast} />
    </div>
  )
}
