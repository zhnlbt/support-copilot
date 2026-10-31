// Handwritten synthetic examples. No case dataset or private tickets are bundled.
const insultDraft = 'Здравствуйте! Ваша жалоба на игрока Arman_Petrov принята на рассмотрение. Если нарушение пункта 2.1 ОП подтвердится, администрация примет соответствующие меры.';

export const demoTickets = [
  { id: 'account-001', kind: 'report', priority: 'p0', request: 'Взломали аккаунт, пропали деньги', category: 'report.account', lang: 'ru', needsHuman: true, nextStep: 'always a person', title: 'Report: account access', nickname: null, refs: [], images: 0, server: null, confidence: .88, draft: 'Здравствуйте! Ваше обращение о доступе к аккаунту передано администрации для проверки.', reasons: ['Account access and payment issues require an administrator.'] },
  { id: 'appeal-002', kind: 'complaint', priority: 'p1', request: 'Мен бұғатталдым, апелляция беремін', category: 'complaint.admin', lang: 'kk', needsHuman: true, nextStep: 'appeals go to a person', title: 'Complaint: appeal', nickname: null, refs: [], images: 0, server: null, confidence: .76, draft: 'Сәлеметсіз бе! Апелляцияңыз әкімшілікке қарауға жіберілді.', reasons: ['An administrator must review an appeal.'] },
  { id: 'insult-003', kind: 'complaint', priority: 'p2', request: 'Arman_Petrov оскорблял меня и мою семью, 2.1 ОП', category: 'complaint.insult', lang: 'ru', needsHuman: true, nextStep: 'penalty needs approval', title: 'Complaint: insult', nickname: 'Arman_Petrov', refs: ['2.1'], images: 2, server: null, confidence: .82, draft: insultDraft, conversation: [{ role: 'player', text: 'Arman_Petrov оскорблял меня и мою семью в чате, скрины есть, 2.1 ОП', attachments: 2 }, { role: 'reported_player', text: 'это была игра по роли' }], reasons: ['The evidence and any punishment must be confirmed by an administrator.'] },
  { id: 'stuck-004', kind: 'report', priority: 'p3', request: 'Застрял в текстурах, помогите', category: 'report.help', lang: 'ru', needsHuman: false, nextStep: 'draft is ready', title: 'Report: stuck in textures', nickname: null, refs: [], images: 0, server: null, confidence: .85, draft: 'Здравствуйте! Уточните ваше местоположение и опишите, где застрял персонаж, чтобы администратор мог помочь.', reasons: ['A routine help request with no account or payment issue.'] },
  { id: 'question-005', kind: 'report', priority: 'p3', request: 'Uy sotib olish uchun nima qilish kerak?', category: 'report.question', lang: 'uz', needsHuman: false, nextStep: 'draft is ready', title: 'Report: gameplay question', nickname: null, refs: [], images: 0, server: null, confidence: .81, draft: 'Assalomu alaykum! Qaysi uy haqida so‘rayotganingizni aniqlashtiring, administrator sizga yordam beradi.', reasons: ['A general gameplay question.'] },
  { id: 'duplicates-006', kind: 'report', priority: 'p2', request: 'Same player, same issue, 5 tickets in 1 hour', category: 'report.help', lang: 'ru', needsHuman: true, duplicate: true, nextStep: 'review as one', title: 'Duplicate group: help request', nickname: null, refs: [], images: 0, server: null, confidence: .6, draft: 'Здравствуйте! Мы получили ваши обращения по этой проблеме. Пожалуйста, добавьте подробности в одно обращение.', reasons: ['Five synthetic requests share a reporter and issue within an hour.'] },
];

// Preview catalog only. Production rules must come from an authenticated catalog endpoint.
export const demoSections = [
  { id: 'complaints', title: 'Section 1: Complaint rules' },
  { id: 'general', title: 'Section 2: General rules' },
  { id: 'roleplay', title: 'Section 3: Roleplay terms' },
  { id: 'green-zone', title: 'Section 4: Green zones' },
  { id: 'organizations', title: 'Section 5: Organizations' },
  { id: 'criminal', title: 'Section 6: Criminal groups' },
  { id: 'law', title: 'Section 7: Law enforcement' },
  { id: 'wanted', title: 'Section 8: Wanted players' },
  { id: 'families', title: 'Section 9: Family wars' },
  { id: 'business', title: 'Section 10: Business wars' },
  { id: 'delivery', title: 'Section 11: Delivery activities' },
];
export const demoRules = [
  { id: 'ОП:2.1', ref: '2.1', section: 'general', title: 'Player insult', text: 'Player insults and abusive language are prohibited. An administrator must review the context and evidence before deciding on any action.', aliases: 'оскорбление оск родни', cite: '2.1 ОП' },
  { id: 'ОП:5.2', ref: '5.2', section: 'general', title: 'Unauthorized software', text: 'Reports about suspected unauthorized software require review by an administrator. Attachments alone are not confirmation of a violation.', aliases: 'cheat чит софт', cite: '5.2 ОП' },
  { id: 'ЖБ:1.1.2', ref: '1.1.2', section: 'complaints', title: 'Describe the complaint', text: 'A complaint should describe the incident clearly and include available supporting evidence.', aliases: 'жалоба оформление', cite: '1.1.2 ЖБ' },
  { id: 'RP:DM', ref: 'DM', section: 'roleplay', title: 'Deathmatch', text: 'An allegation of an attack without a roleplay reason requires context and verification by an administrator.', aliases: 'дм убил без причины', cite: 'DM' },
  ...demoSections.slice(3).map((s, i) => ({ id: `preview:${s.id}`, ref: '—', section: s.id, title: s.title.replace(/^Section \d+: /, ''), text: 'This section is reserved for the authoritative rule catalog. No rule text has been loaded for this preview section.', cite: null, aliases: '', placeholder: true })),
];

export const defaultTicketId = 'insult-003';
export const languages = { ru: 'Russian', kk: 'Kazakh', uz: 'Uzbek', en: 'English', es: 'Spanish', pt: 'Portuguese', und: 'Undetermined' };
