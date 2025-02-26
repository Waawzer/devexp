# DevExp

## Description
Plateforme de développement expérimentale construite avec Next.js, TypeScript et MongoDB.

## Fonctionnalités
- Authentification des utilisateurs
- Gestion de projets
- Interface utilisateur moderne et responsive

## Technologies utilisées
- Next.js 14
- TypeScript
- MongoDB avec Mongoose
- JWT pour l'authentification
- TailwindCSS pour le styling

## Installation

1. Cloner le repository
```bash
git clone https://github.com/votre-username/devexp.git
cd devexp
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
Créer un fichier `.env.local` à la racine du projet :
```env
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
```

4. Lancer le serveur de développement
```bash
npm run dev
```

## Structure du projet
- `/src/app` - Routes et pages Next.js
- `/src/components` - Composants React réutilisables
- `/src/lib` - Configurations et utilitaires
- `/src/models` - Modèles Mongoose
- `/src/services` - Services pour la logique métier
- `/src/types` - Types TypeScript
- `/src/utils` - Fonctions utilitaires

## Contribution
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence
MIT
