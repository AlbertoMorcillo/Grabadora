import express from 'express';
import { listarArchivos, subirArchivo, borrarArchivo, descargarArchivo } from '../controllers/driveController.js';
import multer from 'multer';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Ruta para listar los archivos en la carpeta de Google Drive.
router.get('/archivos', listarArchivos);

// Ruta para subir un archivo a la carpeta de Google Drive
router.post('/archivos', upload.single('archivo'), subirArchivo);

// Ruta para borrar un archivo de la carpeta de Google Drive
router.delete('/archivos/:id', borrarArchivo);

// Ruta para descargar un archivo de la carpeta de Google Drive
router.get('/archivos/:id', descargarArchivo);

export default router;
