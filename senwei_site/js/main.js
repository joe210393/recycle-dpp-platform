document.addEventListener('DOMContentLoaded', () => {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  const passportForm = document.querySelector('#passportQueryForm');
  if (passportForm) {
    passportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const batch = document.querySelector('#batchNo').value.trim();
      const card = document.querySelector('#passportResult');
      const code = batch || 'SNW-2026-001';
      card.innerHTML = `
        <div class="kv">
          <strong>品牌</strong><span>SENWEI</span>
          <strong>商品</strong><span>森維修護潤澤精華乳</span>
          <strong>商品批次</strong><span>${code}</span>
          <strong>產品特性</strong><span>銀髮友善、低刺激、環境友善來源</span>
          <strong>護照摘要</strong><span>可追溯回收來源、公開檢測摘要、包材與永續資訊。</span>
          <strong>查詢狀態</strong><span>已找到對應商品護照</span>
        </div>
      `;
      card.classList.add('show');
    });
  }

  const loginForm = document.querySelector('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const tip = document.querySelector('#loginMessage');
      tip.textContent = '此為前台展示版本，登入流程可於後台串接後啟用。';
      tip.classList.add('show');
    });
  }
});
