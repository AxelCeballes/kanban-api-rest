import { useCallback, useSyncExternalStore } from 'react';
import {
  subscribe as subscribeTickets,
  getCachedTickets,
} from '../features/tickets/ticketStore.js';

/** Suscripción React al snapshot de tickets de una columna del rehydrator. */
export function useColumnTickets(columnId) {
  const subscribe = useCallback(subscribeTickets, []);
  const getSnapshot = useCallback(() => getCachedTickets(columnId), [columnId]);
  return useSyncExternalStore(subscribe, getSnapshot, () => []);
}
