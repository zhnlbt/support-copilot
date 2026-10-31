// Deterministic UI simulation, intentionally separate from the production client.
import { demoTickets } from '../data/demo';
export function simulateTriage(ticket) {
  const text = ticket.messages[0].text;
  const sample = /взлом|парол|account|hack/i.test(text) ? demoTickets[0]
    : /апелляц|бұғат|appeal|разбан/i.test(text) ? demoTickets[1]
    : /оск|insult|sokdi/i.test(text) ? demoTickets[2]
    : /застр|stuck/i.test(text) ? demoTickets[3]
    : /sotib|qanday|qilish/i.test(text) ? demoTickets[4] : null;
  const category = sample ? (sample.kind === ticket.kind ? sample.category : ticket.kind === 'report' ? 'report.complaint' : 'complaint.invalid') : ticket.kind === 'report' ? 'report.offtopic' : 'complaint.other';
  const lang = sample?.lang || ticket.server_lang || 'ru';
  return {
    lang, category, priority: category === 'complaint.invalid' ? 'p3' : sample?.priority || 'p3',
    is_spam_or_duplicate: false,
    extracted: { nickname: sample?.nickname || null, rule_refs: sample?.refs || [], has_evidence: ticket.images_count >= 2, server: null },
    draft_reply: { lang, text: sample?.draft || 'Здравствуйте! Уточните, пожалуйста, что произошло, чтобы администратор мог помочь.', cited: sample?.refs || [] },
    needs_human: sample?.needsHuman ?? ticket.kind === 'complaint', confidence: sample?.confidence || .55,
    reasons: ['Synthetic preview result. Run API mode for real classification.', ...(sample?.reasons || [])],
  };
}
