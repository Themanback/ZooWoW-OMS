// ============================================================
// OMS System — Integration Adapters
// МойСклад & Kaspi Магазин API Clients
// ============================================================

const MoyskladAdapter = {
  get config() { return window.OMS_DATA.config.moysklad; },

  _headers(options = {}) {
    const headers = {
      'Authorization': `Bearer ${this.config.token}`,
      'Accept': 'application/json;charset=utf-8',
    };
    if (options.method && ['POST', 'PUT'].includes(options.method.toUpperCase())) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  },

  async _fetch(path, options = {}) {
    let baseUrl = this.config.base_url;
    if (baseUrl.includes('localhost:8080/?url=')) {
      baseUrl = decodeURIComponent(baseUrl.split('localhost:8080/?url=')[1]);
    }
    const originalUrl = `${baseUrl}${path}`;
    const url = `http://localhost:8080/?url=${encodeURIComponent(originalUrl)}`;
    const evId = 'ie-' + Date.now();

    try {
      const fetchOptions = {
        method: options.method || 'GET',
        headers: { ...this._headers(options), ...(options.headers || {}) },
        signal: AbortSignal.timeout(30000),
      };
      if (options.body) fetchOptions.body = options.body;

      const response = await fetch(url, fetchOptions);

      const event = {
        id: evId, direction: 'OUTBOUND', system: 'MOYSKLAD',
        event_type: options.event_type || 'API_CALL',
        status: response.ok ? 'SUCCESS' : 'FAILED',
        attempt_count: 1,
        created_at: new Date().toISOString(),
        error_message: response.ok ? null : `HTTP ${response.status}`,
      };
      window.OMS_DATA.integration_events.unshift(event);

      if (!response.ok) {
        let errBody = '';
        try { errBody = await response.text(); } catch(_) {}
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errBody ? ' — ' + errBody.slice(0, 120) : ''}`);
      }
      return await response.json();
    } catch (err) {
      const event = {
        id: evId, direction: 'OUTBOUND', system: 'MOYSKLAD',
        event_type: options.event_type || 'API_CALL',
        status: 'FAILED', attempt_count: 1,
        created_at: new Date().toISOString(),
        error_message: err.message,
      };
      window.OMS_DATA.integration_events.unshift(event);
      throw err;
    }
  },

  async testConnection() {
    if (!this.config.token) {
      window.OMS_DATA.config.moysklad.connected = false;
      window.OMS_DATA.config.moysklad.last_test_status = 'NO_TOKEN';
      return false;
    }
    try {
      await this._fetch('/context/employee', { event_type: 'TEST_CONNECTION' });
      window.OMS_DATA.config.moysklad.connected = true;
      window.OMS_DATA.config.moysklad.last_test = new Date().toISOString();
      window.OMS_DATA.config.moysklad.last_test_status = 'SUCCESS';
      return true;
    } catch (err) {
      window.OMS_DATA.config.moysklad.connected = false;
      window.OMS_DATA.config.moysklad.last_test = new Date().toISOString();
      window.OMS_DATA.config.moysklad.last_test_status = err.message;
      return false;
    }
  },

  // Fetch all products with pagination (up to 1000 per request)
  async getAllProducts() {
    const LIMIT = 1000;
    let offset = 0;
    let allRows = [];
    while (true) {
      const data = await this._fetch(
        `/entity/product?limit=${LIMIT}&offset=${offset}`,
        { event_type: 'GET_PRODUCTS' }
      );
      const rows = data.rows || [];
      allRows = allRows.concat(rows);
      if (rows.length < LIMIT) break;
      offset += LIMIT;
    }
    return allRows;
  },

  // Fetch all product variants with pagination
  async getAllVariants() {
    const LIMIT = 1000;
    let offset = 0;
    let allRows = [];
    while (true) {
      const data = await this._fetch(
        `/entity/variant?limit=${LIMIT}&offset=${offset}`,
        { event_type: 'GET_VARIANTS' }
      );
      const rows = data.rows || [];
      allRows = allRows.concat(rows);
      if (rows.length < LIMIT) break;
      offset += LIMIT;
    }
    return allRows;
  },

  // Fetch all stock levels with pagination
  async getAllStocks(storeId) {
    const LIMIT = 1000;
    let offset = 0;
    let allRows = [];
    while (true) {
      const filterPart = storeId ? `&filter=store=https://api.moysklad.ru/api/remap/1.2/entity/store/${storeId}` : '';
      const path = `/report/stock/all?limit=${LIMIT}&offset=${offset}${filterPart}`;
      const data = await this._fetch(path, { event_type: 'GET_STOCKS' });
      const rows = data.rows || [];
      allRows = allRows.concat(rows);
      if (rows.length < LIMIT) break;
      offset += LIMIT;
    }
    return allRows;
  },

  // Legacy compat
  async getProducts() {
    return this.getAllProducts();
  },

  async getStocks(storeId) {
    return this.getAllStocks(storeId);
  },

  async createDemand(orderData) {
    return await this._fetch('/entity/demand', {
      method: 'POST',
      body: JSON.stringify(orderData),
      event_type: 'CREATE_DEMAND',
    });
  },
};

// ============================================================

const KaspiAdapter = {
  get config() { return window.OMS_DATA.config.kaspi; },

  _headers(options = {}) {
    const headers = {
      'X-Auth-Token': this.config.api_key,
      'X-Merchant-ID': this.config.merchant_id,
    };
    if (options.method && ['POST', 'PUT'].includes(options.method.toUpperCase())) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  },

  async _fetch(path, options = {}) {
    let baseUrl = this.config.base_url;
    if (baseUrl.includes('localhost:8080/?url=')) {
        baseUrl = decodeURIComponent(baseUrl.split('localhost:8080/?url=')[1]);
    }
    const originalUrl = `${baseUrl}${path}`;
    const url = `http://localhost:8080/?url=${encodeURIComponent(originalUrl)}`;
    const evId = 'ie-' + Date.now();

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this._headers(options), ...(options.headers || {}) },
        signal: AbortSignal.timeout(15000),
      });

      const event = {
        id: evId, direction: options.inbound ? 'INBOUND' : 'OUTBOUND',
        system: 'KASPI',
        event_type: options.event_type || 'API_CALL',
        status: response.ok ? 'SUCCESS' : 'FAILED',
        attempt_count: 1,
        created_at: new Date().toISOString(),
        error_message: response.ok ? null : `HTTP ${response.status}`,
      };
      window.OMS_DATA.integration_events.unshift(event);

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (err) {
      const event = {
        id: evId, direction: 'OUTBOUND', system: 'KASPI',
        event_type: options.event_type || 'API_CALL',
        status: 'FAILED', attempt_count: 1,
        created_at: new Date().toISOString(),
        error_message: err.message,
      };
      window.OMS_DATA.integration_events.unshift(event);
      throw err;
    }
  },

  async testConnection() {
    if (!this.config.api_key || !this.config.merchant_id) {
      window.OMS_DATA.config.kaspi.connected = false;
      window.OMS_DATA.config.kaspi.last_test_status = 'NO_CREDENTIALS';
      return false;
    }
    try {
      await this._fetch(`/merchants/${this.config.merchant_id}`, { event_type: 'TEST_CONNECTION' });
      window.OMS_DATA.config.kaspi.connected = true;
      window.OMS_DATA.config.kaspi.last_test = new Date().toISOString();
      window.OMS_DATA.config.kaspi.last_test_status = 'SUCCESS';
      return true;
    } catch (err) {
      window.OMS_DATA.config.kaspi.connected = false;
      window.OMS_DATA.config.kaspi.last_test = new Date().toISOString();
      window.OMS_DATA.config.kaspi.last_test_status = err.message;
      return false;
    }
  },

  async getOrders(status = 'NEW') {
    const data = await this._fetch(`/orders?status=${status}&pageSize=50`, {
      event_type: 'GET_ORDERS', inbound: true
    });
    return data.orders || data.data || [];
  },

  async updateStocks(items) {
    // items: [{ sku, availableAmount }]
    return await this._fetch('/products/offers', {
      method: 'PUT',
      body: JSON.stringify({ offers: items }),
      event_type: 'UPDATE_STOCKS',
    });
  },

  async updateOrderStatus(orderId, status) {
    return await this._fetch(`/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
      event_type: 'UPDATE_ORDER_STATUS',
    });
  },
};
