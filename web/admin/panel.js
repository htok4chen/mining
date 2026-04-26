'use strict';

/* ============================================================
   Admin Panel JS — 矿业信息服务平台后台管理
   ============================================================ */
const adminApp = (() => {

  // =====================================================
  // STATE
  // =====================================================
  const state = {
    token: localStorage.getItem('adm_token') || '',
    currentModule: null,
    currentPage: 1,
    pageSize: 20,
    searchParams: {},
    editId: null,
    relatedData: {},
  };

  // =====================================================
  // SIDEBAR GROUPS
  // =====================================================
  const SIDEBAR_GROUPS = [
    {
      id: 'content', label: '内容管理', icon: '📰',
      items: [
        { key: 'news-categories', label: '新闻分类' },
        { key: 'news', label: '新闻管理' },
      ],
    },
    {
      id: 'ads', label: '广告管理', icon: '📣',
      items: [
        { key: 'ads-positions', label: '广告位管理' },
        { key: 'ads', label: '广告管理' },
      ],
    },
    {
      id: 'mining', label: '矿权管理', icon: '⛏',
      items: [
        { key: 'mining-categories', label: '融资分类' },
        { key: 'mining-financing', label: '矿权融资' },
      ],
    },
    {
      id: 'experts', label: '专家管理', icon: '👤',
      items: [
        { key: 'experts', label: '专家信息' },
      ],
    },
    {
      id: 'products', label: '产品与相册', icon: '🏭',
      items: [
        { key: 'products', label: '产品管理' },
        { key: 'albums', label: '企业相册' },
      ],
    },
    {
      id: 'messages', label: '留言与咨询', icon: '💬',
      items: [
        { key: 'messages', label: '留言反馈' },
        { key: 'mining-inquiries', label: '融资洽谈' },
      ],
    },
  ];

  // =====================================================
  // STATUS MAPS
  // =====================================================
  const STATUS_MAP     = { 0: '停用', 1: '启用' };
  const MSG_STATUS_MAP = { 0: '未回复', 1: '已回复', 2: '已关闭' };
  const INQ_STATUS_MAP = { 0: '待处理', 1: '已回复', 2: '已关闭' };

  // =====================================================
  // MODULE CONFIGS
  // =====================================================
  const MODULES = {
    'news-categories': {
      label: '新闻分类',
      api: 'news-categories',
      canToggle: true,
      listCols: [
        { k: 'id',         l: 'ID',     w: '60px' },
        { k: 'name',       l: '分类名称' },
        { k: 'sort',       l: '排序',   w: '70px' },
        { k: 'status',     l: '状态',   badge: 'status' },
        { k: 'updated_at', l: '更新时间', date: true },
      ],
      formFields: [
        { k: 'name',   l: '分类名称', type: 'text',   req: true, ph: '请输入分类名称' },
        { k: 'sort',   l: '排序',     type: 'number',            ph: '数字越小越靠前，默认 0' },
        { k: 'status', l: '状态',     type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
    },

    'news': {
      label: '新闻管理',
      api: 'news',
      canToggle: true,
      searchFields: [
        { k: 'category_id', l: '分类', type: 'select', rel: 'news-categories', all: '全部分类' },
        { k: 'status',      l: '状态', type: 'select', opts: [{ v: '', l: '全部状态' }, { v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
      listCols: [
        { k: 'id',           l: 'ID',     w: '60px' },
        { k: 'title',        l: '标题' },
        { k: 'category_id',  l: '分类',   rel: 'news-categories' },
        { k: 'status',       l: '状态',   badge: 'status' },
        { k: 'publish_time', l: '发布时间', date: true },
      ],
      formFields: [
        { k: 'category_id',  l: '新闻分类',   type: 'select',         rel: 'news-categories', all: '请选择分类（可选）' },
        { k: 'title',        l: '标题',       type: 'text',   req: true, ph: '请输入新闻标题' },
        { k: 'summary',      l: '摘要',       type: 'textarea',           ph: '请输入新闻摘要（可选）' },
        { k: 'content',      l: '正文',       type: 'textarea',           ph: '请输入新闻正文内容（可选）', rows: 6 },
        { k: 'cover_image',  l: '封面图 URL', type: 'text',               ph: '请输入封面图链接（可选）' },
        { k: 'publish_time', l: '发布时间',   type: 'datetime-local' },
        { k: 'sort',         l: '排序',       type: 'number',             ph: '数字越小越靠前' },
        { k: 'status',       l: '状态',       type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
    },

    'ads-positions': {
      label: '广告位管理',
      api: 'ads-positions',
      canToggle: true,
      listCols: [
        { k: 'id',     l: 'ID',       w: '60px' },
        { k: 'name',   l: '广告位名称' },
        { k: 'code',   l: '位置代码' },
        { k: 'sort',   l: '排序',     w: '70px' },
        { k: 'status', l: '状态',     badge: 'status' },
      ],
      formFields: [
        { k: 'name',   l: '广告位名称', type: 'text',   req: true, ph: '如：首页主轮播' },
        { k: 'code',   l: '位置代码',   type: 'text',   req: true, ph: '英文 + 下划线，如：home_banner' },
        { k: 'sort',   l: '排序',       type: 'number',            ph: '数字越小越靠前' },
        { k: 'status', l: '状态',       type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
    },

    'ads': {
      label: '广告管理',
      api: 'ads',
      canToggle: true,
      searchFields: [
        { k: 'position_id', l: '广告位', type: 'select', rel: 'ads-positions', all: '全部广告位' },
        { k: 'status',      l: '状态',   type: 'select', opts: [{ v: '', l: '全部状态' }, { v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
      listCols: [
        { k: 'id',          l: 'ID',    w: '60px' },
        { k: 'title',       l: '标题' },
        { k: 'position_id', l: '广告位', rel: 'ads-positions' },
        { k: 'sort',        l: '排序',  w: '70px' },
        { k: 'status',      l: '状态',  badge: 'status' },
      ],
      formFields: [
        { k: 'position_id', l: '广告位',    type: 'select', req: true, rel: 'ads-positions', all: '请选择广告位' },
        { k: 'title',       l: '广告标题',  type: 'text',   req: true, ph: '请输入广告标题' },
        { k: 'image_url',   l: '图片 URL',  type: 'text',   req: true, ph: '请输入广告图片链接' },
        { k: 'link_url',    l: '跳转链接',  type: 'text',              ph: '点击跳转链接（可选）' },
        { k: 'start_time',  l: '开始时间',  type: 'datetime-local' },
        { k: 'end_time',    l: '结束时间',  type: 'datetime-local' },
        { k: 'sort',        l: '排序',      type: 'number',            ph: '数字越小越靠前' },
        { k: 'status',      l: '状态',      type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
    },

    'experts': {
      label: '专家信息',
      api: 'experts',
      canToggle: true,
      listCols: [
        { k: 'id',     l: 'ID',   w: '60px' },
        { k: 'name',   l: '姓名' },
        { k: 'intro',  l: '简介', trunc: true },
        { k: 'sort',   l: '排序', w: '70px' },
        { k: 'status', l: '状态', badge: 'status' },
      ],
      formFields: [
        { k: 'name',   l: '姓名',   type: 'text',   req: true, ph: '请输入专家姓名' },
        { k: 'avatar', l: '头像 URL', type: 'text',            ph: '请输入头像图片链接（可选）' },
        { k: 'intro',  l: '简介',   type: 'textarea',           ph: '请输入专家简介（可选）' },
        { k: 'resume', l: '详细履历', type: 'textarea',          ph: '请输入详细履历（可选）', rows: 4 },
        { k: 'sort',   l: '排序',   type: 'number',             ph: '数字越小越靠前' },
        { k: 'status', l: '状态',   type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
    },

    'mining-categories': {
      label: '融资分类',
      api: 'mining-categories',
      canToggle: true,
      listCols: [
        { k: 'id',         l: 'ID',     w: '60px' },
        { k: 'name',       l: '分类名称' },
        { k: 'sort',       l: '排序',   w: '70px' },
        { k: 'status',     l: '状态',   badge: 'status' },
        { k: 'updated_at', l: '更新时间', date: true },
      ],
      formFields: [
        { k: 'name',   l: '分类名称', type: 'text',   req: true, ph: '请输入分类名称' },
        { k: 'sort',   l: '排序',     type: 'number',            ph: '数字越小越靠前' },
        { k: 'status', l: '状态',     type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
    },

    'mining-financing': {
      label: '矿权融资',
      api: 'mining-financing',
      canToggle: true,
      searchFields: [
        { k: 'category_id', l: '分类', type: 'select', rel: 'mining-categories', all: '全部分类' },
        { k: 'province',    l: '省份', type: 'text',   ph: '如：山西' },
        { k: 'status',      l: '状态', type: 'select', opts: [{ v: '', l: '全部状态' }, { v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
      listCols: [
        { k: 'id',          l: 'ID',       w: '60px' },
        { k: 'title',       l: '项目标题' },
        { k: 'category_id', l: '分类',     rel: 'mining-categories' },
        { k: 'province',    l: '省份',     w: '80px' },
        { k: 'price_ref',   l: '参考价(万)', curr: true },
        { k: 'status',      l: '状态',     badge: 'status' },
      ],
      formFields: [
        { k: 'category_id', l: '融资分类',     type: 'select',        rel: 'mining-categories', all: '请选择分类（可选）' },
        { k: 'title',       l: '项目标题',     type: 'text', req: true, ph: '请输入项目标题' },
        { k: 'province',    l: '省份',         type: 'text',            ph: '如：山西' },
        { k: 'city',        l: '城市',         type: 'text',            ph: '如：太原' },
        { k: 'region_desc', l: '区域描述',     type: 'text',            ph: '详细位置描述（可选）' },
        { k: 'price_ref',   l: '参考价（万元）', type: 'number',         ph: '请输入参考价格' },
        { k: 'summary',     l: '摘要',         type: 'textarea',         ph: '项目摘要（可选）' },
        { k: 'detail',      l: '详细描述',     type: 'textarea',         ph: '项目详细描述（可选）', rows: 5 },
        { k: 'publish_time', l: '发布时间',    type: 'datetime-local' },
        { k: 'sort',        l: '排序',         type: 'number',           ph: '数字越小越靠前' },
        { k: 'status',      l: '状态',         type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
    },

    'products': {
      label: '产品管理',
      api: 'products',
      canToggle: true,
      listCols: [
        { k: 'id',          l: 'ID',   w: '60px' },
        { k: 'name',        l: '产品名称' },
        { k: 'description', l: '描述', trunc: true },
        { k: 'sort',        l: '排序', w: '70px' },
        { k: 'status',      l: '状态', badge: 'status' },
      ],
      formFields: [
        { k: 'name',        l: '产品名称',  type: 'text',    req: true, ph: '请输入产品名称' },
        { k: 'cover_image', l: '封面图 URL', type: 'text',               ph: '请输入封面图链接（可选）' },
        { k: 'description', l: '描述',      type: 'textarea',            ph: '产品描述（可选）' },
        { k: 'sort',        l: '排序',      type: 'number',              ph: '数字越小越靠前' },
        { k: 'status',      l: '状态',      type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
    },

    'albums': {
      label: '企业相册',
      api: 'albums',
      canToggle: true,
      listCols: [
        { k: 'id',          l: 'ID',   w: '60px' },
        { k: 'title',       l: '标题' },
        { k: 'description', l: '描述', trunc: true },
        { k: 'sort',        l: '排序', w: '70px' },
        { k: 'status',      l: '状态', badge: 'status' },
      ],
      formFields: [
        { k: 'title',       l: '标题',     type: 'text',    req: true, ph: '请输入相册标题' },
        { k: 'image_url',   l: '图片 URL', type: 'text',    req: true, ph: '请输入图片链接' },
        { k: 'description', l: '描述',     type: 'textarea',           ph: '相册描述（可选）' },
        { k: 'sort',        l: '排序',     type: 'number',             ph: '数字越小越靠前' },
        { k: 'status',      l: '状态',     type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
      ],
    },

    'messages': {
      label: '留言反馈',
      api: 'messages',
      canCreate: false,
      canToggle: false,
      searchFields: [
        { k: 'status', l: '状态', type: 'select', opts: [{ v: '', l: '全部状态' }, { v: 0, l: '未回复' }, { v: 1, l: '已回复' }, { v: 2, l: '已关闭' }] },
      ],
      listCols: [
        { k: 'id',         l: 'ID',   w: '60px' },
        { k: 'name',       l: '姓名' },
        { k: 'phone',      l: '电话' },
        { k: 'content',    l: '内容', trunc: true },
        { k: 'status',     l: '状态', badge: 'msgStatus' },
        { k: 'created_at', l: '提交时间', date: true },
      ],
      viewFields: [
        { k: 'name',       l: '姓名' },
        { k: 'phone',      l: '电话' },
        { k: 'email',      l: '邮箱' },
        { k: 'content',    l: '留言内容' },
        { k: 'reply',      l: '回复内容' },
        { k: 'created_at', l: '提交时间' },
      ],
      replyFields: [
        { k: 'reply',  l: '回复内容', type: 'textarea', ph: '请输入回复内容' },
        { k: 'status', l: '处理状态', type: 'select', opts: [{ v: 0, l: '未回复' }, { v: 1, l: '已回复' }, { v: 2, l: '已关闭' }] },
      ],
      replyApi:    (id) => `messages/${id}`,
      replyMethod: 'PUT',
    },

    'mining-inquiries': {
      label: '融资洽谈',
      api: 'mining-inquiries',
      canCreate: false,
      canToggle: false,
      canDelete: false,
      searchFields: [
        { k: 'status', l: '状态', type: 'select', opts: [{ v: '', l: '全部状态' }, { v: 0, l: '待处理' }, { v: 1, l: '已回复' }, { v: 2, l: '已关闭' }] },
      ],
      listCols: [
        { k: 'id',           l: 'ID',     w: '60px' },
        { k: 'financing_id', l: '项目 ID', w: '80px' },
        { k: 'name',         l: '姓名' },
        { k: 'phone',        l: '电话' },
        { k: 'content',      l: '内容',   trunc: true },
        { k: 'status',       l: '状态',   badge: 'inquiryStatus' },
        { k: 'created_at',   l: '提交时间', date: true },
      ],
      viewFields: [
        { k: 'financing_id', l: '项目 ID' },
        { k: 'name',         l: '姓名' },
        { k: 'phone',        l: '电话' },
        { k: 'content',      l: '洽谈内容' },
        { k: 'reply',        l: '回复内容' },
        { k: 'created_at',   l: '提交时间' },
      ],
      replyFields: [
        { k: 'reply',  l: '回复内容', type: 'textarea', ph: '请输入回复内容' },
        { k: 'status', l: '处理状态', type: 'select', opts: [{ v: 0, l: '待处理' }, { v: 1, l: '已回复' }, { v: 2, l: '已关闭' }] },
      ],
      replyApi:    (id) => `mining-inquiries/${id}/reply`,
      replyMethod: 'PUT',
    },
  };

  // =====================================================
  // UTILITIES
  // =====================================================
  const esc = (s) => {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  const fmtDate = (v) => {
    if (!v) return '-';
    try {
      const d = new Date(v);
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    } catch (e) { return String(v); }
  };

  const trunc = (v, n = 30) => {
    if (!v) return '-';
    const s = String(v);
    return s.length > n ? s.slice(0, n) + '…' : s;
  };

  const badge = (v, type) => {
    let label, cls;
    if (type === 'status') {
      label = STATUS_MAP[v] ?? v;
      cls   = v == 1 ? 'badge-on' : 'badge-off';
    } else if (type === 'msgStatus') {
      label = MSG_STATUS_MAP[v] ?? v;
      cls   = v == 1 ? 'badge-on' : v == 2 ? 'badge-off' : 'badge-pending';
    } else if (type === 'inquiryStatus') {
      label = INQ_STATUS_MAP[v] ?? v;
      cls   = v == 1 ? 'badge-on' : v == 2 ? 'badge-off' : 'badge-pending';
    } else {
      return esc(v);
    }
    return `<span class="adm-badge ${cls}">${esc(String(label))}</span>`;
  };

  const relLabel = (relKey, id) => {
    const list = state.relatedData[relKey] || [];
    const found = list.find((r) => String(r.id) === String(id));
    return found ? found.name : (id != null ? String(id) : '-');
  };

  // =====================================================
  // API
  // =====================================================
  const callApi = async (path, opts = {}) => {
    const res = await fetch('/api/admin/' + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text();
      throw new Error(`服务器返回异常响应 (${res.status}): ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    if (res.status === 401) {
      doLogout();
      throw new Error('登录已过期，请重新登录');
    }
    if (!res.ok) throw new Error(data.message || `请求失败 (${res.status})`);
    return data;
  };

  // =====================================================
  // TOAST
  // =====================================================
  const toast = (msg, type = 'success') => {
    const el = document.createElement('div');
    el.className = `adm-toast adm-toast-${type}`;
    el.textContent = msg;
    document.getElementById('admToasts').appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 3200);
  };

  // =====================================================
  // CONFIRM DIALOG
  // =====================================================
  const confirm = (msg, onOk, okLabel = '确认删除') => {
    document.getElementById('admConfirmMsg').textContent = msg;
    const okBtn = document.getElementById('admConfirmOk');
    okBtn.textContent = okLabel;
    okBtn.onclick = () => { closeConfirm(); onOk(); };
    document.getElementById('admConfirm').style.display = 'flex';
  };

  const closeConfirm = () => {
    document.getElementById('admConfirm').style.display = 'none';
  };

  // =====================================================
  // MODAL
  // =====================================================
  const openModal = (title, bodyHtml, onSubmit, showSubmit = true) => {
    document.getElementById('admModalTitle').textContent = title;
    document.getElementById('admModalBody').innerHTML = bodyHtml;
    const submitBtn = document.getElementById('admModalSubmit');
    submitBtn.style.display = showSubmit ? '' : 'none';
    submitBtn.disabled = false;
    submitBtn.textContent = '确认';
    submitBtn.onclick = onSubmit || null;
    document.getElementById('admModal').style.display = 'flex';
  };

  const closeModal = () => {
    document.getElementById('admModal').style.display = 'none';
    state.editId = null;
  };

  // =====================================================
  // SIDEBAR
  // =====================================================
  const getCollapsed = () => {
    try { return JSON.parse(localStorage.getItem('adm_sidebar_col') || '{}'); } catch (e) { return {}; }
  };

  const toggleGroup = (gid) => {
    const col = getCollapsed();
    col[gid] = !col[gid];
    localStorage.setItem('adm_sidebar_col', JSON.stringify(col));
    renderSidebar();
  };

  const renderSidebar = () => {
    const col = getCollapsed();
    const nav = document.getElementById('admNav');
    nav.innerHTML = SIDEBAR_GROUPS.map((g) => {
      const open = !col[g.id];
      const items = g.items.map((item) => {
        const active = state.currentModule === item.key ? ' active' : '';
        return `<a class="adm-nav-item${active}" data-mod="${esc(item.key)}">${esc(item.label)}</a>`;
      }).join('');
      return `
        <div class="adm-nav-group">
          <div class="adm-nav-group-hdr" data-gid="${esc(g.id)}">
            <span>${g.icon} ${esc(g.label)}</span>
            <span class="adm-caret">${open ? '▼' : '▶'}</span>
          </div>
          <div class="adm-nav-items${open ? ' open' : ''}">${items}</div>
        </div>`;
    }).join('');

    nav.querySelectorAll('[data-gid]').forEach((el) => {
      el.addEventListener('click', () => toggleGroup(el.dataset.gid));
    });
    nav.querySelectorAll('[data-mod]').forEach((el) => {
      el.addEventListener('click', () => switchModule(el.dataset.mod));
    });
  };

  // =====================================================
  // MODULE SWITCHING & LIST
  // =====================================================
  const switchModule = async (moduleKey) => {
    state.currentModule = moduleKey;
    state.currentPage   = 1;
    state.searchParams  = {};
    state.editId        = null;
    renderSidebar();
    const mod = MODULES[moduleKey];
    if (!mod) return;
    document.getElementById('admBreadcrumb').textContent = `首页 / ${mod.label}`;
    await loadRelated(mod);
    renderListPage(mod);
    await fetchList();
  };

  const loadRelated = async (mod) => {
    const keys = new Set();
    [...(mod.listCols || []), ...(mod.formFields || []), ...(mod.searchFields || [])].forEach((f) => {
      if (f.rel) keys.add(f.rel);
    });
    for (const relKey of keys) {
      if (!state.relatedData[relKey]) {
        const relMod = MODULES[relKey];
        try {
          const d = await callApi(`${relMod ? relMod.api : relKey}?page_size=200`);
          state.relatedData[relKey] = d.list || [];
        } catch (e) {
          state.relatedData[relKey] = [];
        }
      }
    }
  };

  const renderListPage = (mod) => {
    const main = document.getElementById('admMain');

    const searchHtml = mod.searchFields ? `
      <div class="adm-search-bar">
        <form id="admSearchForm" class="adm-search-form">
          ${mod.searchFields.map(renderSearchField).join('')}
          <button type="submit" class="btn-primary">🔍 搜索</button>
          <button type="reset"  class="btn-default">重置</button>
        </form>
      </div>` : '';

    const createBtn = mod.canCreate !== false
      ? `<button class="btn-primary" id="btnCreate">+ 新增${esc(mod.label)}</button>`
      : '';

    main.innerHTML = `
      ${searchHtml}
      <div class="adm-toolbar">${createBtn}</div>
      <div class="adm-table-wrap"><div id="admTableInner"><div class="adm-loading">⏳ 加载中...</div></div></div>
      <div id="admPagination" class="adm-pagination"></div>`;

    if (mod.canCreate !== false) {
      document.getElementById('btnCreate')?.addEventListener('click', openCreate);
    }

    if (mod.searchFields) {
      const form = document.getElementById('admSearchForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        state.searchParams = {};
        for (const [k, v] of fd.entries()) {
          if (v !== '') state.searchParams[k] = v;
        }
        state.currentPage = 1;
        await fetchList();
      });
      form.addEventListener('reset', () => {
        state.searchParams = {};
        state.currentPage  = 1;
        setTimeout(fetchList, 30);
      });
    }
  };

  const buildQuery = () => {
    const p = new URLSearchParams({ page: state.currentPage, page_size: state.pageSize });
    Object.entries(state.searchParams).forEach(([k, v]) => {
      if (v !== '' && v != null) p.set(k, v);
    });
    return p.toString();
  };

  const fetchList = async () => {
    const mod   = MODULES[state.currentModule];
    const inner = document.getElementById('admTableInner');
    const pag   = document.getElementById('admPagination');
    if (!inner || !mod) return;

    inner.innerHTML = '<div class="adm-loading">⏳ 加载中...</div>';
    if (pag) pag.innerHTML = '';

    try {
      const data  = await callApi(`${mod.api}?${buildQuery()}`);
      const list  = data.list  || [];
      const total = data.total || 0;

      if (!list.length) {
        inner.innerHTML = `
          <div class="adm-empty">
            <div class="adm-empty-icon">📭</div>
            <div>暂无数据</div>
            <p>${mod.canCreate !== false ? '点击「+ 新增」按钮添加第一条记录' : '目前没有相关记录'}</p>
          </div>`;
        return;
      }

      inner.innerHTML = renderTable(mod, list);
      if (pag) {
        pag.innerHTML = renderPagination(total, state.currentPage, state.pageSize);
        pag.querySelectorAll('[data-page]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            state.currentPage = Number(btn.dataset.page);
            await fetchList();
          });
        });
      }
      attachTableActions(mod, list);
    } catch (e) {
      inner.innerHTML = `<div class="adm-error-box">❌ 加载失败：${esc(e.message)}&nbsp; <button class="btn-default btn-sm" onclick="adminApp._reload()">重试</button></div>`;
    }
  };

  // =====================================================
  // TABLE RENDERING
  // =====================================================
  const renderSearchField = (f) => {
    if (f.type === 'select') {
      const allOpt = f.all ? `<option value="">${esc(f.all)}</option>` : '';
      const opts   = f.rel
        ? (state.relatedData[f.rel] || []).map((r) => `<option value="${r.id}">${esc(r.name)}</option>`).join('')
        : (f.opts || []).map((o) => `<option value="${o.v}">${esc(o.l)}</option>`).join('');
      return `<select name="${f.k}" class="adm-input" style="min-width:120px">${allOpt}${opts}</select>`;
    }
    return `<input type="text" name="${f.k}" class="adm-input" placeholder="${esc(f.ph || f.l)}" style="min-width:130px">`;
  };

  const renderTable = (mod, list) => {
    const cols = [...mod.listCols, { k: '_act', l: '操作', w: '1px' }];
    const head = cols.map((c) => `<th${c.w ? ` style="width:${c.w}"` : ''}>${esc(c.l)}</th>`).join('');
    const rows = list.map((row) => {
      const cells = mod.listCols.map((c) => {
        let v;
        if      (c.badge) v = badge(row[c.k], c.badge);
        else if (c.rel)   v = esc(relLabel(c.rel, row[c.k]));
        else if (c.date)  v = fmtDate(row[c.k]);
        else if (c.trunc) v = esc(trunc(row[c.k]));
        else if (c.curr)  v = row[c.k] != null ? Number(row[c.k]).toLocaleString('zh-CN') : '-';
        else              v = esc(row[c.k] != null ? row[c.k] : '-');
        return `<td>${v}</td>`;
      }).join('');
      const actCell = `<td class="adm-actions">${renderRowActions(mod, row)}</td>`;
      return `<tr>${cells}${actCell}</tr>`;
    }).join('');
    return `<table class="adm-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  };

  const renderRowActions = (mod, row) => {
    const b = [];
    if (mod.viewFields) {
      b.push(`<button class="btn-sm btn-default" data-act="view"   data-id="${row.id}">查看</button>`);
    }
    if (mod.canCreate !== false && !mod.viewFields) {
      b.push(`<button class="btn-sm btn-primary" data-act="edit"   data-id="${row.id}">编辑</button>`);
    }
    if (mod.replyFields) {
      b.push(`<button class="btn-sm btn-warn"    data-act="reply"  data-id="${row.id}">处理/回复</button>`);
    }
    if (mod.canToggle) {
      const on = row.status == 1;
      b.push(`<button class="btn-sm ${on ? 'btn-off' : 'btn-on'}" data-act="toggle" data-id="${row.id}" data-status="${row.status}">${on ? '停用' : '启用'}</button>`);
    }
    if (mod.canDelete !== false && mod.canCreate !== false) {
      b.push(`<button class="btn-sm btn-danger"  data-act="del"    data-id="${row.id}">删除</button>`);
    }
    return b.join(' ');
  };

  const attachTableActions = (mod, list) => {
    document.querySelectorAll('#admTableInner [data-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        const id  = btn.dataset.id;
        const row = list.find((r) => String(r.id) === String(id));
        if (!row) return;
        if      (act === 'edit')   openEdit(mod, row);
        else if (act === 'view')   openView(mod, row);
        else if (act === 'reply')  openReply(mod, row);
        else if (act === 'toggle') doToggle(mod, row);
        else if (act === 'del')    doDelete(mod, id);
      });
    });
  };

  const renderPagination = (total, page, pageSize) => {
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const info = `<span class="adm-pag-info">共 ${total} 条，第 ${page} / ${totalPages} 页</span>`;
    if (totalPages <= 1) return info;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }
    const btns = pages.map((p) =>
      p === '…'
        ? `<span class="adm-pag-ellipsis">…</span>`
        : `<button class="adm-pag-btn${p === page ? ' active' : ''}" data-page="${p}">${p}</button>`
    ).join('');
    return info + btns;
  };

  // =====================================================
  // FORM RENDERING
  // =====================================================
  const renderFormField = (f, data) => {
    const v      = data ? data[f.k] : undefined;
    const req    = f.req ? ' required' : '';
    const reqMk  = f.req ? '<span class="req">*</span>' : '';
    let input;

    if (f.type === 'select') {
      const allOpt = f.all ? `<option value="">${esc(f.all)}</option>` : '';
      let opts;
      if (f.rel) {
        opts = (state.relatedData[f.rel] || []).map((r) =>
          `<option value="${r.id}"${String(v) === String(r.id) ? ' selected' : ''}>${esc(r.name)}</option>`
        ).join('');
      } else {
        opts = (f.opts || []).map((o) =>
          `<option value="${o.v}"${String(v) === String(o.v) ? ' selected' : ''}>${esc(o.l)}</option>`
        ).join('');
      }
      input = `<select name="${f.k}" class="adm-input"${req}>${allOpt}${opts}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea name="${f.k}" class="adm-input" rows="${f.rows || 3}" placeholder="${esc(f.ph || '')}"${req}>${esc(v != null ? v : '')}</textarea>`;
    } else if (f.type === 'datetime-local') {
      let dtv = '';
      if (v) { try { dtv = new Date(v).toISOString().slice(0, 16); } catch (e2) { /* ignore */ } }
      input = `<input type="datetime-local" name="${f.k}" class="adm-input" value="${esc(dtv)}"${req}>`;
    } else {
      input = `<input type="${f.type}" name="${f.k}" class="adm-input" value="${esc(v != null ? v : '')}" placeholder="${esc(f.ph || '')}"${req}>`;
    }
    return `<div class="adm-form-row"><label>${esc(f.l)} ${reqMk}</label>${input}</div>`;
  };

  const collectForm = (formId, fields) => {
    const form = document.getElementById(formId);
    if (!form) return { data: {}, errors: ['表单未找到'] };
    const errors = [];
    const data   = {};
    fields.forEach((f) => {
      const el = form.querySelector(`[name="${f.k}"]`);
      if (!el) return;
      const v = el.value.trim();
      if (f.req && !v) {
        errors.push(`${f.l} 不能为空`);
        el.classList.add('invalid');
      } else {
        el.classList.remove('invalid');
        if (v !== '') {
          data[f.k] = f.type === 'number' ? (parseFloat(v) || 0) : v;
        }
      }
    });
    return { data, errors };
  };

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================
  const openCreate = () => {
    const mod = MODULES[state.currentModule];
    if (!mod || !mod.formFields) return;
    state.editId = null;
    const body = `<form id="admForm">${mod.formFields.map((f) => renderFormField(f, {})).join('')}</form>`;
    openModal(`新增${mod.label}`, body, doSubmit);
  };

  const openEdit = async (mod, row) => {
    state.editId = row.id;
    try {
      const detail = await callApi(`${mod.api}/${row.id}`);
      const body   = `<form id="admForm">${mod.formFields.map((f) => renderFormField(f, detail)).join('')}</form>`;
      openModal(`编辑${mod.label}`, body, doSubmit);
    } catch (e) {
      toast(`加载详情失败：${e.message}`, 'error');
    }
  };

  const openView = (mod, row) => {
    const rows = (mod.viewFields || []).map((f) => {
      const v = row[f.k];
      return `<div class="adm-view-row"><span class="adm-view-label">${esc(f.l)}</span><span class="adm-view-val">${esc(v != null ? String(v) : '-')}</span></div>`;
    }).join('');
    openModal('查看详情', `<div class="adm-view-detail">${rows}</div>`, null, false);
  };

  const openReply = (mod, row) => {
    state.editId = row.id;
    const viewRows = (mod.viewFields || []).map((f) => {
      const v = row[f.k];
      return `<div class="adm-view-row"><span class="adm-view-label">${esc(f.l)}</span><span class="adm-view-val">${esc(v != null ? String(v) : '-')}</span></div>`;
    }).join('');
    const replyForm = `<form id="admForm">${(mod.replyFields || []).map((f) => renderFormField(f, row)).join('')}</form>`;
    const body = `
      <div class="adm-view-detail">${viewRows}</div>
      <div class="adm-reply-section"><h4>回复 / 处理</h4>${replyForm}</div>`;
    openModal(`处理${mod.label}`, body, () => doReply(mod));
  };

  const setSubmitBusy = (busy) => {
    const btn = document.getElementById('admModalSubmit');
    if (!btn) return;
    btn.disabled    = busy;
    btn.textContent = busy ? '提交中...' : '确认';
  };

  const doSubmit = async () => {
    const mod = MODULES[state.currentModule];
    if (!mod) return;
    const { data, errors } = collectForm('admForm', mod.formFields);
    if (errors.length) { toast(errors[0], 'error'); return; }
    setSubmitBusy(true);
    try {
      if (state.editId) {
        await callApi(`${mod.api}/${state.editId}`, { method: 'PUT', body: JSON.stringify(data) });
        toast('更新成功 ✓');
      } else {
        await callApi(mod.api, { method: 'POST', body: JSON.stringify(data) });
        toast('新增成功 ✓');
      }
      closeModal();
      await fetchList();
    } catch (e) {
      toast(e.message || '操作失败', 'error');
    } finally {
      setSubmitBusy(false);
    }
  };

  const doReply = async (mod) => {
    const { data, errors } = collectForm('admForm', mod.replyFields);
    if (errors.length) { toast(errors[0], 'error'); return; }
    setSubmitBusy(true);
    try {
      await callApi(mod.replyApi(state.editId), { method: mod.replyMethod || 'PUT', body: JSON.stringify(data) });
      toast('处理成功 ✓');
      closeModal();
      await fetchList();
    } catch (e) {
      toast(e.message || '操作失败', 'error');
    } finally {
      setSubmitBusy(false);
    }
  };

  const doToggle = async (mod, row) => {
    const newStatus = row.status == 1 ? 0 : 1;
    try {
      await callApi(`${mod.api}/${row.id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      toast(newStatus == 1 ? '已启用 ✓' : '已停用');
      await fetchList();
    } catch (e) {
      toast(e.message || '操作失败', 'error');
    }
  };

  const doDelete = (mod, id) => {
    confirm('确认要删除这条记录吗？删除后数据不可恢复。', async () => {
      try {
        await callApi(`${mod.api}/${id}`, { method: 'DELETE' });
        toast('删除成功 ✓');
        await fetchList();
      } catch (e) {
        toast(e.message || '删除失败', 'error');
      }
    });
  };

  // =====================================================
  // AUTH
  // =====================================================
  const login = async () => {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;
    const errEl    = document.getElementById('loginErr');
    errEl.textContent = '';

    if (!username) { errEl.textContent = '请输入用户名'; return; }
    if (!password) { errEl.textContent = '请输入密码';   return; }

    const btn = document.getElementById('btnLogin');
    btn.disabled    = true;
    btn.textContent = '登录中...';

    try {
      const res = await callApi('login', { method: 'POST', body: JSON.stringify({ username, password }) });
      if (!res.token) throw new Error('未返回登录令牌');
      state.token = res.token;
      localStorage.setItem('adm_token', res.token);
      document.getElementById('loginPage').style.display  = 'none';
      document.getElementById('adminPage').style.display  = 'flex';
      document.getElementById('admUsername').textContent  = res.username || username;
      await switchModule('news-categories');
    } catch (e) {
      errEl.textContent = e.message || '登录失败，请检查用户名和密码';
    } finally {
      btn.disabled    = false;
      btn.textContent = '登录';
    }
  };

  const doLogout = () => {
    state.token         = '';
    state.currentModule = null;
    state.relatedData   = {};
    localStorage.removeItem('adm_token');
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('loginPass').value         = '';
  };

  const logout = () => {
    confirm('确认退出登录？', doLogout, '确认退出');
  };

  // =====================================================
  // INIT
  // =====================================================
  const init = () => {
    renderSidebar();

    if (state.token) {
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('adminPage').style.display = 'flex';
      switchModule('news-categories');
    }

    document.getElementById('loginPass').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') login();
    });
    document.getElementById('admModal').addEventListener('mousedown', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('admConfirm').addEventListener('mousedown', (e) => {
      if (e.target === e.currentTarget) closeConfirm();
    });
  };

  // Public API
  return { login, logout, toggleGroup, closeModal, closeConfirm, openCreate, _reload: fetchList, init };
})();

adminApp.init();

