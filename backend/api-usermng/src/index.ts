import express from 'express';

const app = express();
app.get('/', (_req, res) => res.send('api-usermng service'));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`api-usermng running on ${PORT}`));
