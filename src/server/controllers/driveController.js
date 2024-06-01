import GDrive from '../gdrive.js';
import multer from 'multer';
import config from 'config';

const drive = new GDrive();
const upload = multer({ dest: 'uploads/' });

export const listarArchivos = async (req, res) => {
  try {
    const archivos = await drive.obtenerArchivos(config.get('google.driveFolderId'));
    res.json(archivos);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const subirArchivo = async (req, res) => {
  try {
    const { file } = req;
    const { originalname, mimetype, path: filePath } = file;
    const archivoGuardado = await drive.guardarArchivo(filePath, mimetype, config.get('google.driveFolderId'), originalname);
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

export const descargarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const archivo = await drive.obtenerArchivo(id);
    archivo.pipe(res);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
