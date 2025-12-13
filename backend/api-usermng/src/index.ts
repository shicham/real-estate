import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`api-usermng running on ${PORT}`));
