import { v4 as uuidv4 } from "uuid";
import { ticketService } from "../DAO/mongo/services/tickets.service.js";
import { productService } from "../DAO/mongo/services/products.service.js";
import ticketsModel from "../DAO/mongo/models/tickets.model.js";
import TicketDTO from "../DAO/DTO/tickets.dto.js";
import CustomError from "../DAO/mongo/services/errors/custom-error.js";
import EErros from "../DAO/mongo/services/errors/enum.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import enviarCorreo from "../utils/emailService.js";

// import mercadopago from "mercadopago";

import { entorno } from "../config.js";
import generarPDF from "../utils/pdfService.js";

// mercadopago.configure({
//   access_token: entorno.MERCADOPAGO_KEY,
// });

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false, // Asegúrate de que esto sea falso para el puerto 587
  auth: {
    user: entorno.GOOGLE_MAIL,
    pass: entorno.GOOGLE_PASS,
  },
});

class TicketController {
  async getTickets(req, res) {
    try {
      const tickets = await ticketService.getTickets();

      if (!tickets) {
        CustomError.createError({
          name: "Error-tickets",
          cause: "Tickets was not found",
          message: "Tickets was not found",
          code: EErros.DATABASES_READ_ERROR,
        });

        req.logger.error({
          message: "Tickets was not found",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "success",
        message: "ticket found",
        payload: tickets,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-tickets",
        cause: error,
        message: "An error occurred while fetching tickets",
        code: EErros.DATABASES_READ_ERROR,
      });

      req.logger.error({
        message: "An error occurred while fetching tickets",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async getTicketById(req, res) {
    try {
      const ticketId = req.params.pid;
      const ticket = await ticketService.getTicketById(ticketId);

      if (!ticket) {
        CustomError.createError({
          name: "Error-ticket-by-id",
          cause: "Ticket was not found",
          message: "Ticket was not found",
          code: EErros.DATABASES_READ_ERROR,
        });

        req.logger.error({
          message: "Ticket was not found",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "Success",
        message: "Ticket found",
        payload: ticket,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-ticket-by-id",
        cause: error,
        message: "An error occurred while fetching ticket by ID",
        code: EErros.DATABASES_READ_ERROR,
      });

      req.logger.error({
        message: "An error occurred while fetching ticket by ID",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async getTicketsByStatus(req, res) {
    try {
      const ticketsStatus = req.params.status;
      const tickets = await ticketService.getTicketsByStatus(ticketsStatus);

      if (!tickets) {
        CustomError.createError({
          name: "Error-tickets-by-status",
          cause: "Tickets was not found",
          message: "Tickets was not found",
          code: EErros.DATABASES_READ_ERROR,
        });
        req.logger.debug({
          message: "Ticket was not found",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "success",
        message: "ticket found",
        payload: tickets,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-ticket-by-status",
        cause: error,
        message: "An error occurred while fetching ticket by status",
        code: EErros.DATABASES_READ_ERROR,
      });

      req.logger.error({
        message: "An error occurred while fetching ticket by status",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async addTicket(req, res) {
    try {
      const cop = "COP";
      const SecretoSeguridad = entorno.SecretoSeguridad

      const ticket = req.body;

      let ticketCode = uuidv4().toString();
      let ticketCodeMongo = await ticketsModel
        .findOne({ code: ticketCode })
        .lean();

      while (ticketCode == ticketCodeMongo) {
        ticketCode = uuidv4().toString();
        ticketCodeMongo = await ticketsModel
          .findOne({ code: ticketCode })
          .lean();
      }

      const updatedCart = [];
      for (const cartItem of ticket.cart) {
        const product = await productService.getProductById(cartItem._id);
        if (product && product.stock >= cartItem.cantidad) {
          // await ticketService.updateProducts(cartItem._id, cartItem.cantidad);
          updatedCart.push(cartItem);
        } else {
          return res.status(400).send({
            status: "error",
            error: "Error-add-product-to-the-cart",
            cause: `Product with ID ${cartItem._id} is out of stock or not found.`,
          });
        }
      }

      const ticketDTO = new TicketDTO(ticketCode, ticket, updatedCart);
      await ticketService.addTicket(ticketDTO);

      try {
        var cadenaConcatenada = ticketDTO.code + (ticketDTO.amount * 100) + cop + SecretoSeguridad;
        //Ejemplo
        console.log("cadena: " + cadenaConcatenada);
        const hashHex = crypto.createHash('sha256').update(cadenaConcatenada).digest('hex');
        console.log("HASH: " + hashHex);

        (async () => {
          try {
            const pdfPath = await generarPDF(ticketDTO);
            const result = await transport.sendMail({
              from: entorno.GOOGLE_MAIL,
              to: `${ticketDTO.purchaser},${entorno.GOOGLE_MAIL_SELLER}`, // Cambia esto a una dirección de correo válida para la prueba
              subject: '¡Recibimos tu pedido!',
              html: `
                  <html>
                    <head>
                      <style>
                        body {
                          font-family: Arial, sans-serif;
                          margin: 0;
                          padding: 0;
                          background-color: #f6f6f6;
                        }
                        .container {
                          width: 100%;
                          max-width: 600px;
                          margin: 0 auto;
                          background-color: #ffffff;
                          padding: 20px;
                          border-radius: 8px;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                          text-align: center;
                          padding-bottom: 20px;
                        }
                        .stage img {
                          max-width: 65%;
                          height: auto;
                        }
                        .stage {
                          text-align: center;
                          padding-bottom: 20px;
                        }
                        .header img {
                          max-width: 30%;
                          height: auto;
                        }
                        .content {
                          padding: 20px 0;
                        }
                        .content p {
                          margin: 10px 0;
                        }
                        .highlight {
                          color: #e74c3c;
                          font-weight: bold;
                          font-size: 18px
                        }
                        .footer {
                          text-align: center;
                          font-size: 18px;
                          color: #777777;
                          padding-top: 20px;
                        }
                        
                        .social-icons a {
                          margin: 10px;
                          color: #000;
                          text-decoration: none;
                        }
                        .iconos {
                          width: 30px;
                          height: 30px;
                        }
                        .contact {
                          margin-top: 20px;
                        }.saludo {
                          font-size: 18px;
                        }.medio{
                          font-size: 15px;
                        }

                        @media (max-width: 600px) {
                          .container {
                            padding: 10px;
                            width: 500px;
                          }
                          .content, .footer {
                            padding: 10px 0;
                          }
                          .social-icons a {
                            margin: 5px;
                          }
                        }

                        @media (max-width: 400px) {
                          .container {
                            padding: 10px;
                            width: 400px;
                          }
                          .highlight {
                            font-size: 14px;
                          }
                          .footer {
                            font-size: 16px;
                          }
                          .contact {
                          margin-top: 18px;
                          }
                          .saludo {
                          font-size: 16px;
                          }
                          .medio{
                          font-size: 13px;
                          }
                        }
                      </style>
                      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha384-k6RqeWeci5ZR/Lv4MR0sA0FfDOMW1W4hfM2ne8u3R6jt4XS5fPt6B0hFSkPaB4Qx" crossorigin="anonymous">
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <img src="https://firebasestorage.googleapis.com/v0/b/ciclopista.appspot.com/o/decorative%2Fcplogo%20rojo%20registrado%20R%20m%C3%A1s%20grande%20(1).png?alt=media&token=68739185-9438-4bf9-ac31-9b43b3fa9c87" alt="Ciclopista Logo">
                        </div>
                        <div class="content">
                          <p class="saludo"><strong>¡Hola, ${ticketDTO.name}!</strong></p>
                          <p class="medio">Ya recibimos la información de tu orden. Estamos a la espera de la aprobación del pago, te avisaremos tan pronto la recibamos.</p>
                          <p class="highlight">Recuerda que tu pedido llegará de 3 a 9 días hábiles después de realizada la compra.</p>
                        </div>
                        <div class="stage">
                          <img src="https://firebasestorage.googleapis.com/v0/b/ciclopista.appspot.com/o/decorative%2Fpedidorecibido.png?alt=media&token=3f74ad3e-ef30-4e94-a071-c7137355bbce" alt="Pedido recibido logo">
                        </div>
                        <div class="footer">
                          <p><strong>SÍGUENOS EN REDES</strong></p>
                          <div class="social-icons">
                            <a href="https://instagram.com/ciclopista?igshid=MzRlODBiNWFlZA==" target="_blank"><img src="https://firebasestorage.googleapis.com/v0/b/ciclopista.appspot.com/o/decorative%2Finstagram%20(1).png?alt=media&token=4126c5ee-7bfd-4b02-be1c-e4ef3b86eee8" class="iconos" alt="Instagram logo"></a>
                            <a href="https://www.facebook.com/Ciclopista.repuestosyaccesorios?mibextid=ZbWKwL" target="_blank"><img src="https://firebasestorage.googleapis.com/v0/b/ciclopista.appspot.com/o/decorative%2Ffacebook.png?alt=media&token=280b1d07-9e9d-4008-b5d2-f34d4063ac0e" class="iconos" alt="Facebook logo"></a>
                            <a href="https://www.tiktok.com" target="_blank"><img src="https://firebasestorage.googleapis.com/v0/b/ciclopista.appspot.com/o/decorative%2Ftik-tok.png?alt=media&token=2bc42a56-917f-437d-a445-7873d524e06c" class="iconos" alt="Tik Tok logo"></a>            
                          </div>
                          <div class="contact">
                            <a href="https://wa.link/zxwck6" style="color: inherit; text-decoration: none;"><img src="https://firebasestorage.googleapis.com/v0/b/ciclopista.appspot.com/o/decorative%2Fwhatsapp.png?alt=media&token=c695aedc-da92-4572-a285-d662330e6493" class="iconos" alt="WhatsApp logo"></a>
                            <p>+57 350 604 0725</p>
                          </div>
                        </div>
                      </div>
                    </body>
                  </html>

                `,
              attachments: [
                {
                  filename: `${ticketDTO.code}.pdf`,
                  path: pdfPath,
                }
              ],
            });
            console.log('Test Email sent:', result);
          } catch (error) {
            console.error('Error sending test email:', error);
          }
        })();

        


        return res.send({ status: "OK", message: "Ticket successfully added", payload: ticketCode, hashHex: hashHex, amount: (ticketDTO.amount * 100) });
      } catch (hashError) {
        console.error("Error generating hash:", hashError);
        return res.status(500).send({
          status: "error",
          error: "Internal Server Error",
          cause: "Error generating hash.",
        });
      }



    } catch (error) {
      return res.status(400).send({
        status: "error",
        error: error,
        cause: `Product with ID is out of stock or not found.`,
      });
    }
  }

  async updateTicket(req, res) {
    try {
      const ticketCode = req.params.code;
      const changes = req.body;

      const updatedTicket = await ticketService.updateTicket(ticketCode, changes);

      if (!updatedTicket) {
        CustomError.createError({
          name: "Error-update-ticket",
          cause: "Ticket was not found",
          message: "Ticket was not found",
          code: EErros.DATABASES_READ_ERROR,
        });
        req.logger.debug({
          message: "Ticket was not found",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "OK",
        message: "Ticket successfully updated",
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-update-ticket",
        cause: error,
        message: "An error occurred while updating ticket",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "An error occurred while updating ticket",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async deleteTicket(req, res) {
    try {
      const ticketId = req.params.pid;
      const deletedTicket = await ticketService.deleteTicket(ticketId);

      if (!deletedTicket) {
        req.logger.error({
          message: "Ticket does not exists",
          Date: new Date().toLocaleTimeString(),
        });

        CustomError.createError({
          name: "Error-delete-ticket",
          cause: "Ticket does not exists",
          message: "Ticket does not exists",
          code: EErros.DATABASES_READ_ERROR,
        });
      }

      return res.send({ status: "OK", message: "Ticket deleted successfully" });
    } catch (error) {
      CustomError.createError({
        name: "Error-delete-ticket",
        cause: error,
        message: "An error occurred while deleting ticket",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "An error occurred while deleting ticket",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async getTicketsByUser(req, res) {
    try {
      const userEmail = req.params.email;
      const userWithOrders = await ticketService.getTicketsByUser(userEmail);

      if (!userEmail) {
        req.logger.debug({
          message: "User does not exists",
          Date: new Date().toLocaleTimeString(),
        });

        CustomError.createError({
          name: "Error-user",
          cause: "User does not exists",
          message: "User does not exists",
          code: EErros.DATABASES_READ_ERROR,
        });
      }

      return res.send({
        status: "success",
        message: "user found",
        payload: userWithOrders,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-tickects-by-user",
        cause: error,
        message: "An error occurred while fetching ticket by Email",
        code: EErros.DATABASES_READ_ERROR,
      });

      req.logger.error({
        message: "An error occurred while fetching ticket by Email",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }
}

export const ticketController = new TicketController();
