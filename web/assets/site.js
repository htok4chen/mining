const $ = (s) => document.querySelector(s);
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
  el.innerHTML = rows.map(n => `<li><a href="news.html">${n.title}</a><span style="float:right;color:#8ea1b7">${(n.publish_time||'').slice(0,10)}</span></li>`).join('') || '<li>暂无新闻</li>';
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
    banner.innerHTML = bannerAds.length ? `<a href="${bannerAds[0].link_url || '#'}"><img src="${bannerAds[0].image_url}" alt="${bannerAds[0].title}"></a>` : '<div>暂无广告</div>';
    let i = 0;
    if (bannerAds.length > 1) {
      setInterval(() => {
        i = (i + 1) % bannerAds.length;
        banner.innerHTML = `<a href="${bannerAds[i].link_url || '#'}"><img src="${bannerAds[i].image_url}" alt="${bannerAds[i].title}"></a>`;
      }, 3500);
    }
  }

  const middle = $('#middleBanner');
  if (middle && middleAds.length) middle.innerHTML = `<a href="${middleAds[0].link_url || '#'}"><img src="${middleAds[0].image_url}" alt="${middleAds[0].title}"></a>`;
  const newsList = $('#homeNews');
  if (newsList) renderNewsList(newsList, news.list || []);

  const expertList = $('#homeExperts');
  if (expertList) {
    expertList.innerHTML = (experts || []).map(e => `<div class="expert-item"><img src="${e.avatar || 'https://picsum.photos/80'}"><div><strong>${e.name}</strong><p>${e.intro || ''}</p></div></div>`).join('') || '<div>暂无专家</div>';
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
    renderCards(miningList, mining.list || [], r => `<div class="card"><div class="content"><h4>${r.title}</h4><p>${r.province || ''}${r.city || ''} ${r.region_desc || ''}</p><p>参考价格：${r.price_ref || '-'} 万元</p><small>${(r.publish_time||'').slice(0,10)}</small></div></div>`);
  }
}

async function loadProducts() {
  const data = await api('/api/public/products');
  const box = $('#products');
  if (box) renderCards(box, Array.isArray(data) ? data : [], p => `<div class="card"><img src="${p.cover_image || 'https://picsum.photos/300/160'}"><div class="content"><h4>${p.name}</h4><p>${p.description || ''}</p></div></div>`);
}

async function loadAlbums() {
  const data = await api('/api/public/albums');
  const box = $('#albums');
  if (box) renderCards(box, Array.isArray(data) ? data : [], p => `<div class="card"><img src="${p.image_url}"><div class="content"><h4>${p.title}</h4><p>${p.description || ''}</p></div></div>`);
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
  if (list) renderCards(list, data && Array.isArray(data.list) ? data.list : [], r => `<div class="card"><div class="content"><h4>${r.title}</h4><p>${r.category_name || ''} | ${r.province || ''}${r.city || ''}</p><p>${r.summary || ''}</p><p>参考价格：${r.price_ref || '-'} 万元</p><small>${(r.publish_time||'').slice(0,10)}</small></div></div>`);
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

window.siteApp = { loadHome, loadProducts, loadAlbums, loadNewsPage, loadMiningPage, submitMessage };
