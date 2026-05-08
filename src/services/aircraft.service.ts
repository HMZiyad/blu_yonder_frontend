import { api } from './api';

// Backend database columns (from image_lib2 table):
// ikey, folder, negno, scan, imgqual, category, rights, manf, model,
// civilid, milid, serno, owner, notes, filename

export interface AircraftRecord {
  ikey: number;
  manf: string;       // manufacturer
  model: string;      // aircraft model name
  civilid: string;    // civil registration / N-number
  milid: string;      // military ID
  serno: string;      // serial / construction number
  owner: string;      // operator/owner
  notes: string;
  filename: string;
}

// What /api/analyze (and /api/aircraft/identify) returns:
export interface IdentifyResult {
  model_name: string;
  manufacturer: string;
  image_filename: string;
  image_metadata: {
    'Common Name'?: string;
    'Civil ID'?: string;
    'Military ID'?: string;
    'c/n'?: string;
    'Operator'?: string;
    'Notes'?: string;
    'Confidence Factor'?: string;
  };
  technical_specs: Record<string, string>;
  historical_context: string;
  verified_links: string[];
}

export const aircraftService = {
  /**
   * POST /api/aircraft/identify (alias for /api/analyze)
   * Sends an image and returns the full identification result directly.
   * No separate "get result by id" step needed — response IS the result.
   */
  identify: async (imageFile: File): Promise<IdentifyResult> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post<IdentifyResult>('/api/aircraft/identify', formData);
  },

  /**
   * GET /api/aircraft/queue
   * Returns: { status, pending_tasks, completed_tasks }
   */
  getQueue: async () => {
    return api.get<{ status: string; pending_tasks: number; completed_tasks: number }>('/api/aircraft/queue');
  },

  /**
   * GET /api/aircraft/records?search=...
   * Returns: { records: AircraftRecord[] }
   * Requires auth token.
   */
  getRecords: async (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get<{ records: AircraftRecord[] }>(`/api/aircraft/records${query}`);
  },

  /**
   * GET /api/aircraft/export-all
   * Triggers a TSV file download (not JSON). Opens browser download dialog.
   */
  exportAll: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    // Append token to URL since we can't set headers in a native download
    window.open(`${baseUrl}/api/aircraft/export-all?token=${token}`, '_blank');
  },
};
