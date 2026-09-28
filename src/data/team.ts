import { teamMembers } from './teamMembers.js'
import hamzaTeamLead from '../assets/hamza-team-lead.png'
import zohaibProfile from '../assets/zohaib-ahmad.jpeg'
import maryamProfile from '../assets/maryam-ashfaq.png'
import kaifProfile from '../assets/kaif-ashfaq.png'
import qaimProfile from '../assets/qaim-shah.png'
import javeriaProfile from '../assets/javeria-hussain.png'
import ayeshaProfile from '../assets/ayesha-fatima.png'

export interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  skills: string[]
  image: string
  location?: string
  linkedin?: string
  github?: string
  twitter?: string
  website?: string
  featured: boolean
}

const photos: Record<string, string> = {
  'hamza-team-lead': hamzaTeamLead,
  'zohaib-ahmad': zohaibProfile,
  'maryam-ashfaq': maryamProfile,
  'kaif-ashfaq': kaifProfile,
  'qaim-shah': qaimProfile,
  'javeria-hussain': javeriaProfile,
  'ayesha-fatima': ayeshaProfile,
}

export const team: TeamMember[] = teamMembers.map(({ photo, ...member }) => ({
  ...member,
  image: photos[photo] || '',
}))
