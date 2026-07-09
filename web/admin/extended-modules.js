// 在 admin/panel.js 中添加新的模块配置

const ADMIN_MODULES_EXTENDED = {
  'mining-trade': {
    label: '矿权交易',
    api: 'mining-trade',
    canToggle: true,
    searchFields: [
      { k: 'province', l: '省份', type: 'text', ph: '如：山西' },
      { k: 'status',   l: '状态', type: 'select', opts: [{ v: '', l: '全部状态' }, { v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
    listCols: [
      { k: 'id',          l: 'ID',       w: '60px' },
      { k: 'title',       l: '标题' },
      { k: 'province',    l: '省份',     w: '80px' },
      { k: 'price',       l: '价格(万)',  curr: true },
      { k: 'status',      l: '状态',     badge: 'status' },
      { k: 'publish_time', l: '发布时间', date: true },
    ],
    formFields: [
      { k: 'title',       l: '矿权标题',  type: 'text',    req: true, ph: '请输入矿权标题' },
      { k: 'province',    l: '省份',      type: 'text',    ph: '如：山西' },
      { k: 'city',        l: '城市',      type: 'text',    ph: '如：太原' },
      { k: 'content',     l: '详细描述',  type: 'textarea', ph: '请输入矿权详细描述', rows: 6 },
      { k: 'image',       l: '图片URL',   type: 'text',    ph: '请输入图片链接' },
      { k: 'price',       l: '价格(万元)', type: 'number',  ph: '请输入参考价格' },
      { k: 'publish_time', l: '发布时间', type: 'datetime-local' },
      { k: 'sort',        l: '排序',      type: 'number',  ph: '数字越小越靠前' },
      { k: 'status',      l: '状态',      type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
  },

  'supply-demand': {
    label: '供求商机',
    api: 'supply-demand',
    canToggle: true,
    searchFields: [
      { k: 'category', l: '类型', type: 'select', opts: [{ v: '', l: '全部' }, { v: '供应', l: '供应' }, { v: '求购', l: '求购' }] },
      { k: 'status',   l: '状态', type: 'select', opts: [{ v: '', l: '全部状态' }, { v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
    listCols: [
      { k: 'id',       l: 'ID',     w: '60px' },
      { k: 'title',    l: '标题' },
      { k: 'category', l: '类型',   w: '80px' },
      { k: 'product',  l: '产品',   w: '100px' },
      { k: 'status',   l: '状态',   badge: 'status' },
    ],
    formFields: [
      { k: 'title',     l: '标题',      type: 'text',   req: true, ph: '请输入商机标题' },
      { k: 'category',  l: '类型',      type: 'select', opts: [{ v: '供应', l: '供应' }, { v: '求购', l: '求购' }] },
      { k: 'product',   l: '产品名称',  type: 'text',   req: true, ph: '请输入产品名称' },
      { k: 'quantity',  l: '数量',      type: 'text',   ph: '如：100吨' },
      { k: 'price',     l: '价格',      type: 'text',   ph: '如：1000元/吨' },
      { k: 'contact',   l: '联系人',    type: 'text' },
      { k: 'phone',     l: '电话',      type: 'tel' },
      { k: 'content',   l: '详细描述',  type: 'textarea', ph: '请输入详细描述', rows: 5 },
      { k: 'sort',      l: '排序',      type: 'number' },
      { k: 'status',    l: '状态',      type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
  },

  'market-quote': {
    label: '市场行情',
    api: 'market-quote',
    canToggle: false,
    listCols: [
      { k: 'id',             l: 'ID',         w: '60px' },
      { k: 'mineral',        l: '矿物名称' },
      { k: 'current_price',  l: '当前价格' },
      { k: 'high_price',     l: '最高价' },
      { k: 'low_price',      l: '最低价' },
      { k: 'change_percent', l: '涨跌��' },
      { k: 'updated_at',     l: '更新时间', date: true },
    ],
    formFields: [
      { k: 'mineral',        l: '矿物名称',  type: 'text',   req: true },
      { k: 'current_price',  l: '当前价格',  type: 'number' },
      { k: 'high_price',     l: '最高价格',  type: 'number' },
      { k: 'low_price',      l: '最低价格',  type: 'number' },
      { k: 'change_percent', l: '涨跌幅(%)', type: 'number' },
      { k: 'unit',           l: '单位',      type: 'text' },
      { k: 'source',         l: '数据来源',  type: 'text' },
    ],
  },

  'academy': {
    label: '矿业学堂',
    api: 'academy',
    canToggle: true,
    searchFields: [
      { k: 'category', l: '分类', type: 'text', ph: '如：政策解读' },
      { k: 'status',   l: '状态', type: 'select', opts: [{ v: '', l: '全部状态' }, { v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
    listCols: [
      { k: 'id',       l: 'ID',   w: '60px' },
      { k: 'title',    l: '标题' },
      { k: 'category', l: '分类' },
      { k: 'author',   l: '作者' },
      { k: 'status',   l: '状态', badge: 'status' },
      { k: 'views',    l: '浏览', w: '80px' },
    ],
    formFields: [
      { k: 'title',       l: '标题',      type: 'text',    req: true, ph: '请输入学堂标题' },
      { k: 'category',    l: '分类',      type: 'text',    ph: '如：政策解读' },
      { k: 'author',      l: '作者',      type: 'text' },
      { k: 'content',     l: '内容',      type: 'textarea', ph: '请输入详细内容', rows: 8 },
      { k: 'image',       l: '封面图',    type: 'text' },
      { k: 'publish_time', l: '发布时间', type: 'datetime-local' },
      { k: 'sort',        l: '排序',      type: 'number' },
      { k: 'status',      l: '状态',      type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
  },

  'vip-member': {
    label: 'VIP会员',
    api: 'vip-member',
    canToggle: true,
    listCols: [
      { k: 'id',    l: 'ID',   w: '60px' },
      { k: 'level', l: '等级' },
      { k: 'price', l: '价格' },
      { k: 'status', l: '状态', badge: 'status' },
    ],
    formFields: [
      { k: 'level',    l: '等级',     type: 'select', opts: [{ v: '基础', l: '基础VIP' }, { v: '高级', l: '高级VIP' }, { v: '尊享', l: '尊享VIP' }] },
      { k: 'price',    l: '价格',     type: 'number', ph: '请输入会员价格' },
      { k: 'benefits', l: '会员权益',  type: 'textarea', ph: '请输入会员权益说明', rows: 4 },
      { k: 'status',   l: '状态',     type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
  },

  'friendly-link': {
    label: '友情链接',
    api: 'friendly-link',
    canToggle: true,
    listCols: [
      { k: 'id',   l: 'ID',   w: '60px' },
      { k: 'name', l: '链接名称' },
      { k: 'url',  l: '链接地址', trunc: true },
      { k: 'status', l: '状态', badge: 'status' },
    ],
    formFields: [
      { k: 'name',   l: '链接名称', type: 'text', req: true, ph: '请输入友链名称' },
      { k: 'url',    l: '链接地址', type: 'text', req: true, ph: '请输入完整URL' },
      { k: 'logo',   l: 'LOGO链接', type: 'text', ph: '请输入LOGO图片URL' },
      { k: 'sort',   l: '排序',     type: 'number' },
      { k: 'status', l: '状态',     type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
  },

  'strategic-partner': {
    label: '战略合作伙伴',
    api: 'strategic-partner',
    canToggle: true,
    listCols: [
      { k: 'id',   l: 'ID',   w: '60px' },
      { k: 'name', l: '合作伙伴名称' },
      { k: 'website', l: '官网', trunc: true },
      { k: 'status', l: '状态', badge: 'status' },
    ],
    formFields: [
      { k: 'name',    l: '伙伴名称', type: 'text', req: true, ph: '请输入伙伴名称' },
      { k: 'logo',    l: 'LOGO',    type: 'text', ph: '请输入LOGO链接' },
      { k: 'website', l: '官方网站', type: 'text', ph: '请输入官方网址' },
      { k: 'sort',    l: '排序',    type: 'number' },
      { k: 'status',  l: '状态',    type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
  },

  'contact-info': {
    label: '在线客服',
    api: 'contact-info',
    canToggle: true,
    listCols: [
      { k: 'id',   l: 'ID',   w: '60px' },
      { k: 'type', l: '类型' },
      { k: 'value', l: '值', trunc: true },
      { k: 'status', l: '状态', badge: 'status' },
    ],
    formFields: [
      { k: 'type',    l: '客服类型', type: 'select', opts: [{ v: 'wechat', l: '微信' }, { v: 'qq', l: 'QQ' }, { v: 'phone', l: '电话' }] },
      { k: 'value',   l: '值',      type: 'text', ph: '微信/QQ号或电话' },
      { k: 'qr_code', l: '二维码',  type: 'text', ph: '二维码图片URL' },
      { k: 'status',  l: '状态',    type: 'select', opts: [{ v: 1, l: '启用' }, { v: 0, l: '停用' }] },
    ],
  },
};

// 将扩展模块添加到 MODULES 对象
Object.assign(MODULES, ADMIN_MODULES_EXTENDED);

// 更新 SIDEBAR_GROUPS 添加新的分组
const EXTENDED_SIDEBAR_GROUPS = [
  {
    id: 'platform', label: '平台功能', icon: '🏢',
    items: [
      { key: 'mining-trade', label: '矿权交易' },
      { key: 'supply-demand', label: '供求商机' },
      { key: 'market-quote', label: '市场行情' },
      { key: 'academy', label: '矿业学堂' },
      { key: 'vip-member', label: 'VIP会员' },
    ],
  },
  {
    id: 'links', label: '链接管理', icon: '🔗',
    items: [
      { key: 'friendly-link', label: '友情链接' },
      { key: 'strategic-partner', label: '战略合作伙伴' },
    ],
  },
  {
    id: 'service', label: '客服管理', icon: '📞',
    items: [
      { key: 'contact-info', label: '在线客服' },
    ],
  },
];
