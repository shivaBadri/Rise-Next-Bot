import { company } from '../config/company.js';

export function normalizeText(text = '') {
  return text.trim().toLowerCase();
}

export function findService(input = '') {
  const text = normalizeText(input);
  const numberMap = ['technology', 'bpo', 'creative', 'marketing', 'hiring'];
  if (/^[1-5]$/.test(text)) return company.services.find((s) => s.key === numberMap[Number(text) - 1]);
  return company.services.find((s) => text.includes(s.key) || text.includes(s.label.toLowerCase().split(' ')[0]));
}

export function buildMainMenuText() {
  return `Welcome to ${company.name} 👋\n${company.intro}\n\nPlease choose a service:\n\n1. Technology Solutions\n2. BPO & Operations\n3. VN Studios / Creative\n4. Digital Marketing\n5. Hiring & Staffing\n\nReply with a number or type your requirement.\n\nContact: ${company.phone}\nWebsite: ${company.website}`;
}

export function buildServiceText(service) {
  const points = service.options.map((item, index) => `${index + 1}. ${item}`).join('\n');
  return `${service.label}\n\n${service.details}\n\nWe offer:\n${points}\n\nPlease share your name, company and requirement. Our team will contact you shortly.`;
}

export function buildFallbackText() {
  return `Thanks for contacting ${company.name}. Please reply with:\n1 for Technology\n2 for BPO\n3 for VN Studios\n4 for Digital Marketing\n5 for Hiring\n\nOr type your requirement directly.`;
}
