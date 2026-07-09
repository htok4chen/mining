package api

import (
    "net/http"
    "strconv"
    "github.com/gin-gonic/gin"
    "mining/internal/models"
    "mining/internal/db"
)

// MiningTradeAPI 矿权交易API
func GetMiningTrades(c *gin.Context) {
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "12"))
    province := c.Query("province")
    
    offset := (page - 1) * pageSize
    query := db.DB.Where("status = ?", 1)
    
    if province != "" {
        query = query.Where("province LIKE ?", "%"+province+"%")
    }
    
    var trades []models.MiningTrade
    var total int64
    
    query.Model(&models.MiningTrade{}).Count(&total)
    query.Offset(offset).Limit(pageSize).Order("sort ASC, publish_time DESC").Find(&trades)
    
    c.JSON(http.StatusOK, gin.H{
        "list":  trades,
        "total": total,
    })
}

func GetMiningTradeDetail(c *gin.Context) {
    id := c.Param("id")
    var trade models.MiningTrade
    
    if err := db.DB.First(&trade, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"message": "未找到该矿权信息"})
        return
    }
    
    // 增加浏览次数
    db.DB.Model(&trade).Update("views", trade.Views+1)
    
    c.JSON(http.StatusOK, trade)
}

// SupplyDemandAPI 供求商机API
func GetSupplyDemands(c *gin.Context) {
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "12"))
    category := c.Query("category")
    
    offset := (page - 1) * pageSize
    query := db.DB.Where("status = ?", 1)
    
    if category != "" {
        query = query.Where("category = ?", category)
    }
    
    var demands []models.SupplyDemand
    var total int64
    
    query.Model(&models.SupplyDemand{}).Count(&total)
    query.Offset(offset).Limit(pageSize).Order("sort ASC, publish_time DESC").Find(&demands)
    
    c.JSON(http.StatusOK, gin.H{
        "list":  demands,
        "total": total,
    })
}

// MarketQuoteAPI 市场行情API
func GetMarketQuotes(c *gin.Context) {
    var quotes []models.MarketQuote
    db.DB.Order("mineral ASC").Find(&quotes)
    
    c.JSON(http.StatusOK, gin.H{"list": quotes})
}

func GetMarketQuoteDetail(c *gin.Context) {
    mineral := c.Param("mineral")
    var quote models.MarketQuote
    
    if err := db.DB.Where("mineral = ?", mineral).First(&quote).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"message": "未找到该行情数据"})
        return
    }
    
    c.JSON(http.StatusOK, quote)
}

// AcademyAPI 矿业学堂API
func GetAcademyContent(c *gin.Context) {
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "12"))
    category := c.Query("category")
    
    offset := (page - 1) * pageSize
    query := db.DB.Where("status = ?", 1)
    
    if category != "" {
        query = query.Where("category = ?", category)
    }
    
    var contents []models.Academy
    var total int64
    
    query.Model(&models.Academy{}).Count(&total)
    query.Offset(offset).Limit(pageSize).Order("sort ASC, publish_time DESC").Find(&contents)
    
    c.JSON(http.StatusOK, gin.H{
        "list":  contents,
        "total": total,
    })
}

func GetAcademyDetail(c *gin.Context) {
    id := c.Param("id")
    var content models.Academy
    
    if err := db.DB.First(&content, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"message": "未找到该内容"})
        return
    }
    
    db.DB.Model(&content).Update("views", content.Views+1)
    c.JSON(http.StatusOK, content)
}

// VIPMemberAPI VIP会员API
func GetVIPPlans(c *gin.Context) {
    var vips []models.VIPMember
    db.DB.Where("status = ?", 1).Order("sort ASC").Find(&vips)
    
    c.JSON(http.StatusOK, gin.H{"list": vips})
}

// FriendlyLinkAPI 友情链接API
func GetFriendlyLinks(c *gin.Context) {
    var links []models.FriendlyLink
    db.DB.Where("status = ?", 1).Order("sort ASC").Find(&links)
    
    c.JSON(http.StatusOK, gin.H{"list": links})
}

// StrategicPartnerAPI 战略合作API
func GetStrategicPartners(c *gin.Context) {
    var partners []models.StrategicPartner
    db.DB.Where("status = ?", 1).Order("sort ASC").Find(&partners)
    
    c.JSON(http.StatusOK, gin.H{"list": partners})
}

// ContactInfoAPI 在线客服API
func GetContactInfo(c *gin.Context) {
    contactType := c.Query("type") // wechat/qq/phone
    var contacts []models.ContactInfo
    
    query := db.DB.Where("status = ?", 1)
    if contactType != "" {
        query = query.Where("type = ?", contactType)
    }
    
    query.Find(&contacts)
    c.JSON(http.StatusOK, gin.H{"list": contacts})
}
