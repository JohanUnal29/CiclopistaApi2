import nodemailer from "nodemailer";
import { entorno } from "../config.js";
import generarPDF from "./pdfService.js";

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: entorno.GOOGLE_EMAIL,
      pass: entorno.GOOGLE_PASS,
    },
  });
  
  const enviarCorreo = async (ticketDTO) => {
    try {
      const pdfPath = await generarPDF(ticketDTO);
      
      const mailOptions = {
        from: entorno.GOOGLE_EMAIL,
        to: ticketDTO.purchaser,
        subject: 'Copia de tu Ticket',
        text: 'Adjunto encontrarás el PDF con los detalles de tu ticket.',
        attachments: [
          {
            filename: `${ticketDTO.code}.pdf`,
            path: pdfPath,
          }
        ],
      };
  
      return new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            return reject(error);
          }
          resolve(info.response);
        });
      });
    } catch (error) {
      throw new Error('Error generating or sending PDF: ' + error.message);
    }
  };
  
  export default enviarCorreo;