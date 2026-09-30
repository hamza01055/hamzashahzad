// Roles open to new collaborators. Shown in "Join Our Team" on the Team page and used by the chatbot.
// Each role lists who is a good fit; these are not existing team members.
export const joinTeam = {
  note: 'Currently open for collaborators, interns, freelance partners, and builders who want to work on AI, web, mobile, automation, and SaaS projects.',
  roles: [
    { title: 'AI / ML Engineer', fit: ['Builds with Python, PyTorch or TensorFlow, and modern LLM tooling', 'Has built RAG, computer vision, or AI agent projects', 'Cares about evaluating models, not only demos'] },
    { title: 'Web Developer', fit: ['Comfortable with React, TypeScript, and Tailwind CSS', 'Connects frontends to REST APIs built with FastAPI, Django, or Node', 'Writes clean, responsive, accessible interfaces'] },
    { title: 'Mobile App Developer', fit: ['Builds cross-platform apps with Flutter', 'Integrates APIs, authentication, and push notifications', 'Has tested or shipped apps on Android or iOS'] },
    { title: 'UI/UX Designer', fit: ['Designs in Figma, from wireframes to polished UI', 'Thinks in user flows and reusable design systems', 'Hands off clear specs developers can build from'] },
    { title: 'Automation / n8n Expert', fit: ['Builds workflows with n8n, Make, or Zapier', 'Connects APIs, webhooks, databases, and AI models', 'Documents automations so clients can maintain them'] },
    { title: 'Content & Marketing Partner', fit: ['Writes clear content for tech products and social media', 'Understands SEO, product launches, and audience growth', 'Turns project work into case studies and posts'] },
  ],
}
