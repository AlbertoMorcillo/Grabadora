import GDrive from '../gdrive.js';
import multer from 'multer';
import config from 'config';

const drive = new GDrive(); // Instancia de la clase GDrive
const upload = multer({ dest: 'uploads/' }); // Configuración de multer

export const listarArchivos = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query; // Página y tamaño de página
    const archivos = await drive.obtenerArchivos(config.get('google.driveFolderId')); // Obtener archivos
    const total = archivos.length;
    const paginatedFiles = archivos.slice((page - 1) * pageSize, page * pageSize);
    res.json({ total, archivos: paginatedFiles });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const subirArchivo = async (req, res) => {
  try {
    const { file } = req;
    const { mimetype, path: filePath } = file;
    const fecha = new Date();
    const fechaStr = fecha.toISOString().replace(/T/, ' ').replace(/\..+/, ''); // Formatear la fecha a string sin milisegundos
    const nombreArchivo = `Grabacion ${fechaStr}.wav`;
    const archivoGuardado = await drive.guardarArchivo(filePath, mimetype, config.get('google.driveFolderId'), nombreArchivo); // Guardar archivo
    res.json(archivoGuardado);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const borrarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    await drive.borrarArchivo(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const borrarTodasLasGrabaciones = async (req, res) => {
  try {
    const archivos = await drive.obtenerArchivos(config.get('google.driveFolderId'));
    const deletePromises = archivos.map(archivo => drive.borrarArchivo(archivo.id));
    await Promise.all(deletePromises);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).send(error.message);
  }
};


export const descargarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const archivo = await drive.obtenerArchivo(id);
    archivo.pipe(res);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const renombrarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre.endsWith('.wav')) {
      return res.status(400).send('El nombre del archivo debe terminar con .wav');
    }
    const archivoRenombrado = await drive.renombrarArchivo(id, nombre);
    res.json(archivoRenombrado);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
