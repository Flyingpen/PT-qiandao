/**
 * PT 签到 v3 终极版
 * 环境变量：
 *   PT_SITE_<SITE>_CK     必须，对应站点 cookie
 *   PT_WEBHOOK_URL        必须，推送地址
 *   PT_WEBHOOK_TYPE       bark | sct | custom
 *   PT_PROXY              可选
 *   PT_RETRY              重试次数，默认 3
 */
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');

const RETRY = Number(process.env.PT_RETRY) || 3;
const PROXY = process.env.PT_PROXY || null;
const WEBHOOK_URL = process.env.PT_WEBHOOK_URL;
const WEBHOOK_TYPE = (process.env.PT_WEBHOOK_TYPE || 'custom').toLowerCase();

if (!WEBHOOK_URL) throw new Error('❌ 未配置 PT_WEBHOOK_URL');

const http = axios.create({
  timeout: 15000,
  ...(PROXY ? { httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(PROXY) } : {}),
  maxRedirects: 0   // 禁止自动跳转，方便我们检测 302
});

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const sites = {
  hdkyl: {
    host: 'www.hdkyl.in',
    url: 'https://www.hdkyl.in/attendance.php'
  },
  carpt: {
    host: 'carpt.net',
    url: 'https://carpt.net/attendance.php'
  }
};

/* ===== 推送 ===== */
async function push(title, content) {
  let body;
  switch (WEBHOOK_TYPE) {
    case 'bark': body = { title, body: content }; break;
    case 'sct': body = { title, desp: content }; break;
    default: body = { title, content }; break;
  }
  try { await http.post(WEBHOOK_URL, body); } catch {}
}

/* ===== 签到 ===== */
async function sign(siteKey) {
  const site = sites[siteKey];
  const cookie = process.env[`PT_SITE_${siteKey.toUpperCase()}_CK`]?.trim();
  if (!cookie) {
    const msg = `${siteKey}: ❌ Cookie 未配置`;
    console.log(msg);
    await push('PT 签到失败', msg);
    return { site: siteKey, ok: false, reason: 'Cookie 未配置' };
  }

  const headers = {
    cookie,
    'user-agent': UA,
    referer: `https://${site.host}`
  };

  for (let i = 1; i <= RETRY; i++) {
    try {
      const { status, headers: respHeaders, data: html } = await http.get(site.url, { headers });

      /* 被 302 到登录页 */
      if (status === 302 || status === 301) {
        const loc = respHeaders.location || '';
        if (/login\.php|takelogin\.php/i.test(loc)) {
          throw new Error('Cookie 失效，被重定向到登录页');
        }
      }

      /* 已签到 */
      if (/今日已签到|签到已得|already signed/i.test(html)) {
        return { site: siteKey, ok: true, reason: '今日已签到' };
      }

      /* 提取 formhash */
      const m = html.match(/name="formhash"\s+value="([a-f0-9]{32})"/i);
      if (!m) throw new Error('HTML 中找不到 formhash，可能页面结构变化');

      const formhash = m[1];

      /* 提交签到 */
      const params = new URLSearchParams({ action: 'attendance', formhash });
      const { status: st2, data: d2 } = await http.post(site.url, params.toString(), {
        headers: { ...headers, 'content-type': 'application/x-www-form-urlencoded' }
      });

      if (d2.includes('成功') || d2.includes('success') || st2 === 302) {
        return { site: siteKey, ok: true };
      }
      throw new Error(`签到接口返回异常：${d2.slice(0, 150)}`);
    } catch (err) {
      console.error(`[${siteKey}] 第 ${i} 次失败：${err.message}`);
      if (i === RETRY) {
        const msg = `${siteKey}: ❌ ${err.message}`;
        await push('PT 签到失败', msg);
        return { site: siteKey, ok: false, reason: err.message };
      }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

/* ===== 主流程 ===== */
(async () => {
  const results = [];
  for (const key of Object.keys(sites)) results.push(await sign(key));

  const summary = results.map(r => `${r.site}: ${r.ok ? '✅' : '❌'}`).join('\n');
  console.log('\n===== 签到汇总 =====\n' + summary);

  /* 全部成功也推送一次 */
  if (results.every(r => r.ok)) {
    /* ===== 推送函数：提到最外层，只定义一次 ===== */
async function push(title, content) {
  const payload = {
    msg_type: 'text',
    content: { text: `${title}\n${content}` }
  };
  try {
    const { status, data } = await http.post(WEBHOOK_URL, payload, { timeout: 5000 });
    console.log(`[FEISHU] 推送返回 ${status}`, data);
  } catch (e) {
    console.error('[FEISHU] 推送失败', e.response?.status, e.response?.data || e.message);
  }
}

/* ===== 主流程 ===== */
(async () => {
  const results = [];
  for (const key of Object.keys(sites)) results.push(await sign(key));

  const summary = results.map(r => `${r.site}: ${r.ok ? '✅' : '❌'}`).join('\n');
  console.log('\n===== 签到汇总 =====\n' + summary);

  /* 无论成功还是失败都推送 */
  await push('PT 签到结果', summary);
})();
  }
})();
