# Architecture Overview

High-level architecture of the Game Night Live platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Astro + React Islands (Cloudflare Pages)          │    │
│  │  - Static pages (landing, browse)                   │    │
│  │  - React islands for interactivity                  │    │
│  │  - Socket.io client for real-time                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Node.js + Express + Socket.io (Railway/Render)    │    │
│  │  - REST API endpoints                               │    │
│  │  - Real-time game logic                             │    │
│  │  - WebSocket connections                            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────────┐ ┌────────────┐ ┌──────────────┐
    │  PostgreSQL  │ │    Auth0   │ │Cloudflare R2 │
    │   Database   │ │    Auth    │ │File Storage  │
    └──────────────┘ └────────────┘ └──────────────┘
```

## Frontend Architecture (Astro)

### Static Pages
- Landing page
- Game browser
- User profiles
- Leaderboards

### React Islands (Interactive)
- Game player (real-time)
- Live leaderboard
- Chat components
- Drawing canvas

### Why Astro?
- **Fast**: Ships minimal JavaScript
- **Flexible**: Use React only where needed
- **SEO**: Server-side rendering for marketing pages
- **DX**: Great developer experience

## Backend Architecture

### REST API Layer
- Express.js handles HTTP requests
- RESTful endpoints for CRUD operations
- Auth0 JWT validation middleware
- Rate limiting and security

### Real-time Layer (Socket.io)
- WebSocket connections for live games
- Room-based architecture (one room per game session)
- Pub/sub pattern for leaderboard updates
- Automatic reconnection handling

### Database Layer
- PostgreSQL for relational data
- Connection pooling
- Prepared statements for security
- Migrations for schema management

## Data Flow

### Game Session Flow

```
1. Host creates game
   └─> POST /api/games → Insert to database

2. Players browse games
   └─> GET /api/games → Fetch from database

3. Game starts
   └─> Host updates status → WebSocket broadcast

4. Player joins
   └─> Socket: join-game → Add to room
   └─> Create score entry in DB

5. Question sent
   └─> Socket: question → Broadcast to all in room

6. Player answers
   └─> Socket: submit-answer → Calculate points
   └─> Update score in DB
   └─> Broadcast leaderboard update

7. Game ends
   └─> Update game status
   └─> Finalize rankings
   └─> Distribute prizes (Stripe)
```

## Real-time Communication

### Socket.io Rooms

Each game session has its own room:
- Room name: `game-${sessionId}`
- All players join the room
- Host can broadcast to entire room
- Efficient for 100+ concurrent players

### Events

**Client → Server:**
- `join-game` - Join a game session
- `submit-answer` - Submit an answer
- `chat-message` - Send chat message
- `leave-game` - Leave game

**Server → Client:**
- `question` - New question broadcast
- `leaderboard-update` - Updated rankings
- `score-update` - Player's score changed
- `player-joined` - Someone joined
- `chat-message` - New chat message

## Scaling Strategy

### Current (MVP)
- Single backend server
- In-memory game state
- Good for 100-500 concurrent users

### Phase 2 (Scaling)
- Enable Redis adapter
- Multiple backend servers
- Load balancer
- Handles 10,000+ concurrent users

### Phase 3 (Global)
- Multi-region deployment
- Edge caching
- Database read replicas
- CDN for assets

## Security

### Authentication
- Auth0 handles user authentication
- JWT tokens for API requests
- Secure token storage
- Social login support

### Authorization
- User roles (player, host, admin)
- Middleware checks permissions
- Rate limiting per user
- Input validation

### Data Protection
- Parameterized queries (SQL injection prevention)
- CORS configuration
- HTTPS only in production
- Sensitive data encryption

## File Storage (Cloudflare R2)

### Why R2?
- **Cost**: 10x cheaper than S3
- **Performance**: Fast global CDN
- **Compatibility**: S3-compatible API
- **Free egress**: No bandwidth charges

### Storage Structure
```
bucket/
├── avatars/
│   └── {userId}.jpg
├── drawings/
│   └── {gameId}/
│       └── {userId}-{timestamp}.png
└── challenges/
    └── {gameId}/
        └── {userId}-{timestamp}.jpg
```

## Monitoring & Observability

### Logging
- Structured logging (JSON)
- Request/response logging
- Error tracking
- Performance metrics

### Metrics (Future)
- Active connections
- Games in progress
- API response times
- Database query performance

### Error Tracking (Future)
- Sentry integration
- Real-time error alerts
- Stack trace collection
- User impact analysis

## Development Workflow

```
1. Local Development
   └─> Docker Compose (PostgreSQL)
   └─> npm run dev (both frontend & backend)

2. Testing
   └─> Unit tests (Jest)
   └─> Integration tests
   └─> E2E tests (Playwright)

3. Deployment
   └─> Frontend: Cloudflare Pages (auto-deploy)
   └─> Backend: Railway/Render (auto-deploy)
   └─> Database: Supabase (managed)
```

## Technology Choices

### Frontend: Astro vs Next.js
✅ **Chose Astro** because:
- Faster page loads (less JavaScript)
- Better for content-heavy pages
- React islands for interactivity
- Easier to optimize

### Backend: Node.js vs Go/Python
✅ **Chose Node.js** because:
- Same language as frontend
- Excellent for real-time (Socket.io)
- Large ecosystem
- Easier to find developers

### Database: PostgreSQL vs MongoDB
✅ **Chose PostgreSQL** because:
- Relational data (users, games, scores)
- ACID compliance
- Better for analytics
- Mature tooling

### Real-time: Socket.io vs WebRTC
✅ **Chose Socket.io** because:
- Simpler to implement
- Automatic reconnection
- Room management built-in
- WebRTC overkill for our use case
