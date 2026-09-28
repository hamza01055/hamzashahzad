import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import portfolioBackground from './assets/portfolio-background.jpg'
import profileImage from './assets/hamza-shahzad-profile.png'
import { getProjects, getSettings, getTeam } from './data/store'
import Chatbot from './components/Chatbot'
import GitHubActivity from './components/GitHubActivity'

// Content comes from the admin store, falling back to the files in src/data.
const projectData = getProjects()
const team = getTeam()
const siteSettings = getSettings()
const contactEmail = siteSettings.contactEmail
const whatsappUrl = `https://wa.me/${siteSettings.whatsappNumber}`
// Opens WhatsApp with a first message ready to send (used by the navbar "Start a project" button).
const startProjectUrl = `${whatsappUrl}?text=${encodeURIComponent('Hi Hamza, I would like to start a project.')}`

gsap.registerPlugin(ScrollTrigger)

const Icons = {
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
  ),
  Filter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
  ),
  ArrowUpRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
  ),
  ArrowUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
  ),
  Code: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F2B56B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3-1.2 4.8L6 9l4.8 1.2L12 15l1.2-4.8L18 9l-4.8-1.2L12 3Z" /><path d="m19 15-.6 2.4L16 18l2.4.6L19 21l.6-2.4L22 18l-2.4-.6L19 15Z" /></svg>
  ),
  Database: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></svg>
  ),
  Cloud: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 0 1 0 9Z" /></svg>
  ),
  Mobile: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M10 18h4" /></svg>
  ),
  Git: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><path d="M8 6h8M6 8v4a6 6 0 0 0 6 6M18 8v4a6 6 0 0 1-6 6" /></svg>
  ),
  Palette: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F2B56B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
  ),
  Blocks: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F2B56B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 17h6" /><path d="M17 14v6" /></svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2B56B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  ),
  Quote: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5DFB8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
  ),
  Twitter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>
  ),
  LinkedIn: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
  ),
  Github: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
  ),
  Instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" /></svg>
  ),
  Whatsapp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-4-1l-4 1 1-4a8.5 8.5 0 1 1 16-4.5Z" /><path d="M8.5 9.5c.4 2 2 3.6 4 4 .6.1 1.3-.2 1.7-.8l.3-.5-1.5-.9-.7.7c-.9-.3-1.6-1-1.9-1.9l.7-.7-.9-1.5-.5.3c-.6.4-.9 1.1-.8 1.7Z" /></svg>
  ),
  Telegram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
  ),
}

const PORTFOLIO_DATA = {
  projects: projectData,
  services: [
    { icon: <Icons.Code />, title: 'Artificial Intelligence', desc: 'Machine learning, deep learning, generative AI, LLM applications, RAG systems, and AI agents built around real product needs.', tags: ['Machine Learning', 'LLMs', 'AI Agents'] },
    { icon: <Icons.Palette />, title: 'Computer Vision', desc: 'Visual AI systems for image understanding, object detection, classification, and image processing workflows.', tags: ['YOLOv8', 'OpenCV', 'Object Detection'] },
    { icon: <Icons.Briefcase />, title: 'Web & Software Development', desc: 'Modern web applications, REST APIs, backend systems, and full-stack products with practical, scalable foundations.', tags: ['Python', 'FastAPI', 'React'] },
    { icon: <Icons.Sun />, title: 'Mobile & AI Automation', desc: 'Flutter applications and AI-powered automation workflows that connect intelligent services to useful business experiences.', tags: ['Flutter', 'Automation', 'API Integration'] },
  ],
  skills: {
    design: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Generative AI', 'Prompt Engineering'],
    development: ['Python', 'Java', 'JavaScript', 'SQL', 'C++', 'FastAPI', 'Flask', 'Django'],
    tools: ['LangChain', 'LangGraph', 'OpenAI API', 'Hugging Face', 'Ollama', 'PostgreSQL', 'MongoDB', 'Redis', 'FAISS', 'ChromaDB', 'AWS', 'Docker', 'Linux', 'Vercel', 'Render'],
  },
  workflow: [
    { step: '01', title: 'Discovery', desc: 'Understand the problem and requirements.' },
    { step: '02', title: 'Planning', desc: 'Define architecture, responsibilities, milestones, and scope.' },
    { step: '03', title: 'Design', desc: 'Design the product experience and technical system.' },
    { step: '04', title: 'Development', desc: 'Build the AI, backend, frontend, mobile, and supporting systems.' },
    { step: '05', title: 'Testing', desc: 'Validate quality, performance, and reliability.' },
    { step: '06', title: 'Launch', desc: 'Deploy and continue improving the product.' },
  ],
  experience: [
    { role: 'Freelance AI Developer', company: 'Self-employed', period: '2025 — Present', desc: 'Developing AI applications using Python and FastAPI for real-world use cases, including RAG applications, multi-agent workflows, REST APIs, and LLM integrations.', bullets: ['Built RAG applications with LangChain and vector databases including FAISS and ChromaDB', 'Created LangGraph workflows for research, analysis, and report generation', 'Used Docker and Git for development, version control, and deployment'] },
    { role: 'AI / Software Intern', company: '10Pearls · Islamabad, Pakistan', period: 'Internship', desc: 'Working on software and AI-related development while gaining practical experience in professional engineering workflows, application development, and production-oriented problem solving.' },
  ],
}

const Section = ({ id, className = '', children }) => (
  <section id={id} className={`max-w-7xl mx-auto px-4 md:px-8 lg:px-12 ${className}`}>
    {children}
  </section>
)

// Editorial type used across the site: mono labels, serif headings (see index.css), Outfit body.
const Eyebrow = ({ children, dark = false, className = '' }) => (
  <span className={`font-eyebrow block text-xs font-semibold uppercase tracking-[0.12em] md:text-[13px] ${dark ? 'text-gray-400' : 'text-[#3f3a36]'} ${className}`}>{children}</span>
)

const Accent = ({ children, dark = false, plain = false }) => (
  <em className={`italic pr-[0.08em] -mr-[0.08em] ${plain ? '' : dark ? 'text-gradient-accent-dark' : 'text-gradient-accent'}`}>{children}</em>
)

// Sets one phrase of a title in the italic gradient accent.
const withAccent = (title, accent, dark) => {
  const index = accent ? title.lastIndexOf(accent) : -1
  if (index < 0) return title
  return <>{title.slice(0, index)}<Accent dark={dark}>{accent}</Accent>{title.slice(index + accent.length)}</>
}

const SectionHeader = ({ subtitle, title, accent, description, align = 'center', rightAction = null, dark = false }) => (
  <div className={`mb-12 ${align === 'left' ? 'text-left' : 'text-center'}`}>
    <Eyebrow dark={dark} className="mb-4">{subtitle}</Eyebrow>
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div className={`${align === 'left' ? 'max-w-3xl' : 'max-w-4xl mx-auto'}`}>
        <h2 className={`text-[2.5rem] md:text-6xl leading-[1.05] ${dark ? 'text-white' : 'text-[#1a1a1a]'}`}>{withAccent(title, accent, dark)}</h2>
      </div>
      {rightAction}
    </div>
    {description && (
      <p className={`mt-6 text-lg leading-[1.7] ${dark ? 'text-gray-300' : 'text-[#4d4a46]'} ${align === 'left' ? 'max-w-3xl' : 'max-w-3xl mx-auto'}`}>
        {description}
      </p>
    )}
  </div>
)

const buttonBase = 'inline-flex items-center justify-center whitespace-nowrap leading-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B56B]'
const buttonSizes = {
  md: 'h-12 min-w-[140px] px-5 text-sm font-semibold',
  secondary: 'h-11 min-w-[140px] px-5 text-sm font-semibold',
  small: 'h-10 px-4 text-sm font-medium',
  icon: 'h-11 w-11 p-0',
}
const buttonVariants = {
  primary: 'rounded-full bg-[#F2B56B] text-[#1a1a1a] hover:brightness-95',
  dark: 'rounded-full bg-[#1a1a1a] text-white hover:bg-gray-800',
  secondary: 'rounded-full border border-[#e7e3dc] bg-white text-[#1a1a1a] hover:bg-gray-50',
  outline: 'rounded-full border border-gray-200 bg-white text-[#1a1a1a] hover:bg-gray-50',
  'outline-dark': 'rounded-full border border-gray-700 bg-transparent text-white hover:bg-white/10',
  ghost: 'rounded-full text-[#a36a0b] hover:bg-[#FDF5EB]',
  icon: 'rounded-full bg-white text-[#1a1a1a] shadow-lg hover:bg-[#F2B56B]',
}

const Button = ({ as: Component = 'button', variant = 'primary', size = 'md', className = '', children, ...props }) => (
  <Component className={`${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`} {...props}>
    {children}
  </Component>
)

const Pill = ({ active, onClick, children }) => (
  <Button
    type="button"
    onClick={onClick}
    size="small"
    variant={active ? 'dark' : 'secondary'}
    className={`border ${active ? 'border-[#1a1a1a]' : 'text-gray-600 hover:border-gray-300'}`}
  >
    {children}
  </Button>
)

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const mobileLinks = [
    ['Work', '/work'],
    ['Services', '/services'],
    ['About', '/about'],
    ['Team', '/team'],
    ['Contact', '/#contact'],
  ]

  return (
  <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#F5F4F0]/80 border-b border-[#e7e3dc]">
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between h-20">
      <a href="/" className="flex items-center gap-3" aria-label="Go to Hamza Shahzad home page">
        <div>
          <div className="text-lg font-black tracking-tight">Hamza Shahzad</div>
        </div>
      </a>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#374151]">
        <a href="/work" className="hover:text-[#1a1a1a]">Work</a>
        <a href="/services" className="hover:text-[#1a1a1a]">Services</a>
        <a href="/about" className="hover:text-[#1a1a1a]">About</a>
        <a href="/team" className="hover:text-[#1a1a1a]">Team</a>
        <a href="/#contact" className="hover:text-[#1a1a1a]">Contact</a>
      </nav>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          variant="secondary"
          size="icon"
          className="md:hidden border border-[#e7e3dc] hover:border-[#F2B56B]"
        >
          {menuOpen ? <Icons.Close /> : <Icons.Menu />}
        </Button>
        <Button as="a" href={startProjectUrl} target="_blank" rel="noreferrer" aria-label="Start a project with Hamza on WhatsApp" variant="dark">Start a project</Button>
      </div>
    </div>
    {menuOpen && (
      <nav className="md:hidden border-t border-[#e7e3dc] bg-[#F5F4F0]/95 px-4 py-4 shadow-lg" aria-label="Mobile navigation">
        <div className="mx-auto flex max-w-7xl flex-col gap-1">
          {mobileLinks.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[#374151] transition hover:bg-white hover:text-[#1a1a1a]">
              {label}
            </a>
          ))}
        </div>
      </nav>
    )}
  </header>
  )
}

const Hero = () => (
  <Section id="home" className="pt-14 pb-20 md:pt-20 md:pb-28">
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-14">
      <div>
        {siteSettings.showAvailability && siteSettings.availabilityText && (
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eedbb5] bg-[#FDF5EB] px-4 py-2 font-eyebrow text-xs font-semibold uppercase tracking-[0.12em] text-[#a36a0b]">
            <span className="w-2 h-2 rounded-full bg-[#F2B56B]" /> {siteSettings.availabilityText}
          </div>
        )}

        <h1 data-motion-hero="headline" className="mt-8 text-5xl md:text-7xl leading-none text-[#1a1a1a]">
          I build intelligent<br />systems into <Accent>products</Accent>
        </h1>

        <p data-motion-hero="subheadline" className="mt-6 max-w-xl text-lg md:text-xl text-[#4d4a46] leading-relaxed">
          I’m Hamza Shahzad, an AI Engineer, Python Developer, and Machine Learning Engineer focused on building practical AI applications with Python, FastAPI, LangChain, LangGraph, and RAG.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
          <Button as="a" data-motion-hover href="#work" variant="primary">
            View projects <Icons.ArrowRight />
          </Button>
          <Button as="a" data-motion-hover href="#contact" variant="secondary">Start a conversation</Button>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl">
          {[
            ['AI', 'Core specialization'],
            ['BS AI', 'Academic foundation'],
          ].map(([value, label]) => (
            <div key={label} className="bg-white rounded-[1.5rem] border border-[#efebe6] p-4 shadow-sm">
              <div className="font-display text-4xl leading-none text-[#e0a04f]">{value}</div>
              <div className="font-eyebrow mt-1 text-[11px] uppercase tracking-[0.12em] text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div data-motion-hero="visual" className="relative mx-auto w-full max-w-xl aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-[#dce3e5] shadow-[0_32px_80px_rgba(0,0,0,0.12)]">
          <img src={profileImage} alt="Hamza Shahzad" className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090d]/35 via-transparent to-white/10" />
        </div>
      </div>
    </div>

    <div className="mt-16">
      <span className="font-eyebrow mb-4 block text-xs md:text-[13px] font-semibold uppercase tracking-[0.12em] text-[#3f3a36]">Open source · live from GitHub</span>
      <GitHubActivity />
    </div>
  </Section>
)

const technologyLogos = {
  python: 'python',
  pytorch: 'pytorch',
  tensorflow: 'tensorflow',
  'scikit-learn': 'scikitlearn',
  opencv: 'opencv',
  yolo: 'yolo',
  'hugging face': 'huggingface',
  langchain: 'langchain',
  langgraph: 'langgraph',
  ollama: 'ollama',
  qdrant: 'qdrant',
  react: 'react',
  'next.js': 'nextdotjs',
  javascript: 'javascript',
  typescript: 'typescript',
  html: 'html5',
  'tailwind css': 'tailwindcss',
  fastapi: 'fastapi',
  django: 'django',
  flask: 'flask',
  flutter: 'flutter',
  dart: 'dart',
  android: 'android',
  ios: 'ios',
  postgresql: 'postgresql',
  mongodb: 'mongodb',
  mysql: 'mysql',
  redis: 'redis',
  websocket: 'socketdotio',
  websockets: 'socketdotio',
  docker: 'docker',
  kubernetes: 'kubernetes',
  linux: 'linux',
  nginx: 'nginx',
  git: 'git',
  github: 'github',
  'github actions': 'githubactions',
  mlflow: 'mlflow',
  firebase: 'firebase',
  supabase: 'supabase',
  postman: 'postman',
  figma: 'figma',
  n8n: 'n8n',
  celery: 'celery',
  swagger: 'swagger',
}

const technologyColors = {
  python: '3776AB',
  pytorch: 'EE4C2C',
  tensorflow: 'FF6F00',
  scikitlearn: 'F7931E',
  opencv: '5C3EE8',
  yolo: '111F68',
  'hugging face': 'FFD21E',
  langchain: '1C3C3C',
  langgraph: '1C3C3C',
  llamaindex: '6B4FBB',
  ollama: '000000',
  qdrant: 'DC244C',
  react: '61DAFB',
  nextdotjs: '000000',
  javascript: 'F7DF1E',
  typescript: '3178C6',
  html5: 'E34F26',
  css3: '1572B6',
  tailwindcss: '06B6D4',
  django: '092E20',
  flask: '000000',
  dart: '0175C2',
  android: '3DDC84',
  ios: '000000',
  fastapi: '009688',
  flutter: '02569B',
  postgresql: '4169E1',
  mongodb: '47A248',
  redis: 'DC382D',
  mysql: '4479A1',
  websocket: '010101',
  websockets: '010101',
  aws: '232F3E',
  docker: '2496ED',
  kubernetes: '326CE5',
  linux: 'FCC624',
  nginx: '009639',
  github: '181717',
  git: 'F05032',
  githubactions: '2088FF',
  mlflow: '0194E2',
  firebase: 'FFCA28',
  supabase: '3FCF8E',
  postman: 'FF6C37',
  figma: 'F24E1E',
  n8n: 'EA4B71',
  celery: '37814A',
  swagger: '85EA2D',
}

const TechIcon = ({ technology }) => {
  const key = technology.toLowerCase()
  const logo = technologyLogos[key]
  if (logo) {
    return <img src={`https://cdn.simpleicons.org/${logo}/${technologyColors[key] || technologyColors[logo] || '6B7280'}`} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
  }

  const name = technology.toLowerCase()
  if (name.includes('ai') || name.includes('llm') || name.includes('nlp') || name.includes('vision') || name.includes('rag') || name.includes('yolo') || name.includes('generative')) return <Icons.Sparkles />
  if (name.includes('sql') || name.includes('mongo') || name.includes('redis') || name.includes('database') || name.includes('qdrant') || name.includes('faiss')) return <Icons.Database />
  if (name.includes('aws') || name.includes('cloud') || name.includes('firebase') || name.includes('supabase')) return <Icons.Cloud />
  if (name.includes('flutter') || name.includes('android') || name.includes('ios') || name.includes('mobile')) return <Icons.Mobile />
  if (name.includes('git') || name.includes('github') || name.includes('docker') || name.includes('kubernetes') || name.includes('ci/cd')) return <Icons.Git />
  return <Icons.Code />
}

const Projects = () => {
  const [filter, setFilter] = useState('All Projects')
  const filters = ['All Projects', 'AI / ML', 'Web', 'Mobile', 'SaaS', 'Automation', 'Open Source']
  const featuredProjects = PORTFOLIO_DATA.projects.filter((project) => project.featured).slice(0, 6)
  const visibleProjects = featuredProjects.filter((project) => {
    if (filter === 'All Projects') return true
    if (filter === 'Open Source') return Boolean(project.github)
    if (filter === 'Web') return project.filters.includes('Web Apps')
    return project.filters.includes(filter)
  })

  return (
    <Section id="work" className="max-w-[1400px] pt-16 pb-24">
      <SectionHeader
        subtitle="SELECTED WORK"
        title="AI systems, software products & digital experiences" accent="digital experiences"
        description="A selection of intelligent systems, software products, and digital experiences built across AI, web, SaaS, and automation."
      />

      <div className="mb-12 flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible">
        {filters.map((item) => (
          <Pill key={item} active={filter === item} onClick={() => setFilter(item)}>{item}</Pill>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        {visibleProjects.map((project) => (
          <article key={project.id} data-motion-project-card data-motion-hover className="group overflow-hidden rounded-[1.75rem] border border-[#e7e3dc] bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <img src={project.image} alt={project.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <Button as="a" href={`/work/${project.slug}`} aria-label={`View ${project.title}`} variant="icon" size="icon" className="absolute right-5 top-5">
                <Icons.ArrowUpRight />
              </Button>
            </div>
            <div className="p-7">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-3xl text-[#1a1a1a]">{project.title}</h3>
                <span className="shrink-0 rounded-full bg-[#FDF5EB] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a36a0b]">{project.filters[0]}</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#4d4a46]">{project.description}</p>
              <span className="mt-4 inline-flex w-fit rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">{project.status}</span>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-14 text-center">
        <Button as="a" href="/work" variant="dark">View All Projects <Icons.ArrowRight /></Button>
      </div>
    </Section>
  )
}

const WorkProjectCard = ({ project }) => (
  <article data-motion-project-card data-motion-hover className="bg-white rounded-[2rem] p-4 pb-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
    <div className="w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-6 bg-gray-100">
      <img src={project.image} alt={project.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div className="px-2 flex-1 flex flex-col">
      <div className="flex justify-between items-start gap-3">
        <span className="text-xs font-black tracking-widest text-[#F2B56B]">{String(project.id).padStart(2, '0')} / 20</span>
        <span className="bg-[#1a1a1a] text-white text-xs font-semibold px-3 py-1 rounded-full">{project.status}</span>
      </div>
      <h3 className="mt-4 text-2xl text-[#1a1a1a]">{project.title}</h3>
      <p className="mt-3 text-[#4d4a46] text-sm leading-relaxed">{project.description}</p>
      <p className="font-eyebrow mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a36a0b]">{project.category}</p>
      <div className="flex flex-wrap gap-2 mt-5">
        {project.technology.slice(0, 6).map((technology) => <span key={technology} className="bg-gray-50 text-gray-500 text-xs font-medium px-3 py-1 rounded-full border border-gray-100">{technology}</span>)}
      </div>
      {project.slug ? <a href={`/work/${project.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#a36a0b]">View Project <Icons.ArrowRight /></a> : <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-gray-400">Project details coming soon</span>}
      {project.github && <a href={project.github} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#1a1a1a]"><Icons.Github /> GitHub Repository</a>}
    </div>
  </article>
)

const ProjectCaseStudy = ({ project }) => (
  <>
    <Section className="pt-20 pb-14">
      <a href="/work" className="inline-flex items-center gap-2 text-sm font-semibold text-[#a36a0b]"><Icons.ArrowRight /> Back to Work</a>
      <div className="mt-10 max-w-4xl">
        <span className="font-eyebrow text-xs md:text-[13px] font-semibold uppercase tracking-[0.12em] text-[#3f3a36]">{project.category}</span>
        <h1 className="mt-5 text-5xl md:text-7xl leading-none">{project.title}</h1>
        <p className="mt-8 text-xl leading-relaxed text-[#4d4a46]">{project.description}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <span className="rounded-full bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white">{project.status}</span>
          {project.technology.slice(0, 5).map((technology) => <span key={technology} className="rounded-full bg-white border border-gray-200 px-4 py-2 text-sm text-gray-600">{technology}</span>)}
        </div>
      </div>
    </Section>
    <Section className="pb-24">
      <div className="overflow-hidden rounded-[2.5rem] bg-gray-100 aspect-[16/7]">
        <img src={project.image} alt={project.title} decoding="async" className="h-full w-full object-cover" />
      </div>
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {[
            ['Overview', project.caseStudy.overview],
            ['Problem', project.caseStudy.problem],
            ['Solution', project.caseStudy.solution],
            ['Architecture', project.caseStudy.architecture],
            ['Development Process', project.caseStudy.process],
            ['Challenges', project.caseStudy.challenges],
            ['Outcome', project.caseStudy.outcome],
          ].map(([title, content]) => <section key={title}><h2 className="text-3xl">{title}</h2><p className="mt-4 text-lg leading-relaxed text-[#4d4a46]">{content}</p></section>)}
        </div>
        <aside className="h-fit rounded-[2rem] bg-white p-7 shadow-sm border border-gray-100">
          <h2 className="text-2xl">Key Features</h2>
          <ul className="mt-5 space-y-3 text-sm text-[#4d4a46]">{project.highlights.map((highlight) => <li key={highlight} className="flex gap-3"><Icons.CheckCircle /> <span>{highlight}</span></li>)}</ul>
          <h2 className="mt-9 text-2xl">Technology</h2>
          <div className="mt-5 flex flex-wrap gap-2">{project.technology.map((technology) => <span key={technology} className="rounded-full bg-[#FDF5EB] px-3 py-1.5 text-xs font-medium text-[#a36a0b]">{technology}</span>)}</div>
          {project.github ? <a href={project.github} target="_blank" rel="noreferrer" className="mt-9 inline-flex items-center gap-2 border-t border-gray-100 pt-5 text-sm font-semibold text-[#a36a0b]"><Icons.Github /> View GitHub Repository</a> : <p className="mt-9 border-t border-gray-100 pt-5 text-xs leading-relaxed text-gray-400">No public GitHub, live demo, or documentation link has been added because none was supplied.</p>}
        </aside>
      </div>
    </Section>
  </>
)

const WorkPage = () => {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const byTitle = (title) => projectData.find((project) => project.title === title)
  const catalogItem = (number, title, description, category, technology, status, sourceTitle = title) => {
    const source = byTitle(sourceTitle)
    return {
      ...(source || {}),
      id: number,
      title,
      description,
      category,
      technology,
      tags: technology,
      status,
      image: source?.image || projectData[number - 1]?.image,
      slug: source?.slug,
      github: source?.github,
      featured: false,
    }
  }
  const sections = [
    {
      id: 'ai-ml',
      filter: 'AI / ML',
      eyebrow: '01 — AI & MACHINE LEARNING',
      title: 'Intelligent Systems & AI Experiments',
      description: 'Projects focused on machine learning, deep learning, computer vision, NLP, and intelligent applications.',
      projects: [
        catalogItem(1, 'Smart City Issue Detection & Reporting System', 'Computer vision platform for detecting and reporting urban infrastructure issues.', 'AI / Computer Vision / SaaS', ['YOLOv8', 'Python', 'OpenCV', 'FastAPI', 'React', 'PostgreSQL'], 'Prototype / FYP', 'SmartCity AI'),
        catalogItem(2, 'AI Research Agent', 'AI-powered research workflow for breaking down complex research tasks and generating structured results.', 'LLM / AI Agents', ['Python', 'LangGraph', 'LangChain', 'LLMs', 'RAG'], 'Prototype', 'AI Research Agent'),
        catalogItem(3, 'Multi-Agent Financial Analyst', 'Multi-agent AI system designed to analyze financial information through specialized AI workflows.', 'AI / FinTech / Multi-Agent', ['Python', 'LangGraph', 'LLMs', 'RAG'], 'Project'),
        catalogItem(4, 'AI Vision Analytics Platform', 'Computer vision platform for image/video processing and visual intelligence.', 'Computer Vision / AI', ['Python', 'YOLO', 'OpenCV', 'PyTorch', 'FastAPI'], 'Prototype'),
      ],
    },
    {
      id: 'web',
      filter: 'Web Apps',
      eyebrow: '02 — WEB APPLICATIONS',
      title: 'Modern Web Products',
      description: 'Full-stack web applications combining modern frontend interfaces with reliable backend systems.',
      projects: [
        catalogItem(5, 'E-Commerce Platform', 'Modern e-commerce application with product management, customers, orders, and administration.', 'Full-Stack Web', ['React', 'TypeScript', 'FastAPI', 'PostgreSQL'], 'Prototype'),
        catalogItem(6, 'Freelancer CRM', 'CRM platform for managing leads, clients, projects, proposals, and follow-ups.', 'SaaS / Business Software', ['React', 'FastAPI', 'PostgreSQL'], 'Prototype'),
        catalogItem(7, 'Restaurant Management System', 'Web-based restaurant management platform for managing menus, orders, staff, and business operations.', 'SaaS / Business Software', ['React', 'FastAPI', 'PostgreSQL'], 'Prototype', 'Restaurant Management SaaS'),
        catalogItem(8, 'Smart Inventory System', 'Inventory management application for products, stock, suppliers, and business analytics.', 'SaaS / Business Software', ['React', 'FastAPI', 'PostgreSQL'], 'Prototype'),
      ],
    },
    {
      id: 'mobile',
      filter: 'Mobile',
      eyebrow: '03 — MOBILE APPLICATIONS',
      title: 'Apps Built for Android & iOS',
      description: 'Mobile applications designed around practical user experiences and modern backend systems.',
      projects: [
        catalogItem(9, 'TaskFlow', 'Productivity application for tasks, projects, deadlines, and collaboration.', 'SaaS / Mobile / Productivity', ['Flutter', 'FastAPI', 'PostgreSQL'], 'Prototype'),
        catalogItem(10, 'AI Healthcare Mobile Platform', 'Mobile experience for an AI-enabled healthcare ecosystem.', 'Mobile / AI', ['Flutter', 'FastAPI', 'PostgreSQL', 'AI'], 'Concept'),
        catalogItem(11, 'Smart Business Mobile App', 'Mobile application concept for managing business operations and accessing business data on the go.', 'Mobile / Business Software', ['Flutter', 'REST API', 'PostgreSQL'], 'Concept'),
      ],
    },
    {
      id: 'saas',
      filter: 'SaaS',
      eyebrow: '04 — SAAS & DIGITAL PLATFORMS',
      title: 'Software Products Built Around Real Workflows',
      description: 'Products designed as scalable web-based platforms.',
      projects: [
        catalogItem(12, 'AI Business OS', 'AI-powered workspace combining business intelligence, knowledge, documents, research, meetings, and automation.', 'AI SaaS / Multi-Agent / RAG', ['FastAPI', 'PostgreSQL', 'LangChain', 'LangGraph', 'RAG', 'LLMs'], 'In Progress'),
        catalogItem(13, 'AI Customer Support Platform', 'AI-powered customer support system using company knowledge to assist with customer conversations.', 'AI SaaS / LLM', ['React', 'FastAPI', 'LLMs', 'RAG', 'Vector Search'], 'Prototype'),
        catalogItem(14, 'AI Document Intelligence', 'Platform for extracting, understanding, searching, and interacting with information from documents.', 'AI / Document Processing', ['Python', 'OCR', 'LLMs', 'RAG', 'Vector Search'], 'Prototype'),
        catalogItem(15, 'AI Knowledge Base', 'Private knowledge platform that allows users to upload information and interact with it through AI.', 'LLM / RAG / SaaS', ['FastAPI', 'LLMs', 'Embeddings', 'FAISS / Qdrant', 'PostgreSQL'], 'Prototype'),
      ],
    },
    {
      id: 'automation',
      filter: 'Automation',
      eyebrow: '05 — AUTOMATION & N8N',
      title: 'Intelligent Workflows',
      description: 'Automation projects connecting applications, APIs, AI models, databases, and business processes.',
      workflow: true,
      projects: [
        catalogItem(16, 'AI Lead Automation', 'Automatically process incoming leads, classify them, store information, and trigger follow-up workflows.', 'AI / Automation', ['n8n', 'AI', 'APIs', 'PostgreSQL'], 'Prototype'),
        catalogItem(17, 'AI Email Assistant', 'Automated email workflow for classification, summarization, drafting, and routing.', 'AI / Automation', ['n8n', 'LLM', 'Gmail/API', 'Automation'], 'Prototype'),
        catalogItem(18, 'Social Media Automation', 'Workflow system for content processing, scheduling, notifications, and AI-assisted content operations.', 'AI / Automation', ['n8n', 'AI', 'APIs', 'Automation'], 'Prototype'),
        catalogItem(19, 'Business Notification System', 'Automated workflow for sending alerts, updates, and business notifications based on predefined events.', 'Automation', ['n8n', 'Webhooks', 'APIs', 'Automation'], 'Prototype'),
      ],
    },
    {
      id: 'other',
      filter: 'Other',
      eyebrow: '06 — OTHER SOFTWARE PROJECTS',
      title: 'Experiments, Tools & Engineering Projects',
      description: 'A space for projects that do not fit directly into AI, web, mobile, SaaS, or automation.',
      projects: [
        catalogItem(20, 'Machine Learning From Scratch', 'Educational implementation of machine learning concepts using fundamental Python and numerical computing techniques.', 'Machine Learning / Python', ['Python', 'NumPy', 'Mathematics'], 'Research / Learning', 'ML From Scratch'),
      ],
    },
  ]
  const normalized = search.trim().toLowerCase()
  const visibleSections = sections.map((section) => ({
    ...section,
    projects: section.projects.filter((project) => !normalized || [project.title, project.category, project.description, project.technology.join(' ')].join(' ').toLowerCase().includes(normalized)),
  })).filter((section) => filter === 'All' || section.filter === filter)

  return (
    <>
      <Section className="pt-20 pb-10">
        <div className="mx-auto mb-10 max-w-4xl text-center">
          <span className="font-eyebrow text-xs md:text-[13px] font-semibold uppercase tracking-[0.12em] text-[#3f3a36]">WORK / PROJECTS</span>
          <h1 className="mt-5 text-5xl md:text-7xl leading-none">AI, Apps, Platforms &amp; Automation <Accent>I&apos;ve Built.</Accent></h1>
          <p className="mt-7 text-xl leading-relaxed text-[#4d4a46]">A collection of software products, AI systems, web applications, mobile apps, SaaS platforms, and automation workflows.</p>
        </div>
        <div className="text-center"><Button as="a" href="#ai-ml" variant="primary">Explore My Work <Icons.ArrowRight /></Button></div>
      </Section>
      <Section className="pb-24">
        <div className="sticky top-20 z-20 -mx-4 mb-14 flex flex-wrap justify-center gap-3 bg-[#F5F4F0]/95 px-4 py-4 backdrop-blur md:mx-0 md:rounded-full">
          {['All', 'AI / ML', 'Web Apps', 'Mobile', 'SaaS', 'Automation', 'Other'].map((item) => <Pill key={item} active={filter === item} onClick={() => { setFilter(item); if (item !== 'All') document.getElementById(item === 'Web Apps' ? 'web' : item === 'AI / ML' ? 'ai-ml' : item.toLowerCase())?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>{item}</Pill>)}
        </div>
        <div className="flex flex-col items-center gap-6 mb-14">
          <div className="relative w-full max-w-2xl"><div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400"><Icons.Search /></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects, skills, or technologies..." className="w-full rounded-full bg-white py-4 pl-12 pr-5 text-sm outline-none shadow-sm border border-transparent focus:border-gray-200" /></div>
        </div>
        <div className="space-y-20">
          {visibleSections.map((section) => <section id={section.id} key={section.id} className="scroll-mt-36 border-t border-[#e7e3dc] pt-14">
            <div className="mb-8"><span className="font-eyebrow text-xs md:text-[13px] font-semibold uppercase tracking-[0.12em] text-[#3f3a36]">{section.eyebrow}</span><h2 className="mt-3 text-4xl md:text-5xl">{section.title}</h2><p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#4d4a46]">{section.description}</p></div>
            {section.workflow && <div className="glass-dark mb-8 grid grid-cols-2 gap-3 rounded-[2rem] p-6 text-center text-white md:grid-cols-6"><span>Trigger</span><span>→ n8n</span><span>→ Process Data</span><span>→ AI / LLM</span><span>→ Decision</span><span>→ Action</span></div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{section.projects.map((project) => <WorkProjectCard key={`${section.id}-${project.id}`} project={project} />)}</div>
          </section>)}
        </div>
        {visibleSections.every((section) => section.projects.length === 0) && <p className="py-16 text-center text-[#4d4a46]">No projects match this search.</p>}
        <div className="mt-20 rounded-[3rem] bg-[#F2B56B] p-10 text-center md:p-16"><h2 className="text-4xl md:text-5xl">Have Something You Want to <Accent plain>Build?</Accent></h2><p className="mx-auto mt-5 max-w-2xl text-lg text-[#5d4529]">From AI systems to complete digital products, let&apos;s build it.</p><div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"><Button as="a" href="/#contact" variant="dark">Start a Project <Icons.ArrowRight /></Button><Button as="a" href="/services" variant="secondary">View Services <Icons.ArrowRight /></Button></div></div>
      </Section>
    </>
  )
}

const TeamMemberCard = ({ member }) => (
  <article className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col">
    <div className="mx-auto aspect-square w-40 rounded-full overflow-hidden bg-[#EBE7DF] flex items-center justify-center border-4 border-white shadow-md">
      {member.image ? (
        <img src={member.image} alt={member.name} className="h-full w-full object-cover object-top" />
      ) : (
        <span className="text-4xl font-black text-[#F2B56B]">{member.name.slice(-2)}</span>
      )}
    </div>
    <div className="p-3 pt-5 flex-1 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl text-[#1a1a1a]">{member.name}</h3>
          <p className="text-sm font-semibold text-[#F2B56B] mt-1">{member.role}</p>
        </div>
        {member.id === 1 && <span className="rounded-full bg-[#FDF5EB] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a36a0b]">Technical Lead</span>}
      </div>
      <p className="text-sm leading-relaxed text-[#4d4a46] mt-4">{member.bio}</p>
      {member.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {member.skills.slice(0, 5).map((skill) => <span key={skill} className="rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs text-gray-500">{skill}</span>)}
        </div>
      )}
      {(member.linkedin || member.github || member.website) && (
        <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-500">
          {member.linkedin && <a href={member.linkedin} target="_blank" rel="noreferrer" className="hover:text-[#1a1a1a]">LinkedIn</a>}
          {member.github && <a href={member.github} target="_blank" rel="noreferrer" aria-label={`${member.name} GitHub`} title="GitHub" className="hover:text-[#1a1a1a]"><Icons.Github /></a>}
          {member.twitter && <a href={member.twitter} target="_blank" rel="noreferrer" aria-label={`${member.name} Twitter/X`} title="Twitter/X" className="hover:text-[#1a1a1a]"><Icons.Twitter /></a>}
          {member.website && <a href={member.website} target="_blank" rel="noreferrer" className="hover:text-[#1a1a1a]">Website</a>}
        </div>
      )}
    </div>
  </article>
)

const TeamPage = () => {
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'AI / ML', 'Engineering', 'Frontend', 'Backend', 'Mobile', 'Design', 'DevOps', 'QA', 'Automation']
  const visibleTeam = filter === 'All' ? team : team.filter((member) => member.skills.some((skill) => skill.toLowerCase().includes(filter.toLowerCase().split(' ')[0])))

  return (
    <>
      <Section id="team" className="pt-20 pb-10">
        <SectionHeader
          subtitle="COLLABORATORS"
          title="People I collaborate with" accent="collaborate"
          description="Great products are built through collaboration. I work with specialists across AI, software engineering, design, mobile development, automation, and product development when the project requires it."
        />
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((item) => <Pill key={item} active={filter === item} onClick={() => setFilter(item)}>{item}</Pill>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {visibleTeam.map((member) => <TeamMemberCard key={member.id} member={member} />)}
        </div>
      </Section>

      <Section className="py-16">
        <div className="rounded-[3rem] bg-[#EBE7DF] p-10 md:p-14">
          <SectionHeader subtitle="COLLABORATIVE EXPERTISE" title="Multiple disciplines. One product mindset." accent="product mindset." description="The people I collaborate with bring capabilities across product definition, intelligent systems, software delivery, and ongoing improvement." />
          <div className="flex flex-wrap justify-center gap-3">
            {['AI & Machine Learning', 'Computer Vision', 'Generative AI', 'LLM Engineering', 'AI Agents', 'Web Development', 'Mobile Development', 'Backend Engineering', 'UI/UX Design', 'Cloud & DevOps', 'Automation', 'QA & Testing', 'SaaS Development', 'Product Development'].map((item) => <span key={item} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">{item}</span>)}
          </div>
        </div>
      </Section>

      <Section className="pb-24">
        <div className="glass-dark rounded-[3rem] p-10 md:p-16 text-center text-white">
          <p className="font-eyebrow text-xs md:text-[13px] font-semibold uppercase tracking-[0.12em] text-gray-400">COLLABORATE WITH US</p>
          <h2 className="mt-4 text-4xl md:text-6xl">Have a <Accent dark>Bigger Idea?</Accent></h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">Bring us your idea. We’ll combine the right skills and turn it into a product.</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button as="a" href="/#contact" variant="primary">Start a Project</Button>
            <Button as="a" href="/#services" variant="outline-dark">View Services</Button>
          </div>
        </div>
      </Section>
    </>
  )
}

const AboutPage = () => (
  <div className="font-body">
    <Section id="about-page" className="pt-20 pb-16 md:pt-28">
      <div className="max-w-3xl">
        <Eyebrow>About me</Eyebrow>
        <h1 className="font-display mt-5 text-5xl leading-[1.02] tracking-[-0.015em] text-[#1a1a1a] sm:text-6xl md:text-7xl">Building Intelligent Systems.<br className="hidden sm:block" /> Turning Ideas Into <Accent>Products.</Accent></h1>
        <div className="mt-8 max-w-2xl space-y-6 text-lg leading-[1.7] text-[#4d4a46]">
          <p>I’m <span className="font-medium text-[#1a1a1a]">Hamza Shahzad</span>, an Artificial Intelligence Engineer and software builder focused on creating intelligent systems and modern digital products.</p>
          <p>I work across <span className="text-[#1a1a1a]">Artificial Intelligence, Machine Learning, Computer Vision, Generative AI, LLM applications, AI agents, backend engineering, and application development</span>.</p>
          <p>My approach combines AI with practical software engineering—building systems that are not only technically interesting, but also useful, maintainable, and designed for real-world applications.</p>
        </div>
        <div className="mt-8 flex items-center gap-2 text-[#3f3a36]">
          <a href="https://linkedin.com/in/hamza-shahzad-667602355/" target="_blank" rel="noreferrer" aria-label="Hamza Shahzad on LinkedIn" className="rounded-lg p-2 transition hover:bg-white hover:text-[#1a1a1a]"><Icons.LinkedIn /></a>
          <a href="https://github.com/hamza01055" target="_blank" rel="noreferrer" aria-label="Hamza Shahzad on GitHub" className="rounded-lg p-2 transition hover:bg-white hover:text-[#1a1a1a]"><Icons.Github /></a>
          <a href="https://twitter.com/expertswith_ai" target="_blank" rel="noreferrer" aria-label="Hamza Shahzad on X" className="rounded-lg p-2 transition hover:bg-white hover:text-[#1a1a1a]"><Icons.Twitter /></a>
        </div>
      </div>
    </Section>

    <div className="bg-[#EBE7DF]/40">
      <Section className="py-20">
        <SectionHeader subtitle="My journey" title="From Learning AI to Building Real Systems" accent="Real Systems" description="My journey started with a strong interest in programming and Artificial Intelligence. During my BS in Artificial Intelligence, I explored machine learning, deep learning, computer vision, natural language processing, and software development." />
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 md:p-12 shadow-sm">
          <p className="text-lg leading-[1.7] text-[#4d4a46]">Over time, my focus moved beyond learning individual technologies. I started building complete applications where AI becomes part of a larger product.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-[#1a1a1a]">
            {['Idea', 'Architecture', 'Development', 'AI Integration', 'Testing', 'Product'].map((item, index) => <React.Fragment key={item}><span className="rounded-full bg-[#FDF5EB] px-4 py-2">{item}</span>{index < 5 && <span className="text-[#F2B56B]">→</span>}</React.Fragment>)}
          </div>
          <p className="mt-8 text-lg leading-[1.7] text-[#4d4a46]">This shift from experimenting with models to engineering complete systems shaped the way I approach technology today.</p>
        </div>
      </Section>
    </div>

    <Section className="py-20">
      <SectionHeader subtitle="What I do" title="AI, LLMs, and the software around them" accent="software" description="I build the intelligent capabilities and reliable software infrastructure needed to turn ideas into useful products." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[
          ['Artificial Intelligence', 'I build intelligent systems using machine learning, deep learning, computer vision, NLP, and generative AI.', ['Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'Generative AI', 'LLM Applications', 'AI Agents']],
          ['LLM Engineering', 'I develop applications around modern language models and retrieval systems.', ['LLM Applications', 'RAG', 'LangChain', 'LangGraph', 'Embeddings', 'Vector Search', 'AI Agents', 'Knowledge Systems']],
          ['Software Engineering', 'I build the software infrastructure that turns AI capabilities into usable products.', ['Python', 'FastAPI', 'Django', 'REST APIs', 'React', 'TypeScript', 'Flutter', 'PostgreSQL', 'Git & GitHub']],
        ].map(([title, description, skills]) => (
          <div key={title} className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h3 className="font-display text-3xl leading-tight">{title}</h3>
            <p className="mt-4 leading-relaxed text-[#4d4a46]">{description}</p>
            <div className="mt-6 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-500">{skill}</span>)}</div>
          </div>
        ))}
      </div>
    </Section>

    <div className="glass-dark text-white">
      <Section className="py-20">
        <div className="mx-auto max-w-4xl">
          <Eyebrow dark>How I think about engineering</Eyebrow>
          <h2 className="font-display mt-5 text-[2.75rem] leading-[1.05] tracking-[-0.01em] md:text-6xl">AI Is Only Valuable When It Solves a <Accent dark>Real Problem.</Accent></h2>
          <p className="mt-8 text-lg leading-[1.7] text-gray-400">I don’t approach every problem by asking, “Where can we use AI?” I start with, “What problem are we actually trying to solve?” From there, I determine whether AI is appropriate and what type of system makes sense.</p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">{['Machine learning model', 'Computer vision pipeline', 'LLM application', 'RAG system', 'AI agent', 'Backend system', 'Automation workflow', 'A combination'].map((item) => <span key={item} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300">{item}</span>)}</div>
          <p className="font-display mt-10 text-3xl italic leading-snug text-[#F2B56B] md:text-4xl">The technology should serve the product—not the other way around.</p>
        </div>
      </Section>
    </div>

    <Section className="py-20">
      <SectionHeader subtitle="My engineering approach" title="Understand. Design. Build. Test. Iterate. Deliver." accent="Deliver." description="A practical process for creating maintainable products that can continue evolving." />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          ['Understand', 'Understand the problem, users, requirements, and constraints.'],
          ['Design', 'Plan the architecture, data flow, AI components, APIs, and user experience.'],
          ['Build', 'Develop the system using appropriate technologies and engineering practices.'],
          ['Test', 'Validate functionality, reliability, AI behavior, and performance.'],
          ['Iterate', 'Improve the system based on testing, feedback, and real-world requirements.'],
          ['Deliver', 'Create a maintainable product that can continue evolving.'],
        ].map(([title, description], index) => <div key={title} className="rounded-[1.5rem] bg-white p-6 shadow-sm"><span className="font-eyebrow text-xs font-semibold text-[#a36a0b]">0{index + 1}</span><h3 className="font-display mt-3 text-2xl">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#4d4a46]">{description}</p></div>)}
      </div>
    </Section>

    <div className="bg-[#EBE7DF]/40">
      <Section className="py-20">
        <SectionHeader subtitle="Experience & education" title="Grounded in engineering practice" accent="practice" description="Professional experience and academic foundations supporting my work across AI and software systems." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm"><Eyebrow>10Pearls · Islamabad</Eyebrow><h3 className="font-display mt-4 text-3xl leading-tight">AI / Software Engineering Intern</h3><p className="mt-4 leading-relaxed text-[#4d4a46]">I’m gaining professional experience working in a real-world technology environment, strengthening my software engineering practices, collaboration, development workflows, and practical AI engineering skills.</p></div>
          <div className="rounded-[2rem] bg-white p-8 shadow-sm"><Eyebrow>The Islamia University of Bahawalpur</Eyebrow><h3 className="font-display mt-4 text-3xl leading-tight">BS Artificial Intelligence</h3><p className="mt-2 text-sm font-medium text-gray-500">4-Year Bachelor’s Degree · 2022–2026</p><p className="mt-4 leading-relaxed text-[#4d4a46]">Academic foundations across Artificial Intelligence, Machine Learning, Deep Learning, Computer Vision, NLP, programming, algorithms, data, and intelligent systems.</p></div>
        </div>
      </Section>
    </div>

    <Section className="py-20">
      <SectionHeader subtitle="Technologies I work with" title="An interactive toolkit, not a percentage chart" accent="toolkit" description="The tools I use across AI systems, LLM engineering, application development, data, and infrastructure." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          ['AI / ML', ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Hugging Face', 'YOLO']],
          ['LLM / GenAI', ['LangChain', 'LangGraph', 'RAG', 'Vector Databases', 'Embeddings', 'AI Agents']],
          ['Development', ['FastAPI', 'Django', 'React', 'TypeScript', 'Flutter', 'REST APIs']],
          ['Data & Infrastructure', ['PostgreSQL', 'Git', 'GitHub', 'Cloud Platforms', 'AI Automation']],
        ].map(([title, items]) => <div key={title} className="rounded-[2rem] bg-white p-7 shadow-sm"><h3 className="font-display text-2xl">{title}</h3><div className="mt-5 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full bg-[#FDF5EB] px-3 py-1.5 text-sm text-[#a36a0b]">{item}</span>)}</div></div>)}
      </div>
    </Section>

    <Section className="pb-20">
      <SectionHeader subtitle="Open source" title="Code & Contributions" accent="Contributions" />
      <GitHubActivity />
    </Section>

    <Section className="pb-20">
      <SectionHeader subtitle="What I build" title="Products across the stack" accent="the stack" description="My work spans multiple types of digital products." />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">{[['AI Systems', 'Intelligent applications powered by ML, computer vision, NLP, and generative AI.'], ['SaaS Products', 'Cloud-based platforms designed around real business workflows.'], ['Web Applications', 'Modern, responsive applications with strong backend architecture.'], ['Mobile Applications', 'Cross-platform applications for Android and iOS.'], ['AI Automation', 'Intelligent workflows that reduce repetitive tasks and connect business processes.']].map(([title, description]) => <div key={title} className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm"><h3 className="font-display text-2xl leading-tight">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#4d4a46]">{description}</p></div>)}</div>
    </Section>

    <div className="glass-dark text-white">
      <Section className="py-20">
        <div className="mx-auto max-w-4xl text-center"><Eyebrow dark>Current direction</Eyebrow><h2 className="font-display mt-5 text-[2.75rem] leading-[1.05] tracking-[-0.01em] md:text-6xl">Becoming a Stronger <Accent dark>AI Engineer</Accent></h2><p className="mt-6 text-lg leading-[1.7] text-gray-400">My current professional direction is focused on production AI systems, Computer Vision, LLM engineering, AI agents, RAG architectures, backend systems, scalable applications, and AI-powered products.</p><p className="mt-6 text-xl font-medium text-white">The goal is to bridge the gap between <span className="text-[#F2B56B]">AI research, engineering, and real-world products</span>.</p></div>
      </Section>
    </div>

    <Section className="py-20">
      <div className="mx-auto max-w-3xl text-center"><span className="font-display block text-7xl leading-none text-[#F2B56B]">“</span><h2 className="font-display text-5xl leading-[1.05] tracking-[-0.01em] md:text-6xl">Build. Learn. Improve. <Accent>Repeat.</Accent></h2><p className="mt-6 text-lg leading-[1.7] text-[#4d4a46]">Every project is an opportunity to understand something better. I believe progress comes from consistently building, testing ideas, learning from failures, and improving the next version.</p></div>
    </Section>

    <Section className="pb-24">
      <div className="rounded-[3rem] bg-[#F2B56B] p-10 md:p-16 text-center"><h2 className="font-display text-5xl leading-[1.05] tracking-[-0.01em] md:text-7xl">Have an <Accent plain>Idea?</Accent></h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#5d4529]">Let’s turn an idea into something real—an AI system, SaaS platform, web application, mobile app, or intelligent automation workflow.</p><div className="mt-8 flex flex-col sm:flex-row justify-center gap-4"><Button as="a" href="/#work" variant="dark">View My Work <Icons.ArrowRight /></Button><Button as="a" href="/#contact" variant="secondary">Let’s Talk</Button></div></div>
    </Section>
  </div>
)

const ServicesPage = () => {
  const serviceGroups = [
    {
      title: 'AI & Machine Learning',
      description: 'Build intelligent systems that use data, machine learning, computer vision, NLP, and generative AI.',
      capabilities: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Object Detection', 'Image Classification', 'NLP', 'Predictive Systems', 'AI Model Integration', 'Model APIs', 'AI-powered Applications'],
      technologies: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'YOLO', 'OpenCV', 'Hugging Face'],
      cta: 'Discuss an AI Project',
    },
    {
      title: 'LLM & Generative AI',
      description: 'Build applications that use large language models to search, understand, generate, and interact with information.',
      capabilities: ['LLM Applications', 'RAG Systems', 'AI Chatbots', 'AI Assistants', 'AI Agents', 'Multi-Agent Systems', 'Document Intelligence', 'Knowledge Bases', 'Semantic Search', 'Embeddings', 'Vector Search', 'AI Workflows'],
      technologies: ['LangChain', 'LangGraph', 'Hugging Face', 'Sentence Transformers', 'FAISS', 'Qdrant', 'pgvector', 'LLM APIs'],
      cta: 'Build an AI Application',
    },
    {
      title: 'SaaS Development',
      description: 'Build SaaS platforms designed around real business workflows.',
      capabilities: ['SaaS Architecture', 'Authentication', 'User Management', 'Role-Based Access', 'Admin Dashboards', 'REST APIs', 'Database Design', 'Multi-Tenant Systems', 'Subscription Systems', 'Analytics', 'AI Integration'],
      technologies: ['CRM systems', 'Business management platforms', 'AI SaaS', 'Inventory systems', 'Customer support platforms', 'Internal business tools'],
      cta: 'Build My SaaS',
    },
    {
      title: 'Web Development',
      description: 'Build responsive web applications that combine strong frontend experiences with reliable backend systems.',
      capabilities: ['Landing Pages', 'Business Websites', 'Dashboards', 'Web Applications', 'API Integration', 'Authentication', 'Admin Panels', 'Database-Driven Applications'],
      technologies: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Python', 'FastAPI', 'Django', 'REST APIs', 'PostgreSQL'],
      cta: 'Build My Website',
    },
    {
      title: 'Mobile App Development',
      description: 'Build cross-platform mobile applications designed to connect with modern APIs and backend systems.',
      capabilities: ['Android Applications', 'iOS Applications', 'Cross-Platform Development', 'API Integration', 'Authentication', 'Push Notifications', 'Backend Integration', 'AI-powered Mobile Features'],
      technologies: ['Flutter'],
      cta: 'Build My App',
    },
    {
      title: 'AI Automation',
      description: 'Design intelligent workflows that connect applications, APIs, data, and AI to reduce repetitive work.',
      capabilities: ['Lead automation', 'Customer support automation', 'AI email workflows', 'Document processing', 'Data extraction', 'AI-powered reporting', 'Content workflows', 'Internal business automation', 'Notification systems', 'AI agent workflows'],
      technologies: ['APIs', 'AI workflows', 'Automation systems', 'Intelligent agents'],
      cta: 'Automate My Workflow',
    },
  ]

  const faqs = [
    ['Can you build a complete product?', 'Yes. Projects can cover multiple layers including AI, backend, frontend, mobile, databases, APIs, and automation.'],
    ['Can you work on an existing project?', 'Yes. Existing applications can be extended, improved, integrated with AI, or restructured where appropriate.'],
    ['Do you work with collaborators?', 'For projects requiring multiple disciplines, I can collaborate with specialists when the scope calls for it.'],
    ['Can you build an MVP?', 'Yes. The project can be scoped around the core features required to validate an idea before expanding it.'],
    ['Can AI be added to an existing application?', 'Yes. Existing products can be evaluated for assistants, RAG, recommendations, document processing, computer vision, or automation.'],
    ['Do you provide only development?', 'The engagement can cover planning, architecture, development, AI integration, testing, and technical delivery depending on the project.'],
  ]

  return (
    <>
      <Section id="services-page" className="pt-20 pb-24">
        <div className="max-w-5xl">
          <span className="font-eyebrow text-xs md:text-[13px] font-semibold uppercase tracking-[0.12em] text-[#3f3a36]">SERVICES</span>
          <h1 className="mt-5 text-5xl md:text-7xl leading-none">What I <Accent>Build</Accent></h1>
          <h2 className="mt-7 text-3xl md:text-5xl leading-tight">AI, Software & Digital Products Built Around Real Business Problems.</h2>
          <p className="mt-7 max-w-3xl text-xl leading-relaxed text-[#4d4a46]">I help turn ideas, workflows, and business requirements into modern digital products—from AI-powered systems and SaaS platforms to web applications, mobile apps, and intelligent automation.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button as="a" href="/#contact" variant="primary">Start a Project <Icons.ArrowRight /></Button>
            <Button as="a" href="/#work" variant="outline">View My Work</Button>
          </div>
        </div>
      </Section>

      <div className="bg-[#EBE7DF]/40">
        <Section className="py-20">
          <SectionHeader subtitle="SERVICES OVERVIEW" title="From Idea to Working Product" accent="Working Product" description="I provide development across AI, software engineering, application development, and automation." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceGroups.map((service, index) => <div key={service.title} className="rounded-[2rem] bg-white p-8 shadow-sm"><span className="font-eyebrow text-xs font-semibold text-[#a36a0b]">0{index + 1}</span><h3 className="mt-5 text-3xl">{service.title}</h3><p className="mt-4 leading-relaxed text-[#4d4a46]">{service.description}</p><Button as="a" href="/#contact" variant="ghost" size="small" className="mt-6">{service.cta} <Icons.ArrowRight /></Button></div>)}
          </div>
        </Section>
      </div>

      <Section className="py-24">
        <SectionHeader subtitle="DETAILED CAPABILITIES" title="Technology matched to the problem" accent="the problem" description="Each engagement can be scoped around the capabilities and technologies that make sense for the product." />
        <div className="space-y-8">
          {serviceGroups.map((service, index) => (
            <article key={service.title} className="rounded-[2.5rem] bg-white p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
                <div className="max-w-xl"><span className="font-eyebrow text-xs font-semibold text-[#a36a0b]">0{index + 1}</span><h3 className="mt-4 text-3xl md:text-4xl">{service.title}</h3><p className="mt-4 text-lg leading-relaxed text-[#4d4a46]">{service.description}</p></div>
                <Button as="a" href="/#contact" variant="dark" size="secondary" className="self-start">{service.cta} <Icons.ArrowRight /></Button>
              </div>
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><h4 className="font-bold">Capabilities</h4><div className="mt-4 flex flex-wrap gap-2">{service.capabilities.map((item) => <span key={item} className="rounded-full bg-[#FDF5EB] px-3 py-1.5 text-sm text-[#a36a0b]">{item}</span>)}</div></div>
                <div><h4 className="font-bold">Technologies / Typical Products</h4><div className="mt-4 flex flex-wrap gap-2">{service.technologies.map((item) => <span key={item} className="rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 text-sm text-gray-500">{item}</span>)}</div></div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <div className="glass-dark text-white">
        <Section className="py-24">
          <SectionHeader subtitle="PRODUCT DEVELOPMENT" title="From Concept to Product" accent="Product" dark description="If you have an idea but don't know where to start, I can help translate the idea into a technical product plan." />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Idea', 'Product Planning', 'Architecture', 'Development', 'Testing', 'Launch'].map((step, index) => <div key={step} className="rounded-[1.5rem] border border-white/10 p-6"><span className="font-eyebrow text-xs font-semibold text-[#F2B56B]">0{index + 1}</span><h3 className="mt-4 text-2xl">{step}</h3><p className="mt-3 text-sm leading-relaxed text-gray-400">{['Define the problem and target users.', 'Define features, priorities, and requirements.', 'Select the appropriate technologies and architecture.', 'Build the product and integrate required components.', 'Validate the product and improve reliability.', 'Prepare the system for deployment and continued development.'][index]}</p></div>)}
          </div>
        </Section>
      </div>

      <Section className="py-24">
        <SectionHeader subtitle="WHY WORK WITH ME?" title="Engineering + Product Thinking" accent="Product Thinking" description="The focus is on building useful systems rather than adding complexity for its own sake." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            ['AI First When It Makes Sense', 'I don’t add AI simply because it’s popular. I focus on whether it actually improves the product.'],
            ['Full Product Perspective', 'I can work across AI, backend, frontend, mobile, APIs, databases, and automation.'],
            ['Practical Development', 'The focus is on building usable systems rather than only prototypes or experiments.'],
            ['Flexible Collaboration', 'Projects can be handled individually or with specialist collaborators when multiple disciplines are required.'],
          ].map(([title, description]) => <div key={title} className="rounded-[2rem] bg-white p-7 shadow-sm"><h3 className="text-2xl">{title}</h3><p className="mt-4 leading-relaxed text-[#4d4a46]">{description}</p></div>)}
        </div>
      </Section>

      <div className="bg-[#EBE7DF]/40">
        <Section className="py-24">
          <SectionHeader subtitle="WHO I WORK WITH" title="Built for different stages and ambitions" accent="ambitions" description="My services can support individuals, founders, startups, businesses, and organizations." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">{[['Startups', 'Build and validate new digital products.'], ['Small & Medium Businesses', 'Improve existing workflows with software and automation.'], ['Founders', 'Turn product ideas into working MVPs.'], ['Organizations', 'Develop internal systems and intelligent business tools.'], ['Individuals', 'Build websites, applications, and custom software products.']].map(([title, description]) => <div key={title} className="rounded-[1.5rem] bg-white p-6 shadow-sm"><h3 className="text-2xl">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#4d4a46]">{description}</p></div>)}</div>
        </Section>
      </div>

      <Section className="py-24">
        <SectionHeader subtitle="HOW WE WORK" title="A clear path from requirements to delivery" accent="delivery" description="Every engagement is shaped around the product, the people using it, and the outcome it needs to create." />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">{[['Discovery', 'Understand your idea, requirements, users, and goals.'], ['Scope', 'Define features, priorities, timeline, and technical requirements.'], ['Architecture', 'Design the technical structure and choose the appropriate stack.'], ['Build', 'Develop the product in structured stages.'], ['Review', 'Test, refine, and incorporate feedback.'], ['Deliver', 'Prepare the final product for deployment and future development.']].map(([title, description], index) => <div key={title} className="rounded-[1.5rem] bg-white p-6 shadow-sm"><span className="font-eyebrow text-xs font-semibold text-[#a36a0b]">0{index + 1}</span><h3 className="mt-4 text-2xl">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#4d4a46]">{description}</p></div>)}</div>
      </Section>

      <div className="bg-[#EBE7DF]/40">
        <Section className="py-24">
          <SectionHeader subtitle="FAQ" title="Questions before we start" accent="we start" description="A few practical answers about working together." />
          <div className="mx-auto max-w-4xl space-y-4">{faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl bg-white p-6 shadow-sm"><summary className="cursor-pointer list-none pr-8 text-lg font-bold">{question}<span className="float-right text-[#F2B56B] group-open:rotate-45 transition-transform">+</span></summary><p className="mt-4 max-w-3xl leading-relaxed text-[#4d4a46]">{answer}</p></details>)}</div>
        </Section>
      </div>

      <Section className="py-24">
        <div className="rounded-[3rem] bg-[#F2B56B] p-10 md:p-16 text-center"><h2 className="text-4xl md:text-6xl">Have a <Accent plain>Product</Accent> in Mind?</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#5d4529]">Let’s turn your idea into a working digital product.</p><div className="mt-8 flex flex-col sm:flex-row justify-center gap-4"><Button as="a" href="/#contact" variant="dark">Start a Project <Icons.ArrowRight /></Button><Button as="a" href="/#work" variant="secondary">View My Work</Button></div></div>
      </Section>
    </>
  )
}

const ServicesAndSkills = () => (
  <div className="bg-[#EBE7DF]/40 pt-10 pb-10">
    <Section id="services">
      <SectionHeader
        subtitle="SERVICES"
        title="AI engineering and product development" accent="product development"
        description="From intelligent systems and automation to web applications, mobile products, APIs, and backend infrastructure, I build complete products around AI."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PORTFOLIO_DATA.services.map((service, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col h-full">
            <div className="w-12 h-12 rounded-full bg-[#FDF5EB] flex items-center justify-center mb-6">{service.icon}</div>
            <h3 className="text-3xl text-[#1a1a1a] mb-4">{service.title}</h3>
            <p className="text-[#4d4a46] leading-relaxed mb-8 flex-1">{service.desc}</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {service.tags.map((tag, tIdx) => (
                <span key={tIdx} className="bg-gray-50 text-gray-500 text-xs font-medium px-4 py-1.5 rounded-full border border-gray-100">{tag}</span>
              ))}
            </div>
            <Button as="a" href="/#contact" variant="ghost" size="small" className="mt-auto">
              Learn more <Icons.ArrowRight />
            </Button>
          </div>
        ))}
      </div>
      <div className="glass-dark mt-8 rounded-[2rem] p-8 md:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="font-eyebrow text-xs md:text-[13px] font-semibold uppercase tracking-[0.12em] text-gray-400">COLLABORATION</p>
          <h3 className="mt-2 text-3xl leading-tight">Need More Than One Specialist?</h3>
          <p className="text-gray-400 mt-3 max-w-2xl">Some products require multiple disciplines. When a project needs broader expertise, I collaborate with my team across AI, software engineering, design, mobile development, automation, and product development.</p>
        </div>
        <Button as="a" href="/#contact" variant="primary" size="secondary" className="w-full md:w-auto shrink-0">Discuss Your Project</Button>
      </div>
    </Section>

    <Section id="skills" className="pt-10">
      <SectionHeader
        subtitle="SKILLS & TECH STACK"
        title="AI engineering and modern software tools" accent="software tools"
        description="The technologies I use across AI systems, computer vision, LLM applications, backend services, full-stack products, mobile apps, SaaS, automation, and infrastructure."
      />

      <div className="skills-marquee space-y-3" aria-label="Technology stack">
        {[
          ['left', ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'OpenCV', 'YOLO', 'NLP', 'Computer Vision', 'Generative AI', 'Hugging Face', 'LangChain', 'LangGraph', 'LlamaIndex', 'RAG', 'AI Agents', 'Ollama', 'FAISS', 'Qdrant']],
          ['right', ['FastAPI', 'Django', 'Flask', 'React', 'Next.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Flutter', 'Dart', 'Android', 'iOS', 'REST APIs', 'WebSockets', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis']],
          ['left', ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Nginx', 'Git', 'GitHub', 'GitHub Actions', 'CI/CD', 'MLflow', 'n8n', 'Firebase', 'Supabase', 'Postman', 'Swagger', 'Figma', 'Celery', 'SQL', 'System Design', 'SaaS', 'AI Automation']],
        ].map(([direction, technologies], rowIndex) => (
          <div key={direction + rowIndex} className={`skills-marquee-viewport skills-marquee-${direction}`}>
            <div className="skills-marquee-track">
              {[...technologies, ...technologies].map((technology, index) => (
                <span key={`${technology}-${index}`} className="skills-marquee-pill">
                  <span className="skills-marquee-icon" aria-hidden="true"><TechIcon technology={technology} /></span>
                  {technology}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  </div>
)

const Workflow = () => (
  <Section id="workflow" className="pt-24 pb-10">
    <SectionHeader
      subtitle="WORKFLOW"
      title="How I design and build" accent="build"
      description="A clear, repeatable process: discover → design → build → refine—delivering clean UI, smooth interactions, and fast, responsive results."
    />
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {PORTFOLIO_DATA.workflow.map((item, idx) => (
        <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-sm flex flex-col items-start relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-10 h-10 rounded-full bg-[#F2B56B] text-[#1a1a1a] flex items-center justify-center font-bold mb-6 text-lg">{item.step}</div>
          <h3 className="text-2xl text-[#1a1a1a] mb-4">{item.title}</h3>
          <p className="text-[#4d4a46] text-sm leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </Section>
)

const HomeTeam = () => (
  <div className="bg-[#EBE7DF]/30">
    <Section id="team-preview" className="py-24">
      <SectionHeader
        subtitle="COLLABORATORS"
        title="Built through collaboration." accent="collaboration."
        description="I lead the technical direction and collaborate with developers, AI engineers, designers, and technology specialists when a project needs broader expertise."
        rightAction={<Button as="a" href="/team" variant="dark" size="secondary">Meet the collaborators <Icons.ArrowRight /></Button>}
      />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {team.filter((member) => member.featured && member.image).map((member) => (
          <a key={member.id} href="/team" className="group block rounded-[2rem] border border-white/70 bg-white/60 p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" aria-label={`View ${member.name} on the team page`}>
            <div className="mx-auto aspect-square w-full max-w-40 overflow-hidden rounded-full border-4 border-white bg-[#EBE7DF] shadow-md">
              <img src={member.image} alt={member.name} className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="px-1 pb-1 pt-4">
              <h3 className="truncate text-xl text-[#1a1a1a]">{member.name}</h3>
              <p className="mt-1 truncate text-xs font-semibold text-[#b47718]">{member.role}</p>
            </div>
          </a>
        ))}
      </div>
    </Section>
  </div>
)

const _AboutAndExperience = () => (
  <Section id="about" className="pt-24 pb-20">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
      <div className="relative w-full aspect-[4/5] bg-[#dce3e5] rounded-[3rem] overflow-hidden shadow-lg order-2 lg:order-1">
        <img src={profileImage} alt="Hamza Shahzad profile" className="h-full w-full object-cover object-top" />
      </div>

      <div className="order-1 lg:order-2">
        <span className="font-eyebrow text-xs md:text-[13px] font-semibold uppercase tracking-[0.12em] text-[#3f3a36] mb-4 block">ABOUT HAMZA</span>
        <h2 className="text-4xl md:text-5xl text-[#1a1a1a] mb-8 leading-tight">Engineering intelligence into <Accent>real-world products</Accent></h2>
        <div className="space-y-6 text-[#4d4a46] text-lg leading-relaxed mb-12">
            <p>I’m an Artificial Intelligence engineer with hands-on experience building practical AI systems and modern software products.</p>
          <p>My work spans Machine Learning, Computer Vision, NLP, Generative AI, LLM applications, AI agents, backend engineering, web development, and mobile applications.</p>
          <p>I enjoy taking an idea from an early concept and turning it into a working product—from architecture and the AI layer to APIs, databases, interfaces, and deployment workflows.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['AI', 'Core\nSpecialization'],
            ['BS AI', 'Academic\nFoundation'],
          ].map(([value, label]) => (
            <div key={value} className="bg-white p-6 rounded-3xl shadow-sm text-center">
              <h3 className="text-4xl text-[#F2B56B]">{value}</h3>
              <p className="text-xs text-gray-500 font-medium mt-2 whitespace-pre-line">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div>
      <SectionHeader
        subtitle="EXPERIENCE & EDUCATION"
        title="Building toward the future of intelligent software" accent="intelligent software"
        description="Experience as a Freelance AI Developer and AI / Software Intern, alongside a Bachelor of Science in Artificial Intelligence from The Islamia University of Bahawalpur."
      />
      <div className="relative border-l-2 border-[#F5DFB8] ml-4 md:ml-0 md:pl-12 text-left space-y-12 pb-12">
        {PORTFOLIO_DATA.experience.map((exp, idx) => (
          <div key={idx} className="relative pl-8 md:pl-0">
            <div className="absolute w-4 h-4 bg-[#F2B56B] rounded-full -left-[45px] md:-left-[57px] top-8 shadow-[0_0_0_6px_#F5F4F0]" />
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                <div>
                  <h3 className="text-3xl text-[#1a1a1a] mb-2">{exp.role}</h3>
                  <div className="flex items-center gap-2 text-gray-500 font-medium"><Icons.Briefcase /> <span>{exp.company}</span></div>
                </div>
                <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">{exp.period}</span>
              </div>

              <p className="text-[#4d4a46] leading-relaxed mb-6">{exp.desc}</p>

              {exp.bullets && (
                <ul className="space-y-3">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3 text-gray-600 text-sm">
                      <span className="mt-0.5"><Icons.CheckCircle /></span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        <div className="relative pl-8 md:pl-0">
          <div className="absolute w-4 h-4 bg-[#F2B56B] rounded-full -left-[45px] md:-left-[57px] top-8 shadow-[0_0_0_6px_#F5F4F0]" />
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h3 className="text-3xl text-[#1a1a1a] mb-2">Bachelor of Science in Artificial Intelligence</h3>
                <div className="flex items-center gap-2 text-gray-500 font-medium"><Icons.Briefcase /> <span>The Islamia University of Bahawalpur</span></div>
              </div>
              <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">4-Year Bachelor’s Degree</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Section>
)

const Web3Section = () => (
  <Section id="web3" className="py-24">
    <div className="bg-[#EBE7DF] rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
      <div className="max-w-xl">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 text-[#F2B56B]"><Icons.Blocks /></div>
        <span className="font-eyebrow text-xs md:text-[13px] font-semibold uppercase tracking-[0.12em] text-[#3f3a36] mb-4 block">WEB3</span>
        <h2 className="text-3xl md:text-5xl text-[#1a1a1a] mb-6 leading-tight">Learning the future, <Accent>one block at a time</Accent></h2>
        <p className="text-[#4d4a46] text-lg leading-relaxed">Blockchain technology is where I see the future heading. I’m still learning — smart contracts, wallets, and the ideas behind decentralization — while contributing content and artwork to web3 communities like Dlicom.</p>
      </div>
      <Button as="a" href="/about" variant="dark" className="shadow-lg">
        Read about my work <Icons.ArrowUpRight />
      </Button>
    </div>
  </Section>
)

const Contact = () => {
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')
    const email = formData.get('email')
    const message = formData.get('message')
    const subject = encodeURIComponent(`Project inquiry from ${name}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    setSubmitted(true)
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
  }

  return (
    <Section id="contact" className="py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="flex flex-col">
          <h2 className="text-4xl text-[#1a1a1a] mb-10">Have an idea? Let’s <Accent>build it.</Accent></h2>

          <div className="space-y-8 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FDF5EB] text-[#F2B56B] flex items-center justify-center shrink-0"><Icons.Mail /></div>
              <div>
                <h4 className="text-base font-bold text-[#1a1a1a]">Email</h4>
                <a href={`mailto:${contactEmail}`} className="text-[#4d4a46] hover:text-[#1a1a1a] transition">{contactEmail}</a>
                <Button type="button" onClick={handleCopy} variant="ghost" size="small" className="ml-2 px-2 text-xs text-gray-400">{copied ? 'Copied' : 'Copy'}</Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FDF5EB] text-[#F2B56B] flex items-center justify-center shrink-0"><Icons.MapPin /></div>
              <div>
                <h4 className="text-base font-bold text-[#1a1a1a]">Location</h4>
                <p className="text-[#4d4a46]">Pakistan</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E9F9EF] text-[#25D366] flex items-center justify-center shrink-0"><Icons.Whatsapp /></div>
              <div>
                <h4 className="text-base font-bold text-[#1a1a1a]">WhatsApp</h4>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-[#4d4a46] hover:text-[#1a1a1a] transition">Message me on WhatsApp</a>
              </div>
            </div>
          </div>

          <h4 className="text-base font-bold text-[#1a1a1a] mb-6">Primary social contacts</h4>
          <div className="flex flex-wrap gap-3 mb-10">
            <Button as="a" href="https://twitter.com/expertswith_ai" target="_blank" rel="noreferrer" aria-label="Follow Hamza Shahzad on X" variant="secondary" size="small" className="text-gray-600 hover:border-[#1DA1F2]"><span className="text-[#1DA1F2]"><Icons.Twitter /></span> @expertswith_ai</Button>
            <Button as="a" href="https://www.instagram.com/hamxa_builds/" target="_blank" rel="noreferrer" aria-label="Follow Hamza Shahzad on Instagram" variant="secondary" size="small" className="text-gray-600 hover:border-[#E1306C]"><span className="text-[#E1306C]"><Icons.Instagram /></span> @hamxa_builds</Button>
            <Button as="a" href="https://t.me/hamm_xa" target="_blank" rel="noreferrer" aria-label="Message Hamza Shahzad on Telegram" variant="secondary" size="small" className="text-gray-600 hover:border-[#229ED9]"><span className="text-[#229ED9]"><Icons.Telegram /></span> @hamm_xa</Button>
            <Button as="a" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Message Hamza Shahzad on WhatsApp" variant="primary" size="small" className="bg-[#25D366] text-white hover:brightness-95"><Icons.Whatsapp /> WhatsApp</Button>
          </div>

          <div className="w-full aspect-video md:aspect-auto md:h-64 bg-[#EBE7DF]/50 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 border border-gray-200/50 relative overflow-hidden">
            <Icons.MapPin />
            <span className="text-sm mt-2">Pakistan · AI & software engineering</span>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-sm border border-gray-100">
          <h2 className="text-4xl text-[#1a1a1a] mb-8">Send a <Accent>Message</Accent></h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold text-[#1a1a1a] mb-2">Name</label>
              <input id="contact-name" name="name" type="text" placeholder="Your name" required autoComplete="name" className="w-full bg-[#F5F4F0] px-5 py-4 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-[#F2B56B] transition-shadow border-none" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold text-[#1a1a1a] mb-2">Email</label>
              <input id="contact-email" name="email" type="email" placeholder="your@email.com" required autoComplete="email" className="w-full bg-[#F5F4F0] px-5 py-4 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-[#F2B56B] transition-shadow border-none" />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold text-[#1a1a1a] mb-2">Message</label>
              <textarea id="contact-message" name="message" placeholder="Tell me about your project..." rows="5" required className="w-full bg-[#F5F4F0] px-5 py-4 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-[#F2B56B] transition-shadow border-none resize-none" />
            </div>
            <Button type="submit" className="mt-4 w-full rounded-2xl text-base font-bold">
              <Icons.Send /> Send Message
            </Button>
            <p role="status" className="text-center text-xs text-gray-500 font-medium mt-6">{submitted ? 'Your email app should open with the inquiry prepared.' : 'Submitting opens your email app with the inquiry prepared.'}</p>
          </form>
        </div>
      </div>
    </Section>
  )
}

const PreFooterCTA = () => (
  <div className="glass-dark py-24 md:py-32 px-4 text-center">
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <h2 className="text-4xl md:text-6xl text-white mb-6">Build your next <Accent dark>modern</Accent> experience</h2>
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">I’m Hamza Shahzad, an Artificial Intelligence Engineer building intelligent systems, software products, and modern digital experiences.</p>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
        <Button as="a" href="#contact" variant="primary" className="w-full shadow-sm sm:w-auto">
          Start a conversation <Icons.ArrowRight />
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-gray-400 text-sm">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> Project inquiries welcome</span>
        <span className="hidden sm:inline">•</span>
        <span>Based in Pakistan</span>
        <span className="hidden sm:inline">•</span>
        <span>Response within 24h</span>
      </div>
    </div>
  </div>
)

const Footer = () => (
  <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        <div className="md:col-span-5 flex flex-col items-start">
          <h3 className="text-3xl text-[#1a1a1a] mb-2">Hamza Shahzad</h3>
          <p className="text-gray-500 text-sm mb-6">Artificial Intelligence Engineer</p>
          <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">          AI Engineer building intelligent systems, software products, and digital experiences.</p>
          <div className="flex items-center gap-2 text-gray-500 text-sm"><Icons.MapPin />           <span>Pakistan</span></div>
        </div>

        <div className="md:col-span-3 md:col-start-7 flex flex-col">
          <h4 className="font-bold text-[#1a1a1a] mb-6">Navigation</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li><a href="/" className="hover:text-[#F2B56B] transition">Home</a></li>
            <li><a href="/work" className="hover:text-[#F2B56B] transition">Projects</a></li>
            <li><a href="/about" className="hover:text-[#F2B56B] transition">About</a></li>
            <li><a href="/services" className="hover:text-[#F2B56B] transition">Services</a></li>
            <li><a href="/team" className="hover:text-[#F2B56B] transition">Team</a></li>
            <li><a href="/#contact" className="hover:text-[#F2B56B] transition">Contact</a></li>
          </ul>
        </div>

        <div className="md:col-span-3 flex flex-col">
          <h4 className="font-bold text-[#1a1a1a] mb-6">Connect</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li><a href="https://github.com/hamza01055" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#F2B56B] transition"><Icons.Github /> Github</a></li>
            <li><a href="https://linkedin.com/in/hamza-shahzad-667602355/" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#F2B56B] transition"><Icons.LinkedIn /> LinkedIn</a></li>
            <li><a href="https://twitter.com/expertswith_ai" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#F2B56B] transition"><Icons.Twitter /> @expertswith_ai</a></li>
            <li><a href="https://www.instagram.com/hamxa_builds/" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#F2B56B] transition"><Icons.Instagram /> @hamxa_builds</a></li>
            <li><a href="https://t.me/hamm_xa" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#F2B56B] transition"><Icons.Telegram /> @hamm_xa</a></li>
            <li><a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#F2B56B] transition"><Icons.Whatsapp /> WhatsApp</a></li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 text-sm">© 2026 Hamza Shahzad. All rights reserved.</p>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top" variant="secondary" size="icon" className="ml-2 border-gray-100 bg-gray-50 shadow-sm hover:bg-gray-100">
            <Icons.ArrowUp />
          </Button>
        </div>
      </div>
    </div>
  </footer>
)

const routeMetadata = {
  '/': {
    title: 'Hamza Shahzad | Artificial Intelligence Engineer',
    description: 'Hamza Shahzad builds practical AI applications, software products, LLM systems, computer vision workflows, and automation tools.',
  },
  '/work': {
    title: 'Work & Projects | Hamza Shahzad',
    description: 'Explore Hamza Shahzad\'s AI, software, web, mobile, SaaS, and automation projects, including prototypes, concepts, and learning work.',
  },
  '/services': {
    title: 'AI & Software Services | Hamza Shahzad',
    description: 'AI application development, LLM and RAG systems, custom software, web development, mobile applications, and automation.',
  },
  '/about': {
    title: 'About Hamza Shahzad | AI Engineer',
    description: 'Learn about Hamza Shahzad\'s focus across artificial intelligence, machine learning, computer vision, LLM applications, and software engineering.',
  },
  '/team': {
    title: 'Collaborators | Hamza Shahzad',
    description: 'Meet the specialists Hamza Shahzad collaborates with across AI, software engineering, design, mobile development, and automation.',
  },
}

export default function App() {
  const [backgroundOffset, setBackgroundOffset] = useState({ x: 0, y: 0 })
  const appRef = useRef(null)
  const currentPath = window.location.pathname
  const isTeamPage = currentPath === '/team'
  const isAboutPage = currentPath === '/about'
  const isServicesPage = currentPath === '/services'
  const isWorkPage = currentPath === '/work'
  const projectSlug = currentPath.startsWith('/work/') ? currentPath.slice('/work/'.length) : ''
  const caseStudyProject = projectSlug ? projectData.find((project) => project.slug === projectSlug) : null

  useEffect(() => {
    const metadata = routeMetadata[currentPath] || {
      title: 'Hamza Shahzad | AI Engineer',
      description: 'Hamza Shahzad builds practical AI applications and modern software products.',
    }
    const canonicalUrl = `https://hamzashahzad.com${currentPath === '/' ? '' : currentPath}`
    document.title = metadata.title

    const tags = {
      description: metadata.description,
      'og:title': metadata.title,
      'og:description': metadata.description,
      'og:url': canonicalUrl,
      'twitter:title': metadata.title,
      'twitter:description': metadata.description,
    }

    Object.entries(tags).forEach(([key, content]) => {
      const selector = key.startsWith('og:') || key.startsWith('twitter:') ? `meta[property="${key}"]` : `meta[name="${key}"]`
      let tag = document.head.querySelector(selector)
      if (!tag) {
        tag = document.createElement('meta')
        if (key.startsWith('og:') || key.startsWith('twitter:')) tag.setAttribute('property', key)
        else tag.setAttribute('name', key)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    })

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [currentPath])

  useEffect(() => {
    const handleBackgroundMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 24
      const y = (event.clientY / window.innerHeight - 0.5) * 24
      setBackgroundOffset({ x, y })
    }

    const resetBackground = () => setBackgroundOffset({ x: 0, y: 0 })
    window.addEventListener('mousemove', handleBackgroundMove)
    window.addEventListener('mouseleave', resetBackground)

    return () => {
      window.removeEventListener('mousemove', handleBackgroundMove)
      window.removeEventListener('mouseleave', resetBackground)
    }
  }, [])

  useLayoutEffect(() => {
    const root = appRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const hoverCleanups = []
    const context = gsap.context(() => {
      const heroHeadline = '[data-motion-hero="headline"]'
      const heroSubheadline = '[data-motion-hero="subheadline"]'
      const heroVisual = '[data-motion-hero="visual"]'

      if (root.querySelector(heroHeadline) && root.querySelector(heroSubheadline)) {
        gsap.fromTo([heroHeadline, heroSubheadline], { autoAlpha: 0, y: 50 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.14,
          clearProps: 'transform,opacity,visibility',
        })
      }

      if (root.querySelector(heroVisual)) {
        gsap.to(heroVisual, {
          y: -12,
          duration: 3.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      gsap.utils.toArray('[data-motion-project-card]').forEach((card) => {
        gsap.fromTo(card, { autoAlpha: 0, y: 50 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'power2.out',
          overwrite: 'auto',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
        })
      })

      gsap.utils.toArray('[data-motion-hover]').forEach((element) => {
        const target = element
        const onEnter = () => gsap.to(target, { y: -3, scale: 1.02, duration: 0.25, ease: 'power2.out', overwrite: true })
        const onLeave = () => gsap.to(target, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out', overwrite: true })
        target.addEventListener('pointerenter', onEnter)
        target.addEventListener('pointerleave', onLeave)
        hoverCleanups.push(() => {
          target.removeEventListener('pointerenter', onEnter)
          target.removeEventListener('pointerleave', onLeave)
        })
      })
    }, root)

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup())
      context.revert()
    }
  }, [currentPath])

  return (
    <div
      ref={appRef}
      className="relative min-h-screen overflow-x-hidden bg-[#F5F4F0] text-[#1a1a1a] site font-body antialiased selection:bg-[#F2B56B] selection:text-white"
    >
      <div
        aria-hidden="true"
        className="portfolio-background-layer pointer-events-none fixed inset-[-24px] z-0 bg-cover bg-center bg-no-repeat transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{
          backgroundImage: `url(${portfolioBackground})`,
          transform: `translate3d(${backgroundOffset.x}px, ${backgroundOffset.y}px, 0) scale(1.06)`,
        }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#F5F4F0]/5" />
      <div className="relative z-10">
      <Navbar />
      <main>
        {caseStudyProject ? (
          <ProjectCaseStudy project={caseStudyProject} />
        ) : isWorkPage ? (
          <WorkPage />
        ) : isTeamPage ? (
          <TeamPage />
        ) : isAboutPage ? (
          <AboutPage />
        ) : isServicesPage ? (
          <ServicesPage />
        ) : (
          <>
            <Hero />
            <Projects />
            <ServicesAndSkills />
            <Workflow />
            <HomeTeam />
            <Web3Section />
            <Contact />
            <PreFooterCTA />
          </>
        )}
      </main>
      <Footer />
      </div>
      {siteSettings.showChatbot && <Chatbot />}
    </div>
  )
}
