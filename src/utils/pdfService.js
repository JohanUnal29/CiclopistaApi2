import fs from 'fs';
import path from 'path';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';

// Registrar las fuentes necesarias
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const __dirname = path.resolve();

const generarPDF = (ticketDTO) => {
  return new Promise(async (resolve, reject) => {
    const dir = path.join(__dirname, 'tickets');
    const filePath = path.join(dir, `${ticketDTO.code}.pdf`);

    // Verificar si la carpeta 'tickets' existe, si no, crearla
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    // Función para cargar la imagen desde URL y convertirla a base64
    const loadImage = async (url) => {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary').toString('base64');
      } catch (error) {
        console.error('Error al descargar la imagen:', error);
        return null;
      }
    };

    // Definir el contenido del documento
    const docDefinition = {
      content: [
        { text: 'Detalles del Ticket', style: 'header' },
        { text: 'Código: ' + ticketDTO.code },
        { text: 'Fecha: ' + ticketDTO.purchase_datetime },
        { text: 'Nombre: ' + ticketDTO.name },
        { text: 'Comprador: ' + ticketDTO.purchaser },
        { text: 'Teléfono: ' + ticketDTO.phone },
        { text: 'Mensaje: ' + ticketDTO.message },
        { text: 'Departamento: ' + ticketDTO.departamento },
        { text: 'Ciudad o Municipio: ' + ticketDTO.ciudad_o_municipio },
        { text: 'Barrio: ' + ticketDTO.barrio },
        { text: 'Dirección: ' + ticketDTO.direccion },
        { text: 'Referencias de entrega: ' + ticketDTO.referencias_entrega },
        { text: 'Monto: ' + ticketDTO.amount, style: 'bold' },
        { text: 'Productos en el carrito', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: [100, '*', 'auto', 'auto'],
            body: [
              [{ text: 'Imagen', style: 'tableHeader' }, { text: 'Producto', style: 'tableHeader' }, { text: 'Código', style: 'tableHeader' }, { text: 'Cantidad', style: 'tableHeader' }, { text: 'Precio', style: 'tableHeader' }]
            ]
          },
          margin: [0, 10, 0, 10]
        }
      ],
      styles: {
        header: { fontSize: 24, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 18, bold: true, margin: [0, 10, 0, 5] },
        bold: { bold: true },
        tableHeader: { bold: true, fillColor: '#CCCCCC' }
      },
      defaultStyle: { fontSize: 12, margin: [0, 5, 0, 5] }
    };

    // Cargar logo
    const logoPath = path.join(__dirname, 'logo', 'cplogo.png');
    if (fs.existsSync(logoPath)) {
      const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
      docDefinition.content.unshift({
        image: 'data:image/png;base64,' + logoBase64,
        fit: [100, 100],
        alignment: 'right'
      });
    }

    // Cargar imágenes de los productos y construir las filas de la tabla
    for (const item of ticketDTO.cart) {
      const imageBase64 = await loadImage(item.image);
      const row = [
        { image: imageBase64 ? 'data:image/png;base64,' + imageBase64 : null, fit: [50, 50] },
        item.title,
        item.code,
        item.quantity.toString(),
        item.price.toString()
      ];
      // Asegurarse de que la tabla y el cuerpo existan antes de agregar la fila
      if (docDefinition.content[13] && docDefinition.content[13].table && docDefinition.content[13].table.body) {
        docDefinition.content[13].table.body.push(row);
      } else {
        console.error('La tabla o el cuerpo de la tabla no están definidos');
        reject(new Error('La tabla o el cuerpo de la tabla no están definidos'));
        return;
      }
    }

    // Generar el PDF
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBase64((data) => {
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      resolve(filePath);
    });
  });
};

export default generarPDF;
