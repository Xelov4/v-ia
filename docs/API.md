# API Documentation - Video-IA.net

## Vue d'ensemble

L'API de Video-IA.net permet d'accéder programmatiquement aux données des outils IA. Toutes les réponses sont au format JSON.

## Base URL

```
https://www.video-ia.net/api
```

## Endpoints

### 1. Liste des outils

**GET** `/tools`

Récupère la liste de tous les outils avec pagination et filtres.

#### Paramètres de requête

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `page` | number | Numéro de page (défaut: 1) | `?page=2` |
| `limit` | number | Nombre d'outils par page (défaut: 20, max: 100) | `?limit=50` |
| `category` | string | Filtrer par catégorie | `?category=AI Assistant` |
| `search` | string | Recherche dans le nom et la description | `?search=video` |
| `tags` | string | Filtrer par tags (séparés par des virgules) | `?tags=Video,AI` |

#### Exemple de requête

```bash
curl "https://www.video-ia.net/api/tools?page=1&limit=10&category=Video generation"
```

#### Exemple de réponse

```json
{
  "tools": [
    {
      "tool_name": "CassetteAI",
      "tool_category": "Music",
      "tool_link": "https://cassetteai.com/",
      "overview": "Generate royalty-free music tracks.",
      "tool_description": "Copilot Music Creation is an AI-powered tool...",
      "target_audience": "Musicians looking for inspiration, Content creators needing background music",
      "key_features": "Music creation, Royalty-free music tracks, Tailored to specific needs",
      "use_cases": "Create background music for videos, Generate music for podcasts",
      "tags": "Music",
      "image_url": "https://statics.topai.tools/img/tools/cassetteai.webp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 16827,
    "totalPages": 1683
  }
}
```

### 2. Détail d'un outil

**GET** `/tools/{slug}`

Récupère les détails complets d'un outil spécifique.

#### Paramètres de chemin

| Paramètre | Type | Description |
|-----------|------|-------------|
| `slug` | string | Slug de l'outil (basé sur le nom) |

#### Exemple de requête

```bash
curl "https://www.video-ia.net/api/tools/cassetteai"
```

#### Exemple de réponse

```json
{
  "tool_name": "CassetteAI",
  "tool_category": "Music",
  "tool_link": "https://cassetteai.com/",
  "overview": "Generate royalty-free music tracks.",
  "tool_description": "Copilot Music Creation is an AI-powered tool...",
  "target_audience": "Musicians looking for inspiration, Content creators needing background music",
  "key_features": "Music creation, Royalty-free music tracks, Tailored to specific needs",
  "use_cases": "Create background music for videos, Generate music for podcasts",
  "tags": "Music",
  "image_url": "https://statics.topai.tools/img/tools/cassetteai.webp"
}
```

### 3. Liste des catégories

**GET** `/categories`

Récupère la liste de toutes les catégories avec le nombre d'outils.

#### Exemple de requête

```bash
curl "https://www.video-ia.net/api/categories"
```

#### Exemple de réponse

```json
{
  "categories": [
    {
      "name": "AI Assistant",
      "count": 944,
      "tools": []
    },
    {
      "name": "Content creation",
      "count": 780,
      "tools": []
    }
  ]
}
```

### 4. Outils par catégorie

**GET** `/categories/{category}/tools`

Récupère tous les outils d'une catégorie spécifique.

#### Paramètres de chemin

| Paramètre | Type | Description |
|-----------|------|-------------|
| `category` | string | Nom de la catégorie (URL encodé) |

#### Paramètres de requête

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `page` | number | Numéro de page | `?page=1` |
| `limit` | number | Nombre d'outils par page | `?limit=20` |

#### Exemple de requête

```bash
curl "https://www.video-ia.net/api/categories/ai-assistant/tools?page=1&limit=10"
```

### 5. Statistiques

**GET** `/stats`

Récupère les statistiques globales de la base de données.

#### Exemple de requête

```bash
curl "https://www.video-ia.net/api/stats"
```

#### Exemple de réponse

```json
{
  "totalTools": 16827,
  "totalCategories": 141,
  "totalTags": 332,
  "toolsWithLinks": 16807,
  "toolsWithImages": 16827,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### 6. Recherche avancée

**GET** `/search`

Recherche avancée avec plusieurs critères.

#### Paramètres de requête

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `q` | string | Terme de recherche | `?q=video generation` |
| `category` | string | Catégorie | `?category=Video generation` |
| `tags` | string | Tags (séparés par des virgules) | `?tags=AI,Video` |
| `audience` | string | Audience cible | `?audience=content creators` |
| `features` | string | Fonctionnalités | `?features=text to speech` |
| `page` | number | Numéro de page | `?page=1` |
| `limit` | number | Nombre de résultats | `?limit=20` |

#### Exemple de requête

```bash
curl "https://www.video-ia.net/api/search?q=video&category=Video generation&tags=AI&page=1&limit=10"
```

## Codes de statut HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 400 | Requête invalide |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

## Limites de taux

- **Requêtes par minute** : 100
- **Requêtes par heure** : 1000
- **Taille maximale de réponse** : 10MB

## Authentification

L'API publique ne nécessite pas d'authentification. Pour les endpoints d'administration, une authentification par token est requise.

## Format des erreurs

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Tool not found",
    "details": "The requested tool does not exist"
  }
}
```

## Exemples d'utilisation

### JavaScript/Node.js

```javascript
// Récupérer tous les outils
const response = await fetch('https://www.video-ia.net/api/tools?limit=50');
const data = await response.json();
console.log(data.tools);

// Rechercher des outils
const searchResponse = await fetch('https://www.video-ia.net/api/search?q=video&category=Video generation');
const searchData = await searchResponse.json();
console.log(searchData.tools);
```

### Python

```python
import requests

# Récupérer les statistiques
response = requests.get('https://www.video-ia.net/api/stats')
stats = response.json()
print(f"Total tools: {stats['totalTools']}")

# Rechercher des outils
search_params = {
    'q': 'video generation',
    'category': 'Video generation',
    'limit': 10
}
response = requests.get('https://www.video-ia.net/api/search', params=search_params)
tools = response.json()
```

### PHP

```php
// Récupérer les catégories
$response = file_get_contents('https://www.video-ia.net/api/categories');
$categories = json_decode($response, true);

foreach ($categories['categories'] as $category) {
    echo "Category: {$category['name']} - {$category['count']} tools\n";
}
```

## Support

Pour toute question concernant l'API :

- **Email** : api@video-ia.net
- **Documentation** : https://www.video-ia.net/docs/api
- **GitHub** : https://github.com/video-ia/api-issues 