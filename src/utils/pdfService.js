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
        { text: 'Detalles del Ticket', style: 'header', margin: [0, 0, 0, 10] },
        { text: [{ text: 'Código: ', style: 'bold' }, ticketDTO.code], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Fecha: ', style: 'bold' }, ticketDTO.purchase_datetime], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Nombre: ', style: 'bold' }, ticketDTO.name], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Documento: ', style: 'bold' }, ticketDTO.identification_document], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Comprador: ', style: 'bold' }, ticketDTO.purchaser], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Teléfono: ', style: 'bold' }, ticketDTO.phone], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Mensaje: ', style: 'bold' }, ticketDTO.message], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Departamento: ', style: 'bold' }, ticketDTO.departamento], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Ciudad o Municipio: ', style: 'bold' }, ticketDTO.ciudad_o_municipio], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Barrio: ', style: 'bold' }, ticketDTO.barrio], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Dirección: ', style: 'bold' }, ticketDTO.direccion], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Referencias de entrega: ', style: 'bold' }, ticketDTO.referencias_entrega], margin: [0, 0, 0, 5] },
        { text: [{ text: 'Monto Total: $', color: 'red', style: 'bold' }, { text: ticketDTO.amount, color: 'red' }], margin: [0, 10, 0, 10] },
        { text: 'Productos en el carrito', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: [100, '*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Imagen', style: 'tableHeader' },
                { text: 'Producto', style: 'tableHeader' },
                { text: 'Código', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader' },
                { text: 'Precio', style: 'tableHeader' }
              ]
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
    const tableIndex = docDefinition.content.findIndex(
      (item) => item.table
    );

    if (tableIndex === -1) {
      reject(new Error('No se encontró la tabla en el contenido del documento'));
      return;
    }

    const tableBody = docDefinition.content[tableIndex].table.body;

    for (const item of ticketDTO.cart) {
      const imageBase64 = await loadImage(item.image);
      const row = [
        imageBase64 ? { image: 'data:image/png;base64,' + imageBase64, fit: [50, 50] } : 'Sin imagen',
        item.title,
        item.code,
        item.quantity.toString(),
        item.price.toString()
      ];
      tableBody.push(row);
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
