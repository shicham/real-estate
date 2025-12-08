import express from 'express';

const app = express();
app.get('/', (_req, res) => res.send('api-auth service'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`api-auth running on ${PORT}`));
