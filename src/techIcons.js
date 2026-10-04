/**
 * Curated authentic vector SVG icons and brand colors for modern tech stacks.
 */
const TECH_ICONS = {
  react: {
    name: 'React',
    color: '#06b6d4',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(0 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>`
  },
  nextjs: {
    name: 'Next.js',
    color: '#f8fafc',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.8 14.5l-5.6-7.3v7.3H8.5V7.5h1.7l5.6 7.3V7.5h1.7v9h-1.7z"/></svg>`
  },
  vue: {
    name: 'Vue.js',
    color: '#42b883',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 3h3.5L12 14.5 18.5 3H22L12 21 2 3zm4.5 0h3L12 7.5 14.5 3h3L12 12 6.5 3z"/></svg>`
  },
  vercel: {
    name: 'Vercel',
    color: '#ffffff',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 3 22 21 2 21"/></svg>`
  },
  cloudflare: {
    name: 'Cloudflare',
    color: '#f38020',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`
  },
  nodejs: {
    name: 'Node.js',
    color: '#22c55e',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 5.2v10.4L12 22.8 3 17.6V7.2L12 2zm0 2.3L4.8 8.5v7l7.2 4.2 7.2-4.2v-7L12 4.3z"/></svg>`
  },
  express: {
    name: 'Express',
    color: '#94a3b8',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16M14 6l6 6-6 6M4 6v12"/></svg>`
  },
  graphql: {
    name: 'GraphQL',
    color: '#e535ab',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zm0 2.31L5.34 8.16v7.68L12 19.69l6.66-3.85V8.16L12 4.31z"/><circle cx="12" cy="12" r="3"/></svg>`
  },
  oauth: {
    name: 'OAuth2 / Vault',
    color: '#f43f5e',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>`
  },
  postgresql: {
    name: 'PostgreSQL',
    color: '#38bdf8',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`
  },
  redis: {
    name: 'Redis',
    color: '#ef4444',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6l9-4 9 4-9 4-9-4zm0 6l9 4 9-4m-18 6l9 4 9-4" stroke="currentColor" stroke-width="2" fill="none"/></svg>`
  },
  docker: {
    name: 'Docker',
    color: '#0284c7',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 6h3v3h-3zm-4 0h3v3H9zm-4 0h3v3H5zm8-4h3v3h-3zm-4 0h3v3H9zM1 12v3c0 4 3 7 8 7h6c5 0 8-3 8-7v-3H1z"/></svg>`
  },
  aws: {
    name: 'AWS',
    color: '#f59e0b',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 15c4 4 14 4 18 0M17 18l4-3-3-4"/></svg>`
  },
  python: {
    name: 'Python',
    color: '#3b82f6',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2H8a4 4 0 0 0-4 4v3h8V8h4V4a2 2 0 0 0-2-2zM12 22h4a4 4 0 0 0 4-4v-3h-8v1h-4v4a2 2 0 0 0 2 2z"/></svg>`
  },
  client: {
    name: 'Client App',
    color: '#06b6d4',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
  },
  api: {
    name: 'API Service',
    color: '#a855f7',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="3.6" y1="9" x2="20.4" y2="9"/><line x1="3.6" y1="15" x2="20.4" y2="15"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg>`
  }
};

/**
 * Automatically resolves a tech stack icon and brand color based on text matching.
 */
function resolveTechIcon(text = '') {
  const lower = text.toLowerCase();

  if (lower.includes('react') || lower.includes('frontend')) return TECH_ICONS.react;
  if (lower.includes('next')) return TECH_ICONS.nextjs;
  if (lower.includes('vue')) return TECH_ICONS.vue;
  if (lower.includes('vercel')) return TECH_ICONS.vercel;
  if (lower.includes('cloudflare') || lower.includes('waf') || lower.includes('cdn')) return TECH_ICONS.cloudflare;
  if (lower.includes('node')) return TECH_ICONS.nodejs;
  if (lower.includes('express')) return TECH_ICONS.express;
  if (lower.includes('graphql')) return TECH_ICONS.graphql;
  if (lower.includes('auth') || lower.includes('vault') || lower.includes('oauth') || lower.includes('crypto')) return TECH_ICONS.oauth;
  if (lower.includes('postgres') || lower.includes('sql') || lower.includes('db') || lower.includes('database')) return TECH_ICONS.postgresql;
  if (lower.includes('redis') || lower.includes('cache')) return TECH_ICONS.redis;
  if (lower.includes('docker') || lower.includes('container')) return TECH_ICONS.docker;
  if (lower.includes('aws') || lower.includes('cloud')) return TECH_ICONS.aws;
  if (lower.includes('python')) return TECH_ICONS.python;
  if (lower.includes('client') || lower.includes('web') || lower.includes('mobile')) return TECH_ICONS.client;

  return TECH_ICONS.api;
}

module.exports = {
  TECH_ICONS,
  resolveTechIcon
};
