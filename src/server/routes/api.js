import express from 'express';
import { listarArchivos, subirArchivo, borrarArchivo, descargarArchivo, renombrarArchivo, borrarTodasLasGrabaciones } from '../controllers/driveController.js';
import multer from 'multer';


const router = express.Router(); // Crear un router de express para manejar las rutas de la API de Google Drive
const upload = multer({ dest: 'uploads/' }); // Configuración de multer para subir archivos

// Ruta para listar los archivos en la carpeta de Google Drive.
router.get('/archivos', listarArchivos);

// Ruta para subir un archivo a la carpeta de Google Drive
router.post('/archivos', upload.single('archivo'), subirArchivo);

// Ruta para borrar un archivo de la carpeta de Google Drive
router.delete('/archivos/:id', borrarArchivo);

// Ruta para descargar un archivo de la carpeta de Google Drive
router.get('/archivos/:id', descargarArchivo);

// Ruta para renombrar un archivo de la carpeta de Google Drive
router.patch('/archivos/:id', renombrarArchivo);

// Ruta para borrar todos los archivos de la carpeta de Google Drive
router.delete('/archivos', borrarTodasLasGrabaciones);

export default router;
