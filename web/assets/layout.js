(function(){
  const links = [
    ['index.html','首页'],['about.html','关于我们'],['products.html','产品展示'],['news.html','新闻资讯'],['experts.html','专家展示'],['finance.html','矿权融资'],['album.html','企业相册'],['message.html','留言反馈'],['contact.html','联系我们']
  ];
  const current = location.pathname.split('/').pop() || 'index.html';
  const nav = links.map(([href,text]) => `<a href="/${href}" class="${current===href?'active':''}">${text}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<header class="header"><div class="container header-inner"><a class="logo" href="/index.html">矿业信息服务平台</a><nav class="nav">${nav}</nav></div></header>`);
  document.body.insertAdjacentHTML('beforeend', '<footer class="footer"><div class="container"><div class="footer-info">版权 &copy; 2026 矿业信息服务平台 &nbsp;|&nbsp; 地址：北京市朝阳区矿业大道88号 &nbsp;|&nbsp; 电话：010-88886666 &nbsp;|&nbsp; 邮箱：service@example.com</div></div></footer>');
})();
