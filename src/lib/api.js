export const dataMode = import.meta.env.VITE_DATA_MODE === 'api' ? 'api' : 'demo';
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const languages = new Set(['ru', 'kk', 'uz', 'en', 'es', 'pt', 'und']);
const stringList = value => Array.isArray(value) && value.every(item => typeof item === 'string');
const nullableString = value => value === null || typeof value === 'string';

export function validateTriageResponse(value) {
  if (!value || typeof value !== 'object' || typeof value.category !== 'string' ||
      !['p0', 'p1', 'p2', 'p3'].includes(value.priority) || !languages.has(value.lang) ||
      typeof value.needs_human !== 'boolean' || typeof value.is_spam_or_duplicate !== 'boolean' ||
      !value.extracted || !stringList(value.extracted.rule_refs) ||
      !nullableString(value.extracted.nickname) || !nullableString(value.extracted.server) ||
      typeof value.extracted.has_evidence !== 'boolean' ||
      typeof value.draft_reply?.text !== 'string' || !languages.has(value.draft_reply?.lang) ||
      !stringList(value.draft_reply.cited) || !Number.isFinite(value.confidence) ||
      value.confidence < 0 || value.confidence > 1 || !stringList(value.reasons)) {
    throw new Error('The triage service returned an unexpected response. Check the backend contract.');
  }
  return value;
}

export async function requestTriage(ticket, { signal, fetcher = fetch } = {}) {
  const response = await fetcher(`${baseUrl}/triage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ticket), signal,
  });
  if (!response.ok) throw new Error(`The triage service returned HTTP ${response.status}. Please try again.`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error('The API returned a page instead of JSON. Check the /api reverse proxy.');
  return validateTriageResponse(await response.json());
}

export const knowledgeFileUrl = filename => `${baseUrl}/data/${encodeURIComponent(filename)}`;
