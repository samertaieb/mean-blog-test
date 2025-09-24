# Blog Backend – MEAN Stack (Node.js, Express, MongoDB, TypeScript)

## 🎯 Contexte
Ce backend implémente l’API d’une plateforme de blog collaboratif multi-auteurs en **MEAN Stack**, conformément au test technique.  
Il gère les utilisateurs, les rôles, l’authentification sécurisée et les opérations CRUD avancées sur les articles et les commentaires.

---

## 🚀 Fonctionnalités
- **Gestion des utilisateurs & Authentification**
  - Inscription / connexion sécurisée
  - JWT + Refresh Token
  - Rôles dynamiques : `Admin`, `Éditeur`, `Rédacteur`, `Lecteur`
  - Admin peut changer les rôles

- **Gestion des articles**
  - Création d’articles avec titre, contenu, image, tags
  - Éditeur/Admin : modifier tous les articles
  - Rédacteur : modifier seulement ses articles
  - Admin seul : supprimer
  - Articles stockés dans MongoDB (Mongoose, indexes optimisés)

- **Commentaires (temps réel via Socket.io)**
  - Commentaires imbriqués
  - Notifications en temps réel à l’auteur

- **Sécurité**
  - Rate limiting API
  - Hashing mots de passe (bcrypt)
  - CORS configuré
  - Validation ObjectId

- **Bonus (préparés)**
  - Web Push API (VAPID)
  - Analytics (compteurs vues/likes/partages)
  - Architecture microservices (plan : UserService, ArticleService, NotificationService)

---

## 🛠️ Installation

### Prérequis
- Node.js ≥ 18
- npm ≥ 9
- MongoDB ≥ 6 en local (`mongodb://localhost:27017`)

### Étapes
```bash
cd backend
npm install
cp .env.example .env  # puis éditez les variables
```

### Variables d’environnement (.env)
```ini
PORT=4000
CORS_ORIGIN=http://localhost:4200
MONGO_URI=mongodb://localhost:27017/mean_blog
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
```

### Scripts
```bash
npm run dev    # mode développement (tsx)
npm run build  # build TypeScript -> dist
npm start      # lance dist/server.js
npm run seed   # insère comptes tests
```

---

## 📂 Structure
```
backend/
  src/
    app.ts               # Express app, middlewares
    server.ts            # bootstrap serveur HTTP + Socket.io
    seed.ts              # script de seed MongoDB
    config/              # env, secrets
    middleware/          # auth, roles, rate limit
    models/              # User, Article, Comment
    routes/              # auth, users, articles, comments
    services/            # JWT, Socket, Push
```

---

## ✅ Tests rapides
```bash
curl http://localhost:4000/health

# login
curl -X POST http://localhost:4000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"writer@mail.com","password":"pass"}'
```

---

## 📌 Choix techniques
- **TypeScript ESM** + `tsx` → DX simple, pas de soucis CommonJS
- **Mongoose** pour ORM MongoDB
- **JWT access/refresh** (rotation + vérification stricte)
- **Socket.io** pour temps réel
- **Helmet + Rate limiting** → sécurité
- **Index texte** `{ title, content, tags }` → recherche performante

---

## 📝 Roadmap Bonus
- Push notifications (Web Push API) → notifications natives
- Analytics admin (Chart.js/Recharts en frontend)
- Découpage microservices (User / Article / Notification)
