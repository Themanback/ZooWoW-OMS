// ============================================================
// OMS System — Demo Data & Initial State
// ============================================================

const DEMO_USERS = [
  { id: 'u1', name: 'Алексей Иванов', email: 'admin@oms.kz', role: 'ADMIN', is_active: true, created_at: '2025-01-01T08:00:00Z' },
  { id: 'u2', name: 'Дина Сейткали', email: 'operator@oms.kz', role: 'OPERATOR', is_active: true, created_at: '2025-01-05T08:00:00Z' },
  { id: 'u3', name: 'Марат Жумабеков', email: 'warehouse@oms.kz', role: 'WAREHOUSE_WORKER', is_active: true, created_at: '2025-01-10T08:00:00Z' },
  { id: 'u4', name: 'Айгуль Бекова', email: 'packer@oms.kz', role: 'PACKER', is_active: true, created_at: '2025-01-12T08:00:00Z' },
  { id: 'u5', name: 'Серик Нурланов', email: 'manager@oms.kz', role: 'MANAGER', is_active: true, created_at: '2025-01-15T08:00:00Z' },
];

const DEMO_PRODUCTS = [
  { id: 'p1', moysklad_id: 'ms-001', code: 'RC-CAT-2KG', article: 'RC-CAT-2KG', kaspi_sku: 'KSP-CAT-001', barcode: '4870016102345', name: 'Корм Royal Canin для кошек 2кг', is_active: true, sync_disabled: false, needs_mapping: false, mapping_type: 'AUTO_SKU', last_sync_failed: false },
  { id: 'p2', moysklad_id: 'ms-002', code: 'PED-DOG-3KG', article: 'PED-DOG-3KG', kaspi_sku: 'KSP-DOG-002', barcode: '4870016102346', name: 'Корм Pedigree для собак 3кг', is_active: true, sync_disabled: false, needs_mapping: false, mapping_type: 'AUTO_BARCODE', last_sync_failed: false },
  { id: 'p3', moysklad_id: 'ms-003', code: 'LEAD-NYL-15', article: 'LEAD-NYL-15', kaspi_sku: 'KSP-ACC-003', barcode: '4870016102347', name: 'Поводок нейлоновый 1.5м', is_active: true, sync_disabled: false, needs_mapping: false, mapping_type: 'MANUAL', last_sync_failed: false },
  { id: 'p4', moysklad_id: 'ms-004', code: 'BOWL-CER-CAT', article: 'BOWL-CER-CAT', kaspi_sku: '', barcode: '4870016102348', name: 'Миска керамическая для кошек', is_active: true, sync_disabled: false, needs_mapping: true, mapping_type: null, last_sync_failed: false },
  { id: 'p5', moysklad_id: 'ms-005', code: 'TOY-MOUSE-CAT', article: 'TOY-MOUSE-CAT', kaspi_sku: 'KSP-TOY-005', barcode: '4870016102349', name: 'Игрушка мышь для кошек', is_active: true, sync_disabled: false, needs_mapping: false, mapping_type: 'AUTO_SKU', last_sync_failed: true },
  { id: 'p6', moysklad_id: 'ms-006', code: 'BED-DOG-6080', article: 'BED-DOG-6080', kaspi_sku: 'KSP-BED-006', barcode: '4870016102350', name: 'Лежак для собак 60x80', is_active: true, sync_disabled: true, needs_mapping: false, mapping_type: 'MANUAL', last_sync_failed: false },
  { id: 'p7', moysklad_id: 'ms-007', code: '', article: '', kaspi_sku: '', barcode: '', name: 'Витамины для кошек Beaphar', is_active: true, sync_disabled: false, needs_mapping: true, mapping_type: null, last_sync_failed: false },
  { id: 'p8', moysklad_id: 'ms-008', code: 'SHMP-DOG-250', article: 'SHMP-DOG-250', kaspi_sku: 'KSP-SHA-008', barcode: '4870016102352', name: 'Шампунь для собак 250мл', is_active: true, sync_disabled: false, needs_mapping: false, mapping_type: 'AUTO_SKU', last_sync_failed: false },
];

const DEMO_STOCKS = [
  { product_id: 'p1', total_qty: 45, reserved_qty: 5, available_qty: 40, last_synced_at: new Date(Date.now() - 18*60000).toISOString() },
  { product_id: 'p2', total_qty: 32, reserved_qty: 8, available_qty: 24, last_synced_at: new Date(Date.now() - 18*60000).toISOString() },
  { product_id: 'p3', total_qty: 120, reserved_qty: 2, available_qty: 118, last_synced_at: new Date(Date.now() - 18*60000).toISOString() },
  { product_id: 'p4', total_qty: 15, reserved_qty: 0, available_qty: 15, last_synced_at: new Date(Date.now() - 18*60000).toISOString() },
  { product_id: 'p5', total_qty: 0, reserved_qty: 0, available_qty: 0, last_synced_at: new Date(Date.now() - 45*60000).toISOString() },
  { product_id: 'p6', total_qty: 8, reserved_qty: 1, available_qty: 7, last_synced_at: new Date(Date.now() - 18*60000).toISOString() },
  { product_id: 'p7', total_qty: 60, reserved_qty: 0, available_qty: 60, last_synced_at: new Date(Date.now() - 18*60000).toISOString() },
  { product_id: 'p8', total_qty: 24, reserved_qty: 3, available_qty: 21, last_synced_at: new Date(Date.now() - 18*60000).toISOString() },
];

const DEMO_ORDERS = [
  {
    id: 'ord-001', kaspi_order_id: 'KSP-20250411-001',
    status: 'NEW',
    customer_name: 'Айдар Сейтов', customer_phone: '+7 701 234 5678',
    delivery_address: 'г. Алматы, ул. Абая 150, кв. 45',
    total_amount: 12500,
    created_at: new Date(Date.now() - 2*3600000).toISOString(),
    updated_at: new Date(Date.now() - 2*3600000).toISOString(),
    assigned_to: null,
    has_issue: false,
    items: [
      { id: 'oi-001', product_id: 'p1', kaspi_sku: 'KSP-CAT-001', name: 'Корм Royal Canin для кошек 2кг', quantity: 2, unit_price: 4500, is_available: null },
      { id: 'oi-002', product_id: 'p3', kaspi_sku: 'KSP-ACC-003', name: 'Поводок нейлоновый 1.5м', quantity: 1, unit_price: 3500, is_available: null },
    ],
    status_history: [
      { from_status: null, to_status: 'NEW', changed_by: 'SYSTEM', changed_at: new Date(Date.now() - 2*3600000).toISOString(), comment: 'Заказ получен из Kaspi' }
    ]
  },
  {
    id: 'ord-002', kaspi_order_id: 'KSP-20250411-002',
    status: 'ACCEPTED',
    customer_name: 'Зарина Мусина', customer_phone: '+7 702 345 6789',
    delivery_address: 'г. Алматы, ул. Сатпаева 22',
    total_amount: 8200,
    created_at: new Date(Date.now() - 5*3600000).toISOString(),
    updated_at: new Date(Date.now() - 4*3600000).toISOString(),
    assigned_to: 'u2',
    has_issue: false,
    items: [
      { id: 'oi-003', product_id: 'p2', kaspi_sku: 'KSP-DOG-002', name: 'Корм Pedigree для собак 3кг', quantity: 1, unit_price: 5200, is_available: null },
      { id: 'oi-004', product_id: 'p8', kaspi_sku: 'KSP-SHA-008', name: 'Шампунь для собак 250мл', quantity: 3, unit_price: 1000, is_available: null },
    ],
    status_history: [
      { from_status: null, to_status: 'NEW', changed_by: 'SYSTEM', changed_at: new Date(Date.now() - 5*3600000).toISOString(), comment: 'Заказ получен из Kaspi' },
      { from_status: 'NEW', to_status: 'ACCEPTED', changed_by: 'u2', changed_at: new Date(Date.now() - 4*3600000).toISOString(), comment: 'Принято в обработку' }
    ]
  },
  {
    id: 'ord-003', kaspi_order_id: 'KSP-20250411-003',
    status: 'PICKING',
    customer_name: 'Руслан Ахметов', customer_phone: '+7 707 456 7890',
    delivery_address: 'г. Алматы, пр. Назарбаева 78',
    total_amount: 6800,
    created_at: new Date(Date.now() - 7*3600000).toISOString(),
    updated_at: new Date(Date.now() - 1*3600000).toISOString(),
    assigned_to: 'u3',
    has_issue: true,
    issue_description: 'stock_issue',
    items: [
      { id: 'oi-005', product_id: 'p3', kaspi_sku: 'KSP-ACC-003', name: 'Поводок нейлоновый 1.5м', quantity: 2, unit_price: 3400, is_available: true },
    ],
    status_history: [
      { from_status: null, to_status: 'NEW', changed_by: 'SYSTEM', changed_at: new Date(Date.now() - 7*3600000).toISOString(), comment: 'Заказ получен из Kaspi' },
      { from_status: 'NEW', to_status: 'ACCEPTED', changed_by: 'u2', changed_at: new Date(Date.now() - 6*3600000).toISOString(), comment: '' },
      { from_status: 'ACCEPTED', to_status: 'PICKING', changed_by: 'u3', changed_at: new Date(Date.now() - 1*3600000).toISOString(), comment: 'Взят в сборку' }
    ]
  },
  {
    id: 'ord-004', kaspi_order_id: 'KSP-20250410-015',
    status: 'PACKED',
    customer_name: 'Ботагоз Оспанова', customer_phone: '+7 708 567 8901',
    delivery_address: 'г. Алматы, ул. Жандосова 55',
    total_amount: 15300,
    created_at: new Date(Date.now() - 24*3600000).toISOString(),
    updated_at: new Date(Date.now() - 3*3600000).toISOString(),
    assigned_to: 'u4',
    has_issue: false,
    items: [
      { id: 'oi-006', product_id: 'p1', kaspi_sku: 'KSP-CAT-001', name: 'Корм Royal Canin для кошек 2кг', quantity: 2, unit_price: 4500, is_available: true },
      { id: 'oi-007', product_id: 'p6', kaspi_sku: 'KSP-BED-006', name: 'Лежак для собак 60x80', quantity: 1, unit_price: 6300, is_available: true },
    ],
    status_history: [
      { from_status: null, to_status: 'NEW', changed_by: 'SYSTEM', changed_at: new Date(Date.now() - 24*3600000).toISOString(), comment: '' },
      { from_status: 'NEW', to_status: 'ACCEPTED', changed_by: 'u2', changed_at: new Date(Date.now() - 23*3600000).toISOString(), comment: '' },
      { from_status: 'ACCEPTED', to_status: 'PICKING', changed_by: 'u3', changed_at: new Date(Date.now() - 10*3600000).toISOString(), comment: '' },
      { from_status: 'PICKING', to_status: 'PICKED', changed_by: 'u3', changed_at: new Date(Date.now() - 8*3600000).toISOString(), comment: 'Сборка завершена' },
      { from_status: 'PICKED', to_status: 'PACKED', changed_by: 'u4', changed_at: new Date(Date.now() - 3*3600000).toISOString(), comment: 'Упакован' }
    ]
  },
  {
    id: 'ord-005', kaspi_order_id: 'KSP-20250410-009',
    status: 'DELIVERED',
    customer_name: 'Тимур Касымов', customer_phone: '+7 701 111 2222',
    delivery_address: 'г. Алматы, ул. Алтынсарина 33',
    total_amount: 9800,
    created_at: new Date(Date.now() - 48*3600000).toISOString(),
    updated_at: new Date(Date.now() - 12*3600000).toISOString(),
    assigned_to: 'u2',
    has_issue: false,
    items: [
      { id: 'oi-008', product_id: 'p2', kaspi_sku: 'KSP-DOG-002', name: 'Корм Pedigree для собак 3кг', quantity: 1, unit_price: 5200, is_available: true },
      { id: 'oi-009', product_id: 'p8', kaspi_sku: 'KSP-SHA-008', name: 'Шампунь для собак 250мл', quantity: 2, unit_price: 1000, is_available: true },
      { id: 'oi-010', product_id: 'p3', kaspi_sku: 'KSP-ACC-003', name: 'Поводок нейлоновый 1.5м', quantity: 1, unit_price: 3600, is_available: true },
    ],
    status_history: [
      { from_status: null, to_status: 'NEW', changed_by: 'SYSTEM', changed_at: new Date(Date.now() - 48*3600000).toISOString(), comment: '' },
      { from_status: 'NEW', to_status: 'ACCEPTED', changed_by: 'u2', changed_at: new Date(Date.now() - 47*3600000).toISOString(), comment: '' },
      { from_status: 'ACCEPTED', to_status: 'PICKING', changed_by: 'u3', changed_at: new Date(Date.now() - 24*3600000).toISOString(), comment: '' },
      { from_status: 'PICKING', to_status: 'PICKED', changed_by: 'u3', changed_at: new Date(Date.now() - 22*3600000).toISOString(), comment: '' },
      { from_status: 'PICKED', to_status: 'PACKED', changed_by: 'u4', changed_at: new Date(Date.now() - 18*3600000).toISOString(), comment: '' },
      { from_status: 'PACKED', to_status: 'READY', changed_by: 'u2', changed_at: new Date(Date.now() - 16*3600000).toISOString(), comment: '' },
      { from_status: 'READY', to_status: 'DELIVERED', changed_by: 'u2', changed_at: new Date(Date.now() - 12*3600000).toISOString(), comment: 'Передан курьеру Kaspi' }
    ]
  },
  {
    id: 'ord-006', kaspi_order_id: 'KSP-20250411-005',
    status: 'CANCELLED',
    customer_name: 'Асель Жакупова', customer_phone: '+7 776 333 4444',
    delivery_address: 'г. Алматы, ул. Байзакова 280',
    total_amount: 4500,
    created_at: new Date(Date.now() - 4*3600000).toISOString(),
    updated_at: new Date(Date.now() - 1*3600000).toISOString(),
    assigned_to: null,
    has_issue: false,
    items: [
      { id: 'oi-011', product_id: 'p1', kaspi_sku: 'KSP-CAT-001', name: 'Корм Royal Canin для кошек 2кг', quantity: 1, unit_price: 4500, is_available: null },
    ],
    status_history: [
      { from_status: null, to_status: 'NEW', changed_by: 'SYSTEM', changed_at: new Date(Date.now() - 4*3600000).toISOString(), comment: '' },
      { from_status: 'NEW', to_status: 'CANCELLED', changed_by: 'SYSTEM', changed_at: new Date(Date.now() - 1*3600000).toISOString(), comment: 'Отменён клиентом через Kaspi' }
    ]
  },
];

const DEMO_SYNC_TASKS = [
  { id: 'st-001', sync_type: 'FULL', direction: 'MS_TO_OMS', status: 'SUCCESS', started_at: new Date(Date.now() - 18*60000).toISOString(), finished_at: new Date(Date.now() - 17*60000).toISOString(), items_processed: 8, items_failed: 0, triggered_by: 'SCHEDULER' },
  { id: 'st-002', sync_type: 'FULL', direction: 'OMS_TO_KASPI', status: 'SUCCESS', started_at: new Date(Date.now() - 17*60000).toISOString(), finished_at: new Date(Date.now() - 16*60000 - 30000).toISOString(), items_processed: 6, items_failed: 1, triggered_by: 'SCHEDULER' },
  { id: 'st-003', sync_type: 'INCREMENTAL', direction: 'MS_TO_OMS', status: 'SUCCESS', started_at: new Date(Date.now() - 38*60000).toISOString(), finished_at: new Date(Date.now() - 37*60000 - 45000).toISOString(), items_processed: 3, items_failed: 0, triggered_by: 'SCHEDULER' },
  { id: 'st-004', sync_type: 'FULL', direction: 'MS_TO_OMS', status: 'FAILED', started_at: new Date(Date.now() - 60*60000).toISOString(), finished_at: new Date(Date.now() - 59*60000 - 30000).toISOString(), items_processed: 0, items_failed: 1, triggered_by: 'SCHEDULER' },
  { id: 'st-005', sync_type: 'FULL', direction: 'MS_TO_OMS', status: 'SUCCESS', started_at: new Date(Date.now() - 90*60000).toISOString(), finished_at: new Date(Date.now() - 89*60000).toISOString(), items_processed: 8, items_failed: 0, triggered_by: 'u1' },
];

const DEMO_SYNC_ERRORS = [
  { id: 'se-001', sync_task_id: 'st-002', error_type: 'MAPPING_ERROR', entity_type: 'PRODUCT', entity_id: 'p4', message: 'Товар "Миска керамическая для кошек" не имеет kaspi_sku. Синхронизация пропущена.', resolved: false, created_at: new Date(Date.now() - 17*60000).toISOString() },
  { id: 'se-002', sync_task_id: 'st-002', error_type: 'MAPPING_ERROR', entity_type: 'PRODUCT', entity_id: 'p7', message: 'Товар "Витамины для кошек Beaphar" — нет совпадения ни по артикулу, ни по штрихкоду.', resolved: false, created_at: new Date(Date.now() - 17*60000).toISOString() },
  { id: 'se-003', sync_task_id: 'st-004', error_type: 'API_ERROR', entity_type: 'PRODUCT', entity_id: null, message: 'МойСклад API вернул 503 Service Unavailable. Retry исчерпан (5/5 попыток).', resolved: true, resolved_at: new Date(Date.now() - 58*60000).toISOString(), resolved_by: 'u1', created_at: new Date(Date.now() - 60*60000).toISOString() },
  { id: 'se-004', sync_task_id: 'st-002', error_type: 'API_ERROR', entity_type: 'PRODUCT', entity_id: 'p5', message: 'Kaspi вернул ошибку при обновлении остатка для KSP-TOY-005: Invalid SKU format.', resolved: false, created_at: new Date(Date.now() - 17*60000).toISOString() },
];

const DEMO_INTEGRATION_EVENTS = [
  { id: 'ie-001', direction: 'OUTBOUND', system: 'MOYSKLAD', event_type: 'GET_PRODUCTS', status: 'SUCCESS', attempt_count: 1, created_at: new Date(Date.now() - 18*60000).toISOString(), error_message: null },
  { id: 'ie-002', direction: 'OUTBOUND', system: 'MOYSKLAD', event_type: 'GET_STOCKS', status: 'SUCCESS', attempt_count: 1, created_at: new Date(Date.now() - 18*60000).toISOString(), error_message: null },
  { id: 'ie-003', direction: 'OUTBOUND', system: 'KASPI', event_type: 'UPDATE_STOCKS', status: 'SUCCESS', attempt_count: 1, created_at: new Date(Date.now() - 17*60000).toISOString(), error_message: null },
  { id: 'ie-004', direction: 'INBOUND', system: 'KASPI', event_type: 'GET_ORDERS', status: 'SUCCESS', attempt_count: 1, created_at: new Date(Date.now() - 10*60000).toISOString(), error_message: null },
  { id: 'ie-005', direction: 'OUTBOUND', system: 'MOYSKLAD', event_type: 'GET_STOCKS', status: 'FAILED', attempt_count: 5, created_at: new Date(Date.now() - 60*60000).toISOString(), error_message: '503 Service Unavailable после 5 попыток' },
  { id: 'ie-006', direction: 'OUTBOUND', system: 'KASPI', event_type: 'UPDATE_STOCK_SKU', status: 'FAILED', attempt_count: 3, created_at: new Date(Date.now() - 17*60000).toISOString(), error_message: 'Invalid SKU format для KSP-TOY-005' },
];

const DEMO_AUDIT_LOG = [
  { id: 'al-001', user_id: 'u1', action: 'MAPPING_MANUAL', entity_type: 'PRODUCT', entity_id: 'p3', old_value: null, new_value: { kaspi_sku: 'KSP-ACC-003' }, created_at: new Date(Date.now() - 3*24*3600000).toISOString() },
  { id: 'al-002', user_id: 'u2', action: 'ORDER_STATUS_CHANGE', entity_type: 'ORDER', entity_id: 'ord-002', old_value: { status: 'NEW' }, new_value: { status: 'ACCEPTED' }, created_at: new Date(Date.now() - 4*3600000).toISOString() },
  { id: 'al-003', user_id: 'u3', action: 'ORDER_STATUS_CHANGE', entity_type: 'ORDER', entity_id: 'ord-003', old_value: { status: 'ACCEPTED' }, new_value: { status: 'PICKING' }, created_at: new Date(Date.now() - 1*3600000).toISOString() },
  { id: 'al-004', user_id: 'u1', action: 'SYNC_MANUAL_START', entity_type: 'SYNC_TASK', entity_id: 'st-005', old_value: null, new_value: { type: 'FULL' }, created_at: new Date(Date.now() - 90*60000).toISOString() },
  { id: 'al-005', user_id: 'u4', action: 'ORDER_STATUS_CHANGE', entity_type: 'ORDER', entity_id: 'ord-004', old_value: { status: 'PICKED' }, new_value: { status: 'PACKED' }, created_at: new Date(Date.now() - 3*3600000).toISOString() },
  { id: 'al-006', user_id: 'u1', action: 'SYNC_ERROR_RESOLVED', entity_type: 'SYNC_ERROR', entity_id: 'se-003', old_value: { resolved: false }, new_value: { resolved: true }, created_at: new Date(Date.now() - 58*60000).toISOString() },
  { id: 'al-007', user_id: 'u2', action: 'ORDER_STATUS_CHANGE', entity_type: 'ORDER', entity_id: 'ord-005', old_value: { status: 'READY' }, new_value: { status: 'DELIVERED' }, created_at: new Date(Date.now() - 12*3600000).toISOString() },
];

const DEFAULT_CONFIG = {
  moysklad: {
    token: '',
    base_url: 'https://api.moysklad.ru/api/remap/1.2',
    polling_interval: 30,
    connected: false,
    last_test: null,
    last_test_status: null,
  },
  kaspi: {
    api_key: '',
    merchant_id: '',
    base_url: 'https://kaspi.kz/shop/api/v1',
    polling_interval: 10,
    connected: false,
    last_test: null,
    last_test_status: null,
  },
  general: {
    reconciliation_interval: 720,
    max_retry_attempts: 5,
    timezone: 'Asia/Almaty',
  },
  agents: {
    claude_api_key: '',
    proxy_url: 'http://localhost:8080',
    items: [
      {
        id: 'agent-review',
        type: 'REVIEW',
        name: 'Код-ревью',
        icon: '🔍',
        color: 'rgba(99,102,241,0.15)',
        accent: '#6366f1',
        description: 'Анализирует код на ошибки, потенциальные проблемы, нарушения стиля и предлагает улучшения',
        model: 'claude-opus-4-6',
        enabled: true,
        system_prompt: `Ты опытный разработчик, выполняющий код-ревью. Анализируй предоставленный код и давай структурированную обратную связь:

1. **Ошибки и баги** — явные проблемы, которые приведут к сбоям
2. **Потенциальные проблемы** — места с риском ошибок при определённых условиях
3. **Качество кода** — читаемость, сложность, дублирование (DRY)
4. **Безопасность** — уязвимости: XSS, SQL injection, утечки данных, небезопасные операции
5. **Производительность** — узкие места, избыточные вычисления, лишние запросы
6. **Рекомендации** — конкретные улучшения с примерами исправленного кода

Отвечай на русском языке. Будь конкретным: указывай номера строк, давай примеры кода для каждой рекомендации. В конце дай общую оценку качества кода (1–10).`,
      },
      {
        id: 'agent-test',
        type: 'TESTING',
        name: 'Генерация тестов',
        icon: '🧪',
        color: 'rgba(16,185,129,0.15)',
        accent: '#10b981',
        description: 'Создаёт unit-тесты и интеграционные тесты для переданного кода с edge cases',
        model: 'claude-sonnet-4-6',
        enabled: true,
        system_prompt: `Ты эксперт по тестированию ПО. По предоставленному коду создавай полный набор тестов:

1. **Unit-тесты** — тестирование каждой функции/метода изолированно
2. **Edge cases** — граничные значения, null/undefined, пустые строки/массивы, отрицательные числа
3. **Негативные сценарии** — что происходит при ошибочных входных данных, исключениях
4. **Интеграционные тесты** — взаимодействие между компонентами (если применимо)
5. **Моки и стабы** — для внешних зависимостей, API-вызовов, БД

Автоматически определи язык и подходящий тест-фреймворк (Jest/Vitest для JS, pytest для Python, JUnit для Java и т.д.). Каждый тест должен иметь понятное описание в стиле "должен [делать что-то] когда [условие]". Добавляй комментарии на русском языке.`,
      },
      {
        id: 'agent-rewrite',
        type: 'REWRITE',
        name: 'Переписка кода',
        icon: '✏️',
        color: 'rgba(245,158,11,0.15)',
        accent: '#f59e0b',
        description: 'Рефакторинг, оптимизация и улучшение кода по вашим инструкциям',
        model: 'claude-sonnet-4-6',
        enabled: true,
        system_prompt: `Ты опытный разработчик, специализирующийся на рефакторинге и улучшении кода.

При переписке кода:
1. **Сохраняй логику** — функциональность должна остаться идентичной
2. **Улучшай читаемость** — понятные имена, короткие функции, чистая структура
3. **Принципы** — SOLID, DRY, KISS, YAGNI
4. **Современный синтаксис** — используй актуальные возможности языка
5. **Производительность** — оптимизируй где это оправдано
6. **Документация** — добавляй JSDoc/docstrings для публичных функций

Структура ответа:
- Краткий анализ: что именно улучшено и почему
- Переписанный код в блоке кода
- Список ключевых изменений

Отвечай на русском языке.`,
      },
    ],
  },
};

// ============================================================
// GLOBAL STATE INITIALIZATION
// ============================================================
window.OMS_DATA = {
  users: DEMO_USERS,
  products: DEMO_PRODUCTS,
  stocks: DEMO_STOCKS,
  orders: DEMO_ORDERS,
  sync_tasks: DEMO_SYNC_TASKS,
  sync_errors: DEMO_SYNC_ERRORS,
  integration_events: DEMO_INTEGRATION_EVENTS,
  audit_log: DEMO_AUDIT_LOG,
  config: DEFAULT_CONFIG,
  current_user: DEMO_USERS[0], // Default: Admin
};

// Load from localStorage if exists
function loadFromStorage() {
  try {
    const stored = localStorage.getItem('oms_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge config only (preserve demo data)
      if (parsed.config) {
        window.OMS_DATA.config = { ...DEFAULT_CONFIG, ...parsed.config };
        // Deep merge
        window.OMS_DATA.config.moysklad = { ...DEFAULT_CONFIG.moysklad, ...parsed.config.moysklad };
        window.OMS_DATA.config.kaspi = { ...DEFAULT_CONFIG.kaspi, ...parsed.config.kaspi };
        window.OMS_DATA.config.general = { ...DEFAULT_CONFIG.general, ...parsed.config.general };
        // Merge agents: preserve default items structure, restore saved api key, proxy, per-agent prompt/model
        if (parsed.config.agents) {
          const saved = parsed.config.agents;
          window.OMS_DATA.config.agents = {
            ...DEFAULT_CONFIG.agents,
            claude_api_key: saved.claude_api_key || '',
            proxy_url: saved.proxy_url || DEFAULT_CONFIG.agents.proxy_url,
            items: DEFAULT_CONFIG.agents.items.map(defAgent => {
              const savedAgent = (saved.items || []).find(a => a.id === defAgent.id);
              return savedAgent ? { ...defAgent, ...savedAgent, icon: defAgent.icon, color: defAgent.color, accent: defAgent.accent } : defAgent;
            }),
          };
        }
      }
      if (parsed.orders) window.OMS_DATA.orders = parsed.orders;
      if (parsed.sync_tasks) window.OMS_DATA.sync_tasks = parsed.sync_tasks;
      if (parsed.sync_errors) window.OMS_DATA.sync_errors = parsed.sync_errors;
      if (parsed.integration_events) window.OMS_DATA.integration_events = parsed.integration_events;
      if (parsed.audit_log) window.OMS_DATA.audit_log = parsed.audit_log;
      if (parsed.products) window.OMS_DATA.products = parsed.products;
      if (parsed.stocks) window.OMS_DATA.stocks = parsed.stocks;
      if (parsed.users) window.OMS_DATA.users = parsed.users;
      if (parsed.current_user) window.OMS_DATA.current_user = parsed.current_user;
    }
  } catch(e) { console.warn('OMS: Failed to load from storage', e); }
}

function saveToStorage() {
  try {
    localStorage.setItem('oms_data', JSON.stringify(window.OMS_DATA));
  } catch(e) { console.warn('OMS: Failed to save to storage', e); }
}

loadFromStorage();
