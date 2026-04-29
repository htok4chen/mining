(function () {
  const STORE_KEYS = {
    ads: "demo_ads",
    experts: "demo_experts",
    users: "demo_users",
    admin: "demo_admin"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value || null));
  }

  function loadJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return clone(fallback);
    try {
      return JSON.parse(raw);
    } catch (_) {
      return clone(fallback);
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureSeed() {
    const D = window.DEMO_DATA || {};
    if (!localStorage.getItem(STORE_KEYS.ads) && D.ads) saveJSON(STORE_KEYS.ads, D.ads);
    if (!localStorage.getItem(STORE_KEYS.experts) && D.experts) saveJSON(STORE_KEYS.experts, D.experts);
    if (!localStorage.getItem(STORE_KEYS.users) && D.users) saveJSON(STORE_KEYS.users, D.users);
    if (!localStorage.getItem(STORE_KEYS.admin) && D.admin) saveJSON(STORE_KEYS.admin, D.admin);
  }

  function getAds() {
    return loadJSON(STORE_KEYS.ads, (window.DEMO_DATA || {}).ads || {});
  }

  function saveAds(ads) {
    saveJSON(STORE_KEYS.ads, ads);
  }

  function getExperts() {
    return loadJSON(STORE_KEYS.experts, (window.DEMO_DATA || {}).experts || []);
  }

  function saveExperts(experts) {
    saveJSON(STORE_KEYS.experts, experts);
  }

  function getUsers() {
    return loadJSON(STORE_KEYS.users, (window.DEMO_DATA || {}).users || []);
  }

  function saveUsers(users) {
    saveJSON(STORE_KEYS.users, users);
  }

  function getAdmin() {
    return loadJSON(STORE_KEYS.admin, (window.DEMO_DATA || {}).admin || { username: "admin", password: "admin123" });
  }

  function saveAdmin(admin) {
    saveJSON(STORE_KEYS.admin, admin);
  }

  function readFileAsDataUrl(file) {
    if (!file) return Promise.resolve("");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderAds() {
    const body = document.querySelector("#adminAdsTable");
    if (!body) return;
    const ads = getAds();
    const rows = [];
    Object.keys(ads).forEach((slot) => {
      (ads[slot] || []).forEach((ad) => {
        rows.push({ slot, ...ad });
      });
    });

    body.innerHTML = rows
      .map(
        (ad) => `
      <tr>
        <td>${ad.title}</td>
        <td>${ad.slot}</td>
        <td><img class="preview-thumb" src="${ad.imageUrl}" alt="${ad.title}"></td>
        <td>${ad.status === "offline" ? "下线" : "上线"}</td>
        <td class="actions">
          <button type="button" data-action="toggle" data-id="${ad.id}" data-slot="${ad.slot}">${ad.status === "offline" ? "上架" : "下架"}</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  function bindAdsPage() {
    const form = document.querySelector("#adForm");
    const body = document.querySelector("#adminAdsTable");
    if (!form || !body) return;

    renderAds();

    body.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action='toggle']");
      if (!btn) return;
      const slot = btn.dataset.slot;
      const id = btn.dataset.id;
      const ads = getAds();
      ads[slot] = (ads[slot] || []).map((ad) => {
        if (ad.id !== id) return ad;
        return { ...ad, status: ad.status === "offline" ? "online" : "offline" };
      });
      saveAds(ads);
      renderAds();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const slot = form.querySelector("[name='slot']").value;
      const title = form.querySelector("[name='title']").value.trim();
      const linkUrl = form.querySelector("[name='linkUrl']").value.trim() || "#";
      const status = form.querySelector("[name='status']").value;
      const size = form.querySelector("[name='size']").value;
      const imageUrlInput = form.querySelector("[name='imageUrl']").value.trim();
      const imageFile = form.querySelector("[name='imageFile']").files[0];
      const uploadedImage = await readFileAsDataUrl(imageFile);
      const imageUrl = uploadedImage || imageUrlInput;

      if (!title || !imageUrl) {
        alert("请填写标题并上传广告图片（或填写图片链接）。");
        return;
      }

      const ads = getAds();
      const record = {
        id: `${slot}-${Date.now()}`,
        title,
        imageUrl,
        linkUrl,
        status,
        size: slot === "HOME_TILE" ? size : "small"
      };
      if (!ads[slot]) ads[slot] = [];
      ads[slot].push(record);
      saveAds(ads);
      form.reset();
      renderAds();
      alert("广告位已保存。");
    });
  }

  function renderExperts() {
    const body = document.querySelector("#adminExpertsTable");
    if (!body) return;
    const experts = getExperts();
    body.innerHTML = experts
      .map(
        (expert) => `
      <tr>
        <td>${expert.name}</td>
        <td>${expert.title}</td>
        <td><img class="preview-thumb" src="${expert.avatarUrl}" alt="${expert.name}"></td>
        <td><img class="preview-thumb" src="${expert.cardImageUrl || expert.avatarUrl}" alt="${expert.name}名片"></td>
        <td>${expert.status === "offline" ? "下线" : "启用"}</td>
        <td><button type="button" data-action="toggle" data-id="${expert.id}">${expert.status === "offline" ? "启用" : "停用"}</button></td>
      </tr>
    `
      )
      .join("");
  }

  function bindExpertsPage() {
    const form = document.querySelector("#expertForm");
    const body = document.querySelector("#adminExpertsTable");
    if (!form || !body) return;

    renderExperts();

    body.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action='toggle']");
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const experts = getExperts().map((item) => {
        if (item.id !== id) return item;
        return { ...item, status: item.status === "offline" ? "online" : "offline" };
      });
      saveExperts(experts);
      renderExperts();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.querySelector("[name='name']").value.trim();
      const title = form.querySelector("[name='title']").value.trim();
      const summary = form.querySelector("[name='summary']").value.trim();
      const status = form.querySelector("[name='status']").value;

      const avatarUrlInput = form.querySelector("[name='avatarUrl']").value.trim();
      const avatarFile = form.querySelector("[name='avatarFile']").files[0];
      const avatarData = await readFileAsDataUrl(avatarFile);

      const cardUrlInput = form.querySelector("[name='cardImageUrl']").value.trim();
      const cardFile = form.querySelector("[name='cardFile']").files[0];
      const cardData = await readFileAsDataUrl(cardFile);

      const avatarUrl = avatarData || avatarUrlInput;
      const cardImageUrl = cardData || cardUrlInput || avatarUrl;

      if (!name || !title || !avatarUrl) {
        alert("请填写专家姓名、头衔，并上传头像（或填写头像链接）。");
        return;
      }

      const experts = getExperts();
      experts.push({
        id: Date.now(),
        name,
        title,
        summary,
        status,
        avatarUrl,
        cardImageUrl
      });
      saveExperts(experts);
      form.reset();
      renderExperts();
      alert("专家信息已保存。");
    });
  }

  function renderUsers() {
    const body = document.querySelector("#adminUsersTable");
    if (!body) return;
    body.innerHTML = getUsers()
      .map(
        (u) => `
      <tr>
        <td>${u.username}</td>
        <td>${u.name || "-"}</td>
        <td>${u.phone || "-"}</td>
        <td>${u.email || "-"}</td>
      </tr>
    `
      )
      .join("");
  }

  function bindUserManagePage() {
    const adminPwdForm = document.querySelector("#adminPasswordForm");
    const resetForm = document.querySelector("#userResetForm");
    if (!adminPwdForm || !resetForm) return;

    renderUsers();

    adminPwdForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const oldPassword = adminPwdForm.querySelector("[name='oldPassword']").value.trim();
      const newPassword = adminPwdForm.querySelector("[name='newPassword']").value.trim();
      const confirmPassword = adminPwdForm.querySelector("[name='confirmPassword']").value.trim();
      const admin = getAdmin();

      if (oldPassword !== admin.password) {
        alert("管理员旧密码错误。");
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        alert("新密码至少6位。");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("两次输入的新密码不一致。");
        return;
      }

      admin.password = newPassword;
      saveAdmin(admin);
      adminPwdForm.reset();
      alert("管理员密码已更新。");
    });

    resetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = resetForm.querySelector("[name='username']").value.trim();
      const newPassword = resetForm.querySelector("[name='newPassword']").value.trim();
      const users = getUsers();
      const found = users.find((u) => u.username === username);

      if (!found) {
        alert("未找到该用户。");
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        alert("重置密码至少6位。");
        return;
      }

      found.password = newPassword;
      saveUsers(users);
      resetForm.reset();
      renderUsers();
      alert("用户密码已重置。");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureSeed();
    bindAdsPage();
    bindExpertsPage();
    bindUserManagePage();
  });
})();
