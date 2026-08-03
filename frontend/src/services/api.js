const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const normalizeForecastPayload = (payload = {}) => {
  const historicalDates = Array.isArray(payload?.historical_dates) ? payload.historical_dates.filter(Boolean) : [];
  const historicalValues = Array.isArray(payload?.historical_values) ? payload.historical_values : [];
  const forecastDates = Array.isArray(payload?.forecast_dates) ? payload.forecast_dates.filter(Boolean) : [];
  const forecastValues = Array.isArray(payload?.forecast_values) ? payload.forecast_values : [];

  const normalizedHistoricalValues = historicalDates.map((_, index) => {
    const value = Number(historicalValues[index]);
    return Number.isFinite(value) ? value : 50;
  });

  const normalizedForecastValues = forecastDates.map((_, index) => {
    const value = Number(forecastValues[index]);
    return Number.isFinite(value) ? value : 50;
  });

  return {
    historical_dates: historicalDates,
    historical_values: normalizedHistoricalValues,
    forecast_dates: forecastDates,
    forecast_values: normalizedForecastValues,
    trend: payload?.trend || 'Stable',
    trend_magnitude: Number.isFinite(Number(payload?.trend_magnitude)) ? Number(payload?.trend_magnitude) : 0,
    data_points: Number.isFinite(Number(payload?.data_points)) ? Number(payload?.data_points) : 0
  };
};

export const apiService = {
  // Auth
  async login(username, password) {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    return r.json();
  },

  async signup(username, email, password) {
    const r = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    return r.json();
  },

  // Analyses
  async getAnalyses(userId = 1) {
    const r = await fetch(`${API_BASE}/analyses?user_id=${userId}`);
    return r.json();
  },

  async createAnalysis(userId, name, texts, options = {}) {
    const r = await fetch(`${API_BASE}/analyses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, name, texts, ...options })
    });
    return r.json();
  },

  async getAnalysisDetails(analysisId) {
    const r = await fetch(`${API_BASE}/analyses/${analysisId}/details`);
    return r.json();
  },

  // ABSA
  async getABSA(analysisId) {
    const r = await fetch(`${API_BASE}/absa?analysis_id=${analysisId}`);
    return r.json();
  },

  // Forecast
  async getForecast(analysisId, days = 7) {
    const r = await fetch(`${API_BASE}/forecast?analysis_id=${analysisId}&days=${days}`);
    const payload = await r.json();
    return normalizeForecastPayload(payload);
  },

  // Benchmarking
  async benchmark(analysisIds) {
    const r = await fetch(`${API_BASE}/benchmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysisIds)
    });
    return r.json();
  },

  // Alerts
  async getAlerts(userId = 1) {
    const r = await fetch(`${API_BASE}/alerts?user_id=${userId}`);
    return r.json();
  },

  async markAlertRead(alertId) {
    const r = await fetch(`${API_BASE}/alerts/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId })
    });
    return r.json();
  },

  // Brand Health Score
  async getHealthScore(userId = 1) {
    const r = await fetch(`${API_BASE}/health-score/${userId}`);
    return r.json();
  },

  // Multi-brand workspace
  async getBrands(userId = 1) {
    const r = await fetch(`${API_BASE}/brands/${userId}`);
    return r.json();
  },

  async createBrand(userId, brandName) {
    const r = await fetch(`${API_BASE}/brands/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_name: brandName })
    });
    return r.json();
  },

  // Chatbot Q&A
  async chatQuery(query, userId = 1) {
    const r = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, user_id: userId })
    });
    return r.json();
  },

  // Sarcasm Detection
  async detectSarcasm(text) {
    const r = await fetch(`${API_BASE}/analyze/sarcasm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    return r.json();
  },

  // Share link
  async generateShareLink(analysisId) {
    const r = await fetch(`${API_BASE}/share/${analysisId}`, {
      method: "POST"
    });
    return r.json();
  },

  // User Profile
  async getUserProfile(userId = 1) {
    const r = await fetch(`${API_BASE}/users/profile/${userId}`);
    return r.json();
  }
};
