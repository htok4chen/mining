package models

import "time"

// MiningTrade 矿权交易
type MiningTrade struct {
    ID          int       `json:"id" gorm:"primaryKey"`
    Title       string    `json:"title" gorm:"index"`
    Province    string    `json:"province"`
    City        string    `json:"city"`
    Content     string    `json:"content" gorm:"type:longtext"`
    Image       string    `json:"image"`
    Price       float64   `json:"price"`
    Status      int       `json:"status" gorm:"index"` // 0:停用 1:启用
    Sort        int       `json:"sort"`
    Views       int       `json:"views"`
    PublishTime time.Time `json:"publish_time"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

// SupplyDemand 供求商机
type SupplyDemand struct {
    ID          int       `json:"id" gorm:"primaryKey"`
    Title       string    `json:"title" gorm:"index"`
    Category    string    `json:"category"` // 供应/求购
    Product     string    `json:"product"`
    Quantity    string    `json:"quantity"`
    Price       string    `json:"price"`
    Contact     string    `json:"contact"`
    Phone       string    `json:"phone"`
    Content     string    `json:"content" gorm:"type:longtext"`
    Status      int       `json:"status" gorm:"index"`
    Sort        int       `json:"sort"`
    PublishTime time.Time `json:"publish_time"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

// MarketQuote 市场行情
type MarketQuote struct {
    ID          int       `json:"id" gorm:"primaryKey"`
    Mineral     string    `json:"mineral" gorm:"index"` // 矿物名称
    CurrentPrice float64  `json:"current_price"`
    PrevPrice   float64   `json:"prev_price"`
    ChangePercent float64 `json:"change_percent"`
    HighPrice   float64   `json:"high_price"`
    LowPrice    float64   `json:"low_price"`
    Unit        string    `json:"unit"` // 单位
    Source      string    `json:"source"`
    UpdatedAt   time.Time `json:"updated_at"`
}

// Academy 矿业学堂
type Academy struct {
    ID          int       `json:"id" gorm:"primaryKey"`
    Title       string    `json:"title" gorm:"index"`
    Category    string    `json:"category"`
    Content     string    `json:"content" gorm:"type:longtext"`
    Author      string    `json:"author"`
    Image       string    `json:"image"`
    Views       int       `json:"views"`
    Status      int       `json:"status" gorm:"index"`
    Sort        int       `json:"sort"`
    PublishTime time.Time `json:"publish_time"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

// VIPMember VIP会员
type VIPMember struct {
    ID          int       `json:"id" gorm:"primaryKey"`
    UserID      int       `json:"user_id" gorm:"index"`
    Level       string    `json:"level"` // 基础/高级/尊享
    Price       float64   `json:"price"`
    Benefits    string    `json:"benefits" gorm:"type:longtext"`
    StartDate   time.Time `json:"start_date"`
    EndDate     time.Time `json:"end_date"`
    Status      int       `json:"status"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

// FriendlyLink 友情链接
type FriendlyLink struct {
    ID        int       `json:"id" gorm:"primaryKey"`
    Name      string    `json:"name" gorm:"index"`
    URL       string    `json:"url"`
    Logo      string    `json:"logo"`
    Status    int       `json:"status" gorm:"index"`
    Sort      int       `json:"sort"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

// StrategicPartner 战略合作伙伴
type StrategicPartner struct {
    ID        int       `json:"id" gorm:"primaryKey"`
    Name      string    `json:"name" gorm:"index"`
    Logo      string    `json:"logo"`
    Website   string    `json:"website"`
    Status    int       `json:"status" gorm:"index"`
    Sort      int       `json:"sort"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

// ContactInfo 在线客服信息
type ContactInfo struct {
    ID          int       `json:"id" gorm:"primaryKey"`
    Type        string    `json:"type"` // wechat/qq/phone
    Value       string    `json:"value"`
    QRCode      string    `json:"qr_code"`
    Status      int       `json:"status"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
