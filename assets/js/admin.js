(function () {
  const STORE_KEY = "mining_demo_store_v2";
  const D = window.DEMO_DATA || {};

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function getStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {
      admin: clone(D.admin || { username: "admin", password: "admin123" }),
      users: clone(D.users || []),
      currentUserId: null,
      ads: clone(D.ads || []),
      experts: clone(D.experts || [])
    };
  }
  function setStore(store) { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
  function nextId(arr) { return Math.max(0, ...arr.map((x) => Number(x.id) || 0)) + 1; }
  function esc(s) { return String(s || "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function bindAdsPage() {
    const form = document.querySelector("#adForm");
    const tbody = document.querySelector("#adTableBody");
    if (!form || !tbody) return;

    function render() {
      const store = getStore();
      tbody.innerHTML = (store.ads || []).map((a) => `
        <tr>
          <td>${esc(a.title)}</td>
          <td>${esc(a.slot)}</td>
          <td><img class="thumb" src="${esc(a.imageUrl)}" alt="${esc(a.title)}"></td>
          <td><span class="status-${a.status === "offline" ? "offline" : "online"}">${a.status === "offline" ? "下线" : "上线"}</span></td>
          <td>
            <button class="btn secondary" data-action="toggle-ad" data-id="${a.id}">${a.status === "offline" ? "上线" : "下线"}</button>
          </td>
        </tr>
      `).join("");
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const store = getStore();
      const imageFile = fd.get("imageFile");
      const imageUrl = imageFile && imageFile.size ? await fileToDataURL(imageFile) : String(fd.get("imageUrl") || "").trim();
      if (!imageUrl) return alert("请上传广告图片或填写图片地址");
      store.ads.unshift({
        id: nextId(store.ads || []),
        title: String(fd.get("title") || "").trim(),
        slot: String(fd.get("slot") || "HOME_BLOCK"),
        status: "online",
        linkUrl: String(fd.get("linkUrl") || "#").trim() || "#",
        imageUrl
      });
      setStore(store);
      form.reset();
      render();
    });

    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest('[data-action="toggle-ad"]');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const store = getStore();
      const ad = store.ads.find((x) => x.id === id);
      if (!ad) return;
      ad.status = ad.status === "offline" ? "online" : "offline";
      setStore(store);
      render();
    });

    render();
  }

  function bindExpertsPage() {
    const form = document.querySelector("#expertForm");
    const tbody = document.querySelector("#expertTableBody");
    if (!form || !tbody) return;

    function render() {
      const store = getStore();
      tbody.innerHTML = (store.experts || []).map((e) => `
        <tr>
          <td>${esc(e.name)}</td>
          <td>${esc(e.title)}</td>
          <td><img class="thumb" src="${esc(e.avatarUrl)}" alt="${esc(e.name)}"></td>
          <td>${e.cardImageUrl ? `<img class="thumb" src="${esc(e.cardImageUrl)}" alt="名片">` : "-"}</td>
          <td><span class="status-${e.status === "offline" ? "offline" : "online"}">${e.status === "offline" ? "下线" : "上线"}</span></td>
          <td><button class="btn secondary" data-action="toggle-expert" data-id="${e.id}">${e.status === "offline" ? "上线" : "下线"}</button></td>
        </tr>
      `).join("");
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const store = getStore();
      const avatarFile = fd.get("avatarFile");
      const cardFile = fd.get("cardFile");
      const avatarUrl = avatarFile && avatarFile.size ? await fileToDataURL(avatarFile) : String(fd.get("avatarUrl") || "").trim();
      const cardImageUrl = cardFile && cardFile.size ? await fileToDataURL(cardFile) : String(fd.get("cardImageUrl") || "").trim();
      if (!avatarUrl) return alert("请上传专家头像或填写头像地址");
      store.experts.unshift({
        id: nextId(store.experts || []),
        name: String(fd.get("name") || "").trim(),
        title: String(fd.get("title") || "").trim(),
        summary: String(fd.get("summary") || "").trim(),
        avatarUrl,
        cardImageUrl,
        status: "online"
      });
      setStore(store);
      form.reset();
      render();
    });

    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest('[data-action="toggle-expert"]');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const store = getStore();
      const expert = store.experts.find((x) => x.id === id);
      if (!expert) return;
      expert.status = expert.status === "offline" ? "online" : "offline";
      setStore(store);
      render();
    });

    render();
  }

  function bindAdminPasswordAndReset() {
    const adminForm = document.querySelector("#adminPasswordForm");
    const userTable = document.querySelector("#userResetTableBody");
    if (!adminForm && !userTable) return;

    if (adminForm) {
      adminForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(adminForm);
        const oldPassword = String(fd.get("oldPassword") || "").trim();
        const newPassword = String(fd.get("newPassword") || "").trim();
        const confirmPassword = String(fd.get("confirmPassword") || "").trim();
        const store = getStore();
        if (oldPassword !== store.admin.password) return alert("原管理员密码不正确");
        if (!newPassword || newPassword.length < 6) return alert("新密码至少 6 位");
        if (newPassword !== confirmPassword) return alert("两次输入不一致");
        store.admin.password = newPassword;
        setStore(store);
        adminForm.reset();
        alert("管理员密码修改成功");
      });
    }

    function renderUsers() {
      if (!userTable) return;
      const store = getStore();
      userTable.innerHTML = (store.users || []).map((u) => `
        <tr>
          <td>${esc(u.username)}</td>
          <td>${esc(u.name || "-")}</td>
          <td>${esc(u.phone || "-")}</td>
          <td><button class="btn secondary" data-action="reset-user-password" data-id="${u.id}">重置为 123456</button></td>
        </tr>
      `).join("");
    }

    if (userTable) {
      userTable.addEventListener("click", (e) => {
        const btn = e.target.closest('[data-action="reset-user-password"]');
        if (!btn) return;
        const id = Number(btn.dataset.id);
        const store = getStore();
        const user = store.users.find((u) => u.id === id);
        if (!user) return;
        user.password = "123456";
        setStore(store);
        alert(`已将 ${user.username} 的密码重置为 123456`);
      });
    }

    renderUsers();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindAdsPage();
    bindExpertsPage();
    bindAdminPasswordAndReset();
  });
})();
