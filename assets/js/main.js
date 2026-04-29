(function () {
  const STORE_KEY = "mining_demo_store_v2";
  const COPYRIGHT_TEXT = "版权 © 2026 矿业信息服务平台  |  地址：北京市朝阳区矿业大道88号  |  电话：010-88886666  |  邮箱：service@example.com";

  const defaults = {
    admin: { username: "admin", password: "admin123" },
    users: [{ id: 1, username: "demo", password: "123456", name: "演示用户", phone: "13800001111", email: "demo@example.com", company: "某某矿业有限公司" }],
    currentUserId: null,
    ads: [],
    experts: []
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function buildDefaultStore() {
    const d = window.DEMO_DATA || {};
    return {
      admin: clone(d.admin || defaults.admin),
      users: clone(d.users || defaults.users),
      currentUserId: null,
      ads: clone(d.ads || defaults.ads),
      experts: clone(d.experts || defaults.experts)
    };
  }

  function getStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) {
        const init = buildDefaultStore();
        localStorage.setItem(STORE_KEY, JSON.stringify(init));
        return init;
      }
      const store = JSON.parse(raw);
      return {
        ...buildDefaultStore(),
        ...store,
        users: Array.isArray(store.users) ? store.users : [],
        ads: Array.isArray(store.ads) ? store.ads : [],
        experts: Array.isArray(store.experts) ? store.experts : []
      };
    } catch (_) {
      return buildDefaultStore();
    }
  }

  function setStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  function getCurrentUser(store = getStore()) {
    return store.users.find((u) => u.id === store.currentUserId) || null;
  }

  window.MiningDemoStore = { getStore, setStore, getCurrentUser };

  function setFooterCopyright() {
    document.querySelectorAll(".copyright").forEach((el) => {
      el.textContent = COPYRIGHT_TEXT;
    });
  }

  function bindMenu() {
    const btn = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    if (btn && nav) btn.addEventListener("click", () => nav.classList.toggle("open"));
  }

  function bindAuthEntry() {
    const topbarTail = document.querySelector(".topbar .container > div:last-child");
    if (!topbarTail) return;
    const user = getCurrentUser();
    if (user) {
      topbarTail.innerHTML = `欢迎，${user.name || user.username} ｜ <a href="user-center.html">用户中心</a> ｜ <a href="#" data-action="logout">退出</a>`;
    } else {
      topbarTail.innerHTML = `服务热线：010-88886666 ｜ <a href="login.html">登录/注册</a>`;
    }
  }

  function bindLogout() {
    document.addEventListener("click", (e) => {
      const el = e.target.closest('[data-action="logout"]');
      if (!el) return;
      e.preventDefault();
      const store = getStore();
      store.currentUserId = null;
      setStore(store);
      location.href = "index.html";
    });
  }

  function bindLoginAndRegister() {
    const loginForm = document.querySelector("#loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(loginForm);
        const username = String(fd.get("username") || "").trim();
        const password = String(fd.get("password") || "").trim();
        const store = getStore();
        const user = store.users.find((u) => u.username === username && u.password === password);
        if (!user) return alert("用户名或密码错误");
        store.currentUserId = user.id;
        setStore(store);
        alert("登录成功");
        location.href = "user-center.html";
      });
    }

    const registerForm = document.querySelector("#registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(registerForm);
        const username = String(fd.get("username") || "").trim();
        const password = String(fd.get("password") || "").trim();
        const name = String(fd.get("name") || "").trim();
        const phone = String(fd.get("phone") || "").trim();
        if (!username || !password || !name || !phone) return alert("请完整填写注册信息");
        const store = getStore();
        if (store.users.some((u) => u.username === username)) return alert("账号已存在");
        const id = Math.max(0, ...store.users.map((u) => Number(u.id) || 0)) + 1;
        store.users.push({ id, username, password, name, phone, email: "", company: "" });
        store.currentUserId = id;
        setStore(store);
        alert("注册并登录成功");
        location.href = "user-center.html";
      });
    }
  }

  function bindUserCenter() {
    const profileForm = document.querySelector("#profileForm");
    const passwordForm = document.querySelector("#userPasswordForm");
    if (!profileForm && !passwordForm) return;

    const store = getStore();
    const user = getCurrentUser(store);
    if (!user) {
      alert("请先登录");
      location.href = "login.html";
      return;
    }

    if (profileForm) {
      profileForm.querySelector('[name="username"]').value = user.username || "";
      profileForm.querySelector('[name="name"]').value = user.name || "";
      profileForm.querySelector('[name="phone"]').value = user.phone || "";
      profileForm.querySelector('[name="email"]').value = user.email || "";
      profileForm.querySelector('[name="company"]').value = user.company || "";
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(profileForm);
        const target = store.users.find((u) => u.id === user.id);
        target.name = String(fd.get("name") || "").trim();
        target.phone = String(fd.get("phone") || "").trim();
        target.email = String(fd.get("email") || "").trim();
        target.company = String(fd.get("company") || "").trim();
        setStore(store);
        alert("个人信息已更新");
        bindAuthEntry();
      });
    }

    if (passwordForm) {
      passwordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(passwordForm);
        const oldPassword = String(fd.get("oldPassword") || "").trim();
        const newPassword = String(fd.get("newPassword") || "").trim();
        const confirmPassword = String(fd.get("confirmPassword") || "").trim();
        const target = store.users.find((u) => u.id === user.id);
        if (target.password !== oldPassword) return alert("原密码不正确");
        if (!newPassword || newPassword.length < 6) return alert("新密码至少 6 位");
        if (newPassword !== confirmPassword) return alert("两次输入的新密码不一致");
        target.password = newPassword;
        setStore(store);
        passwordForm.reset();
        alert("密码修改成功");
      });
    }
  }

  function bindFeedbackForm() {
    const fb = document.querySelector("#feedbackForm");
    if (!fb) return;
    fb.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("留言提交成功！");
      fb.reset();
    });
  }

  function bindFinanceMessageForm() {
    const fm = document.querySelector("#financeMessageForm");
    if (!fm) return;
    const store = getStore();
    const user = getCurrentUser(store);
    const contactFields = fm.querySelector(".js-contact-fields");
    if (user && contactFields) {
      contactFields.style.display = "none";
      contactFields.querySelectorAll("input").forEach((input) => {
        input.required = false;
      });
    }
    fm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert(user ? "洽谈留言已提交！" : "留言已提交，请保持电话畅通。");
      fm.reset();
    });
  }

  window.initHomeEffects = function () {
    const slides = document.querySelectorAll("#heroSlider a");
    if (slides.length) {
      let i = 0;
      slides[0].classList.add("active");
      setInterval(() => {
        slides[i].classList.remove("active");
        i = (i + 1) % slides.length;
        slides[i].classList.add("active");
      }, 3000);
    }

    const wrap = document.querySelector("#expertScroll");
    const ul = wrap && wrap.querySelector("ul");
    if (wrap && ul && ul.children.length > 1) {
      const first = ul.children[0].cloneNode(true);
      ul.appendChild(first);
      let idx = 0;
      const h = ul.children[0].offsetHeight;
      setInterval(() => {
        idx += 1;
        ul.style.transition = "transform .5s";
        ul.style.transform = `translateY(-${idx * h}px)`;
        if (idx === ul.children.length - 1) {
          setTimeout(() => {
            ul.style.transition = "none";
            ul.style.transform = "translateY(0)";
            idx = 0;
          }, 550);
        }
      }, 2500);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindLogout();
    bindLoginAndRegister();
    bindUserCenter();
    bindFeedbackForm();
    bindFinanceMessageForm();
    bindAuthEntry();
    setFooterCopyright();
  });
})();
