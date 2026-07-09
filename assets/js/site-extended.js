// 扩展网站应用功能
if (!window.siteApp) window.siteApp = {};

// 数据加载函数
window.siteApp.loadMiningTrades = async function(page = 1, pageSize = 12) {
  try {
    const res = await fetch(`/api/mining-trade?page=${page}&page_size=${pageSize}`);
    const data = await res.json();
    const html = data.list.map(item => `
      <div class="card">
        <div class="card-header"><h4>${item.title}</h4></div>
        <div class="card-body">
          ${item.image ? `<img src="${item.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">` : ''}
          <p><strong>地区</strong>: ${item.province} ${item.city}</p>
          <p><strong>参考价</strong>: ${item.price}万元</p>
          <p style="color: #666; font-size: 12px; height: 40px; overflow: hidden;">${item.content}</p>
          <a href="/mining-detail.html?id=${item.id}" class="btn btn-primary" style="width: 100%; margin-top: 10px; display: block; text-align: center;">查看详情</a>
        </div>
      </div>
    `).join('');
    document.getElementById('miningTrades').innerHTML = html;
  } catch (e) {
    console.error('加载矿权交易失败:', e);
  }
};

window.siteApp.loadSupplyDemand = async function(page = 1, pageSize = 12) {
  try {
    const res = await fetch(`/api/supply-demand?page=${page}&page_size=${pageSize}`);
    const data = await res.json();
    const html = data.list.map(item => `
      <div class="card">
        <div class="card-header" style="background-color: ${item.category === '供应' ? '#22a447' : '#0d6efd'};">
          <h4>${item.category === '供应' ? '🟢' : '🔵'} ${item.title}</h4>
        </div>
        <div class="card-body">
          <p><strong>产品</strong>: ${item.product}</p>
          <p><strong>数量</strong>: ${item.quantity}</p>
          <p><strong>价格</strong>: ${item.price}</p>
          <p><strong>联系人</strong>: ${item.contact}</p>
          <p><strong>电话</strong>: ${item.phone}</p>
          <a href="tel:${item.phone}" class="btn btn-primary" style="width: 100%; margin-top: 10px; display: block; text-align: center;">联系卖家</a>
        </div>
      </div>
    `).join('');
    document.getElementById('supplyDemand').innerHTML = html;
  } catch (e) {
    console.error('加载供求商机失败:', e);
  }
};

window.siteApp.loadMarketQuotes = async function() {
  try {
    const res = await fetch('/api/market-quote');
    const data = await res.json();
    const html = data.list.map(item => `
      <div class="card">
        <div class="card-body" style="text-align: center;">
          <h4>${item.mineral}</h4>
          <p style="font-size: 24px; color: #e63946; font-weight: bold; margin: 12px 0;">${item.current_price}</p>
          <p style="font-size: 12px; color: #666;">${item.unit || '元/吨'}</p>
          <p style="${item.change_percent >= 0 ? 'color: #e63946;' : 'color: #22a447;'} font-weight: bold;">
            ${item.change_percent >= 0 ? '📈' : '📉'} ${item.change_percent}%
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 8px;">
            高: ${item.high_price} / 低: ${item.low_price}
          </p>
        </div>
      </div>
    `).join('');
    document.getElementById('marketQuotes').innerHTML = html;
  } catch (e) {
    console.error('加载市场行情失败:', e);
  }
};

window.siteApp.loadAcademy = async function(page = 1, pageSize = 12) {
  try {
    const res = await fetch(`/api/academy?page=${page}&page_size=${pageSize}`);
    const data = await res.json();
    const html = data.list.map(item => `
      <div class="card">
        <div class="card-header"><h4>${item.title}</h4></div>
        <div class="card-body">
          ${item.image ? `<img src="${item.image}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">` : ''}
          <p><span class="badge badge-secondary">${item.category}</span></p>
          <p style="color: #666; font-size: 12px; margin: 8px 0;">作者: ${item.author}</p>
          <p style="color: #999; font-size: 12px;">👁 ${item.views} 次浏览</p>
          <a href="/academy-detail.html?id=${item.id}" class="btn btn-primary" style="width: 100%; margin-top: 10px; display: block; text-align: center;">阅读全文</a>
        </div>
      </div>
    `).join('');
    document.getElementById('academyContent').innerHTML = html;
  } catch (e) {
    console.error('加载矿业学堂失败:', e);
  }
};

window.siteApp.submitMessage = async function(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      alert('留言已提交，感谢您的反馈！');
      form.reset();
    } else {
      alert('提交失败，请重试');
    }
  } catch (e) {
    console.error('提交留言失败:', e);
    alert('提交失败，请稍后重试');
  }
};

// 初始化首页加载
window.siteApp.loadHome = function() {
  if (document.getElementById('homeMining')) {
    const pageSize = 12;
    // 加载各个模块的初始数据
    if (document.getElementById('miningTrades')) this.loadMiningTrades(1, pageSize);
    if (document.getElementById('supplyDemand')) this.loadSupplyDemand(1, pageSize);
    if (document.getElementById('marketQuotes')) this.loadMarketQuotes();
    if (document.getElementById('academyContent')) this.loadAcademy(1, pageSize);
  }
};
