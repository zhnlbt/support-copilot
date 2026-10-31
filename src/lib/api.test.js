import { describe, expect, it, vi } from 'vitest';
import { requestTriage, validateTriageResponse } from './api';
import { simulateTriage } from './demoTriage';
const ticket = { kind: 'complaint', images_count: 2, messages: [{ role: 'player', text: 'оскорбление' }] };
const response = simulateTriage(ticket);
describe('Existing backend contract', () => {
  it('rejects malformed nested values before they reach the result UI', () => {
    for (const patch of [
      { draft_reply: { ...response.draft_reply, cited: [{}] } },
      { extracted: { ...response.extracted, has_evidence: 'yes' } },
      { reasons: [null] }, { confidence: NaN }, { lang: 'unknown' },
    ]) expect(() => validateTriageResponse({ ...response, ...patch })).toThrow('unexpected response');
  });
  it('preserves cancellation for a pending request', async () => {
    const controller = new AbortController();
    const fetcher = vi.fn(async (_url, options) => {
      expect(options.signal).toBe(controller.signal);
      throw new DOMException('Aborted', 'AbortError');
    });
    controller.abort();
    await expect(requestTriage(ticket, { fetcher, signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });
  it('posts the ticket schema to /api/triage', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } }));
    expect(await requestTriage(ticket, { fetcher })).toEqual(response);
    expect(fetcher.mock.calls[0][0]).toBe('/api/triage');
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(ticket);
  });
  it('reports HTTP failures, proxy HTML, and invalid contracts', async () => {
    await expect(requestTriage(ticket, { fetcher: async () => new Response('', { status: 503 }) })).rejects.toThrow('HTTP 503');
    await expect(requestTriage(ticket, { fetcher: async () => new Response('<html>', { headers: { 'content-type': 'text/html' } }) })).rejects.toThrow('reverse proxy');
    await expect(requestTriage(ticket, { fetcher: async () => new Response('{}', { headers: { 'content-type': 'application/json' } }) })).rejects.toThrow('unexpected response');
  });
});
