const DEFAULT_BASE_URL = "http://localhost:3001";

/**
 * Resolve the API base URL.
 * CRA supports env vars prefixed with REACT_APP_.
 */
function getApiBaseUrl() {
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
}

/**
 * Convert http(s) base URL to ws(s) base URL.
 */
function toWsBaseUrl(httpBaseUrl) {
  if (httpBaseUrl.startsWith("https://")) return httpBaseUrl.replace("https://", "wss://");
  if (httpBaseUrl.startsWith("http://")) return httpBaseUrl.replace("http://", "ws://");
  return httpBaseUrl;
}

/**
 * Build an Error with status/body for better UX.
 */
async function buildHttpError(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch (e) {
    // ignore
  }
  const err = new Error(payload?.detail || payload?.message || response.statusText);
  err.status = response.status;
  err.payload = payload;
  return err;
}

/**
 * Create an API client instance.
 * We allow injecting callbacks for auth failures (401/403) so contexts can react.
 */
export function createApiClient({ getToken, onAuthError } = {}) {
  const baseUrl = getApiBaseUrl();

  async function request(path, { method = "GET", body, headers } = {}) {
    const token = getToken ? getToken() : null;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 401 || res.status === 403) {
      if (onAuthError) onAuthError(res.status);
      throw await buildHttpError(res);
    }

    if (!res.ok) {
      throw await buildHttpError(res);
    }

    // 204 No Content
    if (res.status === 204) return null;

    return res.json();
  }

  return {
    baseUrl,
    wsBaseUrl: toWsBaseUrl(baseUrl),

    // Auth
    register: (payload) => request("/auth/register", { method: "POST", body: payload }),
    login: (payload) => request("/auth/login", { method: "POST", body: payload }),

    // Restaurants
    listRestaurants: () => request("/restaurants"),
    listMyRestaurants: () => request("/restaurants/me"),
    createRestaurant: (payload) => request("/restaurants", { method: "POST", body: payload }),

    // Menu
    listMenuItems: (restaurantId) => request(`/menu/restaurants/${restaurantId}/items`),
    createMenuItem: (restaurantId, payload) =>
      request(`/menu/restaurants/${restaurantId}/items`, { method: "POST", body: payload }),

    // Cart
    getCart: () => request("/cart"),
    upsertCartItem: (payload) => request("/cart/items", { method: "POST", body: payload }),
    removeCartItem: (cartItemId) => request(`/cart/items/${cartItemId}`, { method: "DELETE" }),

    // Orders
    listOrders: () => request("/orders"),
    getOrder: (orderId) => request(`/orders/${orderId}`),
    createOrder: (payload) => request("/orders", { method: "POST", body: payload }),
    updateOrderStatus: (orderId, payload) =>
      request(`/orders/${orderId}/status`, { method: "POST", body: payload }),

    // Tracking
    getOrderStatus: (orderId) => request(`/tracking/orders/${orderId}/status`)
  };
}

/**
 * Create a WebSocket for order updates.
 * Backend note: ws endpoint is unauthenticated demo (per backend docstring).
 */
export function createOrderTrackingSocket({ apiBaseUrl, orderId } = {}) {
  const baseUrl = apiBaseUrl || getApiBaseUrl();
  const wsBaseUrl = toWsBaseUrl(baseUrl);
  return new WebSocket(`${wsBaseUrl}/tracking/ws/orders/${orderId}`);
}
