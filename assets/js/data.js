window.DEMO_DATA = {
  ads: {
    HOME_TOP_BANNER: [
      { title: "顶部广告1", imageUrl: "https://picsum.photos/1200/320?random=11", linkUrl: "#" },
      { title: "顶部广告2", imageUrl: "https://picsum.photos/1200/320?random=12", linkUrl: "#" },
      { title: "顶部广告3", imageUrl: "https://picsum.photos/1200/320?random=13", linkUrl: "#" }
    ],
    HOME_MID_BANNER: [
      { title: "中部通栏", imageUrl: "https://picsum.photos/1200/120?random=21", linkUrl: "#" }
    ],
    HOME_BOTTOM_BANNER: [
      { title: "底部通栏", imageUrl: "https://picsum.photos/1200/120?random=31", linkUrl: "#" }
    ]
  },

  experts: [
    { id: 1, name: "任广智", title: "高级顾问", avatarUrl: "https://picsum.photos/120/150?random=41", summary: "中南大学地勘专业，长期从事矿业评估与管理咨询。" },
    { id: 2, name: "王建国", title: "高级工程师", avatarUrl: "https://picsum.photos/120/150?random=42", summary: "专注矿山安全与智能化开采技术，具备多项目实战经验。" },
    { id: 3, name: "李海峰", title: "投融资顾问", avatarUrl: "https://picsum.photos/120/150?random=43", summary: "擅长矿权投融资、资源整合与尽调风控方案设计。" }
  ],

  products: [
    { id: 101, title: "矿权评估服务", cover: "https://picsum.photos/400/260?random=51", summary: "为矿业项目提供价值评估、交易定价支持与合规建议。" },
    { id: 102, title: "矿业数据报告", cover: "https://picsum.photos/400/260?random=52", summary: "覆盖政策、资源、市场、技术等多维度行业分析报告。" },
    { id: 103, title: "矿山技术咨询", cover: "https://picsum.photos/400/260?random=53", summary: "矿山规划、采选优化、安全环保与智能化建设咨询。" },
    { id: 104, title: "项目投融资顾问", cover: "https://picsum.photos/400/260?random=54", summary: "项目路演材料、融资结构、合作撮合与实施落地支持。" }
  ],

  news: [
    { id: 201, title: "某省发布新一轮矿产资源规划政策解读", date: "2026-04-10", summary: "围绕矿产资源配置、开发强度与生态保护提出新要求。" },
    { id: 202, title: "矿山智能化建���提速，行业迎来升级窗口", date: "2026-04-08", summary: "智能调度、无人巡检、数字孪生等技术加速落地。" },
    { id: 203, title: "矿权融资需求增长，项目筛选趋于精细化", date: "2026-04-06", summary: "机构关注储量真实性、现金流与合规能力三大指标。" },
    { id: 204, title: "绿色矿山标准持续完善，企业进入提质期", date: "2026-04-03", summary: "环保指标与能耗管控将成为核心竞争力之一。" }
  ],

  gallery: Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `企业活动照片 ${i + 1}`,
    url: `https://picsum.photos/480/320?random=${70 + i}`
  })),

  finance: [
    { id: 301, title: "内蒙古某煤矿项目融资", mineralType: "煤矿", region: "内蒙古·鄂尔多斯", amount: "5000万元", date: "2026-04-15", content: "证照齐全，储量稳定，拟用于设备升级与产线扩建。" },
    { id: 302, title: "新疆某金矿扩产项目", mineralType: "金矿", region: "新疆·伊犁", amount: "8000万元", date: "2026-04-12", content: "现有采选体系完善，计划扩建选矿线并优化环保设施。" },
    { id: 303, title: "广西某铅锌矿技改融资", mineralType: "铅锌矿", region: "广西·河池", amount: "3000万元", date: "2026-04-09", content: "拟引入资金用于尾矿治理、节能改造与自动化升级。" }
  ]
};