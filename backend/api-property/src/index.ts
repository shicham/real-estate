import express from 'express';

const app = express();
app.get('/', (_req, res) => res.send('api-property service'));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`api-property running on ${PORT}`));
