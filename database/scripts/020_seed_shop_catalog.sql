:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

-- V0 shop: simple rewards only. No skins, no marketplace, no player trading.
-- InventoryItemCategory: MythicItem=5
-- LootBoxRarity: Common=1, Rare=2, Epic=3, Legendary=4, Mythic=5
DECLARE @Items TABLE (
    Id uniqueidentifier NOT NULL,
    Name nvarchar(120) NOT NULL,
    Rarity int NOT NULL,
    Description nvarchar(500) NOT NULL
);

INSERT INTO @Items (Id, Name, Rarity, Description) VALUES
('40000000-0000-0000-0000-000000000001', N'Recompense commune', 1, N'Recompense simple du coffre commun.'),
('40000000-0000-0000-0000-000000000002', N'Recompense rare', 2, N'Recompense simple du coffre rare.'),
('40000000-0000-0000-0000-000000000003', N'Recompense epique', 3, N'Recompense simple du coffre epique.'),
('40000000-0000-0000-0000-000000000004', N'Recompense legendaire', 4, N'Recompense simple du coffre legendaire.'),
('40000000-0000-0000-0000-000000000005', N'Recompense mythique', 5, N'Recompense simple du coffre mythique.');

UPDATE target
SET Category = 5,
    Rarity = source.Rarity,
    AssetKey = NULL,
    Description = source.Description,
    IsTradable = 0,
    UpdatedAt = SYSUTCDATETIME()
FROM dbo.InventoryItems target
JOIN @Items source ON source.Name = target.Name
WHERE target.Category <> 5
   OR target.Rarity <> source.Rarity
   OR target.AssetKey IS NOT NULL
   OR ISNULL(target.Description, N'') <> source.Description
   OR target.IsTradable <> 0;

INSERT INTO dbo.InventoryItems (Id, Name, Category, Rarity, AssetKey, Description, IsTradable)
SELECT source.Id, source.Name, 5, source.Rarity, NULL, source.Description, 0
FROM @Items source
WHERE NOT EXISTS (SELECT 1 FROM dbo.InventoryItems target WHERE target.Name = source.Name);

DECLARE @Boxes TABLE (
    Id uniqueidentifier NOT NULL,
    Name nvarchar(120) NOT NULL,
    Description nvarchar(500) NOT NULL,
    PriceFlatulons int NOT NULL,
    Rarity int NOT NULL,
    ItemName nvarchar(120) NOT NULL,
    Compensation int NOT NULL
);

INSERT INTO @Boxes (Id, Name, Description, PriceFlatulons, Rarity, ItemName, Compensation) VALUES
('50000000-0000-0000-0000-000000000001', N'Coffre commun', N'Coffre simple pour demarrer.', 500, 1, N'Recompense commune', 50),
('50000000-0000-0000-0000-000000000002', N'Coffre rare', N'Coffre simple avec une recompense rare.', 1500, 2, N'Recompense rare', 150),
('50000000-0000-0000-0000-000000000003', N'Coffre epique', N'Coffre simple avec une recompense epique.', 3500, 3, N'Recompense epique', 400),
('50000000-0000-0000-0000-000000000004', N'Coffre legendaire', N'Coffre simple avec une recompense legendaire.', 7500, 4, N'Recompense legendaire', 1000),
('50000000-0000-0000-0000-000000000005', N'Coffre mythique', N'Coffre simple avec une recompense mythique.', 12000, 5, N'Recompense mythique', 3000);

UPDATE target
SET Description = source.Description,
    PriceFlatulons = source.PriceFlatulons,
    IsActive = 1,
    UpdatedAt = SYSUTCDATETIME()
FROM dbo.LootBoxes target
JOIN @Boxes source ON source.Name = target.Name
WHERE target.Description <> source.Description
   OR target.PriceFlatulons <> source.PriceFlatulons
   OR target.IsActive = 0;

INSERT INTO dbo.LootBoxes (Id, Name, Description, PriceFlatulons, IsActive)
SELECT source.Id, source.Name, source.Description, source.PriceFlatulons, 1
FROM @Boxes source
WHERE NOT EXISTS (SELECT 1 FROM dbo.LootBoxes target WHERE target.Name = source.Name);

UPDATE target
SET IsActive = 0,
    UpdatedAt = SYSUTCDATETIME()
FROM dbo.LootBoxRewards target
WHERE NOT EXISTS (
    SELECT 1
    FROM @Boxes source
    JOIN dbo.LootBoxes boxItem ON boxItem.Name = source.Name
    JOIN dbo.InventoryItems inventoryItem ON inventoryItem.Name = source.ItemName
    WHERE target.LootBoxId = boxItem.Id AND target.InventoryItemId = inventoryItem.Id
);

UPDATE target
SET Rarity = source.Rarity,
    Weight = 100,
    DuplicateCompensationFlatulons = source.Compensation,
    IsActive = 1,
    UpdatedAt = SYSUTCDATETIME()
FROM dbo.LootBoxRewards target
JOIN dbo.LootBoxes boxItem ON boxItem.Id = target.LootBoxId
JOIN dbo.InventoryItems inventoryItem ON inventoryItem.Id = target.InventoryItemId
JOIN @Boxes source ON source.Name = boxItem.Name AND source.ItemName = inventoryItem.Name
WHERE target.Rarity <> source.Rarity
   OR target.Weight <> 100
   OR target.DuplicateCompensationFlatulons <> source.Compensation
   OR target.IsActive = 0;

INSERT INTO dbo.LootBoxRewards (
    Id, LootBoxId, InventoryItemId, Rarity, Weight, DuplicateCompensationFlatulons, IsActive
)
SELECT NEWID(), boxItem.Id, inventoryItem.Id, source.Rarity, 100, source.Compensation, 1
FROM @Boxes source
JOIN dbo.LootBoxes boxItem ON boxItem.Name = source.Name
JOIN dbo.InventoryItems inventoryItem ON inventoryItem.Name = source.ItemName
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.LootBoxRewards target
    WHERE target.LootBoxId = boxItem.Id AND target.InventoryItemId = inventoryItem.Id
);

COMMIT TRANSACTION;
GO
