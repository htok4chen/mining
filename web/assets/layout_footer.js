(function(){
  const footerHtml = '<footer class="footer"><div class="container"><div class="footer-info">版权 &copy; 2026 矿业信息服务平台 &nbsp;|&nbsp; 地址：北京市朝阳区矿业大道88号 &nbsp;|&nbsp; 电话：010-88886666 &nbsp;|&nbsp; 邮箱：service@example.com</div></div></footer>';
  if (document.querySelector('.footer')) return;

  const script = document.currentScript;
  if (script) {
    script.insertAdjacentHTML('beforebegin', footerHtml);
    return;
  }

  const contentContainer = Array.from(document.body.children).find((el) => el.classList && el.classList.contains('container'));
  if (contentContainer) {
    contentContainer.insertAdjacentHTML('afterend', footerHtml);
    return;
  }

  document.body.insertAdjacentHTML('beforeend', footerHtml);
})();
