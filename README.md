# 🎮 Game Night Live

**The ultimate platform for interactive game nights where hosts engage viewers in real-time competitions and collaborative challenges.**

## 🌟 Features

- **Real-time Interactive Games**: Trivia, drawing challenges, physical challenges, and more
- **Dual Competition Modes**: Individual leaderboards AND team collaboration
- **Live Streaming Integration**: Embed Twitch/YouTube streams
- **Mobile-First**: Viewers use phones as game controllers
- **Prize Distribution**: Integrated payment system for winners
- **Sponsor Support**: Built-in monetization for hosts

## 🏗️ Tech Stack

### Frontend
- **Astro** - Lightning-fast static site generation
- **React Islands** - Interactive components where needed
- **TailwindCSS** - Utility-first styling
- **Socket.io Client** - Real-time game communication
- **Cloudflare Pages** - Hosting

### Backend
- **Node.js + Express** - REST API
- **Socket.io** - Real-time game logic
- **PostgreSQL** - Database (via Supabase)
- **Auth0** - Authentication
- **Cloudflare R2** - File storage
- **Railway/Render** - Hosting

### Ready for Scaling
- **Redis** - Setup complete, enable when needed

## 📁 Project Structure

```
gamenightlive/
├── frontend/          # Astro application
├── backend/           # Node.js API & Socket.io server
├── docs/              # Documentation
└── docker-compose.yml # Local development setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (or use Supabase)
- Auth0 account
- Cloudflare account (for R2)

### 1. Clone and Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Configure Environment

```bash
# Frontend
cd frontend
cp .env.example .env
# Edit .env with your Auth0 credentials

# Backend
cd ../backend
cp .env.example .env
# Edit .env with all service credentials
```

### 3. Database Setup

```bash
cd backend
npm run db:migrate
npm run db:seed  # Optional: Add sample data
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit:
- Frontend: http://localhost:4321
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

## 📖 Documentation

- [Setup Guide](docs/SETUP.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Game Types Guide](docs/GAMES.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🎯 MVP Roadmap

- [x] Project structure
- [ ] User authentication (Auth0)
- [ ] Game lobby system
- [ ] Trivia game implementation
- [ ] Live leaderboard
- [ ] Drawing challenge game
- [ ] Team collaboration mode
- [ ] Prize distribution
- [ ] Host dashboard

## 🤝 Contributing

This is currently in MVP development. Contributions welcome!

## 📝 License

MIT License - See LICENSE file for details

---

Built for **gamenightsarefun.com** 🎉
