import { useEffect, useMemo, useRef, useState } from 'react'

// Live GitHub activity: a contribution graph plus follower, fork, and star counts.
// Used on the About page and in the home page hero.
// Contributions come from a public mirror of the GitHub profile calendar
// (github-contributions-api.jogruber.de); the counts come from the GitHub REST
// API. Everything is fetched in the visitor's browser and cached for an hour in
// sessionStorage, so both pages share one fetch.
const GITHUB_USER = 'hamza01055'
const PROFILE_URL = `https://github.com/${GITHUB_USER}`
const CONTRIBUTIONS_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`
const USER_URL = `https://api.github.com/users/${GITHUB_USER}`
const REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner`
const CACHE_KEY = `gh-activity-v2:${GITHUB_USER}`
const CACHE_MS = 60 * 60 * 1000

// Level 0 (no contributions) is a quiet neutral; levels 1-4 are one violet hue,
// light to dark. Validated as an ordered ramp on white: lightness falls step by
// step and the lightest step clears 2:1 against the card.
const LEVEL_COLORS = ['#e7e6ec', '#9da1f0', '#7176e6', '#4f46e5', '#2e2a8f']

// Squares grow with the card (MIN..MAX px); on narrow screens the graph scrolls.
const GAP = 3
const MIN_CELL = 10
const MAX_CELL = 16
const TOP = 20 // room for month labels

const readCache = () => {
  try {
    const cached = JSON.parse(window.sessionStorage.getItem(CACHE_KEY) || 'null')
    if (cached && Date.now() - cached.savedAt < CACHE_MS) return cached
  } catch {
    // ignore storage errors
  }
  return null
}

const writeCache = (data) => {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, savedAt: Date.now() }))
  } catch {
    // ignore storage errors
  }
}

const utcDate = (iso) => new Date(`${iso}T00:00:00Z`)
const formatDay = (iso) => utcDate(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const formatMonth = (iso) => utcDate(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`
const number = (n) => (n === null || n === undefined ? '—' : n.toLocaleString('en-US'))

// Lays the days out GitHub-style: one column per week, Sunday at the top.
const buildGrid = (days) => {
  const offset = utcDate(days[0].date).getUTCDay()
  const cells = days.map((day, index) => {
    const slot = index + offset
    return { ...day, col: Math.floor(slot / 7), row: slot % 7 }
  })
  const columns = cells[cells.length - 1].col + 1
  const months = []
  cells.forEach((cell) => {
    if (cell.date.endsWith('-01') || cell === cells[0]) {
      const label = utcDate(cell.date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
      const col = cell.row === 0 || cell === cells[0] ? cell.col : cell.col + 1
      if (!months.length || col - months[months.length - 1].col >= 3) months.push({ col, label })
      // A partial first month too close to the next one gives up its label, as on GitHub.
      else if (months.length === 1) months[0] = { col, label }
    }
  })
  return { cells, columns, months }
}

const GitHubMark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#1a1a1a" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
)

// Small decorative shapes that drift behind each stat (.gh-float / .gh-twinkle in index.css).
const Dot = ({ style }) => (
  <span className="gh-float absolute h-3 w-3 rounded-full bg-[#f9a8d4]/70 ring-4 ring-[#fce7f3]" style={style} aria-hidden="true" />
)
const ForkShape = ({ style }) => (
  <svg className="gh-float absolute" style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="6" cy="5" r="2.2" /><circle cx="18" cy="5" r="2.2" /><circle cx="12" cy="19" r="2.2" /><path d="M6 7.2v1.3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.2M12 11.5v5.3" />
  </svg>
)
const StarShape = ({ style, size = 14 }) => (
  <svg className="gh-twinkle absolute" style={style} width={size} height={size} viewBox="0 0 24 24" fill="#fcd34d" aria-hidden="true">
    <path d="m12 2 2.9 6.26 6.85.74-5.12 4.63 1.43 6.74L12 16.9l-6.06 3.47 1.43-6.74L2.25 9l6.85-.74Z" />
  </svg>
)

const decorations = {
  followers: (
    <>
      <Dot style={{ top: 18, right: '45%', animationDelay: '0s' }} />
      <Dot style={{ top: 22, right: 48, animationDelay: '1.2s' }} />
      <Dot style={{ top: 52, right: 16, animationDelay: '0.6s' }} />
      <Dot style={{ bottom: 14, right: 64, animationDelay: '1.8s' }} />
    </>
  ),
  forks: (
    <>
      <ForkShape style={{ top: 18, left: '40%', animationDelay: '0.4s' }} />
      <ForkShape style={{ top: 16, right: 22, animationDelay: '1.4s' }} />
      <ForkShape style={{ bottom: 12, left: '54%', animationDelay: '0.9s' }} />
      <ForkShape style={{ bottom: 14, right: 18, animationDelay: '2s' }} />
    </>
  ),
  stars: (
    <>
      <StarShape style={{ top: 14, right: '44%', animationDelay: '0s' }} />
      <StarShape size={11} style={{ top: 46, left: '58%', animationDelay: '0.8s' }} />
      <StarShape style={{ top: 40, right: 22, animationDelay: '1.6s' }} />
      <StarShape size={10} style={{ bottom: 12, right: 70, animationDelay: '2.2s' }} />
    </>
  ),
}

const StatCard = ({ label, value, color, decoration }) => (
  <div className="relative min-h-[92px] overflow-hidden rounded-[1.25rem] border border-[#e3e0da] bg-white/80 p-5">
    {decoration}
    <p className="relative text-sm text-[#4d4a46]">{label}</p>
    <p className="relative mt-1 text-3xl font-bold leading-tight" style={{ color }}>{value}</p>
  </div>
)

export default function GitHubActivity() {
  const [data, setData] = useState(readCache)
  const [status, setStatus] = useState(data ? 'ready' : 'loading')
  const [active, setActive] = useState(null) // index of the highlighted day
  const [tip, setTip] = useState(null) // { x, y } inside the graph card
  const cardRef = useRef(null)
  const scrollRef = useRef(null)
  const svgRef = useRef(null)
  const sizeRef = useRef(null)
  const [cellSize, setCellSize] = useState(12)
  const pitch = cellSize + GAP

  useEffect(() => {
    if (data) return undefined
    const controller = new AbortController()
    const getJson = (url) => fetch(url, { signal: controller.signal }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    Promise.allSettled([getJson(CONTRIBUTIONS_URL), getJson(USER_URL), getJson(REPOS_URL)]).then(([contrib, user, repos]) => {
      if (controller.signal.aborted) return
      if (contrib.status !== 'fulfilled' || !Array.isArray(contrib.value?.contributions) || !contrib.value.contributions.length) {
        setStatus('error')
        return
      }
      const ownRepos = repos.status === 'fulfilled' && Array.isArray(repos.value) ? repos.value.filter((repo) => !repo.fork) : null
      const next = {
        days: contrib.value.contributions.map(({ date, count, level }) => ({ date, count, level })),
        total: contrib.value.total?.lastYear ?? contrib.value.contributions.reduce((sum, d) => sum + d.count, 0),
        followers: user.status === 'fulfilled' ? user.value.followers : null,
        stars: ownRepos ? ownRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) : null,
        forks: ownRepos ? ownRepos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0) : null,
      }
      writeCache(next)
      setData(next)
      setStatus('ready')
    })
    return () => controller.abort()
  }, [data])

  const grid = useMemo(() => (data ? buildGrid(data.days) : null), [data])

  const summary = useMemo(() => {
    if (!data) return null
    const year = data.days[data.days.length - 1].date.slice(0, 4)
    const yearTotal = data.days.filter((d) => d.date.startsWith(year)).reduce((sum, d) => sum + d.count, 0)
    const activeDays = data.days.filter((d) => d.count > 0).length
    const byMonth = []
    data.days.forEach((d) => {
      const key = d.date.slice(0, 7)
      const last = byMonth[byMonth.length - 1]
      if (last && last.key === key) {
        last.count += d.count
        if (d.count > 0) last.active += 1
      } else {
        byMonth.push({ key, label: formatMonth(d.date), count: d.count, active: d.count > 0 ? 1 : 0 })
      }
    })
    return { year, yearTotal, activeDays, byMonth }
  }, [data])

  // Fit the squares to the available width.
  useEffect(() => {
    const el = sizeRef.current
    if (!el || !grid) return undefined
    const fit = () => {
      const size = Math.floor(el.clientWidth / grid.columns) - GAP
      setCellSize(Math.max(MIN_CELL, Math.min(MAX_CELL, size)))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [grid])

  // On narrow screens, start scrolled to the most recent weeks.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
  }, [grid, cellSize])

  const width = grid ? grid.columns * pitch - GAP : 0
  const height = TOP + 7 * pitch - GAP

  const placeTip = (index) => {
    const cell = grid.cells[index]
    const svgBox = svgRef.current.getBoundingClientRect()
    const cardBox = cardRef.current.getBoundingClientRect()
    const x = svgBox.left - cardBox.left + cell.col * pitch + cellSize / 2
    const edge = Math.min(130, cardBox.width / 2) // keep the tooltip inside the card
    setTip({
      x: Math.min(Math.max(x, edge), cardBox.width - edge),
      y: svgBox.top - cardBox.top + TOP + cell.row * pitch,
    })
    setActive(index)
  }

  const clearTip = () => {
    setActive(null)
    setTip(null)
  }

  // The whole grid is one hit area: the day under the pointer is highlighted,
  // and the gaps between squares never drop the tooltip.
  const onPointerMove = (event) => {
    const box = svgRef.current.getBoundingClientRect()
    const col = Math.floor((event.clientX - box.left + GAP / 2) / pitch)
    const row = Math.floor((event.clientY - box.top - TOP + GAP / 2) / pitch)
    const index = grid.cells.findIndex((c) => c.col === col && c.row === row)
    if (index >= 0) placeTip(index)
    else clearTip()
  }

  // Keyboard: arrows move day by day (up/down) or week by week (left/right).
  const onKeyDown = (event) => {
    const steps = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7, Home: -Infinity, End: Infinity }
    if (!(event.key in steps)) {
      if (event.key === 'Escape') clearTip()
      return
    }
    event.preventDefault()
    const last = grid.cells.length - 1
    placeTip(Math.min(last, Math.max(0, (active ?? last) + steps[event.key])))
  }

  const activeCell = active !== null && grid ? grid.cells[active] : null
  const ready = status === 'ready'

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div ref={cardRef} className="relative min-w-0 rounded-[1.5rem] border border-[#e3e0da] bg-white/80 p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5F4F0]"><GitHubMark /></span>
            <div className="min-w-0">
              <a href={PROFILE_URL} target="_blank" rel="noreferrer" className="block truncate font-semibold text-[#1a1a1a] hover:underline">@{GITHUB_USER}</a>
              <p className="flex items-center gap-1.5 text-xs text-[#6b6660]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25a55f]" aria-hidden="true" />
                Contribution graph · live
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xl font-bold leading-tight text-[#1a1a1a]">{ready ? number(summary.yearTotal) : '—'}</p>
            <p className="font-eyebrow text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b6660]">{ready ? `${summary.year} total` : 'Total'}</p>
          </div>
        </div>

        <div ref={sizeRef} className="mt-6" style={{ minHeight: height }}>
          {status === 'loading' && (
            <div className="flex items-center justify-center rounded-xl bg-[#F5F4F0] text-sm text-[#4d4a46]" style={{ height }}>Loading GitHub activity...</div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#F5F4F0] px-4 text-center text-sm text-[#4d4a46]" style={{ height }}>
              <p>GitHub activity couldn&apos;t be loaded right now.</p>
              <a href={PROFILE_URL} target="_blank" rel="noreferrer" className="font-semibold text-[#4f46e5] underline underline-offset-2">See it on GitHub</a>
            </div>
          )}
          {ready && grid && (
            <div ref={scrollRef} className="overflow-x-auto pb-1">
              <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={`GitHub contribution graph for the last 12 months: ${plural(data.total, 'contribution')} across ${plural(summary.activeDays, 'active day')}. Use the arrow keys to read individual days.`}
                tabIndex={0}
                onPointerMove={onPointerMove}
                onPointerLeave={clearTip}
                onKeyDown={onKeyDown}
                onBlur={clearTip}
                className="block cursor-default rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-4"
              >
                {grid.months.map((m) => (
                  <text key={`${m.label}-${m.col}`} x={m.col * pitch} y={12} fontSize="12" fill="#3f3a36">{m.label}</text>
                ))}
                {grid.cells.map((cell, index) => (
                  <rect
                    key={cell.date}
                    x={cell.col * pitch}
                    y={TOP + cell.row * pitch}
                    width={cellSize}
                    height={cellSize}
                    rx={3}
                    fill={LEVEL_COLORS[cell.level] || LEVEL_COLORS[0]}
                    stroke={index === active ? '#1a1a1a' : 'none'}
                    strokeWidth={index === active ? 1.5 : 0}
                  />
                ))}
              </svg>
            </div>
          )}
        </div>

        {ready && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[#3f3a36]">
            <p>{plural(data.total, 'contribution')} in the last year</p>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="mr-1">Less</span>
              {LEVEL_COLORS.map((color) => <span key={color} className="h-3 w-3 rounded-[3px]" style={{ background: color }} />)}
              <span className="ml-1">More</span>
            </div>
          </div>
        )}

        {activeCell && tip && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-[#1a1a1a] px-3 py-2 text-xs text-white shadow-lg"
            style={{ left: tip.x, top: tip.y - 8 }}
          >
            <strong className="font-semibold">{plural(activeCell.count, 'contribution')}</strong>
            <span className="text-white/70"> · {formatDay(activeCell.date)}</span>
          </div>
        )}

        {/* Table version of the graph for screen readers. */}
        {ready && (
          <table className="sr-only">
            <caption>GitHub contributions by month, last 12 months</caption>
            <thead>
              <tr><th scope="col">Month</th><th scope="col">Contributions</th><th scope="col">Active days</th></tr>
            </thead>
            <tbody>
              {summary.byMonth.map((m) => (
                <tr key={m.key}><th scope="row">{m.label}</th><td>{m.count}</td><td>{m.active}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <StatCard label="Followers" value={ready ? number(data.followers) : '—'} color="#db2777" decoration={decorations.followers} />
        <StatCard label="Forks" value={ready ? number(data.forks) : '—'} color="#0d9488" decoration={decorations.forks} />
        <StatCard label="GitHub Stars" value={ready ? number(data.stars) : '—'} color="#ea580c" decoration={decorations.stars} />
      </div>
    </div>
  )
}
