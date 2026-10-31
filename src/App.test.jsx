import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ConsoleProvider } from './context/ConsoleContext';
function open(path) { return render(<MemoryRouter initialEntries={[path]}><ConsoleProvider><App /></ConsoleProvider></MemoryRouter>); }

describe('Admin console routes and workflows', () => {
  it('keeps automatic-reply and duplicate filters linked to the correct tickets', () => {
    const view = open('/queue?filter=auto');
    expect(screen.getByRole('link', { name: /Застрял в текстурах/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Arman_Petrov оскорблял/ })).toBeNull();
    view.unmount(); open('/queue?filter=duplicates');
    expect(screen.getByRole('link', { name: /Same player, same issue/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Застрял в текстурах/ })).toBeNull();
  });
  it('keeps citation navigation and escalation connected after the redesign', () => {
    open('/review/insult-003');
    fireEvent.click(screen.getByRole('button', { name: 'Escalate' }));
    fireEvent.click(screen.getByRole('link', { name: /2.1 Player insult/ }));
    expect(screen.getByRole('heading', { name: '2.1 Player insult' })).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: 'Queue', exact: true }));
    expect(screen.getByText('Escalated · preview')).toBeTruthy();
  });
  it('does not leak edited drafts between ticket routes', () => {
    open('/review/insult-003');
    fireEvent.change(screen.getByLabelText('Edit before sending'), { target: { value: 'Only for the insult ticket' } });
    fireEvent.click(screen.getByRole('link', { name: 'Back to queue' }));
    fireEvent.click(screen.getByRole('link', { name: /Взломали аккаунт/ }));
    expect(screen.getByLabelText('Edit before sending').value).not.toBe('Only for the insult ticket');
    fireEvent.click(screen.getByRole('link', { name: 'Back to queue' }));
    fireEvent.click(screen.getByRole('link', { name: /Arman_Petrov оскорблял/ }));
    expect(screen.getByLabelText('Edit before sending').value).toBe('Only for the insult ticket');
  });
  it.each([['/queue', 'Ticket queue'], ['/review', 'Ticket review'], ['/review/insult-003', 'Ticket review'], ['/test-console', 'Test console'], ['/rules', 'Knowledge & rules'], ['/insights', 'Insights']])('opens %s directly', (path, title) => {
    open(path); expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy();
  });
  it('redirects the root and handles unknown URLs and ticket IDs', () => {
    const view = open('/'); expect(screen.getByRole('heading', { name: 'Ticket queue' })).toBeTruthy(); view.unmount();
    const unknown = open('/missing'); expect(screen.getByText('404 · Page not found')).toBeTruthy(); unknown.unmount();
    open('/review/missing'); expect(screen.getByRole('heading', { name: 'Ticket not found' })).toBeTruthy();
  });
  it('filters requests and opens the matching ticket', () => {
    open('/queue'); fireEvent.click(screen.getByRole('button', { name: 'Complaints' }));
    expect(screen.queryByText('Взломали аккаунт, пропали деньги')).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: /Arman_Petrov оскорблял/ }));
    expect(screen.getByRole('heading', { name: 'Ticket review' })).toBeTruthy();
  });
  it('saves edited drafts and requires confirmation before marking sent', () => {
    const first = open('/review/insult-003');
    fireEvent.change(screen.getByLabelText('Edit before sending'), { target: { value: 'Edited reply' } });
    first.unmount(); open('/review/insult-003');
    expect(screen.getByLabelText('Edit before sending').value).toBe('Edited reply');
    fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }));
    expect(screen.getByRole('button', { name: 'Confirm send' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm send' }));
    expect(screen.getByRole('button', { name: 'Send', exact: true }).disabled).toBe(true);
  });
  it('searches rules and navigates a citation deep link', () => {
    open('/rules?rule=%D0%9E%D0%9F%3A5.2');
    expect(screen.getByRole('heading', { name: '5.2 Unauthorized software' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Search rules'), { target: { value: 'zzzz-no-rule' } });
    expect(screen.getByRole('heading', { name: 'No matching rules' })).toBeTruthy();
  });
  it('runs demo triage and exposes the raw response', async () => {
    open('/test-console'); fireEvent.click(screen.getByRole('button', { name: 'Run triage' }));
    await waitFor(() => expect(screen.getByText('complaint.insult')).toBeTruthy());
    expect(screen.getByText(/"needs_human": true/)).toBeTruthy();
  });
  it('records merge and template decisions locally', () => {
    open('/insights'); fireEvent.click(screen.getByRole('button', { name: 'Merge group' }));
    expect(screen.getByRole('button', { name: 'Group merged' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(screen.getByText('Approved · local preview')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('button', { name: 'Approve' })).toBeTruthy();
  });
});
