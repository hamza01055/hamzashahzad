// Offline answers for the chatbot. Used when the AI endpoint is not available
// (for example on a static host with no serverless functions). Matches the
// question against the portfolio data with simple keyword rules.
import { profile } from '../data/profile.js'
import { joinTeam } from '../data/joinTeam.js'

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9+#.\s/-]/g, ' ').replace(/\s+/g, ' ').trim()
const has = (text, words) => words.some((word) => new RegExp(`(^|[^a-z0-9])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(text))

const projectLink = (project) => `- ${project.title} (${project.status}): /work/${project.slug}`

const contactText = (settings) => [
  `You can reach Hamza by email at ${settings.contactEmail} or on WhatsApp: https://wa.me/${settings.whatsappNumber}`,
  'There is also a contact form at /#contact.',
].join('\n')

const findProject = (text, projects) => {
  const compact = text.replace(/[\s-]/g, '')
  return projects.find((project) => {
    const title = normalize(project.title)
    const firstWord = project.slug.split('-')[0]
    return text.includes(title)
      || compact.includes(title.replace(/[\s-]/g, ''))
      || text.includes(project.slug.replace(/-/g, ' '))
      // Distinctive names like "smartcity" or "intellivault" on their own
      || (firstWord.length >= 6 && has(text, [firstWord]))
  })
}

// For each topic: words that signal it in a question (ask), and words that
// mark a project as related (match). Both are matched as whole words.
const topics = {
  'computer vision': { ask: ['computer vision', 'cv', 'yolo', 'opencv', 'object detection', 'image', 'images', 'vision'], match: ['computer vision', 'yolo', 'yolov8', 'opencv', 'object detection'] },
  rag: { ask: ['rag', 'retrieval', 'vector', 'knowledge base', 'embeddings', 'semantic search'], match: ['rag', 'vector search', 'vector database', 'semantic search', 'knowledge retrieval'] },
  agents: { ask: ['agent', 'agents', 'multi-agent', 'multi agent', 'agentic'], match: ['multi-agent', 'ai agents', 'agent-based workflows', 'multi-agent architecture', 'multi-agent workflows'] },
  llm: { ask: ['llm', 'llms', 'gpt', 'generative', 'genai', 'gen ai', 'chatbot', 'chatbots', 'langchain', 'langgraph'], match: ['llm', 'llms', 'langchain', 'langgraph', 'genai', 'generative ai'] },
  mobile: { ask: ['flutter', 'mobile', 'android', 'ios', 'dart'], match: ['flutter', 'mobile', 'dart', 'mobile application'] },
  web: { ask: ['react', 'frontend', 'website', 'websites', 'web app', 'web apps', 'typescript'], match: ['react', 'typescript'] },
  automation: { ask: ['automation', 'automate', 'workflow', 'workflows', 'n8n'], match: ['automation', 'workflow automation'] },
  saas: { ask: ['saas', 'crm', 'dashboard', 'dashboards'], match: ['saas'] },
  backend: { ask: ['fastapi', 'backend', 'api', 'apis', 'python', 'django'], match: ['fastapi', 'python', 'rest api', 'express'] },
}

const relatedProjects = (key, projects) => projects.filter((project) => {
  const fields = [project.category, ...(project.technology || []), ...(project.filters || []), ...(project.highlights || [])]
  return has(normalize(fields.join(' | ')), topics[key].match)
})

export const localAnswer = (question, { projects, team, settings }) => {
  const text = normalize(question)

  if (!text) return 'Ask me anything about Hamza\'s projects, services, skills, or how to get in touch.'

  if (has(text, ['hi', 'hello', 'hey', 'salam', 'assalam', 'assalamualaikum', 'aoa']) && text.split(' ').length <= 4) {
    return 'Hi! I’m Hamza’s portfolio assistant. I can help you explore Hamza’s work, find a suitable service, or share how to get in touch. What would you like to build?'
  }

  // Before contact and experience: "can I join?" and "do you offer internships?" are about joining the team.
  if (has(text, ['join', 'joining', 'join your team', 'apply for', 'how to apply', 'can i apply', 'application', 'internships', 'internship opportunity', 'recruit', 'recruiting', 'vacancy', 'vacancies', 'openings', 'open roles', 'become a collaborator', 'work in your team'])) {
    return [
      joinTeam.note,
      `Open roles: ${joinTeam.roles.map((role) => role.title).join(', ')}.`,
      'See what each role looks for on /team, then share your role, a portfolio or GitHub link, and your skills with Hamza.',
      contactText(settings),
    ].join('\n')
  }

  if (has(text, ['discuss', 'my project', 'start a project', 'new project', 'inquiry', 'enquiry', 'requirements'])) {
    return [
      'Happy to help. I can’t send inquiries from this chat right now, so please share your project with Hamza directly.',
      'Helpful details: what you want to build, who will use it, key features and integrations, any deadline, and a budget if you have one.',
      contactText(settings),
    ].join('\n')
  }

  if (has(text, ['price', 'pricing', 'cost', 'rate', 'rates', 'budget', 'quote', 'charge', 'fee', 'fees', 'timeline', 'how long'])) {
    return `Pricing and timelines depend on the project scope, so the best step is to share your idea with Hamza directly.\n${contactText(settings)}`
  }

  if (has(text, ['contact', 'email', 'whatsapp', 'reach', 'hire', 'hiring', 'available', 'availability', 'call', 'meeting', 'talk', 'message', 'phone'])) {
    return `Happy to connect you. ${contactText(settings)}`
  }

  if (has(text, ['resume', 'cv'])) {
    return `You can download Hamza's resume here: ${profile.resume}`
  }

  const project = findProject(text, projects)
  if (project) {
    const lines = [
      `${project.title} (${project.status}, ${project.category})`,
      project.description,
      project.technology?.length ? `Built with: ${project.technology.join(', ')}.` : '',
      `Details: /work/${project.slug}${project.github ? `\nCode: ${project.github}` : ''}`,
    ]
    return lines.filter(Boolean).join('\n')
  }

  if (has(text, ['team', 'collaborator', 'collaborators', 'teammates', 'who works'])) {
    return `Hamza collaborates with specialists when a project needs several disciplines:\n${team.map((m) => `- ${m.name}, ${m.role}`).join('\n')}\nMore on /team.`
  }

  if (has(text, ['education', 'university', 'degree', 'study', 'studied', 'studying', 'student', 'bs', 'graduate', 'graduated', 'college'])) {
    return profile.education.map((item) => `- ${item}`).join('\n')
  }

  if (has(text, ['experience', 'intern', 'internship', 'job', 'jobs', 'work history', '10pearls', 'freelance', 'career'])) {
    return profile.experience.map((item) => `- ${item}`).join('\n')
  }

  const topic = Object.keys(topics).find((key) => has(text, topics[key].ask))
  if (topic && has(text, ['project', 'projects', 'built', 'work', 'examples', 'portfolio', 'show', 'any', 'experience'])) {
    const related = relatedProjects(topic, projects).slice(0, 5)
    if (related.length) return `Here are related projects:\n${related.map(projectLink).join('\n')}\nSee everything on /work.`
  }

  if (has(text, ['project', 'projects', 'portfolio', 'built', 'work', 'examples', 'show'])) {
    const featured = projects.filter((p) => p.featured).slice(0, 6)
    return `Some highlights from Hamza's work:\n${featured.map(projectLink).join('\n')}\nThe full list is on /work.`
  }

  if (has(text, ['skill', 'skills', 'stack', 'tech', 'technology', 'technologies', 'tools', 'languages', 'framework', 'frameworks'])) {
    return Object.entries(profile.skills).map(([group, items]) => `- ${group}: ${items.slice(0, 8).join(', ')}`).join('\n')
  }

  if (has(text, ['service', 'services', 'offer', 'help', 'build', 'make', 'develop', 'create', 'can you', 'what do'])) {
    const related = topic ? relatedProjects(topic, projects).slice(0, 3) : []
    if (related.length) {
      return `Yes, that is part of what Hamza builds. Related work:\n${related.map(projectLink).join('\n')}\nTo discuss your project, reach out at ${settings.contactEmail} or see /services.`
    }
    return `Hamza builds:\n${profile.services.map((s) => `- ${s.title}`).join('\n')}\nDetails are on /services. To start a project, reach out at ${settings.contactEmail}.`
  }

  if (topic) {
    const related = relatedProjects(topic, projects).slice(0, 5)
    if (related.length) return `Yes, Hamza works with that. Related projects:\n${related.map(projectLink).join('\n')}`
  }

  if (has(text, ['who', 'about', 'hamza', 'yourself', 'background', 'introduce'])) {
    return `${profile.summary}\nMore on /about.`
  }

  return `I don't have an answer for that yet. I can help with Hamza's projects, services, skills, experience, and contact details. For anything else, message Hamza at ${settings.contactEmail}.`
}
