(function(){
  const links = [
    ['index.html','首页'],['about.html','关于我们'],['products.html','产品展示'],['news.html','新闻资讯'],['experts.html','专家展示'],['finance.html','矿权融资'],['album.html','企业相册'],['message.html','留言反馈'],['contact.html','联系我们']
  ];
  const current = location.pathname.split('/').pop() || 'index.html';
  const nav = links.map(([href,text]) => `<a href="/${href}" class="${current===href?'active':''}">${text}</a>`).join('');
  const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const userToken = localStorage.getItem('user_token');
  const userName = localStorage.getItem('user_name');

  window._navLogout = function() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_name');
    location.href = '/login.html';
  };

  const authHtml = userToken
    ? `<div class="nav-user-area"><span class="nav-user-name">👤 ${esc(userName || '用户')}</span><a href="#" class="nav-auth-btn" id="_navLogoutBtn">退出</a></div>`
    : `<div class="nav-user-area"><a href="/login.html" class="nav-auth-btn${current==='login.html'?' active':''}">登录</a><a href="/register.html" class="nav-auth-btn${current==='register.html'?' active':''}">注册</a></div>`;
  document.body.insertAdjacentHTML('afterbegin', `<header class="header"><div class="container header-inner"><a class="logo" href="/index.html">矿业信息服务平台</a><nav class="nav">${nav}</nav>${authHtml}</div></header>`);
  document.body.insertAdjacentHTML('beforeend', '<footer class="footer"><div class="container"><div class="footer-info">版权 &copy; 2026 矿业信息服务平台 &nbsp;|&nbsp; 地址：北京市朝阳区矿业大道88号 &nbsp;|&nbsp; 电话：010-88886666 &nbsp;|&nbsp; 邮箱：service@example.com</div></div></footer>');

  const logoutBtn = document.getElementById('_navLogoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', function(e) { e.preventDefault(); window._navLogout(); });
})();
