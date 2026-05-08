import { api } from './api';

export const dashboardService = {
  getStats: async () => {
    // Backend returns: { total_images, to_be_processed, weekly_chart: [10, 15, 8, 20, 25, 12, 5] }
    return api.get<{ total_images: number; to_be_processed: number; weekly_chart: number[] }>('/api/dashboard/stats');
  }
};
