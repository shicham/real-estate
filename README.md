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
