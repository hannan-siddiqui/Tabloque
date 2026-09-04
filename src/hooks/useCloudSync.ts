import { useState, useEffect, useRef } from 'react';
import { TabloqueState } from '../types';
import { pushStateToCloud, subscribeToCloudSync } from '../services/firebase';

export type SyncStatus = 'disconnected' | 'syncing' | 'synced' | 'error';

export function useCloudSync(
  state: TabloqueState,
  onRemoteUpdate: (remoteUpdates: Partial<TabloqueState>) => void
) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemoteApplying = useRef<boolean>(false);

  // Subscribe to real-time remote updates
  useEffect(() => {
    if (!state.firebaseConfig?.apiKey || !state.firebaseConfig?.projectId) {
      setSyncStatus('disconnected');
      return;
    }

    setSyncStatus('synced');

    const unsubscribe = subscribeToCloudSync(state.firebaseConfig, (remoteState) => {
      isRemoteApplying.current = true;
      onRemoteUpdate(remoteState);
      setLastSyncTime(new Date());
      setSyncStatus('synced');
      setTimeout(() => {
        isRemoteApplying.current = false;
      }, 500);
    });

    return () => {
      unsubscribe();
    };
  }, [state.firebaseConfig?.apiKey, state.firebaseConfig?.projectId, state.firebaseConfig?.userId]);

  // Debounced push to cloud when local state changes
  useEffect(() => {
    if (!state.firebaseConfig?.apiKey || !state.firebaseConfig?.projectId) {
      return;
    }
    if (isRemoteApplying.current) {
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setSyncStatus('syncing');
      const success = await pushStateToCloud(state.firebaseConfig!, state);
      if (success) {
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } else {
        setSyncStatus('error');
      }
    }, 1500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [state.pages, state.boards, state.bookmarks, state.pageOrder]);

  return {
    syncStatus,
    lastSyncTime,
  };
}
