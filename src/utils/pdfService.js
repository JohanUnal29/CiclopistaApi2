import PDFDocument from 'pdfkit';

import path from 'path';

const generarPDF = (ticketDTO) => {
  return new Promise((resolve, reject) => {
    const dir = './tickets';
    const filePath = path.join(dir, `${ticketDTO.code}.pdf`);

    // Verificar si la carpeta 'tickets' existe, si no, crearla
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Título
    doc
      .fontSize(20)
      .fillColor('#0000FF')
      .text('Detalles del Ticket', {
        align: 'center',
        underline: true,
      });
    doc.moveDown();

    // Información del Ticket
    doc.fontSize(14).fillColor('#000000');
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
    doc.text(`Monto: ${ticketDTO.amount}`);
    doc.moveDown();

    // Título de Productos en el Carrito
    doc
      .fontSize(16)
      .fillColor('#0000FF')
      .text('Productos en el carrito:', {
        underline: true,
      });
    doc.moveDown();

    // Detalles de Productos en el Carrito
    ticketDTO.cart.forEach(item => {
      doc.fontSize(14).fillColor('#000000');
      doc.text(`Producto: ${item.title}`);
      doc.text(`Código: ${item.code}`);
      doc.text(`Cantidad: ${item.quantity}`);
      doc.text(`Precio: ${item.price}`);
      doc.image(item.image, {
        fit: [100, 100],
        align: 'center',
        valign: 'center',
      });
      doc.moveDown();
    });

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