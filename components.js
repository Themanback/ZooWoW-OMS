// ============================================================
// OMS System — Reusable UI Components
// ============================================================

// ---- Sidebar ----
function renderSidebar() {
  const m = OMS.getMetrics();
  const current = OMS._currentPage;
  const cu = window.OMS_DATA.current_user;

  const navItem = (page, icon, label, badge = null) => {
    const badgeHtml = badge ? `<span class="nav-badge ${badge.type || ''}">${badge.val}</span>` : '';
    return `<button class="nav-item ${current === page ? 'active' : ''}" onclick="OMS.navigate('${page}')">
      <span class="nav-icon">${icon}</span>
      <span>${label}</span>
      ${badgeHtml}
    </button>`;
  };

  return `<aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">📦</div>
      <div class="logo-text">
        <span class="logo-title">OMS System</span>
        <span class="logo-sub">v1.0 MVP</span>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Главное</div>
      ${navItem('dashboard', svgDashboard(), 'Дашборд')}
      ${navItem('orders', svgOrders(), 'Заказы', m.orders_new > 0 ? { val: m.orders_new } : null)}
      ${navItem('warehouse', svgWarehouse(), 'Склад', m.orders_in_progress > 0 ? { val: m.orders_in_progress, type: 'info' } : null)}
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Каталог</div>
      ${navItem('catalog', svgCatalog(), 'Товары и маппинг', m.needs_mapping > 0 ? { val: m.needs_mapping, type: 'warning' } : null)}
      ${navItem('stock', svgStock(), 'Остатки')}
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Интеграции</div>
      ${navItem('sync_logs', svgSync(), 'Логи синхронизации')}
      ${navItem('errors', svgError(), 'Ошибки', m.sync_errors > 0 ? { val: m.sync_errors } : null)}
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">AI-ассистент</div>
      ${navItem('agents', '🤖', 'AI-агенты')}
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Администрирование</div>
      ${navItem('audit', svgAudit(), 'Аудит действий')}
      ${navItem('users', svgUsers(), 'Пользователи')}
      ${navItem('settings', svgSettings(), 'Настройки')}
    </div>

    <div class="sidebar-footer">
      <div class="user-chip" onclick="OMS.navigate('users')">
        <div class="user-avatar">${cu.name.charAt(0)}</div>
        <div class="user-info">
          <div class="user-name">${cu.name}</div>
          <div class="user-role">${OMS.roleLabel(cu.role)}</div>
        </div>
      </div>
    </div>
  </aside>`;
}

// ---- Header ----
function renderHeader(title, subtitle = '') {
  const m = OMS.getMetrics();
  const lastSync = m.last_sync;
  const cfg = window.OMS_DATA.config;
  const msConnected = cfg.moysklad.connected;
  const kaspiConnected = cfg.kaspi.connected;

  return `<header class="header">
    <div>
      <div class="header-title">${title}</div>
      ${subtitle ? `<div class="header-sub">${subtitle}</div>` : ''}
    </div>
    <div class="header-actions">
      <div class="sync-status" title="МойСклад">
        <div class="sync-dot ${msConnected ? '' : 'idle'}"></div>
        <span>МойСклад</span>
      </div>
      <div class="sync-status" title="Kaspi">
        <div class="sync-dot ${kaspiConnected ? '' : 'idle'}"></div>
        <span>Kaspi</span>
      </div>
      <div class="sync-status">
        <span style="color:var(--text-muted)">Синхр.:</span>
        <span>${lastSync ? OMS.formatRelative(lastSync) : 'никогда'}</span>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="OMS.runSync().then(() => OMS.notify())">
        ${svgSync()} Синхронизировать
      </button>
    </div>
  </header>`;
}

// ---- Status Badge ----
function statusBadge(status) {
  return `<span class="badge ${OMS.statusClass(status)}">${OMS.statusLabel(status)}</span>`;
}

// ---- Mapping Badge ----
function mappingBadge(product) {
  if (product.needs_mapping) return `<span class="badge badge-danger">⚠ Нет маппинга</span>`;
  if (product.sync_disabled) return `<span class="badge badge-muted">⊘ Откл.</span>`;
  if (product.last_sync_failed) return `<span class="badge badge-warning">⚡ Ошибка</span>`;
  const types = { AUTO_SKU: 'Авто (SKU)', AUTO_BARCODE: 'Авто (ШК)', MANUAL: 'Вручную', AUTO_EXTERNAL: 'Авто (Ext)' };
  return `<span class="badge badge-success">✓ ${types[product.mapping_type] || 'OK'}</span>`;
}

// ---- Order Status Badge to next actions ----
function orderActionButtons(order) {
  const s = order.status;
  const role = window.OMS_DATA.current_user.role;
  const btns = [];

  if (s === 'NEW' && ['ADMIN', 'OPERATOR'].includes(role))
    btns.push(`<button class="btn btn-primary btn-sm" onclick="OMS.changeOrderStatus('${order.id}','ACCEPTED')">✓ Принять в работу</button>`);
  if (s === 'ACCEPTED' && ['ADMIN', 'OPERATOR', 'WAREHOUSE_WORKER'].includes(role))
    btns.push(`<button class="btn btn-primary btn-sm" onclick="OMS.changeOrderStatus('${order.id}','PICKING')">📦 Начать сборку</button>`);
  if (s === 'PICKING' && ['ADMIN', 'WAREHOUSE_WORKER'].includes(role))
    btns.push(`<button class="btn btn-success btn-sm" onclick="OMS.changeOrderStatus('${order.id}','PICKED','Сборка завершена')">✓ Сборка завершена</button>`);
  if (s === 'PICKED' && ['ADMIN', 'PACKER'].includes(role))
    btns.push(`<button class="btn btn-success btn-sm" onclick="OMS.changeOrderStatus('${order.id}','PACKED','Упаковка завершена')">📫 Упаковано</button>`);
  if (s === 'PACKED' && ['ADMIN', 'OPERATOR'].includes(role))
    btns.push(`<button class="btn btn-success btn-sm" onclick="OMS.changeOrderStatus('${order.id}','READY')">🚀 Готов к передаче</button>`);
  if (s === 'READY' && ['ADMIN', 'OPERATOR'].includes(role))
    btns.push(`<button class="btn btn-success btn-sm" onclick="OMS.changeOrderStatus('${order.id}','DELIVERED','Передан курьеру')">✈ Передать курьеру</button>`);
  if (!['DELIVERED','CANCELLED'].includes(s) && ['ADMIN', 'OPERATOR'].includes(role))
    btns.push(`<button class="btn btn-danger btn-sm" onclick="confirmCancelOrder('${order.id}')">✕ Отменить</button>`);

  return btns.join('');
}

function confirmCancelOrder(orderId) {
  const reason = prompt('Укажите причину отмены (или оставьте пустым):') ?? '';
  if (reason !== null) OMS.changeOrderStatus(orderId, 'CANCELLED', reason || 'Ручная отмена');
}

// ---- Modal Helper ----
function showModal(html) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = html;
  overlay.style.display = 'flex';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ---- SVG Icons ----
const svgDashboard = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;
const svgOrders = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>`;
const svgWarehouse = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`;
const svgCatalog = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 19.5A2.5 2.5 0 015.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`;
const svgStock = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`;
const svgSync = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`;
const svgError = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const svgAudit = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
const svgUsers = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`;
const svgSettings = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`;
const svgEye = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const svgEyeOff = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function togglePasswordVisibility(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.innerHTML = svgEyeOff();
  } else {
    input.type = 'password';
    if (btn) btn.innerHTML = svgEye();
  }
}
