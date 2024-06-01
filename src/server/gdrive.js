import { google } from 'googleapis';
import fs from 'fs';
import config from 'config';

class GDrive {
  constructor() {
    const auth = new google.auth.OAuth2(
      config.get('google.clientId'),
      config.get('google.clientSecret')
    );
    auth.setCredentials({ refresh_token: config.get('google.refreshToken') });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async obtenerCarpetas(idCarpetaDrive) {
    const res = await this.drive.files.list({
      q: `'${idCarpetaDrive}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)'
    });
    return res.data.files;
  }

  async obtenerArchivos(idCarpetaDrive) {
    const res = await this.drive.files.list({
      q: `'${idCarpetaDrive}' in parents and mimeType!='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)'
    });
    return res.data.files;
  }

  async obtenerArchivo(idArxiu) {
    const response = await this.drive.files.get({
      fileId: idArxiu,
      alt: 'media'
    }, { responseType: 'stream' });

    return response.data;
  }

  async guardarArchivo(rutaLocal, tipusMIME, idCarpetaDrive, nomArxiuDrive) {
    const fileStream = fs.createReadStream(rutaLocal);

    const fileMetadata = {
      name: nomArxiuDrive,
      parents: [idCarpetaDrive]
    };

    const media = {
      mimeType: tipusMIME,
      body: fileStream
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name'
    });

    return response.data;
  }

  async borrarArchivo(idArxiu) {
    const res = await this.drive.files.delete({
      fileId: idArxiu,
    });

    return res.data;
  }

  async crearCarpeta(idCarpetaDrive, nomCarpetaFilla) {
    const response = await this.drive.files.create({
      resource: {
        name: nomCarpetaFilla,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [idCarpetaDrive]
      },
      fields: 'id, name'
    });
    return response.data;
  }

  async renombrarArchivo(idArxiu, nuevoNombre) {
    const response = await this.drive.files.update({
      fileId: idArxiu,
      requestBody: {
        name: nuevoNombre
      },
      fields: 'id, name'
    });

    return response.data;
  }
}

export default GDrive;
