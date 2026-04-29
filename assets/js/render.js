(function () {
  const D = window.DEMO_DATA || {};

  const qs = (s) => document.querySelector(s);

  function pickAds(slot) {
    const storeAds = (window.getDemoAds && window.getDemoAds()) || D.ads || {};
    return (storeAds[slot] || []).filter((item) => item.status !== "offline");
  }

  function pickExperts() {
    const experts = (window.getDemoExperts && window.getDemoExperts()) || D.experts || [];
    return experts.filter((item) => item.status !== "offline");
  }

  function renderHome() {
    const slider = qs("#heroSlider");
    const topBanners = pickAds("HOME_TOP_BANNER");
    if (slider && topBanners.length) {
      slider.innerHTML = topBanners
        .map(
          (a, i) => `
        <a class="${i === 0 ? "active" : ""}" href="${a.linkUrl || "#"}">
          <img src="${a.imageUrl}" alt="${a.title}">
        </a>
      `
        )
        .join("");
    }

    const mid = qs("#adMidBanner");
    const midAd = pickAds("HOME_MID_BANNER")[0];
    if (mid && midAd) {
      mid.innerHTML = `<a class="ad-wide" href="${midAd.linkUrl || "#"}"><img src="${midAd.imageUrl}" alt="${midAd.title}"></a>`;
    }

    const bottom = qs("#adBottomBanner");
    const bottomAd = pickAds("HOME_BOTTOM_BANNER")[0];
    if (bottom && bottomAd) {
      bottom.innerHTML = `<a class="ad-wide" href="${bottomAd.linkUrl || "#"}"><img src="${bottomAd.imageUrl}" alt="${bottomAd.title}"></a>`;
    }

    const tileGrid = qs("#adTileGrid");
    const tileAds = pickAds("HOME_TILE").slice(0, 8);
    if (tileGrid && tileAds.length) {
      tileGrid.innerHTML = tileAds
        .map(
          (a) => `
          <a class="ad-tile ad-tile--${a.size === "large" ? "large" : "small"}" href="${a.linkUrl || "#"}">
            <img src="${a.imageUrl}" alt="${a.title}">
            <span>${a.title}</span>
          </a>
        `
        )
        .join("");
    }

    const exp = qs("#expertScroll ul");
    const experts = pickExperts();
    if (exp && experts.length) {
      exp.innerHTML = experts
        .map(
          (e) => `
        <li>
          <img src="${e.avatarUrl}" alt="${e.name}">
          <div>
            <h4>${e.name}</h4>
            <p>${e.summary}</p>
          </div>
        </li>
      `
        )
        .join("");
    }

    const fin = qs("#financeRecommend");
    if (fin && D.finance) {
      fin.innerHTML = D.finance
        .map(
          (f) => `
        <article class="finance-card">
          <h4><a href="finance-detail.html?id=${f.id}">${f.title}</a></h4>
          <p>矿种：${f.mineralType}</p>
          <p>地区：${f.region}</p>
          <p>融资额度：${f.amount}</p>
        </article>
      `
        )
        .join("");
    }

    const news = qs("#homeNewsList");
    if (news && D.news) {
      news.innerHTML = D.news
        .slice(0, 5)
        .map(
          (n) => `
        <a class="news-item" href="news-detail.html?id=${n.id}">
          <span>${n.title}</span><em>${n.date}</em>
        </a>
      `
        )
        .join("");
    }

    if (window.initHomeEffects) window.initHomeEffects();
  }

  function renderProducts() {
    const box = qs("#productGrid");
    if (!box || !D.products) return;
    box.innerHTML = D.products
      .map(
        (p) => `
      <article class="card">
        <img src="${p.cover}" alt="${p.title}">
        <div class="card-body">
          <h4 class="card-title">${p.title}</h4>
          <p class="card-desc">${p.summary}</p>
          <p style="margin-top:8px;"><a class="btn btn-sm" href="product-detail.html?id=${p.id}">查看详情</a></p>
        </div>
      </article>
    `
      )
      .join("");
  }

  function renderNewsList() {
    const box = qs("#newsList");
    if (!box || !D.news) return;
    box.innerHTML = D.news
      .map(
        (n) => `
      <a class="news-item" href="news-detail.html?id=${n.id}">
        <span>${n.title}</span><span class="date">${n.date}</span>
      </a>
    `
      )
      .join("");
  }

  function renderGallery() {
    const box = qs("#galleryGrid");
    if (!box || !D.gallery) return;
    box.innerHTML = D.gallery
      .map(
        (g) => `
      <article class="card">
        <img src="${g.url}" alt="${g.title}">
        <div class="card-body"><h4 class="card-title">${g.title}</h4></div>
      </article>
    `
      )
      .join("");
  }

  function renderFinanceList() {
    const box = qs("#financeList");
    if (!box || !D.finance) return;
    box.innerHTML = D.finance
      .map(
        (f) => `
      <article class="finance-row">
        <div class="main">
          <h4><a href="finance-detail.html?id=${f.id}">${f.title}</a></h4>
          <p>矿种：${f.mineralType} ｜ 地区：${f.region} ｜ 融资额度：${f.amount}</p>
          <p>项目简介：${f.content}</p>
        </div>
        <div class="side">
          <span>${f.date}</span>
          <a class="btn btn-sm" href="finance-detail.html?id=${f.id}">查看详情</a>
        </div>
      </article>
    `
      )
      .join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderHome();
    renderProducts();
    renderNewsList();
    renderGallery();
    renderFinanceList();
  });
})();
