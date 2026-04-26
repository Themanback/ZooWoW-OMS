// ============================================================
// OMS System — Business Services
// ============================================================

const MappingService = {
  // Multi-level auto mapping: SKU → Barcode → External Code
  autoMap(msProducts, kaspiProducts) {
    const results = { mapped: 0, failed: 0, errors: [] };
    msProducts.forEach(msp => {
      const p = window.OMS_DATA.products.find(x => x.moysklad_id === msp.id);
      if (!p) return;
      // Level 1: By SKU/code
      const byCode = kaspiProducts.find(k => k.sku === msp.code || k.vendorCode === msp.code);
      if (byCode) { p.kaspi_sku = byCode.sku; p.needs_mapping = false; p.mapping_type = 'AUTO_SKU'; results.mapped++; return; }
      // Level 2: By barcode
      const msBarcode = msp.barcodes?.[0]?.barcode;
      const byBarcode = msBarcode && kaspiProducts.find(k => k.barcode === msBarcode);
      if (byBarcode) { p.kaspi_sku = byBarcode.sku; p.needs_mapping = false; p.mapping_type = 'AUTO_BARCODE'; results.mapped++; return; }
      // Level 3: External code
      const byExternal = msp.externalCode && kaspiProducts.find(k => k.externalId === msp.externalCode);
      if (byExternal) { p.kaspi_sku = byExternal.sku; p.needs_mapping = false; p.mapping_type = 'AUTO_EXTERNAL'; results.mapped++; return; }
      // No match
      p.needs_mapping = true;
      results.failed++;
      results.errors.push({ product_id: p.id, message: `Нет совпадения для "${p.name}"` });
    });
    return results;
  },
};

const StockService = {
  getAvailable(productId) {
    const s = window.OMS_DATA.stocks.find(x => x.product_id === productId);
    return s ? s.available_qty : 0;
  },

  checkStockForOrder(order) {
    const issues = [];
    order.items.forEach(item => {
      const avail = this.getAvailable(item.product_id);
      if (avail < item.quantity) {
        issues.push({ item, available: avail, needed: item.quantity });
      }
    });
    return issues;
  },
};

const SyncService = {
  getLastSyncTime() {
    const tasks = window.OMS_DATA.sync_tasks;
    return tasks.length > 0 ? tasks[0].started_at : null;
  },

  getNextSyncTime() {
    const last = this.getLastSyncTime();
    if (!last) return null;
    const interval = window.OMS_DATA.config.moysklad.polling_interval || 30;
    return new Date(new Date(last).getTime() + interval * 60000).toISOString();
  },
};
