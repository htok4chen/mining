const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const safeUrl = (u) => (u && (/^https?:\/\//i.test(u) || /^\//.test(u))) ? u : '#';
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

const DEFAULT_PAGE_SIZE = 15;
const listState = {
  products: { page: 1, pageSize: DEFAULT_PAGE_SIZE },
  albums: { page: 1, pageSize: DEFAULT_PAGE_SIZE },
  news: { page: 1, pageSize: DEFAULT_PAGE_SIZE },
  experts: { page: 1, pageSize: DEFAULT_PAGE_SIZE },
  mining: { page: 1, pageSize: DEFAULT_PAGE_SIZE },
  homeNews: { page: 1, pageSize: DEFAULT_PAGE_SIZE },
  homeExperts: { page: 1, pageSize: DEFAULT_PAGE_SIZE },
  homeMining: { page: 1, pageSize: DEFAULT_PAGE_SIZE }
};

const clampPageSize = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(Math.floor(n), 1), 100);
};

const readPageSize = (selectId, fallback = DEFAULT_PAGE_SIZE) => {
  const el = document.getElementById(selectId);
  return el ? clampPageSize(el.value) : fallback;
};

const renderPager = (el, total, page, pageSize, fnName) => {
  if (!el) return;
  const totalCount = Number(total || 0);
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const prev = safePage > 1 ? `<a href="#" onclick="siteApp.${fnName}(${safePage - 1});return false">上一页</a>` : '';
  const next = safePage < totalPages ? `<a href="#" onclick="siteApp.${fnName}(${safePage + 1});return false">下一页</a>` : '';
  const pages = [];
  const start = Math.max(1, safePage - 2);
  const end = Math.min(totalPages, safePage + 2);
  for (let i = start; i <= end; i += 1) {
    pages.push(i === safePage
      ? `<span class="pager-current">${i}</span>`
      : `<a href="#" onclick="siteApp.${fnName}(${i});return false">${i}</a>`);
  }
  el.innerHTML = `<div class="pager-meta">共 ${totalCount} 条</div><div class="pager-links">${prev}${pages.join('')}${next}</div>`;
};

const updatePageSize = (key, value, loadFn) => {
  listState[key].pageSize = clampPageSize(value);
  listState[key].page = 1;
  loadFn(1);
};

const renderNewsList = (el, rows) => {
  el.innerHTML = rows.map(n => `<li><a href="/news-detail.html?id=${encodeURIComponent(n.id)}">${esc(n.title)}</a><span style="float:right;color:#8ea1b7">${esc((n.publish_time||'').slice(0,10))}</span></li>`).join('') || '<li>暂无新闻</li>';
};

const renderCards = (el, rows, mapFn) => {
  el.innerHTML = rows.map(mapFn).join('') || '<div>暂无数据</div>';
};

async function loadHome() {
  const [bannerAdsRaw, middleAdsRaw, tileAdsRaw] = await Promise.all([
    api('/api/public/ads?position=home_banner'),
    api('/api/public/ads?position=home_middle'),
    api('/api/public/ads?position=home_tiles')
  ]);
  const bannerAds = Array.isArray(bannerAdsRaw) ? bannerAdsRaw : [];
  const middleAds = Array.isArray(middleAdsRaw) ? middleAdsRaw : [];
  const tileAds = Array.isArray(tileAdsRaw) ? tileAdsRaw : [];

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
  const tiles = $('#homeAdsTiles');
  if (tiles) {
    tiles.innerHTML = tileAds.map((a, i) =>
      `<a class="ad-tile ${i === 0 ? 'ad-tile-large' : ''}" href="${safeUrl(a.link_url)}"><img src="${esc(a.image_url)}" alt="${esc(a.title)}"></a>`
    ).join('') || '<div>暂无广告</div>';
  }
  await Promise.all([loadHomeNews(1), loadHomeExperts(1), loadHomeMining(1)]);
}

async function loadHomeNews(page = 1) {
  const state = listState.homeNews;
  state.pageSize = readPageSize('homeNewsPageSize', state.pageSize);
  state.page = Math.max(Number(page || state.page || 1), 1);
  const data = await api(`/api/public/news?page=${state.page}&page_size=${state.pageSize}`);
  const newsList = $('#homeNews');
  if (newsList) renderNewsList(newsList, data && Array.isArray(data.list) ? data.list : []);
  renderPager($('#homeNewsPager'), data ? data.total : 0, state.page, state.pageSize, 'loadHomeNews');
}

async function loadHomeExperts(page = 1) {
  const state = listState.homeExperts;
  state.pageSize = readPageSize('homeExpertsPageSize', state.pageSize);
  state.page = Math.max(Number(page || state.page || 1), 1);
  const data = await api(`/api/public/experts?page=${state.page}&page_size=${state.pageSize}`);
  const expertList = $('#homeExperts');
  if (expertList) {
    const rows = data && Array.isArray(data.list) ? data.list : [];
    expertList.innerHTML = rows.map(e => `<div class="expert-item"><img src="${esc(e.avatar || 'https://picsum.photos/80')}"><div><strong>${esc(e.name)}</strong><p>${esc(e.intro || '')}</p><a href="/expert-detail.html?id=${encodeURIComponent(e.id)}" style="font-size:12px;color:var(--primary)">查看详情</a></div></div>`).join('') || '<div>暂无专家</div>';
  }
  renderPager($('#homeExpertsPager'), data ? data.total : 0, state.page, state.pageSize, 'loadHomeExperts');
}

async function loadHomeMining(page = 1) {
  const state = listState.homeMining;
  state.pageSize = readPageSize('homeMiningPageSize', state.pageSize);
  state.page = Math.max(Number(page || state.page || 1), 1);
  const data = await api(`/api/public/mining-financing?page=${state.page}&page_size=${state.pageSize}`);
  const miningList = $('#homeMining');
  if (miningList) {
    renderCards(miningList, data && Array.isArray(data.list) ? data.list : [], r => `<div class="card"><div class="content"><h4>${esc(r.title)}</h4><p>${esc(r.province || '')}${esc(r.city || '')} ${esc(r.region_desc || '')}</p><p>参考价格：${esc(r.price_ref || '-')} 万元</p><small>${esc((r.publish_time||'').slice(0,10))}</small><p><a href="/finance-detail.html?id=${encodeURIComponent(r.id)}" class="detail-link">查看详情</a></p></div></div>`);
  }
  renderPager($('#homeMiningPager'), data ? data.total : 0, state.page, state.pageSize, 'loadHomeMining');
}

async function loadProducts(page = 1) {
  const state = listState.products;
  state.pageSize = readPageSize('productsPageSize', state.pageSize);
  state.page = Math.max(Number(page || state.page || 1), 1);
  const data = await api(`/api/public/products?page=${state.page}&page_size=${state.pageSize}`);
  const box = $('#products');
  if (box) renderCards(box, data && Array.isArray(data.list) ? data.list : [], p => `<div class="card"><img src="${esc(p.cover_image || 'https://picsum.photos/300/160')}"><div class="content"><h4>${esc(p.name)}</h4><p>${esc(p.description || '')}</p><p><a href="/product-detail.html?id=${encodeURIComponent(p.id)}" class="detail-link">查看详情</a></p></div></div>`);
  renderPager($('#productsPager'), data ? data.total : 0, state.page, state.pageSize, 'loadProducts');
}

async function loadAlbums(page = 1) {
  const state = listState.albums;
  state.pageSize = readPageSize('albumsPageSize', state.pageSize);
  state.page = Math.max(Number(page || state.page || 1), 1);
  const data = await api(`/api/public/albums?page=${state.page}&page_size=${state.pageSize}`);
  const box = $('#albums');
  if (box) renderCards(box, data && Array.isArray(data.list) ? data.list : [], p => `<div class="card"><img src="${esc(p.image_url)}"><div class="content"><h4>${esc(p.title)}</h4><p>${esc(p.description || '')}</p><p><a href="/album-detail.html?id=${encodeURIComponent(p.id)}" class="detail-link">查看详情</a></p></div></div>`);
  renderPager($('#albumsPager'), data ? data.total : 0, state.page, state.pageSize, 'loadAlbums');
}

async function loadNewsPage(page = 1) {
  const state = listState.news;
  state.pageSize = readPageSize('newsPageSize', state.pageSize);
  state.page = Math.max(Number(page || state.page || 1), 1);
  const data = await api(`/api/public/news?page=${state.page}&page_size=${state.pageSize}`);
  const list = $('#newsList');
  if (list) renderNewsList(list, data && Array.isArray(data.list) ? data.list : []);
  renderPager($('#newsPager'), data ? data.total : 0, state.page, state.pageSize, 'loadNewsPage');
}

async function loadMiningPage(page = 1) {
  const state = listState.mining;
  state.pageSize = readPageSize('miningPageSize', state.pageSize);
  state.page = Math.max(Number(page || state.page || 1), 1);
  const category = $('#fCategory').value;
  const province = $('#fProvince').value;
  const keyword = $('#fKeyword').value;
  const sort = $('#fSort').value;
  const query = new URLSearchParams({ page: state.page, page_size: state.pageSize });
  if (category) query.set('category_id', category);
  if (province) query.set('province', province);
  if (keyword) query.set('keyword', keyword);
  if (sort) query.set('sort', sort);
  const data = await api('/api/public/mining-financing?' + query.toString());
  const list = $('#miningList');
  if (list) renderCards(list, data && Array.isArray(data.list) ? data.list : [], r => `<div class="card"><div class="content"><h4>${esc(r.title)}</h4><p>${esc(r.category_name || '')} | ${esc(r.province || '')}${esc(r.city || '')}</p><p>${esc(r.summary || '')}</p><p>参考价格：${esc(r.price_ref || '-')} 万元</p><small>${esc((r.publish_time||'').slice(0,10))}</small><p><a href="/finance-detail.html?id=${encodeURIComponent(r.id)}" class="detail-link">查看详情</a></p></div></div>`);
  renderPager($('#miningPager'), data ? data.total : 0, state.page, state.pageSize, 'loadMiningPage');
}

async function loadExperts(page = 1) {
  const state = listState.experts;
  state.pageSize = readPageSize('expertsPageSize', state.pageSize);
  state.page = Math.max(Number(page || state.page || 1), 1);
  const data = await api(`/api/public/experts?page=${state.page}&page_size=${state.pageSize}`);
  const box = $('#expertsList');
  if (box) renderCards(box, data && Array.isArray(data.list) ? data.list : [], e => `<div class="card"><div class="content" style="display:flex;gap:10px;align-items:flex-start"><img src="${esc(e.avatar || 'https://picsum.photos/80')}" alt="${esc(e.name)}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;flex-shrink:0"><div><h4 style="margin:0 0 4px">${esc(e.name)}</h4><p style="margin:0 0 4px;font-size:13px;color:#8ea1b7">${esc(e.title || '')}</p><p style="margin:0 0 6px;font-size:12px">${esc(e.intro || '')}</p><a href="/expert-detail.html?id=${encodeURIComponent(e.id)}" class="detail-link">查看详情</a></div></div></div>`);
  renderPager($('#expertsPager'), data ? data.total : 0, state.page, state.pageSize, 'loadExperts');
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
  box.innerHTML = `<div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap"><img src="${esc(data.avatar || 'https://picsum.photos/120')}" alt="${esc(data.name)}" style="width:120px;height:120px;border-radius:50%;object-fit:cover"><div style="flex:1;min-width:260px"><h1 style="margin:0 0 8px">${esc(data.name)}</h1><p style="margin:0 0 8px;color:#5a6d84">${esc(data.title || '')}</p><p style="margin:0 0 10px">${esc(data.intro || '')}</p>${data.card_image ? `<p style="margin:0 0 10px"><a class="detail-link" href="${esc(data.card_image)}" target="_blank" rel="noopener">查看专家名片</a></p>` : ''}<h3 style="margin:8px 0;color:var(--primary)">详细履历</h3><div class="detail-body">${esc(data.resume || data.intro || '暂无详细履历')}</div></div></div>`;
}

async function loadFinanceDetail() {
  const id = new URLSearchParams(location.search).get('id');
  const box = $('#detailBox');
  if (!box) return;
  if (!id) { box.innerHTML = '<p>参数错误</p>'; return; }
  const data = await api(`/api/public/mining-financing/${encodeURIComponent(id)}`);
  if (!data) { box.innerHTML = '<p>融资项目不存在</p>'; return; }
  const isLoggedIn = !!localStorage.getItem('user_token');
  const inquirySection = isLoggedIn
    ? `<form onsubmit="siteApp.submitInquiry(event)" style="margin-top:18px">
        <h3>在线洽谈</h3>
        <p style="margin:0 0 10px;color:#5a6d84">已登录用户无需重复填写姓名和电话，可直接留言。</p>
        <div class="form-row"><label>留言</label><textarea id="iqContent" rows="4"></textarea></div>
        <input type="hidden" id="iqFinId" value="${esc(data.id)}">
        <button type="submit">提交洽谈</button>
      </form>`
    : `<div class="inquiry-login-hint" style="margin-top:18px;padding:16px;background:#f0f7ff;border:1px solid #c0d8f7;border-radius:6px">
        <h3 style="margin:0 0 8px;color:var(--primary)">在线洽谈</h3>
        <p style="margin:0 0 10px;color:#555">请先登录后提交洽谈申请。</p>
        <a href="/login.html?redirect=${encodeURIComponent(location.href)}" class="detail-link">立即登录</a>
      </div>`;
  box.innerHTML = `<h1>${esc(data.title)}</h1><p style="color:#8ea1b7">${esc(data.category_name || '')} | ${esc(data.province || '')}${esc(data.city || '')}</p><p>参考价格：<strong>${esc(data.price_ref || '-')} 万元</strong></p><p>${esc((data.publish_time||'').slice(0,10))}</p><div class="detail-body">${esc(data.detail || data.summary || '')}</div>${inquirySection}`;
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
  const token = localStorage.getItem('user_token');
  if (!token) {
    const finId = $('#iqFinId') ? $('#iqFinId').value : '';
    const target = finId ? `/finance-detail.html?id=${encodeURIComponent(finId)}` : location.href;
    location.href = `/login.html?redirect=${encodeURIComponent(target)}`;
    return;
  }
  const payload = {
    financing_id: $('#iqFinId').value,
    content: $('#iqContent').value
  };
  const res = await api('/api/public/mining-inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  alert((res && res.message) || '提交成功');
  if (res) { $('#iqContent').value = ''; }
}

window.siteApp = {
  loadHome,
  loadProducts,
  loadAlbums,
  loadNewsPage,
  loadMiningPage,
  loadExperts,
  submitMessage,
  loadNewsDetail,
  loadAdDetail,
  loadExpertDetail,
  loadFinanceDetail,
  loadAlbumDetail,
  loadProductDetail,
  submitInquiry,
  loadHomeNews,
  loadHomeExperts,
  loadHomeMining,
  updateProductsPageSize: (v) => updatePageSize('products', v, loadProducts),
  updateAlbumsPageSize: (v) => updatePageSize('albums', v, loadAlbums),
  updateNewsPageSize: (v) => updatePageSize('news', v, loadNewsPage),
  updateExpertsPageSize: (v) => updatePageSize('experts', v, loadExperts),
  updateMiningPageSize: (v) => updatePageSize('mining', v, loadMiningPage),
  updateHomeNewsPageSize: (v) => updatePageSize('homeNews', v, loadHomeNews),
  updateHomeExpertsPageSize: (v) => updatePageSize('homeExperts', v, loadHomeExperts),
  updateHomeMiningPageSize: (v) => updatePageSize('homeMining', v, loadHomeMining)
};
