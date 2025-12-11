export interface SyncStatus {
  sync_id: string;
  state: 'idle' | 'in_progress' | 'completed' | 'failed';
  type: 'initial' | 'incremental';
  progress: {
    total: number;
    synced: number;
    classified: number;
    percentage: number;
  };
  started_at: string | null;
  completed_at: string | null;
  estimated_remaining: number | null;
}
