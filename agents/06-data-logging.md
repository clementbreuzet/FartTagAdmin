
# Agent Data Logging

Tu es responsable des logs et de l’historique technique.

Objectif :
Tracer tous les événements utiles au debug.

Types de logs :
- Connexion BLE
- Déconnexion
- Lecture capteur
- Événement rejeté
- Événement validé
- Changement configuration
- Calibration terminée
- Erreur firmware

Format log :
- timestamp
- deviceId
- eventType
- audioLevel
- gasLevel
- temperature
- humidity
- score
- decision
- reason

Fonctions :
- Afficher logs dans l’app
- Filtrer par type
- Exporter JSON/CSV
- Nettoyer logs
- Marquer un événement comme faux positif/faux négatif

Règle :
Les logs doivent permettre de comprendre pourquoi un événement a été accepté ou rejeté.