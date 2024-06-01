import express from 'express';
import config from 'config';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

// Convertir `import.meta.url` a `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.get('server.port');

// Middleware para manejar JSON
app.use(express.json());

// Rutas de la API
app.use('/api', apiRoutes);

// Servir archivos estáticos
const clientPath = path.resolve(__dirname, '../client');
app.use(express.static(clientPath));

// Servir el archivo index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
