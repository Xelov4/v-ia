# Video-IA.net - AI Tools Directory

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7.1-green)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.5-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> **Annuaire complet d'outils IA** - Découvrez, explorez et trouvez les meilleurs outils d'intelligence artificielle pour vos projets.

## 🚀 Fonctionnalités

- **📊 16,000+ outils IA** avec descriptions détaillées
- **🔍 Recherche avancée** par catégorie, tags, audience
- **📱 Design responsive** mobile-first
- **⚡ Performance optimisée** avec Next.js 14
- **🗄️ Base de données PostgreSQL** avec Prisma ORM
- **🔒 Interface d'administration** complète
- **🌐 SEO optimisé** avec métadonnées complètes

## 🏗️ Architecture

```
video-ia/
├── app/                    # Next.js App Router
│   ├── admin/             # Interface d'administration
│   ├── tool/[slug]/       # Pages détaillées des outils
│   └── tools/             # Liste des outils
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et gestionnaires
├── prisma/               # Schéma et migrations DB
├── scripts/              # Scripts d'automatisation
├── docs/                 # Documentation complète
└── data/                 # Données CSV et scripts
```

## 🛠️ Technologies

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes modernes

### Backend & Base de données
- **PostgreSQL** - Base de données relationnelle
- **Prisma ORM** - Gestionnaire de base de données type-safe
- **Node.js** - Runtime JavaScript

### Déploiement & Infrastructure
- **Nginx** - Serveur web et reverse proxy
- **PM2** - Gestionnaire de processus Node.js
- **Let's Encrypt** - Certificats SSL gratuits
- **Docker** - Containerisation (optionnel)

## 📦 Installation

### Prérequis
- Node.js 18+ 
- PostgreSQL 15+
- npm ou yarn

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/video-ia/video-ia-directory.git
cd video-ia-directory

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Migrer les données CSV
npm run db:seed

# Démarrer le serveur de développement
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

## 🗄️ Base de données

### Structure
- **16,827 outils** avec informations complètes
- **50+ catégories** organisées
- **200+ tags** pour la classification
- **Relations optimisées** pour les performances

### Migration des données
```bash
# Migrer depuis le CSV
npm run db:seed

# Vérifier les données
npm run db:studio
```

## 🚀 Déploiement

### Déploiement automatique sur VPS

```bash
# Configurer l'IP du VPS dans scripts/deployment/deploy-vps.sh
# Puis exécuter :
./scripts/deployment/deploy-vps.sh
```

### Déploiement manuel

```bash
# Sur le VPS
./scripts/deployment/setup-vps.sh

# Puis déployer l'application
cd /var/www/video-ia
npm install
npm run build
pm2 start npm --name "video-ia" -- start
```

## 📚 Documentation

- **[Guide de développement](docs/development/)** - Architecture et développement
- **[Guide de base de données](docs/database/)** - Structure et migration
- **[Guide de déploiement](docs/deployment/)** - Installation et configuration
- **[API Documentation](docs/API.md)** - Endpoints et intégrations

## 🔧 Scripts utiles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run start            # Serveur de production
npm run type-check       # Vérification TypeScript

# Base de données
npm run db:generate      # Générer client Prisma
npm run db:push          # Pousser le schéma
npm run db:seed          # Migrer les données
npm run db:studio        # Interface graphique DB

# Tests
npm run test             # Tests unitaires
npm run test:coverage    # Couverture de tests

# Déploiement
./scripts/deployment/deploy-vps.sh    # Déploiement VPS
./scripts/deployment/setup-vps.sh     # Configuration VPS
```

## 📊 Statistiques

- **16,827 outils** dans la base de données
- **50+ catégories** d'outils IA
- **200+ tags** pour la classification
- **Performance** : < 2s de chargement
- **SEO** : 100% optimisé
- **Mobile** : 100% responsive

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Next.js** pour le framework React
- **Prisma** pour l'ORM type-safe
- **Tailwind CSS** pour le design system
- **PostgreSQL** pour la base de données robuste

## 📞 Contact

- **Site web** : [https://www.video-ia.net](https://www.video-ia.net)
- **Email** : contact@video-ia.net
- **GitHub** : [https://github.com/video-ia/video-ia-directory](https://github.com/video-ia/video-ia-directory)

---

**Dernière mise à jour** : 27 juillet 2024  
**Version** : 1.0.0  
**Statut** : En développement actif 