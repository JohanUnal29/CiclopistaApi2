import PDFDocument from 'pdfkit';
import PDFTable from 'pdfkit-table';
import fs from 'fs'; 

import axios from 'axios';

import path from 'path';

const __dirname = path.resolve();

const generarPDF = (ticketDTO) => {
  return new Promise(async (resolve, reject) => {
    const dir = path.join(__dirname, 'tickets');
    const filePath = path.join(dir, `${ticketDTO.code}.pdf`);

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
    const logoPath = path.join(__dirname, 'logo', 'cplogo.png'); // Ruta al logo de tu empresa
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

    // Configuración de la tabla usando pdfkit-table
    const table = {
      title: 'Productos en el carrito',
      headers: ['Producto', 'Código', 'Cantidad', 'Precio', 'Imagen'],
      rows: [],
    };

    for (const item of ticketDTO.cart) {
      // Descargar la imagen y agregarla al PDF
      try {
        const response = await axios.get(item.image, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        const imageDataURI = `data:image/png;base64,${imageBuffer.toString('base64')}`;

        // Agregar fila a la tabla con los datos del producto
        table.rows.push([
          item.title,
          item.code.toString(),
          item.quantity.toString(),
          item.price.toString(),
          { image: imageDataURI, fit: [50, 50] }, // Objeto con la imagen y ajuste de tamaño
        ]);
      } catch (error) {
        console.error(`Error downloading image for product ${item.title}:`, error);
        // Puedes manejar el error según tus necesidades (por ejemplo, mostrar un texto alternativo)
        table.rows.push([
          item.title,
          item.code.toString(),
          item.quantity.toString(),
          item.price.toString(),
          'Imagen no disponible',
        ]);
      }
    }

    // Opciones adicionales para la tabla
    const tableOptions = {
      width: 500,
      prepareHeader: () => doc.font(headerFont).fontSize(10).fillColor(headerColor),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => doc.font(bodyFont).fontSize(10),
    };

    // Generar la tabla en el documento PDF
    await PDFTable.create(doc, table, tableOptions);

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