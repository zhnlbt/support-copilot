const KEY = 'support-copilot.demo.v1';
export function readState() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return {
      drafts: value.drafts && typeof value.drafts === 'object' && !Array.isArray(value.drafts) ? value.drafts : {},
      statuses: value.statuses && typeof value.statuses === 'object' && !Array.isArray(value.statuses) ? value.statuses : {},
      merged: value.merged === true,
      template: ['approved', 'dismissed'].includes(value.template) ? value.template : null,
    };
  } catch { return {}; }
}
export function writeState(value) {
  try { localStorage.setItem(KEY, JSON.stringify(value)); return true; }
  catch { return false; }
}
