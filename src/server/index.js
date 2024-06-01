import express from 'express';
import config from 'config';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = config.get('server.port');

app.use(express.json());
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
