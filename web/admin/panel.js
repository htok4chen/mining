const adminApp = (() => {
  let token = '';
  const helpMap = {
    news: '新闻管理：支持新闻列表与新增/编辑（含分类字段 category_id）',
    'news-categories': '新闻分类管理',
    'ads-positions': '广告位（位置）分类/管理',
    ads: '广告管理：支持启停字段 status',
    experts: '专家信息管理（仅展示，不含咨询功能）',
    'mining-categories': '融资分类维护',
    'mining-financing': '矿权融资信息管理',
    messages: '留言反馈管理：支持状态与回复字段'
  };

  const api = (path, options={}) => fetch('/api/admin/' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  }).then(r => r.json());

  const selectedEntity = () => document.getElementById('entity').value;
  const getPayload = () => {
    const text = document.getElementById('payload').value.trim();
    return text ? JSON.parse(text) : {};
  };

  async function login() {
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;
    const res = await api('login', { method: 'POST', body: JSON.stringify({ username, password }) });
    if (!res.token) return alert(res.message || '登录失败');
    token = res.token;
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('manageBox').style.display = 'block';
    loadList();
  }

  async function loadList() {
    const entity = selectedEntity();
    document.getElementById('entityHelp').textContent = helpMap[entity] || '';
    const data = await api(entity + '?page_size=50');
    document.getElementById('list').innerHTML = `<table class="table"><thead><tr><th>ID</th><th>数据</th></tr></thead><tbody>${(data.list||[]).map(i=>`<tr><td>${i.id}</td><td><pre>${JSON.stringify(i,null,2)}</pre></td></tr>`).join('')}</tbody></table>`;
  }

  async function create() {
    const entity = selectedEntity();
    const res = await api(entity, { method: 'POST', body: JSON.stringify(getPayload()) });
    alert(res.message || '已新增');
    loadList();
  }

  async function update() {
    const id = document.getElementById('editId').value;
    if (!id) return alert('请输入ID');
    const entity = selectedEntity();
    const res = await api(`${entity}/${id}`, { method: 'PUT', body: JSON.stringify(getPayload()) });
    alert(res.message || '已更新');
    loadList();
  }

  async function remove() {
    const id = document.getElementById('editId').value;
    if (!id) return alert('请输入ID');
    const entity = selectedEntity();
    const res = await api(`${entity}/${id}`, { method: 'DELETE' });
    alert(res.message || '已删除');
    loadList();
  }

  async function loadInquiries() {
    const data = await api('mining-inquiries?page_size=50');
    document.getElementById('list').innerHTML = `<h3>融资洽谈留言记录</h3><table class="table"><thead><tr><th>ID</th><th>数据</th></tr></thead><tbody>${(data.list||[]).map(i=>`<tr><td>${i.id}</td><td><pre>${JSON.stringify(i,null,2)}</pre></td></tr>`).join('')}</tbody></table><p>回复接口：PUT /api/admin/mining-inquiries/:id/reply</p>`;
  }

  return { login, loadList, create, update, remove, loadInquiries };
})();
