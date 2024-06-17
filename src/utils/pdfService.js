import fs from 'fs';
import axios from 'axios';
import path from 'path';
import PDFDocument from 'pdfkit';
import PDFKitTable from 'pdfkit-table';

const __dirname = path.resolve();

const generarPDF = async (ticketDTO) => {
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
  const bodyFont = 'Helvetica'; // Usando Helvetica estándar de pdfkit
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

  // Crear la tabla de productos usando pdfkit-table
  const tableRows = [];

  for (const item of ticketDTO.cart) {
    let imageDataUri = '';
    try {
      const response = await axios.get(item.image, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      imageDataUri = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
      console.error(`Error downloading image for product ${item.title}:`, error);
    }

    const rowData = {
      Producto: { image: imageDataUri, title: item.title }, // Incluir la imagen y el título del producto
      Código: item.code,
      Cantidad: item.quantity.toString(),
      Precio: item.price.toString(),
    };

    tableRows.push(rowData);
  }

  // Configurar y dibujar la tabla usando pdfkit-table
  const table = new PDFKitTable(doc, {
    margin: { top: 10 },
    headers: ['Producto', 'Código', 'Cantidad', 'Precio'],
    prepareHeader: () => doc.font(headerFont).fontSize(8).fillColor(headerColor),
    prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font(bodyFont).fontSize(8).fillColor(bodyColor),
  });

  table.addPlugin(PDFKitTable.autoTablePlugin);

  await table.startNewPage();

  for (const row of tableRows) {
    await table.addBodyRow({
      Producto: { image: row.Producto.image, width: 50, height: 50 }, // Ajusta el tamaño de la imagen según tus necesidades
      Código: row.Código,
      Cantidad: row.Cantidad,
      Precio: row.Precio,
    });
  }

  doc.end();

  return filePath;
};

export default generarPDF;
