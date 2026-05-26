export const company = {
  name: 'Rise Next Solutions',
  tagline: 'Build, Manage & Scale Businesses',
  intro:
    'Rise Next is a Hyderabad-based studio helping businesses build, manage and scale with technology, branding, hiring, operations, marketing and podcast/creative solutions.',
  phone: process.env.COMPANY_PHONE || '+91 94941 19354',
  email: process.env.COMPANY_EMAIL || 'info@risenext.in',
  website: process.env.COMPANY_WEBSITE || 'https://www.risenext.in',
  services: [
    {
      key: 'technology',
      label: 'Technology Solutions',
      details:
        'Websites, full-stack apps, e-commerce, dashboards, CRM/HRM portals, API integrations and deployment support.',
      options: ['Static Website', 'Dynamic Website', 'MERN Full Stack App', 'E-commerce', 'CRM/HRM Portal', 'WhatsApp/Instagram Bot']
    },
    {
      key: 'bpo',
      label: 'BPO & Operations',
      details:
        'Customer support, backend operations, admin support, lead follow-up, data management and business process support.',
      options: ['Customer Support', 'Lead Follow-up', 'Data Entry', 'Admin Support', 'Back Office Operations']
    },
    {
      key: 'creative',
      label: 'VN Studios / Creative',
      details:
        'Podcast shoots, product shoots, reels, brand edits, YouTube content, promotional creatives and event coverage.',
      options: ['Podcast Shoot', 'Product Shoot', 'Reels & Ads', 'Brand Edits', 'Event Coverage']
    },
    {
      key: 'marketing',
      label: 'Digital Marketing',
      details:
        'SEO, Meta ads, lead generation, social media content, promotions and campaign reporting.',
      options: ['SEO', 'Meta Ads', 'Lead Generation', 'Social Media Management', 'Campaign Reports']
    },
    {
      key: 'hiring',
      label: 'Hiring & Staffing',
      details:
        'Recruitment coordination, candidate sourcing, screening support and team operations assistance.',
      options: ['Candidate Sourcing', 'Screening Support', 'Hiring Coordination']
    }
  ]
};
