# 🏠 API ImmorForge - Documentation Complète

API REST complète pour la plateforme immobilière ImmorForge au Sénégal.

> Comptes de connexion de démonstration et accès aux écrans : voir le [README à la racine](../README.md). Après `node seed.js`, lancez `node seed-demo.js` pour créer les comptes propriétaire et client.

## 📋 Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Architecture](#architecture)
- [Endpoints](#endpoints)
- [Authentification](#authentification)
- [Exemples d'utilisation](#exemples-dutilisation)

## 🚀 Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd immorforge-api

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
```

## ⚙️ Configuration

Modifier le fichier `.env` avec vos paramètres :

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=immorforge
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

## 🎯 Démarrage

```bash
# Développement
npm run dev

# Production
npm start
```

L'API sera disponible sur `http://localhost:3000`

## 🏗️ Architecture

```
src/
├── config/          # Configuration (DB, JWT)
├── models/          # Modèles Sequelize
├── controllers/     # Logique métier
├── middlewares/     # Middlewares (auth, erreurs)
├── routes/          # Définition des routes
├── services/        # Services (email, paiement)
└── utils/           # Utilitaires
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens). Après connexion, incluez le token dans l'en-tête :

```
Authorization: Bearer <votre_token>
```

## 📡 Endpoints

### Authentication (`/api/v1/auth`)

#### POST `/auth/register` - Inscription
```json
{
  "email": "user@example.com",
  "mot_de_passe": "password123",
  "prenom": "Jean",
  "nom": "Dupont",
  "telephone": "+221771234567",
  "role_nom": "client"
}
```

#### POST `/auth/login` - Connexion
```json
{
  "email": "user@example.com",
  "mot_de_passe": "password123"
}
```

#### GET `/auth/profile` - Profil (Auth requis)
#### PUT `/auth/profile` - Mise à jour profil (Auth requis)
#### PUT `/auth/change-password` - Changer mot de passe (Auth requis)

---

### Biens Immobiliers (`/api/v1/biens`)

#### GET `/biens` - Liste des biens
**Query params :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre par page (défaut: 10)
- `type_id` : Filtrer par type
- `zone_id` : Filtrer par zone
- `prix_min` : Prix minimum
- `prix_max` : Prix maximum
- `search` : Recherche texte

**Exemple :**
```
GET /api/v1/biens?page=1&limit=20&zone_id=1&prix_min=100000&prix_max=500000
```

#### GET `/biens/:id` - Détails d'un bien

#### POST `/biens` - Créer un bien (Partenaire/Admin)
```json
{
  "titre": "Belle villa à Dakar",
  "description": "Villa moderne avec piscine",
  "type_id": 3,
  "zone_id": 1,
  "adresse": "Almadies, Dakar",
  "latitude": 14.7167,
  "longitude": -17.4677,
  "prix": 250000000,
  "tarifs": [
    {
      "type_tarif": "vente",
      "montant": 250000000,
      "devise": "XOF"
    }
  ],
  "images": [
    "/uploads/biens/image1.jpg",
    "/uploads/biens/image2.jpg"
  ]
}
```

#### PUT `/biens/:id` - Modifier un bien (Propriétaire/Admin)
#### DELETE `/biens/:id` - Supprimer un bien (Propriétaire/Admin)
#### PUT `/biens/:id/valider` - Valider/Refuser (Admin)
```json
{
  "action": "valider",
  "raison_refus": "Description incomplète"
}
```

#### GET `/biens/mes-biens` - Mes biens (Partenaire)

---

### Favoris (`/api/v1/favoris`)

#### GET `/favoris` - Mes favoris (Auth)
#### POST `/favoris` - Ajouter aux favoris (Auth)
```json
{
  "bien_id": 5
}
```
#### DELETE `/favoris/:bien_id` - Retirer des favoris (Auth)

---

### Demandes (`/api/v1/demandes`)

#### POST `/demandes` - Créer une demande (Client)
```json
{
  "bien_id": 5,
  "message": "Je suis intéressé par ce bien"
}
```

#### GET `/demandes/mes-demandes` - Mes demandes (Client)
#### GET `/demandes/pour-mes-biens` - Demandes pour mes biens (Partenaire)
#### PUT `/demandes/:id/statut` - Changer statut (Partenaire/Admin)
```json
{
  "statut": "acceptee"
}
```

---

### Transactions (`/api/v1/transactions`)

#### POST `/transactions` - Créer transaction (Auth)
```json
{
  "bien_id": 5,
  "type_transaction": "location",
  "montant": 500000
}
```

#### GET `/transactions` - Mes transactions (Auth)
#### GET `/transactions/:id` - Détails transaction (Auth)

---

### Utilisateurs (`/api/v1/users`) - Admin uniquement

#### GET `/users` - Liste des utilisateurs
#### GET `/users/:id` - Détails utilisateur
#### PUT `/users/:id/statut` - Changer statut
```json
{
  "statut": "suspendu"
}
```

---

### Messages (`/api/v1/messages`)

#### GET `/messages?type=recus` - Mes messages (Auth)
#### POST `/messages` - Envoyer message (Auth)
```json
{
  "destinataire_id": 2,
  "contenu": "Bonjour, j'ai une question..."
}
```

---

### Notifications (`/api/v1/notifications`)

#### GET `/notifications` - Mes notifications (Auth)
#### PUT `/notifications/:id/lire` - Marquer comme lu (Auth)

---

## 💡 Exemples d'utilisation

### Inscription et connexion

```javascript
// Inscription
const response = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jean@example.com',
    mot_de_passe: 'password123',
    prenom: 'Jean',
    nom: 'Diop',
    role_nom: 'client'
  })
});

const { data } = await response.json();
const token = data.token;

// Utiliser le token
const biens = await fetch('http://localhost:3000/api/v1/biens/mes-biens', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Recherche de biens

```javascript
// Rechercher des appartements à Dakar entre 50M et 100M XOF
const response = await fetch(
  'http://localhost:3000/api/v1/biens?type_id=1&zone_id=1&prix_min=50000000&prix_max=100000000'
);
const { data } = await response.json();
console.log(data.biens);
```

### Créer un bien (Partenaire)

```javascript
const response = await fetch('http://localhost:3000/api/v1/biens', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    titre: 'Appartement moderne',
    description: 'T3 avec vue mer',
    type_id: 1,
    zone_id: 1,
    prix: 75000000,
    tarifs: [{ type_tarif: 'vente', montant: 75000000 }]
  })
});
```

## 🔑 Rôles et Permissions

| Rôle | Permissions |
|------|------------|
| **admin** | Accès complet, validation des biens, gestion utilisateurs |
| **partenaire** | Créer/modifier/supprimer ses biens, gérer demandes |
| **client** | Consulter biens, favoris, demandes, transactions |

## 📊 Codes de statut

- `200` : Succès
- `201` : Créé avec succès
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Permission refusée
- `404` : Ressource introuvable
- `409` : Conflit (ex: email déjà utilisé)
- `500` : Erreur serveur

## 🛠️ Technologies utilisées

- **Node.js** + **Express.js**
- **MySQL** + **Sequelize ORM**
- **JWT** pour l'authentification
- **Bcrypt** pour le hachage des mots de passe
- **Multer** pour l'upload de fichiers
- **Helmet** pour la sécurité
- **Morgan** pour les logs

## 📝 Notes importantes

1. **Uploads** : Les fichiers sont stockés dans `/uploads` (créez ce dossier)
2. **Base de données** : Exécutez le script SQL fourni pour créer les tables
3. **Rôles** : Insérez les rôles par défaut : admin, partenaire, client
4. **Zones** : Insérez les 14 zones du Sénégal dans la table `zones`

## 🚧 Améliorations futures

- [ ] Système de paiement intégré (Wave, Orange Money)
- [ ] Upload d'images avec optimisation
- [ ] Génération de factures PDF
- [ ] Notifications push
- [ ] Système de messagerie en temps réel (WebSocket)
- [ ] Pagination avancée et filtres
- [ ] Documentation Swagger/OpenAPI

## 📞 Support

Pour toute question : support@immorforge.sn