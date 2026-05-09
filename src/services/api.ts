const API_BASE_URL = 'http://127.0.0.1:5000';

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers: customHeaders, ...customOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers
  const headers: Record<string, string> = {
    ...((customHeaders as Record<string, string>) || {}),
  };

  // Automatically set Content-Type to JSON if data is an object and not FormData
  if (data && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Get token from localStorage if available (client-side only)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...customOptions,
    headers,
  };

  if (data) {
    if (data instanceof FormData) {
      config.body = data;
      // Do NOT set Content-Type for FormData, fetch does it automatically with boundary
      delete headers['Content-Type'];
    } else {
      config.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, config);
    
    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    let responseData = null;
    
    if (contentType && contentType.includes("application/json")) {
       responseData = await response.json();
    } else if (response.status !== 204) {
       // If it's a file export or similar, we might need a different handling method (like blob)
       // But for general API calls, we try to parse text if it's not JSON
       const text = await response.text();
       if (text) {
           responseData = { message: text };
       }
    }

    if (!response.ok) {
      // Handle authentication error globally (e.g., clear token)
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // Optionally trigger a redirect to login or a global state event here
      }

      throw new Error(responseData?.message || responseData?.error || `API error: ${response.status}`);
    }

    return responseData as T;
  } catch (error) {
    console.error(`Error in API call to [${config.method}] ${url}:`, error);
    throw error;
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => fetchApi<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data: any, options?: RequestOptions) => fetchApi<T>(endpoint, { ...options, method: 'POST', data }),
  put: <T>(endpoint: string, data: any, options?: RequestOptions) => fetchApi<T>(endpoint, { ...options, method: 'PUT', data }),
  delete: <T>(endpoint: string, options?: RequestOptions) => fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};
