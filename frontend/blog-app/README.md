# Blog Frontend – MEAN Stack (Angular)

## 🎯 Contexte
Ce frontend Angular fournit l’interface utilisateur d’un blog multi-auteurs conforme au test technique.  
Il interagit avec le backend via API REST + Socket.io pour offrir une expérience fluide.

---

## 🚀 Fonctionnalités
- **Authentification**
  - Login/Logout
  - Stockage session (`access`, `refresh`, `user` dans localStorage)
  - Intercepteur HTTP qui rafraîchit automatiquement le token

- **Gestion des rôles**
  - Admin : accès gestion utilisateurs + suppression articles
  - Éditeur : modifier tous articles
  - Rédacteur : CRUD sur ses articles
  - Lecteur : lecture seule

- **Articles**
  - Liste avec filtres (`q`, `tag`)
  - Recherche texte (Mongo text index + fallback regex)
  - Création / édition / suppression selon rôle
  - Vue détaillée (article + commentaires imbriqués)

- **Commentaires**
  - Temps réel (Socket.io + Web Push)
  - Réponses imbriquées
  - Rafraîchissement auto

- **Admin**
  - Gestion des utilisateurs
  - Dashboard analytics (vues, likes, partages – Chart.js)

---

## 🛠️ Installation

### Prérequis
- Node.js ≥ 18
- Angular CLI (optionnel)

### Étapes
```bash
cd frontend
npm install
npm start   # ou: ng serve
```

### Environnement
`src/environments/environment.ts`
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api',
  wsUrl: 'http://localhost:4000'
};
```

---

## 📂 Structure
```
frontend/
  src/app/
    core/          # auth.service, api.service, guards, interceptor
    features/
      auth/        # login
      articles/    # list, detail, edit
      admin/       # users, analytics
    shared/        # components réutilisables (comments-thread, etc.)
```

---

## 📝 Routes principales
- `/` → Liste des articles (+ recherche / filtres)
- `/articles/new` → Créer un article
- `/articles/:id/edit` → Éditer (permissions)
- `/articles/:id` → Détail
- `/admin/users` → Gestion utilisateurs (admin)
- `/admin/analytics` → Dashboard (admin)
- `/login` → Connexion

---

## 📌 Choix techniques
- **Angular Standalone Components** (pas de modules lourds)
- **Signals API** pour état réactif
- **Router lazy-loading** pour performance
- **HttpInterceptor** pour gérer automatiquement les tokens
- **Chart.js** pour analytics admin
- **@angular/pwa** prêt pour Push Notifications

---

## ✅ Notes d’utilisation
- Cliquer sur **Articles** dans le header → réinitialise les filtres et recharge la liste.
- Le bouton **Supprimer** n’apparaît que pour Admins.
- Les filtres vides (`q`, `tag`) → backend renvoie toute la liste.
