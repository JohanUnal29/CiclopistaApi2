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

// mercadopago.configure({
//   access_token: entorno.MERCADOPAGO_KEY,
// });

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: entorno.GOOGLE_EMAIL,
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



      // try {
      //   const result = await transport.sendMail({
      //     from: entorno.GOOGLE_EMAIL,
      //     to: ticketDTO.purchaser,
      //     subject: "Test camada 51395",
      //     html: `
      //       <div>
      //         <h1>La mejor camada 51395!</h1>
      //         <p>pero un poco silenciosa.... hay que hablar un poco mas!!!!</p>
      //       </div>
      //     `,
      //   });

      //   res.status(200).send({
      //     status: "success",
      //     message: "Ticket created and email sent successfully",
      //     ticket: ticketDTO,
      //     emailResult: result,
      //   });
      // } catch (emailError) {
      //   console.error("Error sending email:", emailError);
      //   res.status(500).send({
      //     status: "error",
      //     error: "Failed to send email",
      //     message: emailError.message,
      //   });
      // }

      try {
        var cadenaConcatenada = ticketDTO.code + (ticketDTO.amount * 100) + cop + SecretoSeguridad;
        //Ejemplo
        console.log("cadena: " + cadenaConcatenada);
        const hashHex = crypto.createHash('sha256').update(cadenaConcatenada).digest('hex');
        console.log("HASH: " + hashHex);

        // const result = await transport.sendMail({
        //   from: entorno.GOOGLE_EMAIL,
        //   to: ticketDTO.purchaser,
        //   subject: "Test camada 51395",
        //   html: `
        //         <div>
        //           <h1>La mejor camada 51395!</h1>
        //           <p>pero un poco silenciosa.... hay que hablar un poco mas!!!!</p>
        //         </div>
        //       `,
        // });

        // result

        console.log('GOOGLE_EMAIL:', entorno.GOOGLE_MAIL);
        console.log('GOOGLE_PASS:', entorno.GOOGLE_PASS);


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
