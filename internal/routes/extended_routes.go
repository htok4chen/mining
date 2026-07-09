import (
    "mining/internal/api"
    "github.com/gin-gonic/gin"
)

func SetupExtendedRoutes(router *gin.Engine) {
    // 公开API路由
    api := router.Group("/api")
    {
        // 矿权交易
        api.GET("/mining-trade", api.GetMiningTrades)
        api.GET("/mining-trade/:id", api.GetMiningTradeDetail)
        
        // 供求商机
        api.GET("/supply-demand", api.GetSupplyDemands)
        
        // 市场行情
        api.GET("/market-quote", api.GetMarketQuotes)
        api.GET("/market-quote/:mineral", api.GetMarketQuoteDetail)
        
        // 矿业学堂
        api.GET("/academy", api.GetAcademyContent)
        api.GET("/academy/:id", api.GetAcademyDetail)
        
        // VIP会员
        api.GET("/vip-plans", api.GetVIPPlans)
        
        // 友情链接
        api.GET("/friendly-links", api.GetFriendlyLinks)
        
        // 战略合作伙伴
        api.GET("/partners", api.GetStrategicPartners)
        
        // 在线客服信息
        api.GET("/contact-info", api.GetContactInfo)
    }
    
    // 管理员API路由（需要认证）
    admin := router.Group("/api/admin")
    admin.Use(middlewares.AuthRequired())
    {
        // 矿权交易管理
        admin.GET("/mining-trade", handleCRUD(models.MiningTrade{}))
        admin.POST("/mining-trade", handleCreate(models.MiningTrade{}))
        admin.GET("/mining-trade/:id", handleRead(models.MiningTrade{}))
        admin.PUT("/mining-trade/:id", handleUpdate(models.MiningTrade{}))
        admin.DELETE("/mining-trade/:id", handleDelete(models.MiningTrade{}))
        
        // 供求商机管理
        admin.GET("/supply-demand", handleCRUD(models.SupplyDemand{}))
        admin.POST("/supply-demand", handleCreate(models.SupplyDemand{}))
        admin.GET("/supply-demand/:id", handleRead(models.SupplyDemand{}))
        admin.PUT("/supply-demand/:id", handleUpdate(models.SupplyDemand{}))
        admin.DELETE("/supply-demand/:id", handleDelete(models.SupplyDemand{}))
        
        // 市场行情管理
        admin.GET("/market-quote", handleCRUD(models.MarketQuote{}))
        admin.POST("/market-quote", handleCreate(models.MarketQuote{}))
        admin.PUT("/market-quote/:id", handleUpdate(models.MarketQuote{}))
        admin.DELETE("/market-quote/:id", handleDelete(models.MarketQuote{}))
        
        // 矿业学堂管理
        admin.GET("/academy", handleCRUD(models.Academy{}))
        admin.POST("/academy", handleCreate(models.Academy{}))
        admin.GET("/academy/:id", handleRead(models.Academy{}))
        admin.PUT("/academy/:id", handleUpdate(models.Academy{}))
        admin.DELETE("/academy/:id", handleDelete(models.Academy{}))
        
        // VIP会员管理
        admin.GET("/vip-member", handleCRUD(models.VIPMember{}))
        admin.POST("/vip-member", handleCreate(models.VIPMember{}))
        admin.PUT("/vip-member/:id", handleUpdate(models.VIPMember{}))
        admin.DELETE("/vip-member/:id", handleDelete(models.VIPMember{}))
        
        // 友情链接管理
        admin.GET("/friendly-link", handleCRUD(models.FriendlyLink{}))
        admin.POST("/friendly-link", handleCreate(models.FriendlyLink{}))
        admin.PUT("/friendly-link/:id", handleUpdate(models.FriendlyLink{}))
        admin.DELETE("/friendly-link/:id", handleDelete(models.FriendlyLink{}))
        
        // 战略合作伙伴管理
        admin.GET("/strategic-partner", handleCRUD(models.StrategicPartner{}))
        admin.POST("/strategic-partner", handleCreate(models.StrategicPartner{}))
        admin.PUT("/strategic-partner/:id", handleUpdate(models.StrategicPartner{}))
        admin.DELETE("/strategic-partner/:id", handleDelete(models.StrategicPartner{}))
        
        // 在线客服管理
        admin.GET("/contact-info", handleCRUD(models.ContactInfo{}))
        admin.POST("/contact-info", handleCreate(models.ContactInfo{}))
        admin.PUT("/contact-info/:id", handleUpdate(models.ContactInfo{}))
        admin.DELETE("/contact-info/:id", handleDelete(models.ContactInfo{}))
    }
}
