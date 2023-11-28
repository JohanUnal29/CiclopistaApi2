import { v4 as uuidv4 } from "uuid";
import { ticketService } from "../DAO/mongo/services/tickets.service.js";
import { productService } from "../DAO/mongo/services/products.service.js";
import ticketsModel from "../DAO/mongo/models/tickets.model.js";
import TicketDTO from "../DAO/DTO/tickets.dto.js";
import CustomError from "../DAO/mongo/services/errors/custom-error.js";
import EErros from "../DAO/mongo/services/errors/enum.js";
// import mercadopago from "mercadopago";

// import { entorno } from "../config.js";

// mercadopago.configure({
//   access_token: entorno.MERCADOPAGO_KEY,
// });



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
          await ticketService.updateProducts(cartItem._id, cartItem.cantidad);
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

      // const items = updatedCart.map((item) => {
      //   return {
      //     id: item._id, // Debes asignar un ID único a cada producto
      //     title: item.title,
      //     currency_id: "COP", // Asegúrate de que la moneda sea la correcta
      //     picture_url: item.thumbnails, // URL de la imagen del producto
      //     description: `Código: ${item.code}`, // Agrega información adicional si es necesario
      //     quantity: item.quantity,
      //     unit_price: item.price,
      //   };
      // });

      // const preference = {
      //   items: items,
      //   payer: {
      //     name: ticket.name,
      //     surname: ticket.purchaser,
      //     email: ticket.email,
      //     phone: {
      //       area_code: "57", // Ajusta según tus datos
      //       number: ticket.phone,
      //     },
      //   },
      //   back_urls: {
      //     success: "http://localhost:3000/",
      //     failure: "http://www.failure.com",
      //     pending: "http://www.pending.com",
      //   },
      //   auto_return: "approved",
      //   // Resto de la configuración de MercadoPago
      // };

      // // Luego, puedes llamar a la API de MercadoPago para crear la preferencia
      // client.preferences
      //   .create(preference)
      //   .then((response) => res.status(200).send(response))
      //   .catch((error) => res.status(400).send({ error: error.message }));

      return res.send({ status: "OK", message: "Ticket successfully added" });
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
      const ticketId = req.params.pid;
      const changes = req.body;

      const updatedTicket = await ticketService.updateTicket(ticketId, changes);

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
