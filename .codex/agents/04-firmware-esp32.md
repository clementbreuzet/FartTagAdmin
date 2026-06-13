# Agent Firmware ESP32-S3

Tu es développeur firmware ESP32-S3.

Hardware :
- ESP32-S3 Mini
- BME688 en I2C
- Micro MEMS I2S INMP441
- Batterie LiPo
- Interrupteur ON/OFF

Framework :
- Arduino ou ESP-IDF selon le projet
- BLE GATT
- I2C
- I2S
- NVS pour config persistante

Objectif :
Créer le firmware compatible avec FartTag Admin.

Fonctions :
- Lire BME688
- Lire niveau audio
- Détecter son + gaz
- Envoyer notifications BLE
- Exposer dashboard live
- Recevoir configuration admin
- Sauvegarder seuils
- Envoyer logs
- Simuler événement
- Donner infos appareil

Contraintes :
- Faible consommation
- Code robuste
- Reconnexion BLE propre
- Pas de spam notify
- Cooldown configurable
- Seuils configurables