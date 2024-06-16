import PDFDocument from 'pdfkit';
import fs from 'fs'; 

import axios from 'axios';

import path from 'path';

const __dirname = path.resolve();

const generarPDF = (ticketDTO) => {
  return new Promise(async (resolve, reject) => {
    const dir = path.join(__dirname, 'tickets');
    const filePath = path.join(dir, `${ticketDTO.code}.pdf`);

    // Verificar si la carpeta 'tickets' existe, si no, crearla
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Configuración de estilos
    const headerFont = 'Helvetica-Bold';
    const bodyFont = 'Helvetica';
    const headerColor = '#336699';
    const bodyColor = '#000000';

    // Título
    doc
      .font(headerFont)
      .fontSize(24)
      .fillColor(headerColor)
      .text('Detalles del Ticket', {
        align: 'center',
        underline: true,
      });
    doc.moveDown();

    // Información del Ticket
    doc.font(bodyFont).fontSize(12).fillColor(bodyColor);
    doc.text(`Código: ${ticketDTO.code}`);
    doc.text(`Fecha: ${ticketDTO.purchase_datetime}`);
    doc.text(`Nombre: ${ticketDTO.name}`);
    doc.text(`Comprador: ${ticketDTO.purchaser}`);
    doc.text(`Teléfono: ${ticketDTO.phone}`);
    doc.text(`Mensaje: ${ticketDTO.message}`);
    doc.text(`Departamento: ${ticketDTO.departamento}`);
    doc.text(`Ciudad o Municipio: ${ticketDTO.ciudad_o_municipio}`);
    doc.text(`Barrio: ${ticketDTO.barrio}`);
    doc.text(`Dirección: ${ticketDTO.direccion}`);
    doc.text(`Referencias de entrega: ${ticketDTO.referencias_entrega}`);
    doc.text(`Monto: ${ticketDTO.amount}`, { bold: true });
    doc.moveDown();

    // Logo de la empresa
    const logoPath = path.join(__dirname, 'logo', 'cplogo.png'); // Ajusta el nombre del archivo de tu logo
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      doc.image(logoBuffer, 400, 10, { fit: [100, 100], align: 'right' });
    }

    // Título de Productos en el Carrito
    doc.moveDown();
    doc
      .font(headerFont)
      .fontSize(18)
      .fillColor(headerColor)
      .text('Productos en el carrito', {
        underline: true,
      });
    doc.moveDown();

    // Configuración de la tabla de productos
    const columnWidths = [150, 100, 50, 100, 100]; // Ajusta los anchos de columna según sea necesario

    // Encabezados de la tabla
    doc.font(headerFont).fontSize(12).fillColor(bodyColor);
    doc.text('Producto', { width: columnWidths[0], align: 'left' });
    doc.text('Código', { width: columnWidths[1], align: 'left' });
    doc.text('Cantidad', { width: columnWidths[2], align: 'left' });
    doc.text('Precio', { width: columnWidths[3], align: 'left' });
    doc.text('Imagen', { width: columnWidths[4], align: 'left' });
    doc.moveDown();

    // Detalles de Productos en el Carrito
    for (const item of ticketDTO.cart) {
      // Nombre del producto
      doc.font(bodyFont).fontSize(12).fillColor(bodyColor);
      doc.text(item.title, { width: columnWidths[0], align: 'left' });

      // Código
      doc.text(item.code.toString(), { width: columnWidths[1], align: 'left' });

      // Cantidad
      doc.text(item.quantity.toString(), { width: columnWidths[2], align: 'left' });

      // Precio
      doc.text(item.price.toString(), { width: columnWidths[3], align: 'left' });

      // Descargar la imagen y agregarla al PDF
      try {
        const response = await axios.get(item.image, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        doc.image(imageBuffer, doc.x + 10, doc.y - 12, { fit: [50, 50] });
        doc.moveDown();
      } catch (error) {
        console.error(`Error downloading image for product ${item.title}:`, error);
        doc.text('Imagen no disponible');
        doc.moveDown();
      }
    }

    doc.end();

    stream.on('finish', () => {
      resolve(filePath);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
};

export default generarPDF;