/**
 * API Service Layer
 * Frontend service to consume TutorUG backend endpoints.
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiService = {
  // ===== CHAT =====
  async sendMessage(sessionId, message) {
    const response = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ sessionId, content: message })
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async getChatHistory(sessionId) {
    const response = await fetch(`${API_BASE}/chat/history/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch chat history');
    return response.json();
  },

  async createChatSession() {
    const response = await fetch(`${API_BASE}/chat/session`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to create chat session');
    return response.json();
  },

  // ===== PAYMENT =====
  async getPaymentPlans() {
    const response = await fetch(`${API_BASE}/payments/plans`);
    if (!response.ok) throw new Error('Failed to fetch payment plans');
    return response.json();
  },

  async initiatePayment(planId) {
    const response = await fetch(`${API_BASE}/payments/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ planId })
    });
    if (!response.ok) throw new Error('Failed to initiate payment');
    return response.json();
  },

  async verifyPayment(transactionId) {
    const response = await fetch(`${API_BASE}/payments/verify/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to verify payment');
    return response.json();
  },

  async getSubscriptionStatus() {
    const response = await fetch(`${API_BASE}/payments/subscription/status`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch subscription status');
    return response.json();
  },

  async cancelSubscription() {
    const response = await fetch(`${API_BASE}/payments/subscription/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to cancel subscription');
    return response.json();
  },

  // ===== TTS =====
  async synthesizeText(text) {
    const response = await fetch(`${API_BASE}/tts/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ text })
    });
    if (!response.ok) throw new Error('Failed to synthesize text');
    return response.json();
  },

  // ===== AUTH =====
  async login(phoneNumber, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password })
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  },

  async logout() {
    localStorage.removeItem('token');
  },

  async sendOTP(phoneNumber) {
    const response = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    if (!response.ok) throw new Error('Failed to send OTP');
    return response.json();
  },

  async verifyOTP(phoneNumber, otp) {
    const response = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp })
    });
    if (!response.ok) throw new Error('OTP verification failed');
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  }
};

export default apiService;
