const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const safeUrl = (u) => (u && /^https?:\/\//i.test(u)) ? u : '#';
const api = async (url, options) => {
  const r = await fetch(url, options);
  const ct = r.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await r.text();
    console.error(`API error (${r.status}) at ${url}: ${text.slice(0, 200)}`);
    return null;
  }
  if (!r.ok) return null;
  const data = await r.json();
  return data;
};

const renderNewsList = (el, rows) => {
  el.innerHTML = rows.map(n => `<li><a href="/news-detail.html?id=${encodeURIComponent(n.id)}">${esc(n.title)}</a><span style="float:right;color:#8ea1b7">${esc((n.publish_time||'').slice(0,10))}</span></li>`).join('') || '<li>暂无新闻</li>';
};

const renderCards = (el, rows, mapFn) => {
  el.innerHTML = rows.map(mapFn).join('') || '<div>暂无数据</div>';
};

async function loadHome() {
  const [bannerAdsRaw, middleAdsRaw, newsRaw, expertsRaw, miningRaw] = await Promise.all([
    api('/api/public/ads?position=home_banner'),
    api('/api/public/ads?position=home_middle'),
    api('/api/public/news?page_size=6'),
    api('/api/public/experts'),
    api('/api/public/mining-financing?page_size=8')
  ]);
  const bannerAds = Array.isArray(bannerAdsRaw) ? bannerAdsRaw : [];
  const middleAds = Array.isArray(middleAdsRaw) ? middleAdsRaw : [];
  const news = newsRaw && Array.isArray(newsRaw.list) ? newsRaw : { list: [] };
  const experts = Array.isArray(expertsRaw) ? expertsRaw : [];
  const mining = miningRaw && Array.isArray(miningRaw.list) ? miningRaw : { list: [] };

  const banner = $('#banner');
  if (banner) {
    banner.innerHTML = bannerAds.length ? `<a href="${safeUrl(bannerAds[0].link_url)}"><img src="${esc(bannerAds[0].image_url)}" alt="${esc(bannerAds[0].title)}"></a>` : '<div>暂无广告</div>';
    let i = 0;
    if (bannerAds.length > 1) {
      setInterval(() => {
        i = (i + 1) % bannerAds.length;
        banner.innerHTML = `<a href="${safeUrl(bannerAds[i].link_url)}"><img src="${esc(bannerAds[i].image_url)}" alt="${esc(bannerAds[i].title)}"></a>`;
      }, 3500);
    }
  }

  const middle = $('#middleBanner');
  if (middle && middleAds.length) middle.innerHTML = `<a href="${safeUrl(middleAds[0].link_url)}"><img src="${esc(middleAds[0].image_url)}" alt="${esc(middleAds[0].title)}"></a>`;
  const newsList = $('#homeNews');
  if (newsList) renderNewsList(newsList, news.list || []);

  const expertList = $('#homeExperts');
  if (expertList) {
    expertList.innerHTML = (experts || []).map(e => `<div class="expert-item"><img src="${esc(e.avatar || 'https://picsum.photos/80')}"><div><strong>${esc(e.name)}</strong><p>${esc(e.intro || '')}</p><a href="/expert-detail.html?id=${encodeURIComponent(e.id)}" style="font-size:12px;color:var(--primary)">查看详情</a></div></div>`).join('') || '<div>暂无专家</div>';
    let top = 0;
    setInterval(() => {
      if (expertList.scrollHeight > expertList.clientHeight) {
        top = (top + 82) % expertList.scrollHeight;
        expertList.scrollTo({ top, behavior: 'smooth' });
      }
    }, 2800);
  }

  const miningList = $('#homeMining');
  if (miningList) {
    renderCards(miningList, mining.list || [], r => `<div class="card"><div class="content"><h4>${esc(r.title)}</h4><p>${esc(r.province || '')}${esc(r.city || '')} ${esc(r.region_desc || '')}</p><p>参考价格：${esc(r.price_ref || '-')} 万元</p><small>${esc((r.publish_time||'').slice(0,10))}</small><p><a href="/finance-detail.html?id=${encodeURIComponent(r.id)}" class="detail-link">查看详情</a></p></div></div>`);
  }
}

async function loadProducts() {
  const data = await api('/api/public/products');
  const box = $('#products');
  if (box) renderCards(box, Array.isArray(data) ? data : [], p => `<div class="card"><img src="${esc(p.cover_image || 'https://picsum.photos/300/160')}"><div class="content"><h4>${esc(p.name)}</h4><p>${esc(p.description || '')}</p><p><a href="/product-detail.html?id=${encodeURIComponent(p.id)}" class="detail-link">查看详情</a></p></div></div>`);
}

async function loadAlbums() {
  const data = await api('/api/public/albums');
  const box = $('#albums');
  if (box) renderCards(box, Array.isArray(data) ? data : [], p => `<div class="card"><img src="${esc(p.image_url)}"><div class="content"><h4>${esc(p.title)}</h4><p>${esc(p.description || '')}</p><p><a href="/album-detail.html?id=${encodeURIComponent(p.id)}" class="detail-link">查看详情</a></p></div></div>`);
}

async function loadNewsPage() {
  const data = await api('/api/public/news?page_size=30');
  const list = $('#newsList');
  if (list) renderNewsList(list, data && Array.isArray(data.list) ? data.list : []);
}

async function loadMiningPage() {
  const category = $('#fCategory').value;
  const province = $('#fProvince').value;
  const keyword = $('#fKeyword').value;
  const sort = $('#fSort').value;
  const query = new URLSearchParams({ page_size: 20 });
  if (category) query.set('category_id', category);
  if (province) query.set('province', province);
  if (keyword) query.set('keyword', keyword);
  if (sort) query.set('sort', sort);
  const data = await api('/api/public/mining-financing?' + query.toString());
  const list = $('#miningList');
  if (list) renderCards(list, data && Array.isArray(data.list) ? data.list : [], r => `<div class="card"><div class="content"><h4>${esc(r.title)}</h4><p>${esc(r.category_name || '')} | ${esc(r.province || '')}${esc(r.city || '')}</p><p>${esc(r.summary || '')}</p><p>参考价格：${esc(r.price_ref || '-')} 万元</p><small>${esc((r.publish_time||'').slice(0,10))}</small><p><a href="/finance-detail.html?id=${encodeURIComponent(r.id)}" class="detail-link">查看详情</a></p></div></div>`);
}

async function submitMessage(e) {
  e.preventDefault();
  const payload = {
    name: $('#msgName').value,
    phone: $('#msgPhone').value,
    email: $('#msgEmail').value,
    content: $('#msgContent').value
  };
  const res = await api('/api/public/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  alert((res && res.message) || '留言提交成功');
  if (res) e.target.reset();
}

async function loadNewsDetail() {
  const id = new URLSearchParams(location.search).get('id');
  const box = $('#detailBox');
  if (!box) return;
  if (!id) { box.innerHTML = '<p>参数错误</p>'; return; }
  const data = await api(`/api/public/news/${encodeURIComponent(id)}`);
  if (!data) { box.innerHTML = '<p>新闻不存在或已下线</p>'; return; }
  box.innerHTML = `<h1>${esc(data.title)}</h1><p style="color:#8ea1b7">${esc(data.category_name || '')} | ${esc((data.publish_time||'').slice(0,10))}</p><div class="detail-body">${esc(data.content || data.summary || '')}</div>`;
}

async function loadAdDetail() {
  const id = new URLSearchParams(location.search).get('id');
  const box = $('#detailBox');
  if (!box) return;
  if (!id) { box.innerHTML = '<p>参数错误</p>'; return; }
  const data = await api(`/api/public/ads/${encodeURIComponent(id)}`);
  if (!data) { box.innerHTML = '<p>广告不存在或已下线</p>'; return; }
  box.innerHTML = `<h1>${esc(data.title)}</h1>${data.image_url ? `<img src="${esc(data.image_url)}" alt="${esc(data.title)}" style="max-width:100%;border-radius:6px;margin:12px 0">` : ''}${data.link_url ? `<p><a href="${safeUrl(data.link_url)}" target="_blank" rel="noopener" class="detail-link">访问链接</a></p>` : ''}${data.description ? `<div class="detail-body">${esc(data.description)}</div>` : ''}`;
}

async function loadExpertDetail() {
  const id = new URLSearchParams(location.search).get('id');
  const box = $('#detailBox');
  if (!box) return;
  if (!id) { box.innerHTML = '<p>参数错误</p>'; return; }
  const data = await api(`/api/public/experts/${encodeURIComponent(id)}`);
  if (!data) { box.innerHTML = '<p>专家不存在</p>'; return; }
  box.innerHTML = `<div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap"><img src="${esc(data.avatar || 'https://picsum.photos/120')}" alt="${esc(data.name)}" style="width:120px;height:120px;border-radius:50%;object-fit:cover"><div><h1 style="margin:0 0 8px">${esc(data.name)}</h1><p>${esc(data.title || '')}</p><p>${esc(data.intro || '')}</p></div></div>`;
}

async function loadFinanceDetail() {
  const id = new URLSearchParams(location.search).get('id');
  const box = $('#detailBox');
  if (!box) return;
  if (!id) { box.innerHTML = '<p>参数错误</p>'; return; }
  const data = await api(`/api/public/mining-financing/${encodeURIComponent(id)}`);
  if (!data) { box.innerHTML = '<p>融资项目不存在</p>'; return; }
  box.innerHTML = `<h1>${esc(data.title)}</h1><p style="color:#8ea1b7">${esc(data.category_name || '')} | ${esc(data.province || '')}${esc(data.city || '')}</p><p>参考价格：<strong>${esc(data.price_ref || '-')} 万元</strong></p><p>${esc((data.publish_time||'').slice(0,10))}</p><div class="detail-body">${esc(data.detail || data.summary || '')}</div><form onsubmit="siteApp.submitInquiry(event)" style="margin-top:18px"><h3>在线洽谈</h3><div class="form-row"><label>姓名</label><input id="iqName" required></div><div class="form-row"><label>电话</label><input id="iqPhone" required></div><div class="form-row"><label>留言</label><textarea id="iqContent" rows="4"></textarea></div><input type="hidden" id="iqFinId" value="${esc(data.id)}"><button type="submit">提交洽谈</button></form>`;
}

async function loadAlbumDetail() {
  const id = new URLSearchParams(location.search).get('id');
  const box = $('#detailBox');
  if (!box) return;
  if (!id) { box.innerHTML = '<p>参数错误</p>'; return; }
  const data = await api(`/api/public/albums/${encodeURIComponent(id)}`);
  if (!data) { box.innerHTML = '<p>相册不存在</p>'; return; }
  box.innerHTML = `<h1>${esc(data.title)}</h1>${data.image_url ? `<img src="${esc(data.image_url)}" alt="${esc(data.title)}" style="max-width:100%;border-radius:6px;margin:12px 0">` : ''}<div class="detail-body">${esc(data.description || '')}</div>`;
}

async function loadProductDetail() {
  const id = new URLSearchParams(location.search).get('id');
  const box = $('#detailBox');
  if (!box) return;
  if (!id) { box.innerHTML = '<p>参数错误</p>'; return; }
  const data = await api(`/api/public/products/${encodeURIComponent(id)}`);
  if (!data) { box.innerHTML = '<p>产品不存在</p>'; return; }
  box.innerHTML = `<h1>${esc(data.name)}</h1>${data.cover_image ? `<img src="${esc(data.cover_image)}" alt="${esc(data.name)}" style="max-width:100%;border-radius:6px;margin:12px 0">` : ''}<div class="detail-body">${esc(data.detail || data.description || '')}</div>`;
}

async function submitInquiry(e) {
  e.preventDefault();
  const payload = {
    financing_id: $('#iqFinId').value,
    name: $('#iqName').value,
    phone: $('#iqPhone').value,
    content: $('#iqContent').value
  };
  const res = await api('/api/public/mining-inquiries', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  alert((res && res.message) || '提交成功');
  if (res) { $('#iqName').value = ''; $('#iqPhone').value = ''; $('#iqContent').value = ''; }
}

window.siteApp = { loadHome, loadProducts, loadAlbums, loadNewsPage, loadMiningPage, submitMessage, loadNewsDetail, loadAdDetail, loadExpertDetail, loadFinanceDetail, loadAlbumDetail, loadProductDetail, submitInquiry };
