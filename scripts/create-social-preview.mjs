import { chromium } from '@playwright/test';
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : {},
);
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<!doctype html><html lang="en"><style>*{box-sizing:border-box}body{margin:0;background:#f1f5f9;color:#172033;font-family:system-ui,sans-serif;padding:66px 72px}small{font-size:19px;color:#475569}h1{font-size:65px;letter-spacing:-3px;margin:20px 0 8px;line-height:1.1}p{font-size:25px;color:#475569;margin:14px 0 32px}.tags{display:flex;gap:12px;margin-bottom:30px}.tags span{background:white;border:1px solid #cbd5e1;border-radius:8px;padding:10px 16px;font-size:18px}.table{background:white;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden}.row{display:grid;grid-template-columns:2fr 1fr 1fr;padding:16px 24px;gap:20px;border-bottom:1px solid #e2e8f0;font-size:19px}.row:first-child{background:#e2e8f0;font-weight:600}.row:last-child{border:0}.paid{color:#047857}.foot{font-size:16px;margin-top:22px;color:#475569}</style><body><small>REACT TABLES FOR ADMIN APPS</small><h1>rc-table-advanced</h1><p>Schema-driven filters. RTL. Multi-calendar dates.</p><div class="tags"><span>TypeScript</span><span>Server-side workflows</span><span>Persian · Gregorian · Hijri</span></div><div class="table"><div class="row"><span>Order</span><span>Status</span><span>Amount</span></div><div class="row"><span>Jane Cooper</span><span class="paid">Paid</span><span>250</span></div><div class="row"><span>Sara Wilson</span><span>Draft</span><span>120</span></div></div><div class="foot">Open source · MIT · Built on rc-table</div></body></html>`,
  );
  await page.screenshot({ path: 'example/public/social-preview.png' });
} finally {
  await browser.close();
}
