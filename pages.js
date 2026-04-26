// ============================================================
// OMS System — All Pages
// ============================================================

// ============================================================
// PAGE: DASHBOARD
// ============================================================
function renderDashboard() {
  const m = OMS.getMetrics();
  const orders = window.OMS_DATA.orders;
  const errors = window.OMS_DATA.sync_errors.filter(e => !e.resolved);
  const cfg = window.OMS_DATA.config;

  const recentOrders = orders.slice(0, 5);

  const msOk = cfg.moysklad.connected;
  const kaspiOk = cfg.kaspi.connected;
  const showSetupBanner = !cfg.moysklad.token || !cfg.kaspi.api_key;

  return `
  ${renderHeader('Дашборд', 'Обзор операций OMS')}
  <div class="page-content">
    ${showSetupBanner ? `
    <div class="alert alert-warning mb-16">
      <span class="alert-icon">⚙</span>
      <div class="alert-content">
        <div class="alert-title">Требуется настройка API-ключей</div>
        <div class="alert-msg">Для запуска синхронизации введите токены МойСклад и Kaspi Магазин в разделе Настройки.</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="OMS.navigate('settings')">Настроить →</button>
    </div>` : ''}

    ${errors.length > 0 ? `
    <div class="alert alert-danger mb-16">
      <span class="alert-icon">⚠</span>
      <div class="alert-content">
        <div class="alert-title">${errors.length} неразрешённых ошибок синхронизации</div>
        <div class="alert-msg">${errors[0].message}</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="OMS.navigate('errors')">Перейти →</button>
    </div>` : ''}

    <div class="metrics-grid">
      <div class="metric-card" onclick="OMS.navigate('orders')">
        <div class="metric-icon accent">${svgOrders()}</div>
        <div class="metric-value">${m.orders_new}</div>
        <div class="metric-label">Новых заказов</div>
        ${m.orders_new > 0 ? `<div class="metric-delta up">▲ Требуют внимания</div>` : `<div class="metric-delta text-muted">Всё обработано</div>`}
      </div>
      <div class="metric-card" onclick="OMS.navigate('orders')">
        <div class="metric-icon info">${svgWarehouse()}</div>
        <div class="metric-value">${m.orders_in_progress}</div>
        <div class="metric-label">В обработке</div>
        <div class="metric-delta" style="color:var(--info)">На разных этапах</div>
      </div>
      <div class="metric-card">
        <div class="metric-icon success">✓</div>
        <div class="metric-value">${m.orders_delivered}</div>
        <div class="metric-label">Выполнено сегодня</div>
        <div class="metric-delta up">▲ Передано курьерам</div>
      </div>
      <div class="metric-card" onclick="OMS.navigate('catalog')">
        <div class="metric-icon warning">⚠</div>
        <div class="metric-value">${m.needs_mapping}</div>
        <div class="metric-label">Без маппинга</div>
        ${m.needs_mapping > 0 ? `<div class="metric-delta down">▼ Требуют маппинга</div>` : `<div class="metric-delta up">✓ Все замаплены</div>`}
      </div>
      <div class="metric-card" onclick="OMS.navigate('errors')">
        <div class="metric-icon danger">${svgError()}</div>
        <div class="metric-value">${m.sync_errors}</div>
        <div class="metric-label">Ошибок синхр.</div>
        ${m.sync_errors > 0 ? `<div class="metric-delta down">▼ Требуют решения</div>` : `<div class="metric-delta up">✓ Нет ошибок</div>`}
      </div>
      <div class="metric-card">
        <div class="metric-icon success">${svgSync()}</div>
        <div class="metric-value">${m.sync_success_rate}%</div>
        <div class="metric-label">Успешность синхр.</div>
        <div class="metric-delta up">↑ За последние задачи</div>
      </div>
      <div class="metric-card" onclick="OMS.navigate('catalog')">
        <div class="metric-icon accent">${svgCatalog()}</div>
        <div class="metric-value">${m.products_synced}<span style="font-size:14px;color:var(--text-muted)">/${m.products_total}</span></div>
        <div class="metric-label">Товаров в синхр.</div>
        <div class="metric-delta" style="color:var(--accent)">Активных SKU</div>
      </div>
      <div class="metric-card">
        <div class="metric-icon success">🕐</div>
        <div class="metric-value" style="font-size:18px">${m.last_sync ? OMS.formatRelative(m.last_sync) : 'никогда'}</div>
        <div class="metric-label">Последняя синхронизация</div>
        <div class="metric-delta text-muted">МойСклад → OMS</div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Recent Orders -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Последние заказы</div>
            <div class="card-sub">5 самых актуальных</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="OMS.navigate('orders')">Все заказы →</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${recentOrders.map(o => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-secondary);border-radius:8px;cursor:pointer" onclick="OMS.navigate('order_detail',{id:'${o.id}'})">
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${o.customer_name}</div>
              <div style="font-size:11px;color:var(--text-muted)">${o.kaspi_order_id}</div>
            </div>
            ${statusBadge(o.status)}
            <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${OMS.formatPrice(o.total_amount)}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Connection Status -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Статус подключений</div>
            <div class="card-sub">Внешние системы</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="OMS.navigate('settings')">Настройки →</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="connection-card">
            <div class="connection-icon" style="background:rgba(255,87,34,0.12);font-size:22px">📊</div>
            <div class="connection-info">
              <div class="connection-name">МойСклад</div>
              <div class="connection-url">${cfg.moysklad.base_url}</div>
              <div class="connection-status">
                ${msOk ? `<span class="badge badge-success">✓ Подключён</span>` :
                  cfg.moysklad.token ? `<span class="badge badge-danger">✕ Ошибка подключения</span>` :
                  `<span class="badge badge-muted">— Не настроен</span>`}
              </div>
            </div>
            <div class="connection-actions">
              <button class="btn btn-secondary btn-sm" onclick="testConnection('moysklad')">Проверить</button>
            </div>
          </div>

          <div class="connection-card">
            <div class="connection-icon" style="background:rgba(245,158,11,0.12);font-size:22px">🛒</div>
            <div class="connection-info">
              <div class="connection-name">Kaspi Магазин</div>
              <div class="connection-url">${cfg.kaspi.base_url}</div>
              <div class="connection-status">
                ${kaspiOk ? `<span class="badge badge-success">✓ Подключён</span>` :
                  cfg.kaspi.api_key ? `<span class="badge badge-danger">✕ Ошибка подключения</span>` :
                  `<span class="badge badge-muted">— Не настроен</span>`}
              </div>
            </div>
            <div class="connection-actions">
              <button class="btn btn-secondary btn-sm" onclick="testConnection('kaspi')">Проверить</button>
            </div>
          </div>
        </div>

        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <div class="section-title mb-8">Быстрые действия</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary btn-sm" onclick="OMS.runSync('FULL','MS_TO_OMS').then(()=>OMS.notify())">🔄 Полная синхр.</button>
            <button class="btn btn-secondary btn-sm" onclick="OMS.runSync('INCREMENTAL','OMS_TO_KASPI').then(()=>OMS.notify())">→ Обновить Kaspi</button>
            <button class="btn btn-secondary btn-sm" onclick="OMS.navigate('sync_logs')">📋 Логи</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
// PAGE: ORDERS
// ============================================================
function renderOrders() {
  const orders = window.OMS_DATA.orders;
  const filterStatus = window._ordersFilter || 'ALL';
  const filterSearch = window._ordersSearch || '';

  let filtered = orders;
  if (filterStatus !== 'ALL') filtered = filtered.filter(o => o.status === filterStatus);
  if (filterSearch) filtered = filtered.filter(o =>
    o.customer_name.toLowerCase().includes(filterSearch.toLowerCase()) ||
    o.kaspi_order_id.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const statuses = ['ALL','NEW','ACCEPTED','PICKING','PICKED','PACKED','READY','DELIVERED','CANCELLED','ERROR'];
  const counts = {};
  statuses.forEach(s => counts[s] = s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length);

  return `
  ${renderHeader('Управление заказами', `Всего: ${orders.length} заказов`)}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-title">Заказы</div>
        <div class="page-subtitle">Все заказы из Kaspi Магазин</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="OMS.runSync('INCREMENTAL','KASPI_TO_OMS').then(()=>OMS.notify())">
          ${svgSync()} Получить из Kaspi
        </button>
      </div>
    </div>

    <div class="filters-bar">
      <input class="filter-input" type="text" placeholder="🔍 Поиск по имени или ID..." value="${filterSearch}"
        oninput="window._ordersSearch=this.value;OMS.notify()">
      <select class="filter-select" onchange="window._ordersFilter=this.value;OMS.notify()">
        ${statuses.map(s => `<option value="${s}" ${s === filterStatus ? 'selected' : ''}>
          ${s === 'ALL' ? 'Все статусы' : OMS.statusLabel(s)} (${counts[s]})
        </option>`).join('')}
      </select>
    </div>

    ${filtered.length === 0 ? `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Нет заказов</div><div class="empty-sub">Попробуйте изменить фильтры</div></div>` : `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID заказа</th>
            <th>Клиент</th>
            <th>Статус</th>
            <th>Сумма</th>
            <th>Дата</th>
            <th>Ответственный</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(o => `
          <tr>
            <td>
              <div style="font-size:13px;font-weight:600;color:var(--text-accent);cursor:pointer" onclick="OMS.navigate('order_detail',{id:'${o.id}'})">${o.kaspi_order_id}</div>
              ${o.has_issue ? `<div class="badge badge-danger" style="margin-top:3px;font-size:10px">⚠ Проблема</div>` : ''}
            </td>
            <td>
              <div style="font-weight:500">${o.customer_name}</div>
              <div class="text-xs text-muted">${o.customer_phone}</div>
            </td>
            <td>${statusBadge(o.status)}</td>
            <td><span style="font-weight:700">${OMS.formatPrice(o.total_amount)}</span></td>
            <td class="td-muted">${OMS.formatRelative(o.created_at)}</td>
            <td>${o.assigned_to ? `<span style="font-size:12px">${OMS.userName(o.assigned_to)}</span>` : `<span class="text-muted text-xs">—</span>`}</td>
            <td>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="btn btn-ghost btn-sm" onclick="OMS.navigate('order_detail',{id:'${o.id}'})">Открыть</button>
                ${orderActionButtons(o)}
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`}
  </div>`;
}

// ============================================================
// PAGE: ORDER DETAIL
// ============================================================
function renderOrderDetail(params = {}) {
  const order = OMS.getOrder(params.id);
  if (!order) return `<div class="page-content"><div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Заказ не найден</div></div></div>`;

  const stock_issues = StockService.checkStockForOrder(order);

  return `
  ${renderHeader(`Заказ ${order.kaspi_order_id}`, order.customer_name)}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <button class="btn btn-ghost btn-sm" onclick="OMS.navigate('orders')" style="margin-bottom:8px">← Назад к заказам</button>
        <div class="page-title">${order.kaspi_order_id}</div>
        <div class="page-subtitle">${OMS.formatDate(order.created_at)}</div>
      </div>
      <div class="page-actions">
        ${statusBadge(order.status)}
        ${orderActionButtons(order)}
      </div>
    </div>

    ${order.has_issue ? `
    <div class="alert alert-warning">
      <span class="alert-icon">⚠</span>
      <div class="alert-content">
        <div class="alert-title">Заказ имеет проблему: ${order.issue_description || 'неизвестно'}</div>
        <div class="alert-msg">Требуется внимание оператора</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="OMS.clearIssue('${order.id}');OMS.notify()">Снять флаг</button>
    </div>` : ''}

    ${stock_issues.length > 0 ? `
    <div class="alert alert-danger">
      <span class="alert-icon">📦</span>
      <div class="alert-content">
        <div class="alert-title">Недостаточно остатков для ${stock_issues.length} позиций</div>
        ${stock_issues.map(i => `<div class="alert-msg">${i.item.name}: нужно ${i.needed}, доступно ${i.available}</div>`).join('')}
      </div>
    </div>` : ''}

    <div class="grid-2">
      <!-- Order Info -->
      <div class="card">
        <div class="card-header"><div class="card-title">Информация о заказе</div></div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[
            ['Клиент', order.customer_name],
            ['Телефон', order.customer_phone],
            ['Адрес доставки', order.delivery_address],
            ['Сумма заказа', OMS.formatPrice(order.total_amount)],
            ['Ответственный', OMS.userName(order.assigned_to || '')],
            ['Создан', OMS.formatDate(order.created_at)],
            ['Обновлён', OMS.formatDate(order.updated_at)],
          ].map(([k, v]) => `
          <div style="display:flex;justify-content:space-between;gap:12px">
            <span style="color:var(--text-muted);font-size:12px;min-width:120px">${k}</span>
            <span style="font-size:13px;font-weight:500;text-align:right">${v || '—'}</span>
          </div>`).join('')}
        </div>

        ${['ACCEPTED','PICKING'].includes(order.status) ? `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <div class="section-title mb-8">Назначить сотрудника</div>
          <div style="display:flex;gap:8px">
            <select class="filter-select" id="assign-select" style="flex:1">
              ${window.OMS_DATA.users.filter(u => u.is_active && ['WAREHOUSE_WORKER','PACKER','OPERATOR'].includes(u.role)).map(u =>
                `<option value="${u.id}" ${order.assigned_to === u.id ? 'selected' : ''}>${u.name} (${OMS.roleLabel(u.role)})</option>`
              ).join('')}
            </select>
            <button class="btn btn-secondary btn-sm" onclick="OMS.assignOrder('${order.id}',document.getElementById('assign-select').value)">Назначить</button>
          </div>
        </div>` : ''}

        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <div class="section-title mb-8">Зафиксировать проблему</div>
          <div style="display:flex;gap:8px">
            <select class="filter-select" id="issue-type-sel" style="flex:1">
              <option value="stock_issue">Нет товара</option>
              <option value="defect">Дефект</option>
              <option value="mismatch">Пересорт</option>
              <option value="qty_short">Не хватает кол-ва</option>
            </select>
            <button class="btn btn-danger btn-sm" onclick="reportIssueForOrder('${order.id}')">Фиксировать</button>
          </div>
        </div>
      </div>

      <!-- Status History -->
      <div class="card">
        <div class="card-header"><div class="card-title">История статусов</div></div>
        <div class="timeline">
          ${[...order.status_history].reverse().map((h, i) => `
          <div class="timeline-item">
            <div class="timeline-dot ${h.to_status === 'DELIVERED' ? 'success' : h.to_status === 'CANCELLED' ? 'danger' : h.to_status === 'ERROR' ? 'warning' : 'accent'}">
              ${i === 0 ? '●' : '○'}
            </div>
            <div class="timeline-content">
              <div class="timeline-title">${OMS.statusLabel(h.to_status)}</div>
              <div class="timeline-meta">${OMS.userName(h.changed_by)} · ${OMS.formatDate(h.changed_at)}</div>
              ${h.comment ? `<div class="timeline-body">${h.comment}</div>` : ''}
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="card mt-16">
      <div class="card-header">
        <div class="card-title">Состав заказа</div>
        <div class="card-sub">${order.items.length} позиций</div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr><th>Товар</th><th>SKU</th><th>Кол-во</th><th>Цена</th><th>Сумма</th><th>Наличие</th></tr>
          </thead>
          <tbody>
            ${order.items.map(item => {
              const stock = window.OMS_DATA.stocks.find(s => s.product_id === item.product_id);
              const avail = stock ? stock.available_qty : '?';
              return `<tr>
                <td><span style="font-weight:500">${item.name}</span></td>
                <td class="td-mono">${item.kaspi_sku}</td>
                <td style="font-weight:700">${item.quantity}</td>
                <td>${OMS.formatPrice(item.unit_price)}</td>
                <td style="font-weight:700">${OMS.formatPrice(item.quantity * item.unit_price)}</td>
                <td>
                  ${item.is_available === true ? `<span class="badge badge-success">✓ Есть</span>` :
                    item.is_available === false ? `<span class="badge badge-danger">✕ Нет</span>` :
                    `<span class="badge badge-muted">На складе: ${avail}</span>`}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function reportIssueForOrder(orderId) {
  const sel = document.getElementById('issue-type-sel');
  const type = sel ? sel.value : 'stock_issue';
  const labels = { stock_issue: 'Нет товара', defect: 'Дефект', mismatch: 'Пересорт', qty_short: 'Не хватает количества' };
  OMS.reportIssue(orderId, type, labels[type] || type);
}

// ============================================================
// PAGE: WAREHOUSE
// ============================================================
function renderWarehouse() {
  const role = window.OMS_DATA.current_user.role;
  const cu = window.OMS_DATA.current_user;
  const orders = window.OMS_DATA.orders;

  const pickingOrders = orders.filter(o => ['ACCEPTED','PICKING'].includes(o.status));
  const packingOrders = orders.filter(o => o.status === 'PICKED');
  const readyOrders = orders.filter(o => ['PACKED','READY'].includes(o.status));

  const activeOrder = window._warehouseOrder ? OMS.getOrder(window._warehouseOrder) : null;

  return `
  ${renderHeader('Рабочее место склада', `${cu.name} · ${OMS.roleLabel(role)}`)}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-title">Склад</div>
        <div class="page-subtitle">Сборка и упаковка заказов</div>
      </div>
      <div class="page-actions">
        <div style="display:flex;gap:8px">
          <span class="badge badge-accent">${pickingOrders.length} на сборке</span>
          <span class="badge badge-warning">${packingOrders.length} на упаковке</span>
          <span class="badge badge-success">${readyOrders.length} готово</span>
        </div>
      </div>
    </div>

    ${activeOrder ? `
    <!-- Active Order Work Mode -->
    <div class="alert alert-info mb-16">
      <span class="alert-icon">📦</span>
      <div class="alert-content">
        <div class="alert-title">Активный заказ: ${activeOrder.kaspi_order_id}</div>
        <div class="alert-msg">${activeOrder.customer_name} · ${activeOrder.delivery_address}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="window._warehouseOrder=null;OMS.notify()">✕ Закрыть</button>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Список сборки</div>
          <div>${statusBadge(activeOrder.status)}</div>
        </div>
        <div class="checklist">
          ${activeOrder.items.map((item, idx) => `
          <div class="checklist-item ${item.is_available === true ? 'checked' : ''}" onclick="toggleItemCheck('${activeOrder.id}',${idx})">
            <div class="checklist-checkbox">${item.is_available === true ? '✓' : ''}</div>
            <div style="flex:1">
              <div class="checklist-label">${item.name}</div>
              <div class="checklist-sku">${item.kaspi_sku}</div>
            </div>
            <div class="checklist-qty">× ${item.quantity}</div>
          </div>`).join('')}
        </div>

        <div style="display:flex;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          ${activeOrder.status === 'ACCEPTED' ?
            `<button class="btn btn-primary" onclick="OMS.changeOrderStatus('${activeOrder.id}','PICKING');OMS.notify()">🏁 Начать сборку</button>` : ''}
          ${activeOrder.status === 'PICKING' ?
            `<button class="btn btn-success" onclick="OMS.changeOrderStatus('${activeOrder.id}','PICKED','Сборка завершена');window._warehouseOrder=null;OMS.notify()">✓ Завершить сборку</button>` : ''}
          ${activeOrder.status === 'PICKED' ?
            `<button class="btn btn-success" onclick="OMS.changeOrderStatus('${activeOrder.id}','PACKED','Упаковка завершена');window._warehouseOrder=null;OMS.notify()">📫 Упаковано</button>` : ''}
          <button class="btn btn-danger btn-sm" onclick="reportIssueFromWarehouse('${activeOrder.id}')">⚠ Проблема</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Информация о заказе</div></div>
        ${[['Клиент', activeOrder.customer_name],['Телефон', activeOrder.customer_phone],['Адрес', activeOrder.delivery_address],['Сумма', OMS.formatPrice(activeOrder.total_amount)]].map(([k,v]) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span class="text-muted text-sm">${k}</span>
          <span style="font-size:13px;font-weight:500">${v}</span>
        </div>`).join('')}
      </div>
    </div>
    ` : `

    <!-- Queue View -->
    <div class="grid-2">
      <!-- Picking Queue -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📦 Очередь сборки</div>
            <div class="card-sub">${pickingOrders.length} заказов</div>
          </div>
        </div>
        ${pickingOrders.length === 0 ? `<div class="empty-state" style="padding:30px"><div class="empty-icon" style="font-size:28px">✓</div><div class="empty-title">Нет заказов на сборке</div></div>` :
        pickingOrders.map(o => `
        <div style="padding:12px;background:var(--bg-secondary);border-radius:8px;margin-bottom:8px;border:1px solid var(--border)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-weight:700;color:var(--text-accent);font-size:13px">${o.kaspi_order_id}</span>
            ${statusBadge(o.status)}
          </div>
          <div style="font-size:12px;color:var(--text-secondary)">${o.customer_name}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${o.items.length} поз. · ${OMS.formatRelative(o.created_at)}</div>
          ${o.has_issue ? `<div class="badge badge-danger" style="margin-top:4px;font-size:10px">⚠ Проблема</div>` : ''}
          <div style="margin-top:8px;display:flex;gap:6px">
            <button class="btn btn-primary btn-sm" onclick="window._warehouseOrder='${o.id}';OMS.notify()">Взять в работу</button>
            <button class="btn btn-ghost btn-sm" onclick="OMS.navigate('order_detail',{id:'${o.id}'})">Открыть</button>
          </div>
        </div>`).join('')}
      </div>

      <!-- Packing + Ready -->
      <div>
        <div class="card mb-16">
          <div class="card-header">
            <div>
              <div class="card-title">📫 На упаковке</div>
              <div class="card-sub">${packingOrders.length} заказов</div>
            </div>
          </div>
          ${packingOrders.length === 0 ? `<div class="empty-state" style="padding:24px"><div class="empty-icon" style="font-size:24px">✓</div><div class="empty-title">Нет на упаковке</div></div>` :
          packingOrders.map(o => `
          <div style="padding:10px;background:var(--bg-secondary);border-radius:8px;margin-bottom:6px;border:1px solid var(--border)">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-weight:600;font-size:13px">${o.kaspi_order_id}</span>
              <span style="font-size:11px;color:var(--text-muted)">${o.customer_name}</span>
            </div>
            <div style="margin-top:6px;display:flex;gap:6px">
              <button class="btn btn-success btn-sm" onclick="window._warehouseOrder='${o.id}';OMS.notify()">Упаковать</button>
            </div>
          </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">🚀 Готово к передаче</div>
              <div class="card-sub">${readyOrders.length} заказов</div>
            </div>
          </div>
          ${readyOrders.length === 0 ? `<div class="empty-state" style="padding:24px"><div class="empty-icon" style="font-size:24px">📭</div><div class="empty-title">Нет готовых</div></div>` :
          readyOrders.map(o => `
          <div style="padding:10px;background:var(--success-light);border:1px solid rgba(16,185,129,0.3);border-radius:8px;margin-bottom:6px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-weight:600;font-size:13px;color:var(--success)">${o.kaspi_order_id}</span>
              ${statusBadge(o.status)}
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${o.customer_name}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>`}
  </div>`;
}

function toggleItemCheck(orderId, itemIdx) {
  const order = OMS.getOrder(orderId);
  if (!order || !order.items[itemIdx]) return;
  order.items[itemIdx].is_available = order.items[itemIdx].is_available !== true ? true : null;
  OMS.notify();
}

function reportIssueFromWarehouse(orderId) {
  const types = ['stock_issue','defect','mismatch','qty_short'];
  const labels = { stock_issue: 'Нет товара', defect: 'Дефект', mismatch: 'Пересорт', qty_short: 'Не хватает количества' };
  const choice = prompt('Тип проблемы:\n1. Нет товара\n2. Дефект\n3. Пересорт\n4. Не хватает количества\n\nВведите номер (1-4):');
  const idx = parseInt(choice) - 1;
  if (idx >= 0 && idx < types.length) {
    OMS.reportIssue(orderId, types[idx], labels[types[idx]]);
  }
}

// ============================================================
// PAGE: CATALOG
// ============================================================
function renderCatalog() {
  const products = window.OMS_DATA.products;
  const filterMap = window._catalogFilter || 'ALL';
  const filterSearch = window._catalogSearch || '';

  let filtered = products;
  if (filterMap === 'NEEDS_MAPPING') filtered = filtered.filter(p => p.needs_mapping);
  else if (filterMap === 'OK') filtered = filtered.filter(p => !p.needs_mapping && !p.sync_disabled && !p.last_sync_failed);
  else if (filterMap === 'DISABLED') filtered = filtered.filter(p => p.sync_disabled);
  else if (filterMap === 'ERROR') filtered = filtered.filter(p => p.last_sync_failed);
  if (filterSearch) {
    const q = filterSearch.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.article && p.article.toLowerCase().includes(q)) ||
      (p.moysklad_id && p.moysklad_id.includes(q)) ||
      (p.kaspi_sku && p.kaspi_sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.includes(q))
    );
  }

  return `
  ${renderHeader('Каталог товаров и маппинг', `${products.length} товаров`)}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-title">Товары и маппинг</div>
        <div class="page-subtitle">Сопоставление SKU между МойСклад и Kaspi</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="OMS.runSync('FULL','MS_TO_OMS').then(()=>OMS.notify())">${svgSync()} Обновить каталог</button>
        <button class="btn btn-primary" onclick="showAutoMappingModal()">⚡ Авто-маппинг</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
      ${[
        { label: 'Всего товаров', val: products.length, cls: 'accent' },
        { label: 'Замаплено', val: products.filter(p=>!p.needs_mapping&&!p.sync_disabled).length, cls: 'success' },
        { label: 'Без маппинга', val: products.filter(p=>p.needs_mapping).length, cls: 'warning' },
        { label: 'Откл. синхр.', val: products.filter(p=>p.sync_disabled).length, cls: 'muted' },
      ].map(m => `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;text-align:center">
        <div style="font-size:22px;font-weight:800;color:var(--text-primary)">${m.val}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${m.label}</div>
      </div>`).join('')}
    </div>

    <div class="filters-bar">
      <input class="filter-input" type="text" placeholder="🔍 Поиск по названию, артикулу, SKU..." value="${filterSearch}"
        oninput="window._catalogSearch=this.value;OMS.notify()">
      <select class="filter-select" onchange="window._catalogFilter=this.value;OMS.notify()">
        <option value="ALL" ${filterMap==='ALL'?'selected':''}>Все товары</option>
        <option value="NEEDS_MAPPING" ${filterMap==='NEEDS_MAPPING'?'selected':''}>Без маппинга</option>
        <option value="OK" ${filterMap==='OK'?'selected':''}>Замаплены</option>
        <option value="DISABLED" ${filterMap==='DISABLED'?'selected':''}>Откл. синхр.</option>
        <option value="ERROR" ${filterMap==='ERROR'?'selected':''}>Ошибки</option>
      </select>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr><th>Название</th><th>Артикул (МС)</th><th>Kaspi SKU</th><th>Штрихкод</th><th>Статус маппинга</th><th>Остаток</th><th>Действия</th></tr>
        </thead>
        <tbody>
          ${filtered.map(p => {
            const stock = window.OMS_DATA.stocks.find(s => s.product_id === p.id);
            return `<tr ${p.sync_disabled ? 'style="opacity:0.6"' : ''}>
              <td>
                <div style="font-weight:500;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.name}">${p.name}</div>
                ${!p.is_active ? `<span class="badge badge-muted" style="font-size:9px">Неактивен</span>` : ''}
              </td>
              <td>
                <div class="td-mono" style="font-size:12px">${p.code || '—'}</div>
                ${p.article && p.article !== p.code ? `<div style="font-size:10px;color:var(--text-muted)">${p.article}</div>` : ''}
              </td>
              <td>
                ${p.kaspi_sku ? `<span class="td-mono">${p.kaspi_sku}</span>` : `<span class="text-muted text-xs">—</span>`}
              </td>
              <td class="td-mono">${p.barcode || '—'}</td>
              <td>${mappingBadge(p)}</td>
              <td>
                ${stock ? `
                <div style="display:flex;flex-direction:column;gap:1px">
                  <span style="font-weight:700">${stock.available_qty}</span>
                  <span style="font-size:10px;color:var(--text-muted)">резерв: ${stock.reserved_qty}</span>
                </div>` : '—'}
              </td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="showMappingModal('${p.id}')">✏ Маппинг</button>
                  <button class="btn btn-ghost btn-sm" onclick="OMS.toggleSyncDisabled('${p.id}')">
                    ${p.sync_disabled ? '▶ Включить' : '⊘ Откл.'}
                  </button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function showMappingModal(productId) {
  const p = window.OMS_DATA.products.find(x => x.id === productId);
  if (!p) return;
  showModal(`
  <div class="modal">
    <div class="modal-header">
      <div><div class="modal-title">Маппинг товара</div><div class="modal-sub">${p.name}</div></div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="form-group">
      <label class="form-label">Артикул (МойСклад)</label>
      <input class="form-input" value="${p.code || '—'}" disabled>
    </div>
    <div class="form-group">
      <label class="form-label">Vendor Article</label>
      <input class="form-input" value="${p.article || '—'}" disabled>
    </div>
    <div class="form-group">
      <label class="form-label">Штрихкод</label>
      <input class="form-input" value="${p.barcode || '—'}" disabled>
    </div>
    <div class="form-group">
      <label class="form-label">Kaspi SKU *</label>
      <input class="form-input" id="mapping-kaspi-sku" value="${p.kaspi_sku || ''}" placeholder="Введите SKU из Kaspi Магазин">
      <div class="form-hint">Укажите точный SKU товара из личного кабинета Kaspi Магазин</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="
        OMS.updateProductMapping('${productId}', document.getElementById('mapping-kaspi-sku').value.trim());
        closeModal();
      ">Сохранить маппинг</button>
    </div>
  </div>`);
}

function showAutoMappingModal() {
  showModal(`
  <div class="modal">
    <div class="modal-header">
      <div><div class="modal-title">Автоматический маппинг</div><div class="modal-sub">Сопоставление по артикулу и штрихкоду</div></div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="alert alert-info">
      <span class="alert-icon">ℹ</span>
      <div class="alert-content">
        <div class="alert-title">Как работает авто-маппинг</div>
        <div class="alert-msg">1. По артикулу (code) МойСклад = SKU Kaspi → 2. По штрихкоду → 3. По external code</div>
      </div>
    </div>
    <div class="alert alert-warning">
      <span class="alert-icon">⚠</span>
      <div class="alert-content">
        <div class="alert-title">Требуется подключение к API</div>
        <div class="alert-msg">Автомаппинг загружает список товаров из обеих систем. Настройте API-ключи в разделе Настройки.</div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="closeModal();OMS.runSync('FULL','MS_TO_OMS').then(()=>OMS.notify())">⚡ Запустить маппинг</button>
    </div>
  </div>`);
}

// ============================================================
// PAGE: STOCK
// ============================================================
function renderStock() {
  const stocks = window.OMS_DATA.stocks;
  const products = window.OMS_DATA.products;

  const mergedStocks = stocks.map(s => {
    const p = products.find(x => x.id === s.product_id);
    return { ...s, product: p };
  }).filter(s => s.product);

  return `
  ${renderHeader('Управление остатками', 'МойСклад → OMS')}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-title">Остатки товаров</div>
        <div class="page-subtitle">available = total - reserved</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="OMS.runSync('INCREMENTAL','MS_TO_OMS').then(()=>OMS.notify())">${svgSync()} Обновить</button>
        <button class="btn btn-primary" onclick="OMS.runSync('FULL','OMS_TO_KASPI').then(()=>OMS.notify())">→ Опубликовать в Kaspi</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px">
      ${[
        { label: 'Всего позиций', val: mergedStocks.map(s=>s.total_qty).reduce((a,b)=>a+b,0) + ' ед.' },
        { label: 'Зарезервировано', val: mergedStocks.map(s=>s.reserved_qty).reduce((a,b)=>a+b,0) + ' ед.' },
        { label: 'Доступно', val: mergedStocks.map(s=>s.available_qty).reduce((a,b)=>a+b,0) + ' ед.' },
      ].map(m => `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px">
        <div style="font-size:24px;font-weight:800;color:var(--text-primary)">${m.val}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${m.label}</div>
      </div>`).join('')}
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr><th>Товар</th><th>Kaspi SKU</th><th>Всего</th><th>Зарезерв.</th><th>Доступно</th><th>Уровень</th><th>Синхр.</th></tr>
        </thead>
        <tbody>
          ${mergedStocks.map(s => {
            const pct = s.total_qty > 0 ? Math.round(s.available_qty / s.total_qty * 100) : 0;
            const barColor = pct > 50 ? 'success' : pct > 20 ? 'warning' : 'danger';
            return `<tr>
              <td>
                <div style="font-weight:500;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.product.name}</div>
                <div style="font-size:10px;color:var(--text-muted)">${s.product.code ? s.product.code : s.product.moysklad_id}</div>
              </td>
              <td class="td-mono">${s.product.kaspi_sku || '—'}</td>
              <td style="font-weight:700">${s.total_qty}</td>
              <td style="color:var(--warning)">${s.reserved_qty}</td>
              <td style="font-weight:800;color:${s.available_qty === 0 ? 'var(--danger)' : 'var(--success)'}">${s.available_qty}</td>
              <td style="min-width:100px">
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="progress-bar" style="width:80px">
                    <div class="progress-fill ${barColor}" style="width:${pct}%"></div>
                  </div>
                  <span style="font-size:11px;color:var(--text-muted)">${pct}%</span>
                </div>
              </td>
              <td class="td-muted">${OMS.formatRelative(s.last_synced_at)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ============================================================
// PAGE: SYNC LOGS
// ============================================================
function renderSyncLogs() {
  const tasks = window.OMS_DATA.sync_tasks;
  const events = window.OMS_DATA.integration_events.slice(0, 30);
  const activeTab = window._syncTab || 'tasks';

  return `
  ${renderHeader('Логи синхронизации', `${tasks.length} задач`)}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-title">Синхронизация</div>
        <div class="page-subtitle">История задач и API-вызовов</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="OMS.runSync('INCREMENTAL','MS_TO_OMS').then(()=>OMS.notify())">${svgSync()} Инкрементальная</button>
        <button class="btn btn-primary" onclick="OMS.runSync('FULL','MS_TO_OMS').then(()=>OMS.notify())">🔄 Полная синхр.</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab ${activeTab==='tasks'?'active':''}" onclick="window._syncTab='tasks';OMS.notify()">Задачи синхронизации</button>
      <button class="tab ${activeTab==='events'?'active':''}" onclick="window._syncTab='events';OMS.notify()">API-события</button>
    </div>

    ${activeTab === 'tasks' ? `
    <div class="table-container">
      <table>
        <thead>
          <tr><th>ID</th><th>Тип</th><th>Направление</th><th>Статус</th><th>Обработано</th><th>Ошибок</th><th>Запущен</th><th>Завершён</th><th>Кем</th></tr>
        </thead>
        <tbody>
          ${tasks.map(t => `
          <tr>
            <td class="td-mono">${t.id}</td>
            <td><span class="badge ${t.sync_type==='FULL'?'badge-accent':'badge-muted'}">${t.sync_type}</span></td>
            <td class="text-sm">${t.direction.replace('_TO_', ' → ')}</td>
            <td>
              <span class="badge ${t.status==='SUCCESS'?'badge-success':t.status==='FAILED'?'badge-danger':t.status==='IN_PROGRESS'?'badge-accent':'badge-muted'}">
                ${t.status === 'IN_PROGRESS' ? '<span class="spinner"></span>' : ''} ${t.status}
              </span>
            </td>
            <td style="font-weight:700">${t.items_processed}</td>
            <td style="color:${t.items_failed>0?'var(--danger)':'var(--text-muted)'}">${t.items_failed}</td>
            <td class="td-muted">${OMS.formatDate(t.started_at)}</td>
            <td class="td-muted">${t.finished_at ? OMS.formatDate(t.finished_at) : '—'}</td>
            <td class="text-sm">${t.triggered_by === 'SCHEDULER' ? '⚙ Расписание' : OMS.userName(t.triggered_by)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `
    <div class="table-container">
      <table>
        <thead>
          <tr><th>ID</th><th>Система</th><th>Тип события</th><th>Направление</th><th>Статус</th><th>Попытки</th><th>Время</th><th>Ошибка</th><th></th></tr>
        </thead>
        <tbody>
          ${events.map(e => `
          <tr>
            <td class="td-mono">${e.id}</td>
            <td><span class="badge ${e.system==='MOYSKLAD'?'badge-accent':'badge-warning'}">${e.system}</span></td>
            <td class="text-sm font-mono">${e.event_type}</td>
            <td><span class="badge badge-muted">${e.direction}</span></td>
            <td><span class="badge ${e.status==='SUCCESS'?'badge-success':e.status==='FAILED'?'badge-danger':'badge-warning'}">${e.status}</span></td>
            <td style="text-align:center">${e.attempt_count}</td>
            <td class="td-muted">${OMS.formatDate(e.created_at)}</td>
            <td style="max-width:200px;font-size:11px;color:var(--danger)">${e.error_message || '—'}</td>
            <td>
              ${e.status === 'FAILED' ? `<button class="btn btn-ghost btn-sm" onclick="OMS.replayIntegrationEvent('${e.id}')">↺ Replay</button>` : ''}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`}
  </div>`;
}

// ============================================================
// PAGE: ERRORS
// ============================================================
function renderErrors() {
  const errors = window.OMS_DATA.sync_errors;
  const filterRes = window._errorsFilter ?? 'OPEN';
  const filtered = filterRes === 'ALL' ? errors : filterRes === 'OPEN' ? errors.filter(e=>!e.resolved) : errors.filter(e=>e.resolved);

  return `
  ${renderHeader('Ошибки синхронизации', `${errors.filter(e=>!e.resolved).length} открытых`)}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-title">Ошибки и исключения</div>
        <div class="page-subtitle">SyncError и неудачные IntegrationEvent</div>
      </div>
    </div>

    <div class="filters-bar">
      <select class="filter-select" onchange="window._errorsFilter=this.value;OMS.notify()">
        <option value="OPEN" ${filterRes==='OPEN'?'selected':''}>Открытые (${errors.filter(e=>!e.resolved).length})</option>
        <option value="RESOLVED" ${filterRes==='RESOLVED'?'selected':''}>Решённые (${errors.filter(e=>e.resolved).length})</option>
        <option value="ALL" ${filterRes==='ALL'?'selected':''}>Все (${errors.length})</option>
      </select>
    </div>

    ${filtered.length === 0 ? `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">Нет ошибок</div><div class="empty-sub">Все синхронизации прошли успешно</div></div>` : `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${filtered.map(e => {
        const p = e.entity_id ? window.OMS_DATA.products.find(x => x.id === e.entity_id) : null;
        return `
        <div style="background:var(--bg-card);border:1px solid ${e.resolved?'var(--border)':'rgba(239,68,68,0.25)'};border-radius:var(--radius);padding:16px">
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="font-size:20px;margin-top:2px">${e.error_type==='MAPPING_ERROR'?'🔗':e.error_type==='API_ERROR'?'🌐':'⚠'}</div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span class="badge ${e.error_type==='MAPPING_ERROR'?'badge-warning':e.error_type==='API_ERROR'?'badge-danger':'badge-accent'}">${e.error_type}</span>
                ${e.resolved ? `<span class="badge badge-success">✓ Решено</span>` : `<span class="badge badge-danger">● Открыто</span>`}
                <span class="text-xs text-muted">${e.id}</span>
              </div>
              <div style="font-size:13px;color:var(--text-primary);margin-bottom:4px">${e.message}</div>
              ${p ? `<div style="font-size:11px;color:var(--text-muted)">Товар: ${p.name}</div>` : ''}
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${OMS.formatDate(e.created_at)}</div>
              ${e.resolved ? `<div style="font-size:11px;color:var(--success);margin-top:2px">Решено: ${OMS.userName(e.resolved_by)} · ${OMS.formatDate(e.resolved_at)}</div>` : ''}
            </div>
            <div style="display:flex;gap:8px;flex-direction:column;flex-shrink:0">
              ${!e.resolved ? `<button class="btn btn-success btn-sm" onclick="OMS.resolveSyncError('${e.id}')">✓ Решено</button>` : ''}
              ${e.entity_id && e.error_type === 'MAPPING_ERROR' ? `<button class="btn btn-secondary btn-sm" onclick="showMappingModal('${e.entity_id}')">✏ Маппинг</button>` : ''}
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`}
  </div>`;
}

// ============================================================
// PAGE: AUDIT LOG
// ============================================================
function renderAuditLog() {
  const logs = window.OMS_DATA.audit_log;
  const filterUser = window._auditUser || 'ALL';
  const filterAction = window._auditAction || 'ALL';

  let filtered = logs;
  if (filterUser !== 'ALL') filtered = filtered.filter(l => l.user_id === filterUser);
  if (filterAction !== 'ALL') filtered = filtered.filter(l => l.entity_type === filterAction);

  const actionLabels = {
    ORDER_STATUS_CHANGE: 'Изменение статуса заказа',
    MAPPING_MANUAL: 'Ручной маппинг',
    SYNC_MANUAL_START: 'Запуск синхронизации',
    SYNC_ERROR_RESOLVED: 'Решение ошибки',
    USER_CREATED: 'Создание пользователя',
    USER_UPDATED: 'Обновление пользователя',
    CONFIG_UPDATED: 'Обновление настроек',
    ORDER_ASSIGNED: 'Назначение на заказ',
    ORDER_ISSUE_REPORTED: 'Фиксация проблемы',
    SYNC_REPLAY: 'Повтор операции',
  };

  return `
  ${renderHeader('Аудит действий', `${logs.length} записей`)}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-title">Аудит-лог</div>
        <div class="page-subtitle">Все действия пользователей в системе</div>
      </div>
    </div>

    <div class="filters-bar">
      <select class="filter-select" onchange="window._auditUser=this.value;OMS.notify()">
        <option value="ALL">Все пользователи</option>
        ${window.OMS_DATA.users.map(u => `<option value="${u.id}" ${filterUser===u.id?'selected':''}>${u.name}</option>`).join('')}
      </select>
      <select class="filter-select" onchange="window._auditAction=this.value;OMS.notify()">
        <option value="ALL">Все типы</option>
        <option value="ORDER">Заказы</option>
        <option value="PRODUCT">Товары</option>
        <option value="SYNC_TASK">Синхронизация</option>
        <option value="SYNC_ERROR">Ошибки</option>
        <option value="USER">Пользователи</option>
        <option value="CONFIG">Настройки</option>
      </select>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr><th>Время</th><th>Пользователь</th><th>Действие</th><th>Сущность</th><th>ID</th><th>Изменения</th></tr>
        </thead>
        <tbody>
          ${filtered.map(l => `
          <tr>
            <td class="td-muted" style="white-space:nowrap">${OMS.formatDate(l.created_at)}</td>
            <td style="font-size:13px;font-weight:500">${OMS.userName(l.user_id)}</td>
            <td>
              <span class="badge badge-accent" style="font-size:10px">${l.action}</span>
              <div class="text-xs text-muted" style="margin-top:2px">${actionLabels[l.action] || l.action}</div>
            </td>
            <td><span class="badge badge-muted">${l.entity_type}</span></td>
            <td class="td-mono">${l.entity_id || '—'}</td>
            <td style="max-width:250px">
              ${l.new_value ? `<pre style="font-size:10px;color:var(--text-secondary);overflow:hidden;white-space:pre-wrap;max-height:40px">${JSON.stringify(l.new_value)}</pre>` : '—'}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ============================================================
// PAGE: USERS
// ============================================================
function renderUsers() {
  const users = window.OMS_DATA.users;
  const cu = window.OMS_DATA.current_user;

  const roleColors = { ADMIN: 'badge-danger', OPERATOR: 'badge-info', WAREHOUSE_WORKER: 'badge-warning', PACKER: 'badge-accent', MANAGER: 'badge-success' };

  return `
  ${renderHeader('Пользователи и роли', `${users.length} пользователей`)}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-title">Управление пользователями</div>
        <div class="page-subtitle">RBAC: роли и права доступа</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="showAddUserModal()">+ Добавить пользователя</button>
      </div>
    </div>

    <div class="alert alert-info mb-16">
      <span class="alert-icon">ℹ</span>
      <div class="alert-content">
        <div class="alert-title">Переключение роли для демо</div>
        <div class="alert-msg">Нажмите «Войти как» для симуляции работы с другой ролью. Текущий пользователь: <strong>${cu.name}</strong></div>
      </div>
    </div>

    <div class="grid-auto">
      ${users.map(u => `
      <div style="background:var(--bg-card);border:1px solid ${u.id===cu.id?'var(--accent)':'var(--border)'};border-radius:var(--radius-lg);padding:20px;${!u.is_active?'opacity:0.5':''}">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--accent),#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0">
            ${u.name.charAt(0)}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;color:var(--text-primary)">${u.name}</div>
            <div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.email}</div>
          </div>
          ${u.id === cu.id ? `<span class="badge badge-accent">● Текущий</span>` : ''}
        </div>
        <div style="margin-bottom:12px">
          <span class="badge ${roleColors[u.role] || 'badge-muted'}">${OMS.roleLabel(u.role)}</span>
          ${!u.is_active ? `<span class="badge badge-muted" style="margin-left:6px">Неактивен</span>` : ''}
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px">Добавлен: ${new Date(u.created_at).toLocaleDateString('ru-RU')}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${u.id !== cu.id ? `<button class="btn btn-secondary btn-sm" onclick="OMS.switchUser('${u.id}')">→ Войти как</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="showEditUserModal('${u.id}')">✏ Изменить</button>
          ${cu.role === 'ADMIN' && u.id !== cu.id ?
            `<button class="btn btn-ghost btn-sm" onclick="OMS.toggleUserActive('${u.id}')">${u.is_active ? '⊘ Откл.' : '▶ Акт.'}</button>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function showAddUserModal() {
  showModal(`
  <div class="modal">
    <div class="modal-header">
      <div><div class="modal-title">Новый пользователь</div></div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Имя и фамилия</label>
        <input class="form-input" id="new-user-name" placeholder="Иван Иванов">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="new-user-email" type="email" placeholder="user@company.kz">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Роль</label>
      <select class="form-select" id="new-user-role">
        <option value="OPERATOR">Оператор заказов</option>
        <option value="WAREHOUSE_WORKER">Сотрудник склада</option>
        <option value="PACKER">Упаковщик</option>
        <option value="MANAGER">Руководитель</option>
        <option value="ADMIN">Администратор</option>
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="
        const name = document.getElementById('new-user-name').value.trim();
        const email = document.getElementById('new-user-email').value.trim();
        const role = document.getElementById('new-user-role').value;
        if(!name||!email){OMS.toast('Заполните все поля','error');return;}
        OMS.addUser({name,email,role});closeModal();
      ">Создать пользователя</button>
    </div>
  </div>`);
}

function showEditUserModal(userId) {
  const u = window.OMS_DATA.users.find(x => x.id === userId);
  if (!u) return;
  showModal(`
  <div class="modal">
    <div class="modal-header">
      <div><div class="modal-title">Редактирование: ${u.name}</div></div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Имя и фамилия</label>
        <input class="form-input" id="edit-user-name" value="${u.name}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="edit-user-email" value="${u.email}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Роль</label>
      <select class="form-select" id="edit-user-role">
        ${['OPERATOR','WAREHOUSE_WORKER','PACKER','MANAGER','ADMIN'].map(r =>
          `<option value="${r}" ${u.role===r?'selected':''}>${OMS.roleLabel(r)}</option>`
        ).join('')}
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="
        OMS.updateUser('${userId}',{
          name: document.getElementById('edit-user-name').value.trim(),
          email: document.getElementById('edit-user-email').value.trim(),
          role: document.getElementById('edit-user-role').value,
        });closeModal();
      ">Сохранить</button>
    </div>
  </div>`);
}

// ============================================================
// PAGE: SETTINGS (Tabbed: API-ключи | AI-агенты | Общие)
// ============================================================
function renderSettings() {
  const cfg = window.OMS_DATA.config;
  const ms = cfg.moysklad;
  const kaspi = cfg.kaspi;
  const gen = cfg.general;
  const agents = cfg.agents;
  const tab = window._settingsTab || 'api';

  return `
  ${renderHeader('Настройки', 'API-ключи, AI-агенты, системные параметры')}
  <div class="page-content">

    <div class="settings-tabs">
      <button class="settings-tab ${tab==='api'?'active':''}" onclick="window._settingsTab='api';OMS.notify()">🔌 API-ключи</button>
      <button class="settings-tab ${tab==='agents'?'active':''}" onclick="window._settingsTab='agents';OMS.notify()">🤖 AI-агенты</button>
      <button class="settings-tab ${tab==='general'?'active':''}" onclick="window._settingsTab='general';OMS.notify()">⚙ Общие</button>
    </div>

    ${tab === 'api' ? renderSettingsApiTab(ms, kaspi) : ''}
    ${tab === 'agents' ? renderSettingsAgentsTab(agents) : ''}
    ${tab === 'general' ? renderSettingsGeneralTab(gen) : ''}

  </div>`;
}

function renderSettingsApiTab(ms, kaspi) {
  return `
    <!-- МойСклад Settings -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-icon moysklad">📊</div>
        <div>
          <div class="settings-section-title">МойСклад</div>
          <div class="settings-section-sub">Учётная система. Источник остатков (master).</div>
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:10px">
          ${ms.connected ? `<span class="badge badge-success">✓ Подключён</span>` :
            ms.token ? `<span class="badge badge-danger">✕ Ошибка</span>` :
            `<span class="badge badge-muted">— Не настроен</span>`}
          ${ms.last_test ? `<span class="text-xs text-muted">Проверено: ${OMS.formatRelative(ms.last_test)}</span>` : ''}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Bearer Token *</label>
          <div class="toggle-password">
            <input type="password" class="form-input password-field" id="ms-token" value="${ms.token}" placeholder="Токен из МойСклад → Профиль → Доступ">
            <button class="toggle-password-btn" id="ms-token-eye" onclick="togglePasswordVisibility('ms-token','ms-token-eye')">${svgEye()}</button>
          </div>
          <div class="form-hint">Создайте токен в МойСклад: Профиль → Доступ → Новый токен</div>
        </div>
        <div class="form-group">
          <label class="form-label">Base URL</label>
          <input type="text" class="form-input" id="ms-url" value="${ms.base_url}" placeholder="https://api.moysklad.ru/api/remap/1.2">
          <div class="form-hint">Стандартный URL для всех тарифов МойСклад</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Интервал polling (мин)</label>
          <input type="number" class="form-input" id="ms-polling" value="${ms.polling_interval}" min="5" max="120" placeholder="30">
          <div class="form-hint">Как часто запрашивать остатки (5–120 мин)</div>
        </div>
        <div class="form-group" style="display:flex;align-items:flex-end">
          <button class="btn btn-secondary w-full" onclick="testConnectionUI('moysklad')">🔌 Проверить подключение</button>
        </div>
      </div>

      ${ms.last_test_status && ms.last_test_status !== 'SUCCESS' ? `
      <div class="alert alert-danger">
        <span class="alert-icon">✕</span>
        <div class="alert-content">
          <div class="alert-title">Ошибка подключения</div>
          <div class="alert-msg">${ms.last_test_status}</div>
        </div>
      </div>` : ''}

      <div class="modal-footer" style="padding-top:16px;margin-top:0;border-top:1px solid var(--border)">
        <div class="text-xs text-muted" style="margin-right:auto">
          Документация: <a href="https://dev.moysklad.ru/doc/api/remap/1.2/" target="_blank" style="color:var(--text-accent)">dev.moysklad.ru</a>
        </div>
        <button class="btn btn-primary" onclick="saveMoyskladSettings()">💾 Сохранить МойСклад</button>
      </div>
    </div>

    <!-- Kaspi Settings -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-icon kaspi">🛒</div>
        <div>
          <div class="settings-section-title">Kaspi Магазин</div>
          <div class="settings-section-sub">Маркетплейс. Источник заказов, витрина остатков.</div>
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:10px">
          ${kaspi.connected ? `<span class="badge badge-success">✓ Подключён</span>` :
            kaspi.api_key ? `<span class="badge badge-danger">✕ Ошибка</span>` :
            `<span class="badge badge-muted">— Не настроен</span>`}
          ${kaspi.last_test ? `<span class="text-xs text-muted">Проверено: ${OMS.formatRelative(kaspi.last_test)}</span>` : ''}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">API Key *</label>
          <div class="toggle-password">
            <input type="password" class="form-input password-field" id="kaspi-key" value="${kaspi.api_key}" placeholder="API-ключ из Kaspi Магазин → API-доступ">
            <button class="toggle-password-btn" id="kaspi-key-eye" onclick="togglePasswordVisibility('kaspi-key','kaspi-key-eye')">${svgEye()}</button>
          </div>
          <div class="form-hint">Получите ключ в Kaspi Магазин: Настройки → API-доступ → Создать ключ</div>
        </div>
        <div class="form-group">
          <label class="form-label">Merchant ID *</label>
          <input type="text" class="form-input" id="kaspi-merchant" value="${kaspi.merchant_id}" placeholder="ID магазина в Kaspi">
          <div class="form-hint">ID вашего магазина (число из URL личного кабинета)</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Base URL</label>
          <input type="text" class="form-input" id="kaspi-url" value="${kaspi.base_url}" placeholder="https://kaspi.kz/shop/api/v1">
        </div>
        <div class="form-group">
          <label class="form-label">Интервал polling заказов (мин)</label>
          <input type="number" class="form-input" id="kaspi-polling" value="${kaspi.polling_interval}" min="3" max="60" placeholder="10">
          <div class="form-hint">Как часто проверять новые заказы (3–60 мин)</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group" style="display:flex;align-items:flex-end">
          <button class="btn btn-secondary w-full" onclick="testConnectionUI('kaspi')">🔌 Проверить подключение</button>
        </div>
        <div></div>
      </div>

      ${kaspi.last_test_status && kaspi.last_test_status !== 'SUCCESS' && kaspi.last_test_status !== 'NO_CREDENTIALS' ? `
      <div class="alert alert-danger">
        <span class="alert-icon">✕</span>
        <div class="alert-content">
          <div class="alert-title">Ошибка подключения</div>
          <div class="alert-msg">${kaspi.last_test_status}</div>
        </div>
      </div>` : ''}

      <div class="modal-footer" style="padding-top:16px;margin-top:0;border-top:1px solid var(--border)">
        <div class="text-xs text-muted" style="margin-right:auto">
          Документация: <a href="https://kaspi.kz/merchantcabinet/api/" target="_blank" style="color:var(--text-accent)">kaspi.kz/merchantcabinet/api</a>
        </div>
        <button class="btn btn-primary" onclick="saveKaspiSettings()">💾 Сохранить Kaspi</button>
      </div>
    </div>

    <!-- CORS Notice -->
    <div class="settings-section" style="border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.04)">
      <div class="settings-section-header">
        <div class="settings-section-icon" style="background:rgba(245,158,11,0.15);font-size:20px">⚠️</div>
        <div>
          <div class="settings-section-title">О работе API из браузера</div>
          <div class="settings-section-sub">CORS-прокси для обхода ограничений браузера</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--text-secondary)">
        <p>Прямые запросы из браузера к <strong>МойСклад</strong> и <strong>Kaspi API</strong> блокируются политикой CORS. Для работы запустите встроенный прокси:</p>
        <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:monospace;font-size:12px;color:var(--text-accent)">
          python3 proxy.py
        </div>
        <p style="font-size:12px;color:var(--text-muted)">Прокси слушает на <code>http://localhost:8080</code> и проксирует запросы к API, добавляя нужные CORS-заголовки. Он же используется AI-агентами для запросов к Claude API.</p>
      </div>
    </div>`;
}

function renderSettingsAgentsTab(agents) {
  const hasKey = agents.claude_api_key && agents.claude_api_key.length > 10;

  return `
    <!-- Claude API global settings -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-icon agents">🤖</div>
        <div>
          <div class="settings-section-title">Claude API — глобальные настройки</div>
          <div class="settings-section-sub">Ключ используется всеми AI-агентами</div>
        </div>
        <div style="margin-left:auto">
          ${hasKey ? `<span class="badge badge-success">✓ Ключ задан</span>` : `<span class="badge badge-muted">— Ключ не задан</span>`}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Claude API Key *</label>
          <div class="toggle-password">
            <input type="password" class="form-input password-field" id="claude-api-key" value="${agents.claude_api_key}" placeholder="sk-ant-api03-...">
            <button class="toggle-password-btn" id="claude-key-eye" onclick="togglePasswordVisibility('claude-api-key','claude-key-eye')">${svgEye()}</button>
          </div>
          <div class="form-hint">Получите ключ на console.anthropic.com → API Keys</div>
        </div>
        <div class="form-group">
          <label class="form-label">CORS-прокси URL</label>
          <input type="text" class="form-input" id="agents-proxy-url" value="${agents.proxy_url}" placeholder="http://localhost:8080">
          <div class="form-hint">Запустите: <code style="color:var(--text-accent)">python3 proxy.py</code> для работы агентов</div>
        </div>
      </div>

      <div class="modal-footer" style="padding-top:16px;margin-top:0;border-top:1px solid var(--border)">
        <button class="btn btn-secondary" onclick="testAgentConnection()">🔌 Проверить соединение</button>
        <button class="btn btn-primary" onclick="saveAgentsGlobalSettings()">💾 Сохранить</button>
      </div>
    </div>

    <!-- Individual agent configs -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-icon" style="background:rgba(99,102,241,0.1);font-size:20px">⚙</div>
        <div>
          <div class="settings-section-title">Конфигурация агентов</div>
          <div class="settings-section-sub">Системный промпт и модель для каждого агента</div>
        </div>
        <div style="margin-left:auto">
          <button class="btn btn-ghost btn-sm" onclick="OMS.navigate('agents')">Перейти к агентам →</button>
        </div>
      </div>

      ${agents.items.map(agent => `
      <div class="agent-config-card">
        <div class="agent-config-header" onclick="toggleAgentConfig('${agent.id}')">
          <div class="agent-config-icon" style="background:${agent.color}">${agent.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${agent.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${agent.description}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
            <span class="agent-model-badge">${agent.model}</span>
            <span class="badge ${agent.enabled ? 'badge-success' : 'badge-muted'}">${agent.enabled ? '● Активен' : '○ Откл.'}</span>
            <span class="agent-config-chevron" id="chevron-${agent.id}">▼</span>
          </div>
        </div>
        <div class="agent-config-body" id="config-body-${agent.id}">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Модель</label>
              <select class="form-select" id="model-${agent.id}">
                <option value="claude-opus-4-6" ${agent.model==='claude-opus-4-6'?'selected':''}>claude-opus-4-6 (максимум)</option>
                <option value="claude-sonnet-4-6" ${agent.model==='claude-sonnet-4-6'?'selected':''}>claude-sonnet-4-6 (баланс)</option>
                <option value="claude-haiku-4-5-20251001" ${agent.model==='claude-haiku-4-5-20251001'?'selected':''}>claude-haiku-4-5 (быстрый)</option>
              </select>
            </div>
            <div class="form-group" style="display:flex;align-items:flex-end;gap:10px">
              <label class="form-label" style="display:flex;align-items:center;gap:8px;cursor:pointer">
                <input type="checkbox" id="enabled-${agent.id}" ${agent.enabled?'checked':''} style="accent-color:var(--accent)">
                Агент активен
              </label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Системный промпт</label>
            <textarea class="form-input" id="prompt-${agent.id}" rows="8" style="font-family:monospace;font-size:12px;resize:vertical">${agent.system_prompt}</textarea>
            <div class="form-hint">Определяет поведение агента. Изменяйте под ваши нужды.</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button class="btn btn-primary btn-sm" onclick="saveAgentItemSettings('${agent.id}')">💾 Сохранить агента</button>
            <button class="btn btn-ghost btn-sm" onclick="OMS.navigate('agent_run',{agentId:'${agent.id}'})">▶ Запустить</button>
          </div>
        </div>
      </div>`).join('')}
    </div>`;
}

function renderSettingsGeneralTab(gen) {
  return `
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-icon general">${svgSettings()}</div>
        <div>
          <div class="settings-section-title">Системные параметры OMS</div>
          <div class="settings-section-sub">Retry, reconciliation, временная зона</div>
        </div>
      </div>

      <div class="form-row-3">
        <div class="form-group">
          <label class="form-label">Макс. попыток retry</label>
          <input type="number" class="form-input" id="gen-retry" value="${gen.max_retry_attempts}" min="1" max="10">
          <div class="form-hint">Экспоненц. backoff: 1s → 5s → 30s → 5min</div>
        </div>
        <div class="form-group">
          <label class="form-label">Reconciliation (мин)</label>
          <input type="number" class="form-input" id="gen-reconcile" value="${gen.reconciliation_interval}" min="60">
          <div class="form-hint">Интервал сверки OMS vs МойСклад</div>
        </div>
        <div class="form-group">
          <label class="form-label">Временная зона</label>
          <select class="form-select" id="gen-tz">
            <option value="Asia/Almaty" ${gen.timezone==='Asia/Almaty'?'selected':''}>Asia/Almaty (UTC+5)</option>
            <option value="Asia/Astana" ${gen.timezone==='Asia/Astana'?'selected':''}>Asia/Astana (UTC+5)</option>
            <option value="UTC" ${gen.timezone==='UTC'?'selected':''}>UTC</option>
          </select>
        </div>
      </div>

      <div class="modal-footer" style="padding-top:16px;margin-top:0;border-top:1px solid var(--border)">
        <button class="btn btn-danger btn-sm" onclick="if(confirm('Сбросить все данные и настройки?')){localStorage.removeItem('oms_data');location.reload();}">🗑 Сброс данных</button>
        <button class="btn btn-primary" onclick="saveGeneralSettings()">💾 Сохранить</button>
      </div>
    </div>`;
}

function saveMoyskladSettings() {
  OMS.saveConfig('moysklad', {
    token: document.getElementById('ms-token').value.trim(),
    base_url: document.getElementById('ms-url').value.trim(),
    polling_interval: parseInt(document.getElementById('ms-polling').value) || 30,
  });
}

function saveKaspiSettings() {
  OMS.saveConfig('kaspi', {
    api_key: document.getElementById('kaspi-key').value.trim(),
    merchant_id: document.getElementById('kaspi-merchant').value.trim(),
    base_url: document.getElementById('kaspi-url').value.trim(),
    polling_interval: parseInt(document.getElementById('kaspi-polling').value) || 10,
  });
}

function saveGeneralSettings() {
  OMS.saveConfig('general', {
    max_retry_attempts: parseInt(document.getElementById('gen-retry').value) || 5,
    reconciliation_interval: parseInt(document.getElementById('gen-reconcile').value) || 720,
    timezone: document.getElementById('gen-tz').value,
  });
}

async function testConnectionUI(system) {
  OMS.toast(`Проверяем подключение к ${system === 'moysklad' ? 'МойСклад' : 'Kaspi'}...`, 'info', 2000);

  // Save current values first
  if (system === 'moysklad') {
    saveMoyskladSettings();
    const ok = await MoyskladAdapter.testConnection();
    OMS.notify();
    OMS.toast(ok ? '✓ МойСклад: подключение успешно!' : '✕ МойСклад: ошибка подключения. Проверьте токен и CORS.', ok ? 'success' : 'error', 5000);
  } else {
    saveKaspiSettings();
    const ok = await KaspiAdapter.testConnection();
    OMS.notify();
    OMS.toast(ok ? '✓ Kaspi: подключение успешно!' : '✕ Kaspi: ошибка подключения. Проверьте API Key и Merchant ID.', ok ? 'success' : 'error', 5000);
  }
}

async function testConnection(system) {
  await testConnectionUI(system);
}

// ---- Agent settings helpers ----

function toggleAgentConfig(agentId) {
  const body = document.getElementById('config-body-' + agentId);
  const chevron = document.getElementById('chevron-' + agentId);
  if (!body) return;
  const open = body.classList.toggle('open');
  if (chevron) chevron.classList.toggle('open', open);
}

function saveAgentsGlobalSettings() {
  OMS.saveAgentsGlobal({
    claude_api_key: document.getElementById('claude-api-key').value.trim(),
    proxy_url: document.getElementById('agents-proxy-url').value.trim() || 'http://localhost:8080',
  });
}

function saveAgentItemSettings(agentId) {
  const model = document.getElementById('model-' + agentId);
  const prompt = document.getElementById('prompt-' + agentId);
  const enabled = document.getElementById('enabled-' + agentId);
  if (!model || !prompt) return;
  OMS.saveAgentItem(agentId, {
    model: model.value,
    system_prompt: prompt.value,
    enabled: enabled ? enabled.checked : true,
  });
}

async function testAgentConnection() {
  const key = document.getElementById('claude-api-key').value.trim();
  const proxyUrl = (document.getElementById('agents-proxy-url').value.trim() || 'http://localhost:8080').replace(/\/$/, '');
  if (!key) { OMS.toast('Введите Claude API Key', 'warning'); return; }

  OMS.toast('Проверяем соединение с Claude API...', 'info', 2500);
  try {
    const resp = await fetch(`${proxyUrl}/?url=https://api.anthropic.com/v1/models`, {
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    });
    if (resp.ok) {
      OMS.toast('✓ Claude API доступен, ключ действителен', 'success', 4000);
    } else {
      const txt = await resp.text();
      OMS.toast(`✕ Ответ ${resp.status}: ${txt.slice(0, 80)}`, 'error', 5000);
    }
  } catch (e) {
    OMS.toast('Нет подключения к прокси. Запустите: python3 proxy.py', 'error', 6000);
  }
}

// ============================================================
// PAGE: AI AGENTS — overview
// ============================================================
function renderAgents() {
  const agents = window.OMS_DATA.config.agents;
  const hasKey = agents.claude_api_key && agents.claude_api_key.length > 10;

  return `
  ${renderHeader('AI-агенты', 'Код-ревью, тестирование и рефакторинг с Claude')}
  <div class="page-content">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-title">AI-ассистенты</div>
        <div class="page-subtitle">Три специализированных агента на базе Claude</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" onclick="window._settingsTab='agents';OMS.navigate('settings')">⚙ Настройки агентов</button>
      </div>
    </div>

    ${!hasKey ? `
    <div class="alert alert-warning mb-16">
      <span class="alert-icon">🔑</span>
      <div class="alert-content">
        <div class="alert-title">Claude API Key не задан</div>
        <div class="alert-msg">Перейдите в Настройки → AI-агенты и укажите ключ. Также запустите <code>python3 proxy.py</code>.</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="window._settingsTab='agents';OMS.navigate('settings')">Настроить →</button>
    </div>` : ''}

    <div class="agents-grid">
      ${agents.items.map(agent => {
        const runs = (window._agentRuns && window._agentRuns[agent.id]) || [];
        const lastRun = runs[0];
        return `
        <div class="agent-card ${!agent.enabled || !hasKey ? 'disabled' : ''}" onclick="${agent.enabled && hasKey ? `OMS.navigate('agent_run',{agentId:'${agent.id}'})` : 'OMS.toast(\"Активируйте агента и задайте API Key\",\"warning\")'}">
          <div class="agent-card-icon" style="background:${agent.color}">${agent.icon}</div>
          <div class="agent-card-type" style="color:${agent.accent}">${agent.type}</div>
          <div class="agent-card-name">${agent.name}</div>
          <div class="agent-card-desc">${agent.description}</div>
          <div class="agent-card-footer">
            <span class="agent-model-badge">${agent.model.replace('claude-','').replace('-20251001','')}</span>
            <div style="display:flex;align-items:center;gap:8px">
              ${lastRun ? `<span class="text-xs text-muted">${runs.length} запусков</span>` : ''}
              ${agent.enabled && hasKey
                ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();OMS.navigate('agent_run',{agentId:'${agent.id}'})">▶ Запустить</button>`
                : `<span class="badge badge-muted">Не активен</span>`}
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Recent runs across all agents -->
    ${(() => {
      const allRuns = agents.items.flatMap(a =>
        ((window._agentRuns && window._agentRuns[a.id]) || []).map(r => ({ ...r, agentName: a.name, agentIcon: a.icon, agentAccent: a.accent }))
      ).sort((x, y) => new Date(y.created_at) - new Date(x.created_at)).slice(0, 5);

      if (!allRuns.length) return `
      <div class="card" style="text-align:center;padding:40px">
        <div style="font-size:36px;margin-bottom:12px">🤖</div>
        <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:6px">Ни одного запуска пока</div>
        <div style="font-size:13px;color:var(--text-muted)">Выберите агента выше и отправьте ему код</div>
      </div>`;

      return `
      <div class="card">
        <div class="card-header">
          <div><div class="card-title">Последние запуски</div><div class="card-sub">${allRuns.length} последних</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${allRuns.map(r => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg-secondary);border-radius:var(--radius-sm);cursor:pointer;border:1px solid var(--border)" onclick="OMS.navigate('agent_run',{agentId:'${r.agent_id}'})">
            <div style="font-size:20px">${r.agentIcon}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${r.agentName}</div>
              <div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.input.slice(0, 60)}…</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
              <span class="badge ${r.status==='SUCCESS'?'badge-success':r.status==='FAILED'?'badge-danger':'badge-accent'}">${r.status==='SUCCESS'?'✓ OK':r.status==='FAILED'?'✕ Ошибка':'...'}</span>
              <span class="text-xs text-muted">${OMS.formatRelative(r.created_at)}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>`;
    })()}
  </div>`;
}

// ============================================================
// PAGE: AGENT RUN — chat-like run interface
// ============================================================
function renderAgentRun(params = {}) {
  const agents = window.OMS_DATA.config.agents;
  const agent = agents.items.find(a => a.id === params.agentId);
  if (!agent) return `<div class="page-content"><div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Агент не найден</div></div></div>`;

  const runs = (window._agentRuns && window._agentRuns[agent.id]) || [];
  const activeRun = runs.find(r => r.status === 'IN_PROGRESS');

  return `
  ${renderHeader(`${agent.icon} ${agent.name}`, agent.description)}
  <div class="page-content" style="display:flex;flex-direction:column;gap:20px">
    <div class="page-header">
      <div class="page-title-group">
        <button class="btn btn-ghost btn-sm" onclick="OMS.navigate('agents')" style="margin-bottom:8px">← Все агенты</button>
        <div class="page-title" style="display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">${agent.icon}</span> ${agent.name}
        </div>
        <div class="page-subtitle">${agent.description}</div>
      </div>
      <div class="page-actions" style="align-items:flex-start">
        <span class="agent-model-badge" style="padding:6px 12px;font-size:12px">${agent.model}</span>
        <button class="btn btn-ghost btn-sm" onclick="window._settingsTab='agents';OMS.navigate('settings')">⚙ Настройки</button>
      </div>
    </div>

    <div class="agent-run-layout">
      <!-- INPUT PANEL -->
      <div class="agent-panel">
        <div class="agent-panel-header">
          <span class="agent-panel-title">Входной код</span>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm" onclick="document.getElementById('agent-code-input').value='';document.getElementById('agent-instruction').value=''">Очистить</button>
            <button class="btn btn-ghost btn-sm" onclick="insertSampleCode('${agent.type}')">Пример</button>
          </div>
        </div>
        <textarea
          class="agent-code-input"
          id="agent-code-input"
          placeholder="// Вставьте код для анализа...&#10;&#10;function example() {&#10;  // ваш код здесь&#10;}"
          spellcheck="false"
        >${window._agentCodeDraft && window._agentCodeDraft[agent.id] ? window._agentCodeDraft[agent.id] : ''}</textarea>
        <div class="agent-toolbar">
          ${agent.type === 'REWRITE' || agent.type === 'REVIEW' ? `
          <input
            class="agent-instruction-input"
            id="agent-instruction"
            type="text"
            placeholder="${agent.type === 'REWRITE' ? 'Инструкция (необяз.): сделай функциональным стилем, добавь типы...' : 'Фокус (необяз.): обрати внимание на безопасность...'}"
            value="${window._agentInstructionDraft && window._agentInstructionDraft[agent.id] ? window._agentInstructionDraft[agent.id] : ''}"
          >` : `<div style="flex:1"></div>`}
          <button
            class="btn btn-primary"
            id="agent-run-btn"
            onclick="triggerAgentRun('${agent.id}')"
            ${activeRun ? 'disabled' : ''}
          >
            ${activeRun ? `<span class="thinking-dots"><span></span><span></span><span></span></span> Думает...` : `▶ Запустить`}
          </button>
        </div>
      </div>

      <!-- OUTPUT PANEL -->
      <div class="agent-panel">
        <div class="agent-panel-header">
          <span class="agent-panel-title">Ответ агента</span>
          <div style="display:flex;gap:6px">
            ${runs.length > 0 ? `<span class="text-xs text-muted">${runs.length} запусков</span>` : ''}
            ${runs.length > 0 && !activeRun ? `<button class="btn btn-ghost btn-sm" onclick="copyLastOutput('${agent.id}')">Копировать</button>` : ''}
          </div>
        </div>
        <div class="agent-output-area" id="agent-output-area">
          ${runs.length === 0 ? `
          <div class="agent-output-empty">
            <div style="font-size:40px">${agent.icon}</div>
            <div style="font-size:14px;font-weight:600;color:var(--text-secondary)">Жду код</div>
            <div>Вставьте код слева и нажмите <strong>▶ Запустить</strong></div>
          </div>
          ` : runs.map(run => renderRunBlock(run, agent)).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function renderRunBlock(run, agent) {
  const statusIcon = run.status === 'SUCCESS' ? '✓' : run.status === 'FAILED' ? '✕' : '';
  const durationStr = run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}с` : '';

  return `
  <div class="agent-run-block">
    <div class="agent-run-meta">
      <span style="color:${run.status === 'SUCCESS' ? 'var(--success)' : run.status === 'FAILED' ? 'var(--danger)' : 'var(--accent)'}">${statusIcon} ${run.status}</span>
      <span>${OMS.formatRelative(run.created_at)}</span>
      ${durationStr ? `<span>${durationStr}</span>` : ''}
      ${run.instruction ? `<span style="color:var(--text-muted)">Инструкция: ${run.instruction.slice(0, 40)}${run.instruction.length > 40 ? '…' : ''}</span>` : ''}
    </div>
    <div class="agent-run-content">
      ${run.status === 'IN_PROGRESS' ? `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 0;color:var(--text-muted)">
          <span class="thinking-dots"><span></span><span></span><span></span></span>
          <span>Агент анализирует код…</span>
        </div>
      ` : run.status === 'FAILED' ? `
        <div style="color:var(--danger)">
          <div style="font-weight:600;margin-bottom:6px">Ошибка выполнения</div>
          <div style="font-size:12px;font-family:monospace;background:var(--bg-secondary);padding:10px;border-radius:6px;border:1px solid rgba(239,68,68,0.2)">${run.error || 'Неизвестная ошибка'}</div>
        </div>
      ` : renderMarkdown(run.output || '')}
    </div>
  </div>`;
}

function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(?!<[hupbl]|<\/[hupbl])(.+)$/gm, m => m.trim() ? m : '')
    .replace(/^(?!<)(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[hupbl])/g, '$1')
    .replace(/(<\/[hupbl][^>]*>)<\/p>/g, '$1');
}

async function triggerAgentRun(agentId) {
  const codeEl = document.getElementById('agent-code-input');
  const instrEl = document.getElementById('agent-instruction');
  if (!codeEl) return;

  const code = codeEl.value;
  const instruction = instrEl ? instrEl.value : '';

  // Save drafts
  if (!window._agentCodeDraft) window._agentCodeDraft = {};
  if (!window._agentInstructionDraft) window._agentInstructionDraft = {};
  window._agentCodeDraft[agentId] = code;
  window._agentInstructionDraft[agentId] = instruction;

  await OMS.runAgent(agentId, code, instruction);
}

function copyLastOutput(agentId) {
  const runs = (window._agentRuns && window._agentRuns[agentId]) || [];
  const lastSuccess = runs.find(r => r.status === 'SUCCESS');
  if (!lastSuccess || !lastSuccess.output) { OMS.toast('Нет результата для копирования', 'warning'); return; }
  navigator.clipboard.writeText(lastSuccess.output)
    .then(() => OMS.toast('Ответ скопирован', 'success'))
    .catch(() => OMS.toast('Не удалось скопировать', 'error'));
}

function insertSampleCode(agentType) {
  const el = document.getElementById('agent-code-input');
  if (!el) return;
  const samples = {
    REVIEW: `function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  const result = db.query(query);

  if (result) {
    localStorage.setItem('user', JSON.stringify(result));
    document.getElementById('output').innerHTML = result.html_content;
    return result;
  }
}`,
    TESTING: `function calculateDiscount(price, discountPercent) {
  if (discountPercent > 100) discountPercent = 100;
  const discount = price * (discountPercent / 100);
  return price - discount;
}

function applyPromoCode(cart, promoCode) {
  const codes = { 'SAVE10': 10, 'SAVE20': 20 };
  if (codes[promoCode]) {
    cart.total = calculateDiscount(cart.total, codes[promoCode]);
    cart.promoApplied = promoCode;
  }
  return cart;
}`,
    REWRITE: `function p(d) {
  var r = [];
  for (var i = 0; i < d.length; i++) {
    if (d[i].a == true) {
      r.push({ n: d[i].n, e: d[i].e, t: new Date(d[i].t).toISOString() });
    }
  }
  return r;
}`,
  };
  el.value = samples[agentType] || samples.REVIEW;
}
