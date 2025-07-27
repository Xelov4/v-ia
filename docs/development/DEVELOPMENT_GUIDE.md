# Guide de Développement - Video-IA.net

**Date de création** : 27 juillet 2024  
**Version** : 1.0.0  
**Auteur** : Video-IA.net Team

## 📋 Table des matières

1. [Architecture](#architecture)
2. [Configuration locale](#configuration-locale)
3. [Structure du code](#structure-du-code)
4. [Conventions](#conventions)
5. [Tests](#tests)
6. [Débogage](#débogage)

## 🏗️ Architecture

### Stack technologique

```
Frontend:
├── Next.js 14 (App Router)
├── TypeScript 5.2.2
├── Tailwind CSS 3.3.5
├── Framer Motion 10.16.4
└── Lucide React 0.292.0

Backend:
├── Node.js 18+
├── PostgreSQL 15+
├── Prisma ORM 5.7.1
└── Next.js API Routes

Infrastructure:
├── Nginx (Reverse Proxy)
├── PM2 (Process Manager)
├── Let's Encrypt (SSL)
└── Docker (Optionnel)
```

### Architecture des dossiers

```
video-ia/
├── app/                    # Next.js App Router
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   ├── tools/             # Liste des outils
│   ├── tool/[slug]/       # Pages de détail
│   ├── admin/             # Interface d'administration
│   ├── sitemap.ts         # Sitemap XML
│   └── robots.ts          # Robots.txt
├── components/            # Composants React
│   ├── Header.tsx        # Navigation
│   └── ToolCard.tsx      # Carte d'outil
├── lib/                   # Utilitaires
│   ├── types.ts          # Types TypeScript
│   ├── data.ts           # Gestionnaire CSV (déprécié)
│   └── database.ts       # Gestionnaire PostgreSQL
├── prisma/               # Base de données
│   └── schema.prisma     # Schéma Prisma
├── scripts/              # Scripts d'automatisation
│   ├── database/         # Scripts DB
│   ├── deployment/       # Scripts déploiement
│   └── development/      # Scripts développement
├── docs/                 # Documentation
│   ├── database/         # Docs base de données
│   ├── deployment/       # Docs déploiement
│   └── development/      # Docs développement
├── data/                 # Données CSV
│   ├── raw/             # Données brutes
│   ├── processed/       # Scripts de traitement
│   └── final/           # Données finales
└── public/              # Assets statiques
```

## 🔧 Configuration locale

### Prérequis

```bash
# Vérifier les versions
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
```

### Installation

```bash
# Cloner le repository
git clone https://github.com/video-ia/video-ia-directory.git
cd video-ia-directory

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env
```

### Configuration de l'environnement

```env
# Database (pour développement local)
DATABASE_URL="postgresql://video_ia_user:password@localhost:5432/video_ia_db"

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Video-IA.net"
```

### Base de données locale

```bash
# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql -c "CREATE DATABASE video_ia_db;"
sudo -u postgres psql -c "CREATE USER video_ia_user WITH PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE video_ia_db TO video_ia_user;"

# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Migrer les données CSV
npm run db:seed
```

### Démarrage du développement

```bash
# Démarrer le serveur de développement
npm run dev

# Vérifier les types TypeScript
npm run type-check

# Lancer les tests
npm run test
```

## 📁 Structure du code

### Composants React

#### Convention de nommage
- **PascalCase** pour les composants : `ToolCard.tsx`
- **camelCase** pour les fichiers utilitaires : `dataManager.ts`
- **kebab-case** pour les dossiers : `tool-detail/`

#### Structure d'un composant

```typescript
// components/ToolCard.tsx
'use client'

import React from 'react'
import { Tool } from '@/lib/types'

interface ToolCardProps {
  tool: Tool
  variant?: 'default' | 'compact'
}

export default function ToolCard({ tool, variant = 'default' }: ToolCardProps) {
  return (
    <div className="card">
      {/* Contenu du composant */}
    </div>
  )
}
```

### Pages Next.js

#### App Router Structure

```typescript
// app/page.tsx
import { Metadata } from 'next'
import { databaseManager } from '@/lib/database'

export const metadata: Metadata = {
  title: 'Video-IA.net - AI Tools Directory',
  description: 'Discover the best AI tools for your projects'
}

export default async function HomePage() {
  const stats = await databaseManager.getStats()
  
  return (
    <div>
      {/* Contenu de la page */}
    </div>
  )
}
```

### Gestionnaires de données

#### Ancien système (CSV)
```typescript
// lib/data.ts (déprécié)
import { Tool } from './types'

const toolsData: Tool[] = [
  // Données statiques pour développement
]
```

#### Nouveau système (PostgreSQL)
```typescript
// lib/database.ts
import { PrismaClient } from '@prisma/client'

export class DatabaseManager {
  async getAllTools(): Promise<ToolWithRelations[]> {
    return await prisma.tool.findMany({
      include: {
        tags: { include: { tag: true } },
        features: true,
        useCases: true,
        audiences: true
      }
    })
  }
}
```

## 📝 Conventions

### TypeScript

#### Types et interfaces
```typescript
// lib/types.ts
export interface Tool {
  id: string
  name: string
  slug: string
  category: string
  link: string | null
  overview: string
  description: string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ToolWithRelations extends Tool {
  tags: { tag: { name: string; slug: string } }[]
  features: { feature: string }[]
  useCases: { useCase: string }[]
  audiences: { audience: string }[]
}
```

#### Gestion d'erreurs
```typescript
try {
  const tools = await databaseManager.getAllTools()
  return tools
} catch (error) {
  console.error('Error fetching tools:', error)
  throw new Error('Failed to fetch tools')
}
```

### CSS avec Tailwind

#### Classes utilitaires
```tsx
// Composant avec classes Tailwind
<div className="
  bg-white 
  rounded-xl 
  shadow-sm 
  border 
  border-gray-200 
  p-6 
  hover:shadow-lg 
  transition-shadow 
  duration-200
">
  {/* Contenu */}
</div>
```

#### Composants personnalisés
```css
/* app/globals.css */
@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
  }
}
```

### Git

#### Messages de commit
```bash
# Format : type(scope): description

feat(tools): add search functionality
fix(database): resolve connection timeout
docs(readme): update installation guide
refactor(components): simplify ToolCard component
test(api): add unit tests for database manager
```

#### Branches
```bash
# Branches principales
main          # Production
develop       # Développement
feature/*     # Nouvelles fonctionnalités
hotfix/*      # Corrections urgentes
```

## 🧪 Tests

### Configuration Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  }
}
```

### Tests unitaires

```typescript
// __tests__/components/ToolCard.test.tsx
import { render, screen } from '@testing-library/react'
import ToolCard from '@/components/ToolCard'

describe('ToolCard', () => {
  it('renders tool information correctly', () => {
    const mockTool = {
      name: 'Test Tool',
      overview: 'Test overview',
      category: 'AI Assistant'
    }
    
    render(<ToolCard tool={mockTool} />)
    
    expect(screen.getByText('Test Tool')).toBeInTheDocument()
    expect(screen.getByText('Test overview')).toBeInTheDocument()
  })
})
```

### Tests d'intégration

```typescript
// __tests__/api/tools.test.ts
import { databaseManager } from '@/lib/database'

describe('Database Manager', () => {
  it('should fetch all tools', async () => {
    const tools = await databaseManager.getAllTools()
    expect(tools).toBeInstanceOf(Array)
    expect(tools.length).toBeGreaterThan(0)
  })
})
```

### Commandes de test

```bash
# Lancer tous les tests
npm run test

# Tests en mode watch
npm run test:watch

# Couverture de tests
npm run test:coverage

# Tests spécifiques
npm test -- --testNamePattern="ToolCard"
```

## 🐛 Débogage

### Outils de développement

#### React Developer Tools
- Installer l'extension Chrome/Firefox
- Inspecter les composants et props
- Profiler les performances

#### Next.js Debug
```bash
# Activer le debug Next.js
DEBUG=* npm run dev

# Debug spécifique
DEBUG=next:*,prisma:* npm run dev
```

#### Prisma Studio
```bash
# Ouvrir l'interface graphique de la DB
npm run db:studio
```

### Logs et monitoring

#### Logs de développement
```typescript
// lib/database.ts
console.log('Fetching tools from database...')
const tools = await prisma.tool.findMany()
console.log(`Found ${tools.length} tools`)
```

#### Monitoring en production
```typescript
// Utiliser PM2 pour les logs
pm2 logs video-ia

// Monitoring en temps réel
pm2 monit
```

### Débogage de la base de données

```bash
# Connexion directe à PostgreSQL
psql -h localhost -U video_ia_user -d video_ia_db

# Requêtes utiles
SELECT COUNT(*) FROM tools;
SELECT category, COUNT(*) FROM tools GROUP BY category;
SELECT * FROM tools WHERE name ILIKE '%AI%';
```

## 🔄 Workflow de développement

### 1. Nouvelle fonctionnalité

```bash
# Créer une branche feature
git checkout -b feature/search-improvements

# Développer la fonctionnalité
# ...

# Tests
npm run test
npm run type-check

# Commit
git add .
git commit -m "feat(search): improve search performance"

# Push et PR
git push origin feature/search-improvements
```

### 2. Correction de bug

```bash
# Créer une branche hotfix
git checkout -b hotfix/database-connection

# Corriger le bug
# ...

# Tests
npm run test

# Commit
git commit -m "fix(database): resolve connection timeout"

# Merge vers main
git checkout main
git merge hotfix/database-connection
```

### 3. Déploiement

```bash
# Vérifier que tout fonctionne
npm run test
npm run build
npm run type-check

# Tag de version
git tag v1.0.0
git push origin v1.0.0

# Déployer
./scripts/deployment/deploy-vps.sh
```

## 📚 Ressources

### Documentation officielle
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Outils recommandés
- **VS Code** avec extensions TypeScript, Tailwind CSS
- **Postman** pour tester les API
- **DBeaver** pour la base de données
- **Figma** pour le design

### Communauté
- [Next.js Discord](https://discord.gg/nextjs)
- [Prisma Discord](https://discord.gg/prisma)
- [Tailwind CSS Discord](https://discord.gg/tailwindcss)

---

**Dernière mise à jour** : 27 juillet 2024  
**Version du guide** : 1.0.0 