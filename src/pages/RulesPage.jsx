import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { demoRules, demoSections } from '../data/demo';
import { Badge, EmptyState, PageHeader } from '../components/ui';
import { dataMode, knowledgeFileUrl } from '../lib/api';

export default function RulesPage() {
  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    if (dataMode !== 'api') return;
    const controller = new AbortController();
    fetch(knowledgeFileUrl('rules_kb.json'), { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
      .then(data => {
        if (!Array.isArray(data.rules)) throw new Error('Invalid rule catalog');
        const rules = data.rules.filter(rule => !rule.is_header).map(rule => ({
          ...rule, section: String(rule.section_id), cite: rule.canonical_cite,
        }));
        const sections = [...new Map(data.rules.map(rule => [String(rule.section_id), {
          id: String(rule.section_id), title: `${rule.prefix} · ${rule.section}`,
        }])).values()];
        if (!controller.signal.aborted) setCatalog({ rules, sections });
      })
      .catch(error => { if (!controller.signal.aborted) setLoadError(error.message); });
    return () => controller.abort();
  }, []);
  const rules = dataMode === 'api' ? catalog?.rules || [] : demoRules;
  const sections = dataMode === 'api' ? catalog?.sections || [] : demoSections;
  const [params, setParams] = useSearchParams();
  const [moreSections, setMoreSections] = useState(false);
  const query = params.get('q') || '';
  const selectedId = params.get('rule') || 'ОП:2.1';
  const selected = rules.find(rule => rule.id === selectedId);
  const section = params.get('section') || selected?.section || 'general';
  const matching = rules.filter(rule => !rule.placeholder && `${rule.ref} ${rule.id} ${rule.title} ${rule.text} ${rule.aliases}`.toLowerCase().includes(query.toLowerCase().trim()));
  const sectionRules = rules.filter(rule => rule.section === section);
  function selectSection(id) {
    const first = rules.find(rule => rule.section === id);
    setParams({ section: id, ...(first ? { rule: first.id } : {}) });
  }
  function selectRule(rule) { setParams({ ...(query ? { q: query } : {}), section: rule.section, rule: rule.id }); }
  if (dataMode === 'api' && !catalog) return <><PageHeader title="Knowledge & rules" />{loadError ? <p className="error-box" role="alert">Unable to load backend rules: {loadError}. Check that the backend is running, then reload.</p> : <p role="status">Loading backend rules…</p>}</>;
  return <>
    <PageHeader title="Knowledge & rules" description="Verified policies are the only sources the assistant can cite." />
    <section className="panel rules-search"><label htmlFor="rule-search" className="field-label">Search rules</label><input id="rule-search" type="search" className="field" placeholder="Search by rule number, keyword or section…" value={query} onChange={e => { const next = new URLSearchParams(params); e.target.value ? next.set('q', e.target.value) : next.delete('q'); setParams(next, { replace: true }); }} />
    <p className="text-muted text-xs mt-2 mb-4">{dataMode === 'api' ? `Backend catalog · ${rules.length} rules loaded from rules_kb.json` : 'Preview catalog · sample summaries, not the authoritative production rulebook.'}</p></section>
    <div className="two-column rules-grid">
      <section className="panel tall-panel"><h2>{query.trim() ? 'Search results' : 'Sections'}</h2>
        {query.trim() ? <div className="mt-3 space-y-2" aria-live="polite">{matching.length ? matching.map(rule => <button type="button" key={rule.id} className={`button w-full justify-start text-left ${selectedId === rule.id ? 'button-dark' : 'button-outline'}`} onClick={() => selectRule(rule)}>{rule.cite} · {rule.title}</button>) : <EmptyState title="No matching rules">Try a rule number, “insult”, “DM”, or “оскорбление”.</EmptyState>}</div>
          : <div className="mt-3 space-y-2">{sections.slice(0, 3).map(s => <button type="button" key={s.id} aria-pressed={section === s.id} className={`button w-full ${section === s.id ? 'button-dark' : 'button-outline'}`} onClick={() => selectSection(s.id)}>{s.title}</button>)}<button type="button" className={`button w-full ${sections.slice(3).some(s => s.id === section) ? 'button-dark' : 'button-outline'}`} aria-expanded={moreSections} onClick={() => setMoreSections(!moreSections)}>More sections <span aria-hidden="true" className="ml-auto">{moreSections ? '−' : '+'}</span></button>{moreSections && <div className="pl-3 space-y-2 border-l border-line">{sections.slice(3).map(s => <button type="button" key={s.id} aria-pressed={section === s.id} className={`button w-full text-sm ${section === s.id ? 'button-dark' : 'button-outline'}`} onClick={() => selectSection(s.id)}>{s.title}</button>)}</div>}</div>}
      </section>
      <section className="panel tall-panel" aria-label="Rule detail">{selected ? <>
        <div className="panel-heading"><h2>{selected.ref !== '—' ? `${selected.ref} ` : ''}{selected.title}</h2><Badge tone="primary">{dataMode === 'api' ? 'BACKEND' : 'PREVIEW'}</Badge></div><p className="eyebrow mt-7">Policy summary</p><p className="rule-body mt-3 leading-relaxed">{selected.text}</p>
        <p className="text-muted text-sm mt-4">Citation count unavailable · connect draft analytics to populate.</p>
        {!selected.placeholder && <><p className="text-xs text-muted mt-2">Canonical ID: {selected.id} · Citation: {selected.cite}</p><h2 className="mt-7">Citation check on every draft</h2><ul className="space-y-3 mt-5 text-sm"><li className="flex items-center gap-2"><Badge tone="success">Required</Badge>Rule exists in rules.json</li><li className="flex items-center gap-2"><Badge tone="success">Required</Badge>Rule fits the ticket topic</li><li className="flex items-center gap-2"><Badge tone="warning">Blocked</Badge>An invented rule sends the ticket to a person</li></ul><p className="text-muted text-xs mt-4">These describe the backend citation requirements; this page does not run a citation check on a ticket.</p></>}
        {sectionRules.filter(rule => rule.id !== selected.id).length > 0 && <div className="mt-8 border-t border-line pt-5"><h3 className="font-semibold text-sm">Also in this section</h3>{sectionRules.filter(rule => rule.id !== selected.id).map(rule => <button type="button" key={rule.id} className="text-link block mt-3 text-sm" onClick={() => selectRule(rule)}>{rule.cite} · {rule.title}</button>)}</div>}
      </> : <EmptyState title="Rule not found">Select a section or search the preview catalog to choose a rule.</EmptyState>}</section>
    </div>
  </>;
}
