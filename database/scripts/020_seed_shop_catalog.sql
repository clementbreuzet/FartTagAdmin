:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

-- InventoryItemCategory: Title=1, ProfileFrame=2, DetectionEffect=3, Sticker=4, MythicItem=5
-- LootBoxRarity: Common=1, Rare=2, Epic=3, Legendary=4, Mythic=5
DECLARE @Items TABLE (
    Id uniqueidentifier NOT NULL,
    Name nvarchar(120) NOT NULL,
    Category int NOT NULL,
    Rarity int NOT NULL,
    AssetKey nvarchar(250) NULL,
    Description nvarchar(500) NULL,
    IsTradable bit NOT NULL
);

INSERT INTO @Items (Id, Name, Category, Rarity, AssetKey, Description, IsTradable) VALUES
('40000000-0000-0000-0000-000000000001', N'Souffle Debutant', 1, 1, N'title-beginner-breath', N'Titre commun pour commencer.', 1),
('40000000-0000-0000-0000-000000000002', N'Maitre du Gaz', 1, 2, N'title-gas-master', N'Titre rare reserve aux connaisseurs.', 1),
('40000000-0000-0000-0000-000000000003', N'Architecte Sonore', 1, 3, N'title-sound-architect', N'Titre epique pour les performances memorables.', 1),
('40000000-0000-0000-0000-000000000004', N'Legende Atmospherique', 1, 4, N'title-atmospheric-legend', N'Titre legendaire.', 1),
('40000000-0000-0000-0000-000000000005', N'Entite Mythique', 1, 5, N'title-mythic-entity', N'Titre mythique ultime.', 0),
('40000000-0000-0000-0000-000000000006', N'Cadre Neon Vert', 2, 1, N'frame-neon-green', N'Cadre de profil neon vert.', 1),
('40000000-0000-0000-0000-000000000007', N'Cadre Plasma Cyan', 2, 2, N'frame-plasma-cyan', N'Cadre de profil plasma cyan.', 1),
('40000000-0000-0000-0000-000000000008', N'Cadre Vortex Violet', 2, 3, N'frame-vortex-purple', N'Cadre de profil vortex violet.', 1),
('40000000-0000-0000-0000-000000000009', N'Cadre Couronne Solaire', 2, 4, N'frame-solar-crown', N'Cadre legendaire lumineux.', 1),
('40000000-0000-0000-0000-000000000010', N'Cadre Singularite', 2, 5, N'frame-singularity', N'Cadre mythique anime.', 0),
('40000000-0000-0000-0000-000000000011', N'Effet Etincelle', 3, 1, N'effect-spark', N'Effet de detection commun.', 1),
('40000000-0000-0000-0000-000000000012', N'Effet Nuage Toxique', 3, 2, N'effect-toxic-cloud', N'Effet de detection rare.', 1),
('40000000-0000-0000-0000-000000000013', N'Effet Onde Cosmique', 3, 3, N'effect-cosmic-wave', N'Effet de detection epique.', 1),
('40000000-0000-0000-0000-000000000014', N'Effet Supernova', 3, 4, N'effect-supernova', N'Effet de detection legendaire.', 1),
('40000000-0000-0000-0000-000000000015', N'Effet Trou Noir', 3, 5, N'effect-black-hole', N'Effet de detection mythique.', 0),
('40000000-0000-0000-0000-000000000016', N'Sticker Pouet', 4, 1, N'sticker-pouet', N'Sticker commun.', 1),
('40000000-0000-0000-0000-000000000017', N'Sticker Gaz Noble', 4, 2, N'sticker-noble-gas', N'Sticker rare.', 1),
('40000000-0000-0000-0000-000000000018', N'Reacteur a Gaz', 5, 5, N'mythic-gas-reactor', N'Objet mythique de collection.', 0);

UPDATE target
SET Category = source.Category,
    Rarity = source.Rarity,
    AssetKey = source.AssetKey,
    Description = source.Description,
    IsTradable = source.IsTradable,
    UpdatedAt = SYSUTCDATETIME()
FROM dbo.InventoryItems target
JOIN @Items source ON source.Name = target.Name
WHERE target.Category <> source.Category
   OR target.Rarity <> source.Rarity
   OR ISNULL(target.AssetKey, N'') <> ISNULL(source.AssetKey, N'')
   OR ISNULL(target.Description, N'') <> ISNULL(source.Description, N'')
   OR target.IsTradable <> source.IsTradable;

INSERT INTO dbo.InventoryItems (Id, Name, Category, Rarity, AssetKey, Description, IsTradable)
SELECT source.Id, source.Name, source.Category, source.Rarity, source.AssetKey, source.Description, source.IsTradable
FROM @Items source
WHERE NOT EXISTS (SELECT 1 FROM dbo.InventoryItems target WHERE target.Name = source.Name);

DECLARE @Boxes TABLE (
    Id uniqueidentifier NOT NULL,
    Name nvarchar(120) NOT NULL,
    Description nvarchar(500) NOT NULL,
    PriceFlatulons int NOT NULL
);

INSERT INTO @Boxes (Id, Name, Description, PriceFlatulons) VALUES
('50000000-0000-0000-0000-000000000001', N'Coffre commun', N'Une selection accessible de recompenses communes et rares.', 500),
('50000000-0000-0000-0000-000000000002', N'Coffre rare', N'Des recompenses rares avec une chance epique.', 1500),
('50000000-0000-0000-0000-000000000003', N'Coffre epique', N'Des recompenses epiques avec une chance legendaire.', 3500),
('50000000-0000-0000-0000-000000000004', N'Coffre legendaire', N'Des recompenses legendaires avec une chance mythique.', 7500),
('50000000-0000-0000-0000-000000000005', N'Coffre mythique', N'Le meilleur du catalogue FartTag Social.', 12000);

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

DECLARE @Rewards TABLE (
    Id uniqueidentifier NOT NULL,
    BoxName nvarchar(120) NOT NULL,
    ItemName nvarchar(120) NOT NULL,
    Rarity int NOT NULL,
    Weight decimal(18,4) NOT NULL,
    Compensation int NOT NULL
);

INSERT INTO @Rewards (Id, BoxName, ItemName, Rarity, Weight, Compensation) VALUES
('60000000-0000-0000-0000-000000000001', N'Coffre commun', N'Souffle Debutant', 1, 40, 50),
('60000000-0000-0000-0000-000000000002', N'Coffre commun', N'Cadre Neon Vert', 1, 30, 50),
('60000000-0000-0000-0000-000000000003', N'Coffre commun', N'Effet Etincelle', 1, 20, 50),
('60000000-0000-0000-0000-000000000004', N'Coffre commun', N'Maitre du Gaz', 2, 10, 150),
('60000000-0000-0000-0000-000000000005', N'Coffre rare', N'Maitre du Gaz', 2, 35, 150),
('60000000-0000-0000-0000-000000000006', N'Coffre rare', N'Cadre Plasma Cyan', 2, 30, 150),
('60000000-0000-0000-0000-000000000007', N'Coffre rare', N'Effet Nuage Toxique', 2, 25, 150),
('60000000-0000-0000-0000-000000000008', N'Coffre rare', N'Architecte Sonore', 3, 10, 400),
('60000000-0000-0000-0000-000000000009', N'Coffre epique', N'Architecte Sonore', 3, 35, 400),
('60000000-0000-0000-0000-000000000010', N'Coffre epique', N'Cadre Vortex Violet', 3, 30, 400),
('60000000-0000-0000-0000-000000000011', N'Coffre epique', N'Effet Onde Cosmique', 3, 25, 400),
('60000000-0000-0000-0000-000000000012', N'Coffre epique', N'Legende Atmospherique', 4, 10, 1000),
('60000000-0000-0000-0000-000000000013', N'Coffre legendaire', N'Legende Atmospherique', 4, 35, 1000),
('60000000-0000-0000-0000-000000000014', N'Coffre legendaire', N'Cadre Couronne Solaire', 4, 30, 1000),
('60000000-0000-0000-0000-000000000015', N'Coffre legendaire', N'Effet Supernova', 4, 25, 1000),
('60000000-0000-0000-0000-000000000016', N'Coffre legendaire', N'Entite Mythique', 5, 10, 3000),
('60000000-0000-0000-0000-000000000017', N'Coffre mythique', N'Entite Mythique', 5, 30, 3000),
('60000000-0000-0000-0000-000000000018', N'Coffre mythique', N'Cadre Singularite', 5, 25, 3000),
('60000000-0000-0000-0000-000000000019', N'Coffre mythique', N'Effet Trou Noir', 5, 25, 3000),
('60000000-0000-0000-0000-000000000020', N'Coffre mythique', N'Reacteur a Gaz', 5, 20, 5000);

UPDATE target
SET Rarity = source.Rarity,
    Weight = source.Weight,
    DuplicateCompensationFlatulons = source.Compensation,
    IsActive = 1,
    UpdatedAt = SYSUTCDATETIME()
FROM dbo.LootBoxRewards target
JOIN dbo.LootBoxes boxItem ON boxItem.Id = target.LootBoxId
JOIN dbo.InventoryItems inventoryItem ON inventoryItem.Id = target.InventoryItemId
JOIN @Rewards source ON source.BoxName = boxItem.Name AND source.ItemName = inventoryItem.Name
WHERE target.Rarity <> source.Rarity
   OR target.Weight <> source.Weight
   OR target.DuplicateCompensationFlatulons <> source.Compensation
   OR target.IsActive = 0;

INSERT INTO dbo.LootBoxRewards (
    Id, LootBoxId, InventoryItemId, Rarity, Weight, DuplicateCompensationFlatulons, IsActive
)
SELECT source.Id, boxItem.Id, inventoryItem.Id, source.Rarity, source.Weight, source.Compensation, 1
FROM @Rewards source
JOIN dbo.LootBoxes boxItem ON boxItem.Name = source.BoxName
JOIN dbo.InventoryItems inventoryItem ON inventoryItem.Name = source.ItemName
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.LootBoxRewards target
    WHERE target.LootBoxId = boxItem.Id AND target.InventoryItemId = inventoryItem.Id
);

COMMIT TRANSACTION;
GO
