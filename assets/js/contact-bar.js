/* 右侧联系栏模块 */
window.siteContactBar = (() => {
  return {
    showWechat: () => {
      document.getElementById('wechatModal').classList.add('show');
      document.getElementById('contactOverlay').classList.add('show');
    },
    showQQ: () => {
      document.getElementById('qqModal').classList.add('show');
      document.getElementById('contactOverlay').classList.add('show');
    },
    close: () => {
      document.getElementById('wechatModal').classList.remove('show');
      document.getElementById('qqModal').classList.remove('show');
      document.getElementById('contactOverlay').classList.remove('show');
    }
  };
})();

/* 扩展 siteApp */
if (window.siteApp) {
  window.siteApp.showContactModal = (type) => {
    if (type === 'wechat') siteContactBar.showWechat();
    else if (type === 'qq') siteContactBar.showQQ();
  };
  window.siteApp.closeContactModal = () => siteContactBar.close();
  window.siteApp.navigate = (url) => window.location.href = url;
  window.siteApp.initContactBar = () => {
    document.getElementById('contactOverlay').addEventListener('click', siteContactBar.close);
  };
}
