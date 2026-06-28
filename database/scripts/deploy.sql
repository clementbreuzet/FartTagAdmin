:setvar DatabaseName "FartSocial"

:r .\000_create_database.sql
:r .\001_schema.sql
:r .\005_upgrade_user_data_and_audio_blob.sql
:r .\007_upgrade_user_progression.sql
:r .\010_seed_security_and_badges.sql
:r .\020_seed_shop_catalog.sql
:r .\900_verify_deployment.sql
