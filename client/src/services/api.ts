const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('reception_token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // --- Authentication ---
  auth: {
    login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    signup: (data: any) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    continueWithDemo: () => request('/auth/demo', { method: 'POST' }),
  },

  // --- Business Profile & Opening Hours ---
  business: {
    getProfile: () => request('/business/profile'),
    updateProfile: (data: any) => request('/business/profile', { method: 'PUT', body: JSON.stringify(data) }),
    updateHours: (hours: any[]) => request('/business/hours', { method: 'PUT', body: JSON.stringify({ hours }) }),
  },

  // --- FAQ / Knowledge Base ---
  faqs: {
    list: (params?: { category?: string; search?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request(`/faqs?${query}`);
    },
    create: (data: any) => request('/faqs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/faqs/${id}`, { method: 'DELETE' }),
  },

  // --- Conversation & Message Threads ---
  conversations: {
    list: (params?: { status?: string; urgency?: string; channel?: string; search?: string }) => {
      const cleanParams: any = {};
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v) cleanParams[k] = v;
        });
      }
      const query = new URLSearchParams(cleanParams).toString();
      return request(`/conversations?${query}`);
    },
    details: (id: string) => request(`/conversations/${id}`),
    sendMessage: (id: string, content: string, sender: 'ai' | 'human') =>
      request(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content, sender }) }),
    addNote: (id: string, content: string) =>
      request(`/conversations/${id}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
    resolve: (id: string, status?: string) =>
      request(`/conversations/${id}/resolve`, { method: 'PUT', body: JSON.stringify({ status }) }),
    takeover: (id: string) => request(`/conversations/${id}/takeover`, { method: 'POST' }),
  },

  // --- Notifications Center ---
  notifications: {
    list: () => request('/notifications'),
    read: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    readAll: () => request('/notifications/read-all', { method: 'POST' }),
  },

  // --- Analytics data ---
  analytics: {
    get: () => request('/analytics'),
  },

  // --- Webhook Simulators ---
  simulations: {
    simulateMessage: (data: {
      businessId: string;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      channel: string;
      content: string;
    }) => request('/webhooks/simulate-message', { method: 'POST', body: JSON.stringify(data) }),
    
    simulateCall: (data: {
      businessId: string;
      customerPhone?: string;
      customerName?: string;
      speechContent: string;
      conversationId?: string;
    }) => request('/webhooks/simulate-call', { method: 'POST', body: JSON.stringify(data) }),
    
    simulateHangup: (conversationId: string, duration?: number) =>
      request('/webhooks/simulate-hangup', { method: 'POST', body: JSON.stringify({ conversationId, duration }) }),
  },
};
export default api;
