import { useCallback, useSyncExternalStore } from 'react';
import { subscribe as subscribeToasts, getToasts } from '../features/toasts/toastStore.js';

export function useToasts() {
  const subscribe = useCallback(subscribeToasts, []);
  return useSyncExternalStore(subscribe, getToasts, () => []);
}
