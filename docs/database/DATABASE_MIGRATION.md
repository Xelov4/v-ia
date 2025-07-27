# Migration des données CSV vers PostgreSQL

Ce guide explique comment migrer les données du fichier CSV vers une base de données PostgreSQL avec Prisma.

## 🏗️ Architecture de la base de données

### Tables principales :
- **`tools`** : Outils AI avec informations de base
- **`categories`** : Catégories d'outils
- **`tags`** : Tags pour organiser les outils
- **`tool_tags`** : Relation many-to-many entre outils et tags
- **`tool_features`** : Fonctionnalités de chaque outil
- **`tool_use_cases`** : Cas d'usage de chaque outil
- **`tool_audiences`** : Public cible de chaque outil
- **`site_stats`** : Statistiques du site

### Avantages de cette structure :
- ✅ **Normalisation** : Évite la duplication de données
- ✅ **Recherche avancée** : Requêtes complexes optimisées
- ✅ **Scalabilité** : Support de milliers d'outils
- ✅ **Flexibilité** : Ajout facile de nouvelles fonctionnalités
- ✅ **Performance** : Index et relations optimisées

## 🚀 Installation et configuration

### 1. Installer PostgreSQL

```bash
# Exécuter le script d'installation automatique
./scripts/setup-database.sh
```

Ou installer manuellement :

```bash
# Installer PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Démarrer le service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer la base de données
sudo -u postgres psql -c "CREATE DATABASE video_ia_db;"
sudo -u postgres psql -c "CREATE USER video_ia_user WITH PASSWORD 'video_ia_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE video_ia_db TO video_ia_user;"
```

### 2. Configurer l'environnement

Le fichier `.env` est automatiquement créé avec :

```env
DATABASE_URL="postgresql://video_ia_user:video_ia_password@localhost:5432/video_ia_db"
```

### 3. Générer le client Prisma

```bash
npm run db:generate
```

### 4. Créer les tables

```bash
npm run db:push
```

## 📊 Migration des données

### 1. Migrer le CSV vers PostgreSQL

```bash
npm run db:seed
```

Ce script va :
- Lire le fichier `working_database_rationalized_full.csv`
- Créer les catégories uniques
- Créer les tags uniques
- Créer tous les outils avec leurs relations
- Mettre à jour les statistiques du site

### 2. Vérifier la migration

```bash
# Ouvrir Prisma Studio pour visualiser les données
npm run db:studio
```

Ou vérifier via la ligne de commande :

```bash
# Se connecter à la base de données
psql -h localhost -U video_ia_user -d video_ia_db

# Vérifier les statistiques
SELECT COUNT(*) FROM tools;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM tags;
```

## 🔧 Commandes utiles

### Base de données
```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers la DB
npm run db:push

# Créer une migration
npm run db:migrate

# Ouvrir Prisma Studio
npm run db:studio

# Migrer les données CSV
npm run db:seed

# Réinitialiser la base de données
npm run db:reset
```

### Développement
```bash
# Démarrer le serveur de développement
npm run dev

# Vérifier les types TypeScript
npm run type-check

# Lancer les tests
npm run test
```

## 📈 Statistiques attendues

Après la migration, vous devriez avoir :

- **~16,827 outils** dans la table `tools`
- **~50-100 catégories** uniques
- **~200-500 tags** uniques
- **~50,000+ relations** tool-tag
- **~100,000+ fonctionnalités** et cas d'usage

## 🔍 Recherche et filtrage

La nouvelle structure permet des requêtes avancées :

### Recherche par texte
```sql
SELECT * FROM tools 
WHERE name ILIKE '%AI%' 
   OR overview ILIKE '%AI%' 
   OR description ILIKE '%AI%';
```

### Filtrage par catégorie
```sql
SELECT * FROM tools WHERE category = 'AI Assistant';
```

### Filtrage par tags
```sql
SELECT t.* FROM tools t
JOIN tool_tags tt ON t.id = tt.tool_id
JOIN tags tag ON tt.tag_id = tag.id
WHERE tag.name = 'Text-to-Speech';
```

### Recherche par audience
```sql
SELECT t.* FROM tools t
JOIN tool_audiences ta ON t.id = ta.tool_id
WHERE ta.audience ILIKE '%Content creators%';
```

## 🚀 Déploiement

### Variables d'environnement de production

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://www.video-ia.net"
NEXT_PUBLIC_APP_URL="https://www.video-ia.net"
```

### Migration en production

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Migrer les données (si nécessaire)
npm run db:seed
```

## 🔒 Sécurité

- ✅ **Mots de passe forts** pour la base de données
- ✅ **Utilisateur dédié** avec privilèges limités
- ✅ **Variables d'environnement** pour les secrets
- ✅ **Connexions sécurisées** en production
- ✅ **Backup automatique** recommandé

## 📊 Monitoring

### Requêtes utiles pour le monitoring

```sql
-- Nombre d'outils par catégorie
SELECT category, COUNT(*) as count 
FROM tools 
GROUP BY category 
ORDER BY count DESC;

-- Tags les plus populaires
SELECT t.name, COUNT(tt.tool_id) as count
FROM tags t
JOIN tool_tags tt ON t.id = tt.tag_id
GROUP BY t.name
ORDER BY count DESC
LIMIT 20;

-- Outils récemment ajoutés
SELECT name, category, created_at 
FROM tools 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion à la base de données**
   ```bash
   # Vérifier que PostgreSQL fonctionne
   sudo systemctl status postgresql
   
   # Vérifier la connexion
   psql -h localhost -U video_ia_user -d video_ia_db
   ```

2. **Erreur de migration**
   ```bash
   # Réinitialiser la base de données
   npm run db:reset
   
   # Régénérer le client
   npm run db:generate
   ```

3. **Données manquantes**
   ```bash
   # Relancer la migration
   npm run db:seed
   ```

## 📚 Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Guide de migration Next.js](https://nextjs.org/docs/migrating)

---

**Note** : Cette migration transforme votre site d'un système basé sur CSV vers une architecture de base de données robuste et scalable, prête pour la production. 