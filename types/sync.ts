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

export interface ClassificationStatus {
  classification_id: string;
  state: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  summary: {
    total: number;
    success: number;
    failed: number;
    new_folders_created: number;
  };
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
}
