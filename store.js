// ============================================================
// OMS System — Global Store & State Management
// ============================================================

const OMS = {
  // ---- Reactive rendering ----
  _subscribers: [],
  _currentPage: 'dashboard',
  _modalStack: [],
  _toastQueue: [],

  subscribe(fn) { this._subscribers.push(fn); },

  notify() {
    saveToStorage();
    this._subscribers.forEach(fn => fn());
  },

  // ---- Navigation ----
  navigate(page, params = {}) {
    this._currentPage = page;
    this._pageParams = params;
    this.notify();
    window.scrollTo(0, 0);
  },

  // ---- Toast notifications ----
  toast(message, type = 'info', duration = 3500) {
    const id = 'toast-' + Date.now();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.id = id;
    const icon = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }[type] || 'ℹ';
    el.innerHTML = `<span style="font-size:16px">${icon}</span><span>${message}</span>`;
    const container = document.getElementById('toast-container');
    if (container) {
      container.appendChild(el);
      setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, duration);
    }
  },

  // ---- PRODUCT actions ----
  updateProductMapping(productId, kaspiSku, mappingType = 'MANUAL') {
    const p = window.OMS_DATA.products.find(x => x.id === productId);
    if (!p) return;
    p.kaspi_sku = kaspiSku;
    p.needs_mapping = !kaspiSku;
    p.mapping_type = kaspiSku ? mappingType : null;
    this.addAuditLog('MAPPING_MANUAL', 'PRODUCT', productId, { kaspi_sku: '' }, { kaspi_sku: kaspiSku });
    this.notify();
    this.toast('Маппинг товара сохранён', 'success');
  },

  toggleSyncDisabled(productId) {
    const p = window.OMS_DATA.products.find(x => x.id === productId);
    if (!p) return;
    p.sync_disabled = !p.sync_disabled;
    this.notify();
    this.toast(p.sync_disabled ? 'Синхронизация отключена' : 'Синхронизация включена', 'info');
  },

  // ---- ORDER actions ----
  getOrder(id) { return window.OMS_DATA.orders.find(o => o.id === id); },

  changeOrderStatus(orderId, newStatus, comment = '') {
    const order = this.getOrder(orderId);
    if (!order) return false;
    const oldStatus = order.status;

    // State machine validation
    const transitions = {
      'NEW': ['ACCEPTED', 'CANCELLED'],
      'ACCEPTED': ['PICKING', 'CANCELLED'],
      'PICKING': ['PICKED', 'ERROR', 'CANCELLED'],
      'PICKED': ['PACKED', 'ERROR'],
      'PACKED': ['READY', 'ERROR'],
      'READY': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [],
      'CANCELLED': [],
      'ERROR': ['ACCEPTED', 'CANCELLED'],
    };
    if (!transitions[oldStatus] || !transitions[oldStatus].includes(newStatus)) {
      this.toast(`Переход ${oldStatus} → ${newStatus} недопустим`, 'error');
      return false;
    }

    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    // Side effects
    if (newStatus === 'ACCEPTED') {
      // Reserve stock
      order.items.forEach(item => {
        const stock = window.OMS_DATA.stocks.find(s => s.product_id === item.product_id);
        if (stock) {
          stock.reserved_qty += item.quantity;
          stock.available_qty = stock.total_qty - stock.reserved_qty;
        }
      });
      order.assigned_to = order.assigned_to || window.OMS_DATA.current_user.id;
    }

    if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED') {
      // Release stock reservation
      order.items.forEach(item => {
        const stock = window.OMS_DATA.stocks.find(s => s.product_id === item.product_id);
        if (stock) {
          stock.reserved_qty = Math.max(0, stock.reserved_qty - item.quantity);
          if (newStatus === 'DELIVERED') {
            stock.total_qty = Math.max(0, stock.total_qty - item.quantity);
          }
          stock.available_qty = stock.total_qty - stock.reserved_qty;
        }
      });
    }

    order.status_history.push({
      from_status: oldStatus,
      to_status: newStatus,
      changed_by: window.OMS_DATA.current_user.id,
      changed_at: new Date().toISOString(),
      comment: comment || '',
    });

    this.addAuditLog('ORDER_STATUS_CHANGE', 'ORDER', orderId, { status: oldStatus }, { status: newStatus, comment });
    this.notify();
    this.toast(`Статус заказа изменён: ${OMS.statusLabel(newStatus)}`, 'success');
    return true;
  },

  assignOrder(orderId, userId) {
    const order = this.getOrder(orderId);
    if (!order) return;
    order.assigned_to = userId;
    this.addAuditLog('ORDER_ASSIGNED', 'ORDER', orderId, {}, { assigned_to: userId });
    this.notify();
    this.toast('Сотрудник назначен на заказ', 'success');
  },

  reportIssue(orderId, issueType, description) {
    const order = this.getOrder(orderId);
    if (!order) return;
    order.has_issue = true;
    order.issue_description = issueType;
    order.status_history.push({
      from_status: order.status, to_status: order.status,
      changed_by: window.OMS_DATA.current_user.id,
      changed_at: new Date().toISOString(),
      comment: `⚠️ Проблема: ${description}`,
    });
    this.addAuditLog('ORDER_ISSUE_REPORTED', 'ORDER', orderId, {}, { issue: issueType, description });
    this.notify();
    this.toast('Проблема зафиксирована', 'warning');
  },

  clearIssue(orderId) {
    const order = this.getOrder(orderId);
    if (!order) return;
    order.has_issue = false;
    order.issue_description = null;
    this.notify();
  },

  // ---- SYNC actions ----
  async runSync(syncType = 'FULL', direction = 'MS_TO_OMS') {
    const cfg = window.OMS_DATA.config;
    const hasMs = cfg.moysklad.token && cfg.moysklad.token.length > 3;
    const hasKaspi = cfg.kaspi.api_key && cfg.kaspi.api_key.length > 3;

    const taskId = 'st-' + Date.now();
    const task = {
      id: taskId, sync_type: syncType, direction,
      status: 'IN_PROGRESS',
      started_at: new Date().toISOString(),
      finished_at: null,
      items_processed: 0, items_failed: 0,
      triggered_by: window.OMS_DATA.current_user.id,
    };
    window.OMS_DATA.sync_tasks.unshift(task);
    this.notify();
    this.toast(`Синхронизация запущена (${syncType})`, 'info');

    await this._delay(400);

    // Try real API call if configured
    let apiSuccess = false;
    let newProducts = null;
    let newStocks = null;
    let apiError = null;

    if (direction === 'MS_TO_OMS' && hasMs) {
      apiSuccess = await MoyskladAdapter.testConnection();
      if (apiSuccess && syncType === 'FULL') {
        try {
          newProducts = await MoyskladAdapter.getAllProducts();
          newStocks = await MoyskladAdapter.getAllStocks();
        } catch (e) {
          console.error('Failed to get real data from МойСклад:', e);
          apiError = e.message;
        }
      } else if (apiSuccess && syncType === 'INCREMENTAL') {
        try {
          newStocks = await MoyskladAdapter.getAllStocks();
        } catch (e) {
          console.error('Failed to get stocks from МойСклад:', e);
          apiError = e.message;
        }
      }
    } else if (direction === 'OMS_TO_KASPI' && hasKaspi) {
      apiSuccess = await KaspiAdapter.testConnection();
    }

    if (newProducts && Array.isArray(newProducts)) {
      // Preserve existing kaspi_sku mappings before overwriting products
      const existingMappings = {};
      window.OMS_DATA.products.forEach(p => {
        if (p.moysklad_id) {
          existingMappings[p.moysklad_id] = {
            kaspi_sku: p.kaspi_sku || '',
            mapping_type: p.mapping_type || null,
            sync_disabled: p.sync_disabled || false,
          };
        }
      });

      window.OMS_DATA.products = newProducts.map(p => {
        const existing = existingMappings[p.id] || {};
        // Extract barcode: try ean13, then code128, then gtin, then first string value
        let barcode = '';
        if (p.barcodes && p.barcodes.length > 0) {
          const bc = p.barcodes[0];
          barcode = bc.ean13 || bc.code128 || bc.gtin || bc.ean8 || '';
          if (!barcode) {
            const vals = Object.values(bc).filter(v => typeof v === 'string' && v.length > 0);
            barcode = vals[0] || '';
          }
        }
        const hasMapped = !!existing.kaspi_sku;
        return {
          id: p.id,
          moysklad_id: p.id,
          code: p.code || '',       // артикул в МойСклад
          article: p.article || '', // vendor article
          kaspi_sku: existing.kaspi_sku || '',
          barcode,
          name: p.name,
          is_active: !p.archived,
          sync_disabled: existing.sync_disabled || false,
          needs_mapping: !hasMapped,
          mapping_type: existing.mapping_type || (hasMapped ? 'MANUAL' : null),
          last_sync_failed: false,
          created_at: p.created || new Date().toISOString(),
          updated_at: p.updated || new Date().toISOString(),
        };
      });
    }

    if (newStocks && Array.isArray(newStocks)) {
      // Build stock map: assortmentId → {quantity, reserve}
      const stockMap = {};
      newStocks.forEach(s => {
        if (s.assortmentId) stockMap[s.assortmentId] = s;
      });

      window.OMS_DATA.stocks = window.OMS_DATA.products.map(p => {
        const s = stockMap[p.moysklad_id] || stockMap[p.id];
        const qty = s ? Math.max(0, s.quantity || 0) : 0;
        const reserve = s ? Math.max(0, s.reserve || 0) : 0;
        return {
          product_id: p.id,
          total_qty: qty,
          reserved_qty: reserve,
          available_qty: Math.max(0, qty - reserve),
          last_synced_at: new Date().toISOString(),
          source: 'MOYSKLAD',
        };
      });
    } else {
      // Just update timestamps if we only got connection info
      window.OMS_DATA.stocks.forEach(s => { s.last_synced_at = new Date().toISOString(); });
    }

    // Calculate results
    const processed = newProducts ? newProducts.length :
      (newStocks ? newStocks.length : (syncType === 'FULL' ? window.OMS_DATA.products.length : Math.ceil(window.OMS_DATA.products.length / 3)));
    const failed = apiError ? processed : 0;

    // Log integration event
    window.OMS_DATA.integration_events.unshift({
      id: 'ie-' + Date.now(), direction: 'OUTBOUND',
      system: direction === 'MS_TO_OMS' ? 'MOYSKLAD' : 'KASPI',
      event_type: direction === 'MS_TO_OMS' ? (newProducts ? 'GET_PRODUCTS' : 'GET_STOCKS') : 'UPDATE_STOCKS',
      status: apiError ? 'FAILED' : 'SUCCESS', attempt_count: 1,
      created_at: new Date().toISOString(), error_message: apiError || null,
    });

    task.status = apiError ? 'FAILED' : 'SUCCESS';
    task.finished_at = new Date().toISOString();
    task.items_processed = processed;
    task.items_failed = failed;

    this.addAuditLog('SYNC_MANUAL_START', 'SYNC_TASK', taskId, {}, { type: syncType, direction });
    this.notify();

    if (apiError) {
      this.toast(`Ошибка синхронизации: ${apiError}`, 'error');
    } else if (newProducts) {
      const noMapping = window.OMS_DATA.products.filter(p => p.needs_mapping).length;
      this.toast(`Синхронизация завершена: ${processed} товаров загружено, ${noMapping} без маппинга`, noMapping > 0 ? 'warning' : 'success');
    } else {
      this.toast(`Остатки обновлены`, 'success');
    }
    return task;
  },

  async replayIntegrationEvent(eventId) {
    const ev = window.OMS_DATA.integration_events.find(e => e.id === eventId);
    if (!ev) return;
    this.toast('Повтор операции запущен...', 'info');
    await this._delay(1200);
    const newEv = {
      ...ev,
      id: 'ie-' + Date.now(),
      status: 'SUCCESS',
      attempt_count: 1,
      created_at: new Date().toISOString(),
      error_message: null,
    };
    window.OMS_DATA.integration_events.unshift(newEv);
    this.addAuditLog('SYNC_REPLAY', 'INTEGRATION_EVENT', eventId, {}, { replayed_as: newEv.id });
    this.notify();
    this.toast('Операция успешно повторена', 'success');
  },

  resolveSyncError(errorId) {
    const err = window.OMS_DATA.sync_errors.find(e => e.id === errorId);
    if (!err) return;
    err.resolved = true;
    err.resolved_at = new Date().toISOString();
    err.resolved_by = window.OMS_DATA.current_user.id;
    this.addAuditLog('SYNC_ERROR_RESOLVED', 'SYNC_ERROR', errorId, { resolved: false }, { resolved: true });
    this.notify();
    this.toast('Ошибка помечена как решённая', 'success');
  },

  // ---- USER actions ----
  addUser(userData) {
    const user = { id: 'u' + Date.now(), ...userData, is_active: true, created_at: new Date().toISOString() };
    window.OMS_DATA.users.push(user);
    this.addAuditLog('USER_CREATED', 'USER', user.id, {}, userData);
    this.notify();
    this.toast('Пользователь создан', 'success');
    return user;
  },

  updateUser(userId, updates) {
    const user = window.OMS_DATA.users.find(u => u.id === userId);
    if (!user) return;
    Object.assign(user, updates);
    this.addAuditLog('USER_UPDATED', 'USER', userId, {}, updates);
    this.notify();
    this.toast('Данные пользователя обновлены', 'success');
  },

  toggleUserActive(userId) {
    const user = window.OMS_DATA.users.find(u => u.id === userId);
    if (!user) return;
    user.is_active = !user.is_active;
    this.notify();
    this.toast(user.is_active ? 'Пользователь активирован' : 'Пользователь деактивирован', 'info');
  },

  switchUser(userId) {
    const user = window.OMS_DATA.users.find(u => u.id === userId);
    if (!user) return;
    window.OMS_DATA.current_user = user;
    this.notify();
    this.toast(`Переключено на: ${user.name} (${OMS.roleLabel(user.role)})`, 'info');
  },

  // ---- CONFIG actions ----
  saveConfig(section, data) {
    window.OMS_DATA.config[section] = { ...window.OMS_DATA.config[section], ...data };
    this.addAuditLog('CONFIG_UPDATED', 'CONFIG', section, {}, data);
    this.notify();
    this.toast('Настройки сохранены', 'success');
  },

  saveAgentsGlobal(data) {
    const agents = window.OMS_DATA.config.agents;
    window.OMS_DATA.config.agents = { ...agents, ...data };
    this.notify();
    this.toast('Настройки агентов сохранены', 'success');
  },

  saveAgentItem(agentId, updates) {
    const agent = window.OMS_DATA.config.agents.items.find(a => a.id === agentId);
    if (!agent) return;
    Object.assign(agent, updates);
    this.notify();
    this.toast('Агент обновлён', 'success');
  },

  async runAgent(agentId, inputCode, instruction) {
    const cfg = window.OMS_DATA.config.agents;
    const agent = cfg.items.find(a => a.id === agentId);
    if (!agent) return null;

    if (!cfg.claude_api_key) {
      this.toast('Укажите Claude API Key в Настройки → AI-агенты', 'error', 5000);
      return null;
    }
    if (!inputCode || !inputCode.trim()) {
      this.toast('Введите код для обработки', 'warning');
      return null;
    }

    if (!window._agentRuns) window._agentRuns = {};
    if (!window._agentRuns[agentId]) window._agentRuns[agentId] = [];

    const runId = 'run-' + Date.now();
    const run = {
      id: runId,
      agent_id: agentId,
      created_at: new Date().toISOString(),
      input: inputCode,
      instruction: instruction || '',
      output: null,
      status: 'IN_PROGRESS',
      error: null,
      duration_ms: null,
      model: agent.model,
    };
    window._agentRuns[agentId].unshift(run);
    this.notify();

    const startTime = Date.now();
    try {
      const proxyBase = (cfg.proxy_url || 'http://localhost:8080').replace(/\/$/, '');
      const apiUrl = `${proxyBase}/?url=https://api.anthropic.com/v1/messages`;

      const userContent = instruction && instruction.trim()
        ? `Инструкции: ${instruction.trim()}\n\nКод:\n\`\`\`\n${inputCode}\n\`\`\``
        : `Код:\n\`\`\`\n${inputCode}\n\`\`\``;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': cfg.claude_api_key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: agent.model,
          max_tokens: 4096,
          system: agent.system_prompt,
          messages: [{ role: 'user', content: userContent }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      run.output = data.content && data.content[0] ? data.content[0].text : JSON.stringify(data);
      run.status = 'SUCCESS';
      run.duration_ms = Date.now() - startTime;
      this.toast(`Агент "${agent.name}" завершил анализ`, 'success');

    } catch (e) {
      run.status = 'FAILED';
      run.error = e.message;
      run.duration_ms = Date.now() - startTime;

      if (e.message.includes('fetch') || e.message.includes('NetworkError') || e.message.includes('Failed')) {
        this.toast('Нет подключения. Запустите proxy.py (python3 proxy.py) и проверьте API Key', 'error', 7000);
      } else if (e.message.includes('401') || e.message.includes('authentication')) {
        this.toast('Неверный Claude API Key. Проверьте ключ в настройках агентов', 'error', 6000);
      } else {
        this.toast(`Ошибка: ${e.message.slice(0, 100)}`, 'error', 5000);
      }
    }

    this.notify();
    return run;
  },

  // ---- AUDIT LOG ----
  addAuditLog(action, entityType, entityId, oldValue, newValue) {
    window.OMS_DATA.audit_log.unshift({
      id: 'al-' + Date.now(),
      user_id: window.OMS_DATA.current_user.id,
      action, entity_type: entityType, entity_id: entityId,
      old_value: oldValue, new_value: newValue,
      created_at: new Date().toISOString(),
    });
    // Keep last 200 entries
    if (window.OMS_DATA.audit_log.length > 200) window.OMS_DATA.audit_log = window.OMS_DATA.audit_log.slice(0, 200);
  },

  // ---- HELPERS ----
  _delay(ms) { return new Promise(r => setTimeout(r, ms)); },

  statusLabel(s) {
    const map = {
      NEW: 'Новый', ACCEPTED: 'Принят в обработку', PICKING: 'На сборке',
      PICKED: 'Собран', PACKED: 'Упакован', READY: 'Готов к передаче',
      DELIVERED: 'Передан', CANCELLED: 'Отменён', ERROR: 'Ошибка обработки'
    };
    return map[s] || s;
  },

  statusClass(s) {
    const map = {
      NEW: 'status-new', ACCEPTED: 'status-accepted', PICKING: 'status-picking',
      PICKED: 'status-picked', PACKED: 'status-packed', READY: 'status-ready',
      DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled', ERROR: 'status-error'
    };
    return map[s] || 'badge-muted';
  },

  roleLabel(r) {
    const map = {
      ADMIN: 'Администратор', OPERATOR: 'Оператор', WAREHOUSE_WORKER: 'Сотрудник склада',
      PACKER: 'Упаковщик', MANAGER: 'Руководитель'
    };
    return map[r] || r;
  },

  userName(userId) {
    if (userId === 'SYSTEM') return '⚙ Система';
    const user = window.OMS_DATA.users.find(u => u.id === userId);
    return user ? user.name : userId;
  },

  productName(id) {
    const p = window.OMS_DATA.products.find(x => x.id === id);
    return p ? p.name : id;
  },

  formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  },

  formatRelative(iso) {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин. назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч. назад`;
    return `${Math.floor(hours / 24)} д. назад`;
  },

  formatPrice(n) {
    return new Intl.NumberFormat('ru-RU').format(n) + ' ₸';
  },

  getMetrics() {
    const orders = window.OMS_DATA.orders;
    const errors = window.OMS_DATA.sync_errors;
    const products = window.OMS_DATA.products;
    const tasks = window.OMS_DATA.sync_tasks;
    return {
      orders_new: orders.filter(o => o.status === 'NEW').length,
      orders_in_progress: orders.filter(o => ['ACCEPTED','PICKING','PICKED','PACKED','READY'].includes(o.status)).length,
      orders_delivered: orders.filter(o => o.status === 'DELIVERED').length,
      orders_cancelled: orders.filter(o => o.status === 'CANCELLED').length,
      sync_errors: errors.filter(e => !e.resolved).length,
      needs_mapping: products.filter(p => p.needs_mapping).length,
      products_total: products.length,
      products_synced: products.filter(p => !p.needs_mapping && !p.sync_disabled).length,
      last_sync: tasks[0] ? tasks[0].started_at : null,
      sync_success_rate: tasks.length > 0 ? Math.round(tasks.filter(t => t.status === 'SUCCESS').length / tasks.length * 100) : 0,
    };
  },
};
