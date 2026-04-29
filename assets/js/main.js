(function () {
  const COPYRIGHT_TEXT = "版权 © 2026 矿业信息服务平台 | 地址：北京市朝阳区矿业大道88号 | 电话：010-88886666 | 邮箱：service@example.com";
  const STORE_KEYS = {
    ads: "demo_ads",
    experts: "demo_experts",
    users: "demo_users",
    currentUser: "demo_current_user",
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

  function seedStore() {
    const D = window.DEMO_DATA || {};
    if (!localStorage.getItem(STORE_KEYS.ads) && D.ads) saveJSON(STORE_KEYS.ads, D.ads);
    if (!localStorage.getItem(STORE_KEYS.experts) && D.experts) saveJSON(STORE_KEYS.experts, D.experts);
    if (!localStorage.getItem(STORE_KEYS.users) && D.users) saveJSON(STORE_KEYS.users, D.users);
    if (!localStorage.getItem(STORE_KEYS.admin) && D.admin) saveJSON(STORE_KEYS.admin, D.admin);
  }

  function getCurrentUser() {
    return loadJSON(STORE_KEYS.currentUser, null);
  }

  function setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORE_KEYS.currentUser);
      return;
    }
    saveJSON(STORE_KEYS.currentUser, user);
  }

  function getUsers() {
    return loadJSON(STORE_KEYS.users, []);
  }

  function saveUsers(users) {
    saveJSON(STORE_KEYS.users, users);
  }

  function getAds() {
    return loadJSON(STORE_KEYS.ads, (window.DEMO_DATA || {}).ads || {});
  }

  function getExperts() {
    return loadJSON(STORE_KEYS.experts, (window.DEMO_DATA || {}).experts || []);
  }

  function updateFooterText() {
    document.querySelectorAll(".footer .copyright").forEach((node) => {
      node.textContent = COPYRIGHT_TEXT;
    });
  }

  function updateAuthNav() {
    const navList = document.querySelector(".nav ul");
    if (!navList) return;
    navList.querySelectorAll(".js-auth-entry").forEach((item) => item.remove());

    const user = getCurrentUser();
    const createItem = (text, href, extraClass) => {
      const li = document.createElement("li");
      li.className = `js-auth-entry ${extraClass || ""}`.trim();
      const a = document.createElement("a");
      a.href = href;
      a.textContent = text;
      const current = location.pathname.split("/").pop() || "index.html";
      if (href === current) a.classList.add("active");
      li.appendChild(a);
      return li;
    };

    const hasLoginLink = !!navList.querySelector("a[href='login.html']");
    const hasUserCenterLink = !!navList.querySelector("a[href='user-center.html']");

    if (user?.username) {
      if (!hasUserCenterLink) navList.appendChild(createItem(`用户中心(${user.username})`, "user-center.html"));
      const logoutItem = document.createElement("li");
      logoutItem.className = "js-auth-entry";
      const btn = document.createElement("a");
      btn.href = "#";
      btn.textContent = "退出登录";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        setCurrentUser(null);
        location.reload();
      });
      logoutItem.appendChild(btn);
      navList.appendChild(logoutItem);
    } else {
      if (!hasLoginLink) navList.appendChild(createItem("登录", "login.html"));
    }
  }

  function bindLoginForm() {
    const loginForm = document.querySelector("#loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = (loginForm.querySelector("[name='username']")?.value || "").trim();
      const password = (loginForm.querySelector("[name='password']")?.value || "").trim();
      const users = getUsers();
      const found = users.find((u) => u.username === username && u.password === password);
      if (!found) {
        alert("账号或密码错误，请重试。");
        return;
      }
      setCurrentUser({ username: found.username, name: found.name || "", phone: found.phone || "", email: found.email || "" });
      alert("登录成功");
      location.href = "user-center.html";
    });
  }

  function bindUserCenterForms() {
    const profileForm = document.querySelector("#profileForm");
    const passwordForm = document.querySelector("#passwordForm");
    const user = getCurrentUser();
    if (!profileForm && !passwordForm) return;

    if (!user?.username) {
      alert("请先登录后再访问用户中心。");
      location.href = "login.html";
      return;
    }

    const users = getUsers();
    const found = users.find((u) => u.username === user.username);
    if (!found) {
      alert("用户信息不存在，请重新登录。");
      setCurrentUser(null);
      location.href = "login.html";
      return;
    }

    const usernameNode = document.querySelector("#currentUserName");
    if (usernameNode) usernameNode.textContent = found.username;

    if (profileForm) {
      profileForm.querySelector("[name='name']").value = found.name || "";
      profileForm.querySelector("[name='phone']").value = found.phone || "";
      profileForm.querySelector("[name='email']").value = found.email || "";

      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        found.name = profileForm.querySelector("[name='name']").value.trim();
        found.phone = profileForm.querySelector("[name='phone']").value.trim();
        found.email = profileForm.querySelector("[name='email']").value.trim();
        saveUsers(users);
        setCurrentUser({ username: found.username, name: found.name, phone: found.phone, email: found.email });
        alert("个人信息已更新。");
      });
    }

    if (passwordForm) {
      passwordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const oldPassword = passwordForm.querySelector("[name='oldPassword']").value.trim();
        const newPassword = passwordForm.querySelector("[name='newPassword']").value.trim();
        const confirmPassword = passwordForm.querySelector("[name='confirmPassword']").value.trim();

        if (oldPassword !== found.password) {
          alert("旧密码不正确。");
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
        found.password = newPassword;
        saveUsers(users);
        passwordForm.reset();
        alert("密码修改成功。");
      });
    }
  }

  function bindCommonForms() {
    const fb = document.querySelector("#feedbackForm");
    if (fb) {
      fb.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("留言提交成功！");
        fb.reset();
      });
    }

    const fm = document.querySelector("#financeMessageForm");
    if (fm) {
      const user = getCurrentUser();
      const identity = fm.querySelector(".negotiation-identity");
      if (user?.username && identity) {
        identity.style.display = "none";
        identity.querySelectorAll("input").forEach((input) => input.removeAttribute("required"));
      }

      fm.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = fm.querySelector("textarea")?.value.trim();
        if (!message) {
          alert("请填写留言内容。");
          return;
        }

        if (!user?.username) {
          const name = fm.querySelector("[name='name']")?.value.trim();
          const phone = fm.querySelector("[name='phone']")?.value.trim();
          if (!name || !phone) {
            alert("请先填写姓名和电话。");
            return;
          }
        }

        alert(user?.username ? "留言已提交，我们将尽快与您联系。" : "洽谈留言已提交！");
        fm.reset();
      });
    }
  }

  function initHomeEffects() {
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
  }

  window.getDemoAds = getAds;
  window.getDemoExperts = getExperts;
  window.getDemoUsers = getUsers;
  window.getCurrentDemoUser = getCurrentUser;
  window.setCurrentDemoUser = setCurrentUser;
  window.saveDemoUsers = saveUsers;
  window.initHomeEffects = initHomeEffects;

  document.addEventListener("DOMContentLoaded", () => {
    seedStore();
    const btn = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    if (btn && nav) {
      btn.addEventListener("click", () => nav.classList.toggle("open"));
    }

    updateFooterText();
    updateAuthNav();
    bindLoginForm();
    bindUserCenterForms();
    bindCommonForms();
  });
})();
