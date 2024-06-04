import express from 'express'; // Importar express
import config from 'config'; // Importar el módulo de configuración
import path from 'path'; // Importar el módulo path
import { fileURLToPath } from 'url'; // Importar la función fileURLToPath
import apiRoutes from './routes/api.js'; // Importar las rutas de la API

// Convertir `import.meta.url` a `__dirname`
const __filename = fileURLToPath(import.meta.url); // Obtener el nombre del archivo actual
const __dirname = path.dirname(__filename); // Obtener el directorio del archivo actual

const app = express();
const PORT = config.get('server.port'); // Puerto del servidor

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
