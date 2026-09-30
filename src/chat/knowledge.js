// Builds the chatbot's system prompt from the portfolio data files.
// Used by the server-side chat API (api/chat.js). Keep it deterministic:
// the output is cached by the API, and any change to it resets that cache.
import { projects } from '../data/projects.js'
import { teamMembers } from '../data/teamMembers.js'
import { profile } from '../data/profile.js'
import { joinTeam } from '../data/joinTeam.js'
import { assistantInstructions } from './assistantPrompt.js'

const projectLine = (project) => [
  `- ${project.title} (${project.status}; ${project.category})`,
  `  Page: /work/${project.slug}${project.github ? ` | GitHub: ${project.github}` : ''}`,
  `  ${project.description}`,
  project.highlights?.length ? `  Highlights: ${project.highlights.join(', ')}` : '',
  project.technology?.length ? `  Technology: ${project.technology.join(', ')}` : '',
].filter(Boolean).join('\n')

export const buildKnowledge = () => {
  const skills = Object.entries(profile.skills).map(([group, items]) => `- ${group}: ${items.join(', ')}`).join('\n')
  const services = profile.services.map((s) => `- ${s.title}: ${s.description}`).join('\n')
  const team = teamMembers.map((m) => `- ${m.name}, ${m.role}. ${m.bio}`).join('\n')
  const contact = Object.entries(profile.contact).map(([key, value]) => `- ${key}: ${value}`).join('\n')
  const pages = Object.entries(profile.pages).map(([path, label]) => `- ${path}: ${label}`).join('\n')

  return `# About
${profile.summary}

${profile.philosophy}

${profile.direction}

Location: ${profile.location}. Website: ${profile.website}. Resume (PDF): ${profile.resume}
Availability: ${profile.availability}

# Experience
${profile.experience.map((e) => `- ${e}`).join('\n')}

# Education
${profile.education.map((e) => `- ${e}`).join('\n')}

# Skills and tools
${skills}

# Services
${services}

How projects run: ${profile.process}
Who Hamza works with: ${profile.clients}
${profile.collaboration}

# Projects
Statuses are stated exactly as they are; many are prototypes or concepts, not shipped products. None of these projects is labeled as paid client work, and no verified results, metrics, or demo links are published for them; the links below are the only project links.
${projects.map(projectLine).join('\n')}

# Team / collaborators
${team}

# Joining the team
${joinTeam.note}
Open roles and who is a good fit:
${joinTeam.roles.map((role) => `- ${role.title}: ${role.fit.join('; ')}`).join('\n')}
To apply: email or WhatsApp Hamza (see Contact) with the role, a portfolio, GitHub, or LinkedIn link, and skills. Details are on /team.

# Contact
${contact}

# Site pages
${pages}`
}

const submissionNote = (canSubmit) => (canSubmit
  ? '- Inquiry submission tool: available. After the visitor explicitly confirms the summary, call submit_inquiry once with the confirmed details. Tell the visitor the inquiry was sent only if the tool result confirms success; if it reports an error, say it has not been sent and give the email and WhatsApp contact instead.'
  : '- Inquiry submission tool: not available on this website. You cannot submit inquiries. After showing the summary, explain that it has not been sent and give the email and WhatsApp contact so the visitor can send the summary to Hamza directly.')

// canSubmitInquiries: whether the submit_inquiry tool is offered in this deployment.
export const buildSystemPrompt = ({ canSubmitInquiries = false } = {}) => `${assistantInstructions}

CHAT INTERFACE
- The chat window already shows the welcome message above and the four quick actions as buttons, so a visitor's first message may simply be one of those labels. Don't repeat the welcome message.
- Replies appear as plain text. Don't use markdown headings, bold, or tables; simple "-" lists are fine. Site paths such as /work/smartcity-ai and full URLs become clickable links, so include them when pointing to a project or page.
${submissionNote(canSubmitInquiries)}

PORTFOLIO KNOWLEDGE BASE
<portfolio>
${buildKnowledge()}
</portfolio>`
