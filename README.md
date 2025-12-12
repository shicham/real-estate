# real-estate (multi-app workspace)

This workspace contains a multi-service scaffold for a real-estate project.

Structure:

```
real-estate
  - backend
      - api-auth
      - api-usermng
      - api-property
  - frontend
     - site
     - admin
     - agency
```

How to use (quick):

- From the repository root run:

```bash
# install dependencies for all workspace packages
npm install

# then run one service individually, e.g. api-auth
cd backend/api-auth
npm run dev
```

Notes:
- Each subproject has a minimal `package.json` and example `src` files.
- This is a scaffold. Add real dependencies (MongoDB, Redis, Nuxt modules) as needed.
- To create a GitHub repo, initialize git and push to a new remote:

```bash
git init
git add .
git commit -m "scaffold real-estate workspace"
# create repo on GitHub and follow instructions to push
```

- Build de l’image Docker
docker build -t api-auth .
- Démarrer le conteneur
docker run -d --name api-auth -p 3001:3001 --env-file .env api-auth
- Voir les logs (démarrage, erreurs, logger, etc.)
docker logs -f api-auth
- Redémarrer le container
docker restart api-auth
- Arrêter + supprimer :
docker rm -f api-auth
- Rebuild :
docker build -t api-auth .
- Rerun :
docker run -d --name api-auth -p 3001:3001 --env-file .env api-auth

