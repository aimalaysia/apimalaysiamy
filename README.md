# MyAPI — API Directory for Southeast Asia

**Discover, explore, and test APIs from across Southeast Asia.**

MyAPI is a curated, open-source directory of APIs from Malaysia, Singapore, Indonesia, Thailand, Vietnam, the Philippines, and the broader SEA region. It indexes government open-data portals, commercial API providers, and public datasets — making it easy for developers to find, evaluate, and integrate regional APIs.

> **Purpose**: Educational and learning use only. Helps developers understand, evaluate, and prototype with APIs from the Southeast Asian ecosystem.

---

## Features

- **1,400+ indexed APIs** — Government data, fintech, transport, health, education, telecom, e-commerce, and more
- **Smart filtering** — By category, country, authentication type, pricing tier, working status, and testability
- **Working & Testable badges** — Verified APIs are marked green, copyable/testable APIs are marked amber
- **Live API playground** — Test any API directly from your browser
- **Country flag icons** — Quick visual identification of API origin
- **Community submissions** — Anyone can submit new APIs for review
- **Dark mode** — Built-in dark theme for comfortable browsing
- **Favorite bookmarks** — Save APIs for quick access later

---

## Architecture

```
myapi/
├── client/              # React SPA (Vite + Tailwind v4)
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route pages (Directory, Playground, Submit)
│   ├── hooks/           # React Query hooks
│   ├── services/        # API client
│   ├── stores/          # Zustand state management
│   ├── types/           # TypeScript interfaces
│   └── styles/          # Global CSS
├── server/              # Hono API server (Node.js)
│   ├── db/              # Database connection, schema, queries, seed
│   ├── routes/          # API route handlers
│   └── scripts/         # Ingestion and maintenance scripts
├── render.yaml          # Render deploy configuration
└── package.json         # Root build/start scripts
```

### Data Flow

```
PasarAPI (catalogue) ──> ingest.ts ──> SQLite DB ──> Hono API ──> React SPA
                                        │
                                   Community submissions
```

The ingestion pipeline (`server/scripts/ingest.ts`) fetches the PasarAPI catalogue, transforms entries to match the MyAPI schema, deduplicates by slug, and upserts into the local SQLite database. Categories are built dynamically from the data.

### Categorisation System

APIs are categorised dynamically from their source data. Current categories include:

| Category | Count | Category | Count |
|---|---|---|---|
| Data & enrichment | 107 | Payments | 103 |
| Government services | 89 | Banking & finance | 65 |
| Maps & location | 63 | Travel & mobility | 53 |
| Communications | 45 | AI | 45 |
| Population & society | 44 | Housing & property | 43 |
| Transport | 41 | Auth & identity | 39 |
| … and 38 more | | | |

### Validation Workflow

APIs are validated through a trust-based system:

| Trust Level | Meaning | Working badge |
|---|---|---|
| `copy-paste` | Open data, no auth needed, direct access | ✅ |
| `authenticated` | Requires API key or token, known to work | ✅ if verified |
| `regulated` | Production-grade with SLAs, may need approval | ✅ if verified |
| `portal` | Web portal, not a direct API | ❌ |

- **Working** = `verified_at IS NOT NULL` (manually verified or trust level is `copy-paste`)
- **Testable** = `copyable = true` (can be tested directly from docs)

---

## Installation & Local Development

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/aimalaysia/apimalaysiamy.git
cd apimalaysiamy

# Install client dependencies
cd client
npm install

# Start the frontend dev server (with API proxy)
npm run dev
```

In a second terminal:

```bash
# Install server dependencies
cd server
npm install

# Seed the database (creates tables + ingests catalogue data)
npm run seed

# Start the API server
npm run dev
```

The frontend runs at `http://localhost:5173` and the API server at `http://localhost:3001`.

### Build for Production

```bash
# From the project root
npm run build
npm start
```

---

## Usage Guide

### Browsing APIs

1. Open the **Directory** page (`/`)
2. Use the **search bar** to find APIs by keyword
3. Filter by **category**, **country**, **auth type**, or **pricing**
4. Toggle **Working** to see only verified APIs
5. Toggle **Testable** to see only copyable/testable APIs
6. Click any card to view full details, code snippets, and documentation links

### Testing APIs in the Playground

1. Navigate to **Playground** (`/playground`)
2. Click **Select an API** to load an API's details
3. The code editor pre-fills with a sample request
4. Modify the request as needed
5. Click **Run** to execute and see the response
6. The playground proxies requests through the server to avoid CORS issues

### Submitting a New API

1. Go to **Submit** (`/submit`)
2. Fill in the API details (title, category, provider, etc.)
3. Select applicable countries
4. Submit for review
5. Submissions are stored in the database with a `pending` status

---

## API Reference

### List All APIs

```http
GET /api/catalogue
```

Returns all APIs in the directory.

**Response:**
```json
{
  "updated": "2026-07-11",
  "count": 1407,
  "apis": [{ "id": "births", "slug": "births", "title": "Daily Live Births", ... }]
}
```

### Search APIs

```http
GET /api/search?q=weather&country=MY&working=true&testable=true
```

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Search keyword (matches title, description, provider, category) |
| `category` | string | Exact category name |
| `country` | string | Country code (MY, SG, ID, TH, etc.) |
| `tier` | string | `open` or `commercial` |
| `auth` | string | `none`, `apiKey`, `oauth`, `bearer`, `token` |
| `pricing` | string | `free`, `freemium`, `paid` |
| `free` | boolean | Filter to free APIs only |
| `no_auth` | boolean | Filter to no-auth APIs only |
| `working` | boolean | Filter to verified/working APIs |
| `testable` | boolean | Filter to copyable/testable APIs |
| `limit` | number | Results per page (max 200, default 50) |
| `offset` | number | Pagination offset |

### Get API Details

```http
GET /api/apis/:id
```

### List Categories

```http
GET /api/categories
```

### List Countries

```http
GET /api/countries
```

### Submit an API

```http
POST /api/submit
Content-Type: application/json

{
  "title": "My API",
  "category": "Weather",
  "countries": ["MY", "SG"],
  "provider": "Provider Name",
  "tier": "open",
  "kind": "api",
  "auth": "apiKey",
  "pricing": "free",
  "docs": "https://docs.example.com",
  "baseUrl": "https://api.example.com/v1",
  "description": "API description"
}
```

---

## Integration Examples

### Fetch APIs via cURL

```bash
# Get all working, free, no-auth APIs in Malaysia
curl "https://apimalaysia.my/api/search?country=MY&free=true&no_auth=true&working=true"

# Search for weather APIs
curl "https://apimalaysia.my/api/search?q=weather&working=true"
```

### JavaScript / TypeScript

```typescript
const BASE = 'https://apimalaysia.my/api'

async function findMalaysianAPIs() {
  const res = await fetch(`${BASE}/search?country=MY&working=true&limit=10`)
  const { apis } = await res.json()
  
  for (const api of apis) {
    console.log(`${api.title} (${api.provider}) — ${api.auth}`)
  }
}
```

### Python

```python
import requests

BASE = "https://apimalaysia.my/api"

def find_free_apis():
    res = requests.get(f"{BASE}/search", params={
        "free": "true",
        "no_auth": "true",
        "working": "true",
        "limit": 50
    })
    return res.json()["apis"]

apis = find_free_apis()
for api in apis:
    print(f"{api['title']} — {api['category']} — {api['country']}")
```

### Building an API Dashboard

```jsx
import { useEffect, useState } from 'react'

function APIDashboard() {
  const [apis, setApis] = useState([])

  useEffect(() => {
    fetch('https://apimalaysia.my/api/search?country=SG&working=true&limit=20')
      .then(r => r.json())
      .then(data => setApis(data.apis))
  }, [])

  return (
    <ul>
      {apis.map(api => (
        <li key={api.id}>
          <strong>{api.title}</strong> — {api.provider}
          {api.verifiedAt && <span> ✅ Verified</span>}
        </li>
      ))}
    </ul>
  )
}
```

---

## Contribution Guide

### Adding a New API

1. Open an issue or submit via the **Submit** page on the website
2. Provide: title, category, countries, provider, auth type, pricing, documentation URL, and base URL
3. The maintainers will review and verify the API
4. Once verified, it's added to the directory with a `verified_at` timestamp

### Updating an Existing API

If you find outdated information:
1. Open a pull request modifying the database seed or ingestion mapping
2. Or submit a correction via the website's Submit page with a note
3. Maintainers will review and update the entry

### Running the Ingestion Pipeline

```bash
cd server
npm run ingest
```

This fetches the latest catalogue data and upserts it into the database. New APIs are added, existing ones are updated, and categories are rebuilt.

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run the build to verify (`cd client && npm run build`)
5. Commit and push
6. Open a pull request

### Coding Standards

- TypeScript throughout (strict mode)
- React function components with hooks
- Tailwind CSS v4 for styling
- Hono for API routes
- Drizzle ORM for database queries
- Use `biome` or `prettier` for formatting

---

## FAQ

### How are APIs verified?

APIs from official government open-data portals are automatically marked as Working. Commercial APIs are verified manually by maintainers or trusted by their provider reputation.

### Can I use these APIs in production?

Many of the listed APIs are production-ready services from official providers. However, always check each API's terms of service, rate limits, and licensing before using in production. MyAPI is for educational discovery — you must verify terms independently.

### How often is the catalogue updated?

The ingestion pipeline can be run at any time to refresh the catalogue. The data source is updated daily. Production instances typically refresh every 24 hours.

### Why are some APIs marked as not testable?

APIs marked with `copyable: false` either require production-grade setup, need approval processes, or are web portals rather than direct API endpoints.

### How do I report a broken API?

Open a GitHub issue or use the Submit page with a correction note. Include the API slug and what's broken.

### Is there rate limiting on the MyAPI service?

The MyAPI server itself has no rate limiting on its search endpoints, but individual APIs listed in the directory may have their own rate limits.

---

## Troubleshooting

### Search returns 0 results

- **Working filter**: The default filter only shows verified APIs. Uncheck "Working" to see all APIs
- **Testable filter**: Uncheck "Testable" to include non-copyable APIs
- **Combined filters**: `free=true` + selecting a paid pricing tier conflicts — choose one
- **Country filter**: Uses country code (MY, SG, ID, etc.)

### Database is empty after deploy

The seed/ingest runs during build. Check build logs for:
- Network access to the catalogue API
- Database file creation permissions
- Disk space

### Frontend shows blank page

- Clear browser cache and hard reload
- Check browser console for errors
- Verify the API server is running (`GET /health` should return `{"status":"ok"}`)

### API proxy not working in dev

The Vite dev server proxies `/api/*` to `http://localhost:3001`. Ensure the server is running on port 3001.

---

## Production Deployment

### Render (recommended)

The project includes a `render.yaml` for easy deployment:

1. Connect your GitHub repository to Render
2. Render auto-detects the `render.yaml` configuration
3. Set the environment variables:
   - `NODE_ENV=production`
   - `PORT=3001`
4. Deploy

### Custom Domain

To configure `apimalaysia.my`:

1. In Render dashboard, go to your service → **Settings** → **Custom Domain**
2. Add `apimalaysia.my`
3. Add the following DNS records at your domain registrar:

```
Type: CNAME
Name: apimalaysia.my
Target: myapi-aimalaysia.onrender.com
```

4. Wait for SSL certificate provisioning (automatic, takes a few minutes)

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `production` | Environment mode |
| `DATABASE_PATH` | `data/myapi.db` | SQLite database location |

---

## License

MIT — See [LICENSE](LICENSE) for details.

---

## Acknowledgements

- Built with [Hono](https://hono.dev/), [React](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/), [Drizzle ORM](https://orm.drizzle.team/), and [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- API catalogue data sourced from public government open-data portals and commercial API providers across Southeast Asia
- Inspired by the need for a regional API discovery platform for the SEA developer community
