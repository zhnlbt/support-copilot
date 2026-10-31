import { createContext, useContext, useState } from 'react';
import { readState, writeState } from '../lib/storage';

const ConsoleContext = createContext(null);
export function ConsoleProvider({ children }) {
  const [state, setState] = useState(readState);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  function update(patch) {
    const next = { ...state, ...patch };
    setState(next);
    setStorageError(!writeState(next));
  }
  function saveDraft(id, draft) { update({ drafts: { ...state.drafts, [id]: draft } }); }
  function setStatus(id, status) { update({ statuses: { ...state.statuses, [id]: status } }); }
  return <ConsoleContext.Provider value={{ state, update, saveDraft, setStatus, notice, setNotice, storageError }}>{children}</ConsoleContext.Provider>;
}
export const useConsole = () => useContext(ConsoleContext);
