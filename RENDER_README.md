# 🚀 Déploiement sur Render - Guide Rapide

## 📦 Fichiers Créés

Tous les fichiers nécessaires pour déployer votre application Scholara sur Render ont été créés :

### Fichiers de Configuration Principaux
- ✅ **`render.yaml`** - Blueprint pour déployer tous les services
- ✅ **`.renderignore`** - Fichiers à exclure du déploiement

### Dockerfiles
- ✅ `backend/auth-service/Dockerfile`
- ✅ `backend/student-service/Dockerfile`
- ✅ `backend/course-service/Dockerfile`
- ✅ `backend/ai-service/Dockerfile`
- ✅ `backend/api-gateway/Dockerfile`
- ✅ `frontend/Dockerfile` (existant)

### Scripts de Build
- ✅ `backend/auth-service/render-build.sh`
- ✅ `backend/course-service/render-build.sh`
- ✅ `backend/ai-service/render-build.sh`

### Documentation
- ✅ **`RENDER_DEPLOYMENT_GUIDE.md`** - Guide complet de déploiement (en anglais)
- ✅ **`RENDER_DEPLOYMENT_CHECKLIST.md`** - Liste de vérification
- ✅ **`POSTGRESQL_MIGRATION.md`** - Guide de migration MySQL → PostgreSQL
- ✅ **`deploy-to-render.bat`** - Script helper Windows

---

## 🎯 Démarrage Rapide

### Étape 1: Préparer le Dépôt Git

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Préparation déploiement Render"

# Ajouter le dépôt distant (GitHub, GitLab, ou Bitbucket)
git remote add origin VOTRE_URL_REPOSITORY
git push -u origin main
```

### Étape 2: Créer un Compte Render

1. Aller sur [render.com](https://render.com)
2. Créer un compte (gratuit)
3. Vérifier votre email

### Étape 3: Déployer avec Blueprint

1. Dans le dashboard Render, cliquer **"New"** → **"Blueprint"**
2. Connecter votre dépôt Git
3. Sélectionner votre repository et branche (main)
4. Render détectera automatiquement `render.yaml`
5. Configurer les variables d'environnement secrètes :
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `OPENAI_API_KEY`
6. Cliquer **"Apply"**

### Étape 4: Attendre le Déploiement

⏱️ **Temps estimé**: 15-30 minutes

Render va automatiquement :
- Créer 2 bases de données (MySQL + PostgreSQL)
- Builder 6 services
- Les déployer
- Configurer les URLs

---

## 🔧 Important: Migration PostgreSQL

⚠️ **Render ne supporte que PostgreSQL en tier gratuit** (pas MySQL)

Vous avez 2 options :

### Option 1: Migrer vers PostgreSQL (Recommandé)
Suivez le guide `POSTGRESQL_MIGRATION.md` pour :
- Mettre à jour les dépendances (MySQL → PostgreSQL)
- Modifier les fichiers de configuration
- Tester localement

### Option 2: Utiliser MySQL Externe
Utilisez un service MySQL externe comme :
- PlanetScale (gratuit)
- Railway
- Aiven

---

## 📋 Services Déployés

Après déploiement, vos services seront disponibles sur :

| Service | URL | Plan |
|---------|-----|------|
| Frontend | `https://scholara-frontend.onrender.com` | Gratuit |
| API Gateway | `https://scholara-api-gateway.onrender.com` | Gratuit |
| Auth Service | `https://scholara-auth-service.onrender.com` | Gratuit |
| Student Service | `https://scholara-student-service.onrender.com` | Gratuit |
| Course Service | `https://scholara-course-service.onrender.com` | Gratuit |
| AI Service | `https://scholara-ai-service.onrender.com` | Starter ($7/mois) |

---

## 💰 Coûts

### Plan Gratuit (Développement/Test)
- ✅ Tous les services: **$0/mois**
- ⚠️ Les services s'endorment après 15 min d'inactivité
- ⚠️ Démarrage lent (30-60 secondes)

### Plan Production (Recommandé)
- 💰 Environ **$56/mois**
- ✅ Services toujours actifs
- ✅ Pas de temps d'attente
- ✅ Plus de ressources

---

## 🛠️ Utiliser le Script Helper (Windows)

Exécutez simplement :

```bash
deploy-to-render.bat
```

Ce script vérifie :
- ✅ Git installé et configuré
- ✅ `render.yaml` présent
- ✅ Tous les Dockerfiles présents
- ✅ Remote Git configuré

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

1. **`RENDER_DEPLOYMENT_GUIDE.md`** - Guide complet étape par étape
2. **`RENDER_DEPLOYMENT_CHECKLIST.md`** - Checklist de déploiement
3. **`POSTGRESQL_MIGRATION.md`** - Migration MySQL → PostgreSQL

---

## 🆘 Besoin d'Aide ?

### Problèmes Courants

**Build qui échoue ?**
- Vérifiez les logs dans le dashboard Render
- Assurez-vous que toutes les dépendances sont à jour

**Erreur de connexion DB ?**
- Vérifiez les variables d'environnement
- Confirmez que la DB est bien créée

**Service timeout ?**
- Pour AI Service, utilisez le plan Starter (plus de ressources)
- Augmentez le timeout dans gunicorn/application.yml

### Ressources
- 📚 [Documentation Render](https://render.com/docs)
- 💬 [Communauté Render](https://community.render.com)
- 🎫 [Support Render](https://render.com/support)

---

## ✅ Checklist Rapide

- [ ] Code poussé sur Git (GitHub/GitLab/Bitbucket)
- [ ] Compte Render créé
- [ ] Blueprint configuré
- [ ] Variables d'environnement ajoutées
- [ ] Services déployés avec succès
- [ ] Frontend accessible
- [ ] API fonctionnelle
- [ ] Bases de données connectées

---

## 🎉 Prêt à Déployer !

Tout est configuré pour déployer votre application Scholara sur Render.

**Suivez le guide complet**: `RENDER_DEPLOYMENT_GUIDE.md`

**Bon déploiement ! 🚀**

---

*Créé le: {{ date }}*
*Version: 1.0*
