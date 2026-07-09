package migrations

import "gorm.io/gorm"

func MigrateExtendedModels(db *gorm.DB) error {
    return db.AutoMigrate(
        &MiningTrade{},
        &SupplyDemand{},
        &MarketQuote{},
        &Academy{},
        &VIPMember{},
        &FriendlyLink{},
        &StrategicPartner{},
        &ContactInfo{},
    )
}
