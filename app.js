// ============================================================
// OMS System — Main App Entry Point
// ============================================================

function renderPage() {
  const page = OMS._currentPage;
  const params = OMS._pageParams || {};
  const app = document.getElementById('app');

  let pageContent = '';
  switch (page) {
    case 'dashboard':    pageContent = renderDashboard(); break;
    case 'orders':       pageContent = renderOrders(); break;
    case 'order_detail': pageContent = renderOrderDetail(params); break;
    case 'warehouse':    pageContent = renderWarehouse(); break;
    case 'catalog':      pageContent = renderCatalog(); break;
    case 'stock':        pageContent = renderStock(); break;
    case 'sync_logs':    pageContent = renderSyncLogs(); break;
    case 'errors':       pageContent = renderErrors(); break;
    case 'audit':        pageContent = renderAuditLog(); break;
    case 'users':        pageContent = renderUsers(); break;
    case 'settings':     pageContent = renderSettings(); break;
    case 'agents':       pageContent = renderAgents(); break;
    case 'agent_run':    pageContent = renderAgentRun(params); break;
    default:             pageContent = renderDashboard();
  }

  app.innerHTML = `
    ${renderSidebar()}
    <div class="main-area">
      ${pageContent}
    </div>
    <div id="toast-container" class="toast-container"></div>
  `;
}

// Register subscriber
OMS.subscribe(renderPage);

// Initial render
renderPage();

// Auto-polling simulation (every 30s update relative times)
setInterval(() => {
  const elements = document.querySelectorAll('[data-relative-time]');
  if (elements.length > 0) renderPage();
}, 60000);

console.log('%c OMS System v1.0 ', 'background:#6366f1;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold');
console.log('Данные:', window.OMS_DATA);
