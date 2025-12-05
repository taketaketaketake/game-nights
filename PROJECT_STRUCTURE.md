# Project Structure

Complete file tree for Game Night Live platform.

```
gamenightlive/
│
├── README.md                          # Main project documentation
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Local development PostgreSQL setup
│
├── docs/                              # Documentation
│   ├── SETUP.md                       # Setup instructions
│   ├── ARCHITECTURE.md                # System architecture
│   └── DEPLOYMENT.md                  # Production deployment guide
│
├── frontend/                          # Astro + React frontend
│   ├── package.json                   # Frontend dependencies
│   ├── astro.config.mjs              # Astro configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── tailwind.config.mjs           # Tailwind CSS configuration
│   ├── .env.example                  # Environment variables template
│   │
│   ├── public/                       # Static assets
│   │   ├── fonts/
│   │   └── images/
│   │
│   └── src/
│       ├── layouts/
│       │   └── Layout.astro          # Base layout component
│       │
│       ├── pages/                    # Astro pages (routes)
│       │   ├── index.astro           # Landing page
│       │   ├── games/
│       │   │   └── browse.astro      # Browse games page
│       │   ├── play/                 # Game session pages
│       │   ├── profile/              # User profile pages
│       │   └── api/                  # API routes (if needed)
│       │
│       ├── components/
│       │   ├── layout/               # Layout components
│       │   │   ├── Header.astro      # Site header
│       │   │   └── Footer.astro      # Site footer
│       │   │
│       │   ├── game/                 # Game components (React)
│       │   │   ├── GamePlayer.tsx    # Interactive game player
│       │   │   └── Leaderboard.tsx   # Real-time leaderboard
│       │   │
│       │   └── ui/                   # UI components
│       │
│       └── lib/
│           └── socket.ts             # Socket.io client utilities
│
└── backend/                           # Node.js + Express backend
    ├── package.json                   # Backend dependencies
    ├── .env.example                   # Environment variables template
    │
    ├── database/                      # Database files
    │   ├── schema.sql                 # PostgreSQL schema
    │   ├── migrate.js                 # Migration script
    │   └── seed.js                    # Sample data seeding
    │
    ├── uploads/                       # Local file uploads (dev only)
    │
    └── src/
        ├── server.js                  # Main server entry point
        │
        ├── config/
        │   └── db.js                  # Database connection config
        │
        ├── routes/                    # REST API routes
        │   ├── games.js               # Game CRUD endpoints
        │   ├── users.js               # User management endpoints
        │   └── leaderboard.js         # Leaderboard endpoints
        │
        ├── sockets/                   # Socket.io handlers
        │   ├── gameRoom.js            # Game session logic
        │   └── chat.js                # Chat functionality
        │
        ├── middleware/                # Express middleware
        │   └── auth.js                # Auth0 authentication (TODO)
        │
        ├── models/                    # Data models (if needed)
        │
        └── utils/
            └── storage.js             # Cloudflare R2 utilities
```

## Key Files Explained

### Frontend

**`astro.config.mjs`**
- Configures Astro with React and Tailwind integrations
- Sets up hybrid rendering mode

**`src/pages/index.astro`**
- Landing page with hero section
- Feature showcase
- Game types overview

**`src/components/game/GamePlayer.tsx`**
- React component for interactive gameplay
- Real-time question/answer interface
- Socket.io connection management

**`src/components/game/Leaderboard.tsx`**
- Live leaderboard updates via WebSocket
- Top 10 player display
- Animated rank changes

### Backend

**`src/server.js`**
- Express server setup
- Socket.io configuration
- API routes registration
- Redis adapter (optional, for scaling)

**`src/routes/games.js`**
- GET /api/games - List games
- GET /api/games/:id - Get game details
- POST /api/games - Create game (host)
- PATCH /api/games/:id/status - Update status

**`src/sockets/gameRoom.js`**
- Game session management
- Player join/leave handling
- Answer submission and scoring
- Leaderboard broadcasting

**`src/utils/storage.js`**
- Cloudflare R2 file uploads
- Avatar management
- Drawing submissions
- Challenge proof uploads

### Database

**`database/schema.sql`**
- Complete PostgreSQL schema
- Tables: users, games, game_sessions, questions, scores, teams, prizes, submissions
- Indexes for performance
- Triggers for updated_at timestamps

**`database/migrate.js`**
- Runs schema.sql to set up database
- Run with: `npm run db:migrate`

**`database/seed.js`**
- Creates sample data for testing
- Sample users, games, and questions
- Run with: `npm run db:seed`

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend Framework | Astro | Fast static site generation |
| Interactive UI | React | Game components |
| Styling | Tailwind CSS | Utility-first CSS |
| Backend Runtime | Node.js | JavaScript runtime |
| Web Framework | Express | REST API |
| Real-time | Socket.io | WebSocket connections |
| Database | PostgreSQL | Relational data storage |
| Authentication | Auth0 | User authentication |
| File Storage | Cloudflare R2 | Images, videos |
| Hosting (Frontend) | Cloudflare Pages | Static site hosting |
| Hosting (Backend) | Railway/Render | Server hosting |

## File Count

- **31 files created**
- **Frontend**: 10 files
- **Backend**: 9 files
- **Database**: 3 files
- **Documentation**: 4 files
- **Configuration**: 5 files

## Next Steps

1. **Install dependencies**:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Set up services**:
   - Create Auth0 account and application
   - Create Cloudflare R2 bucket
   - Start PostgreSQL with Docker Compose

3. **Configure environment**:
   - Copy `.env.example` to `.env` in both directories
   - Fill in credentials

4. **Initialize database**:
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development**:
   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev
   ```

6. **Build your first game**:
   - See `docs/SETUP.md` for complete instructions
   - Check `docs/ARCHITECTURE.md` for system design
   - Review `docs/DEPLOYMENT.md` for production setup

## Development Roadmap

### Phase 1: MVP ✅
- [x] Project structure
- [x] Basic authentication setup
- [x] Database schema
- [x] REST API endpoints
- [x] Socket.io real-time system
- [x] Frontend pages and components

### Phase 2: Core Features
- [ ] Complete Auth0 integration
- [ ] Trivia game implementation
- [ ] Drawing challenge game
- [ ] Live leaderboard
- [ ] Host dashboard
- [ ] Prize distribution (Stripe)

### Phase 3: Enhancement
- [ ] Team collaboration mode
- [ ] Physical challenge verification
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Multiple language support

### Phase 4: Scale
- [ ] Redis for multi-server
- [ ] Advanced caching
- [ ] Performance optimization
- [ ] Load testing
- [ ] Global CDN optimization
