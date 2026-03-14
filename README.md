# NGO Tracker — Backend API (Express + Mongoose)

API REST pour la gestion de projets humanitaires. Remplace le store en mémoire par **MongoDB via Mongoose**.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Serveur | Node.js + Express 4 |
| Base de données | MongoDB + Mongoose 8 |
| Authentification | JWT (jsonwebtoken) |
| Hashage mot de passe | bcryptjs |
| Variables d'env | dotenv |
| Dev hot-reload | nodemon |

---

## Démarrage rapide

### 1. Prérequis

- Node.js ≥ 18
- MongoDB en local (`mongod`) **ou** une connexion MongoDB Atlas

### 2. Installation

```bash
cd ngo-tracker-backend
npm install
```

### 3. Configuration

```bash
cp .env.example .env
# Editer .env — au minimum MONGODB_URI et JWT_SECRET
```

### 4. Données de démonstration

```bash
npm run seed
```

Crée l'organisation **Croix Rouge Burkina** et trois comptes :

| Rôle | Email | Mot de passe | Code ONG |
|---|---|---|---|
| ADMIN | admin@croixrouge.bf | Admin1234! | NGO-BF-2025-0042 |
| MANAGER | manager@croixrouge.bf | Manager1234! | — |
| VIEWER | viewer@croixrouge.bf | Viewer1234! | — |

### 5. Lancement

```bash
npm run dev    # développement (nodemon)
npm start      # production
```

Serveur disponible sur `http://localhost:5000`

---

## Structure du projet

```
src/
├── server.js                  # Point d'entrée — connexion DB + montage routes
├── config/
│   └── db.js                  # Connexion Mongoose
├── models/
│   ├── Organization.js        # Schema ONG
│   ├── User.js                # Schema utilisateur (passwordHash: select:false)
│   ├── Project.js             # Schema projet (budgetSpent cache + virtuel budgetPct)
│   ├── Expense.js             # Schema dépense
│   └── Report.js              # Schema rapport
├── controllers/
│   ├── authController.js      # register / login / me
│   ├── projectsController.js  # CRUD projets + enrichissement live
│   ├── expensesController.js  # CRUD dépenses + syncBudgetSpent()
│   ├── dashboardController.js # KPIs via aggregation MongoDB
│   ├── reportsController.js   # CRUD + génération JSON
│   ├── usersController.js     # Gestion membres
│   └── organizationController.js
├── routes/
│   ├── authRoute.js
│   ├── projectsRoute.js
│   ├── expensesRoute.js
│   ├── dashboardRoute.js
│   ├── reportsRoute.js
│   ├── usersRoute.js
│   └── organizationRoute.js
├── middleware/
│   ├── authMiddleware.js      # authenticate (JWT) + authorize (RBAC)
│   ├── errorMiddleware.js     # notFound 404 + errorHandler global
│   └── loggerMiddleware.js    # logger HTTP coloré
└── utils/
    └── seed.js                # Données de démonstration
```

---

## Endpoints

### Auth — `/api/auth`

| Méthode | Chemin | Corps | Rôle |
|---|---|---|---|
| POST | /register | `{type, name, email, password, orgName?, receiptNumber?, country?, orgCode?}` | Public |
| POST | /login | `{email, password, role, orgCode?}` | Public |
| GET | /me | — | Tous |

### Projets — `/api/projects`

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | / | Tous |
| GET | /:id | Tous |
| GET | /:id/expenses | Tous |
| POST | / | ADMIN |
| PUT | /:id | ADMIN |
| DELETE | /:id | ADMIN |

### Dépenses — `/api/expenses`

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | / | Tous |
| GET | /:id | Tous |
| POST | / | ADMIN, MANAGER |
| PUT | /:id | ADMIN, MANAGER (propres) |
| DELETE | /:id | ADMIN, MANAGER (propres) |

### Dashboard — `/api/dashboard`

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | / | Tous (scopé par rôle) |

### Rapports — `/api/reports`

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | / | Tous |
| GET | /:id | Tous |
| POST | /generate | ADMIN, MANAGER |
| DELETE | /:id | ADMIN |

### Utilisateurs — `/api/users`

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | / | ADMIN |
| GET | /:id | ADMIN |
| PUT | /:id | ADMIN (tous) / Autres (soi-même) |
| DELETE | /:id | ADMIN |

### Organisation — `/api/organization`

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | / | Tous |
| PUT | / | ADMIN |

---

## Différences vs la version in-memory

| Aspect | In-memory | Mongoose |
|---|---|---|
| Persistance | Perdue au redémarrage | Permanente MongoDB |
| IDs | Chaînes `user-001` | ObjectId MongoDB |
| Dashboard | Filtres JS en mémoire | Aggregation pipeline |
| budgetSpent | Recalculé à chaque lecture | Cache synchronisé + recalculé |
| Erreurs de validation | Manuelles | Validators Mongoose automatiques |
| passwordHash | Champ normal | `select: false` — jamais renvoyé |

---

## Production checklist

- [ ] `JWT_SECRET` aléatoire et long (≥ 32 caractères)
- [ ] `MONGODB_URI` pointe vers Atlas ou un serveur sécurisé
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` restreint à votre domaine
- [ ] `npm run seed` uniquement en développement
- [ ] Ajouter `express-rate-limit` sur `/api/auth`
- [ ] HTTPS via reverse proxy (nginx, Caddy)
