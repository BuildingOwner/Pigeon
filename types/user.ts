export interface User {
  id: number;
  email: string;
  name: string;
  picture: string | null;
  is_initial_sync_done: boolean;
  last_sync_at: string | null;
  created_at?: string;
}
