import ticketsModel from "../models/tickets.model.js";
import { productService } from "./products.service.js";
import { UserModel } from "../models/users.model.js";


class TicketService {
  constructor() {}

  addTicket = async (ticket) => {
    try {
      const createdTicket = await ticketsModel.create(ticket);
      const user = await UserModel.findOne({ email: ticket.purchaser });

      if (user) {
        user.tickets.push({ ticket: createdTicket._id });
        await user.save();
      }
      // await enviarCorreo(ticket);
      return createdTicket;
    } catch (error) {
      CustomError.createError({
        name: "Error-add-ticket-IN-SERVICE",
        cause: error,
        message: "An error occurred while adding the ticket",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  getTickets = async () => {
    try {
      const tickets = await ticketsModel.find().lean();
      return tickets;
    } catch (error) {
      CustomError.createError({
        name: "Error-GET-tickets-IN-SERVICE",
        cause: error,
        message: "An error occurred while fetching tickets",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  getTicketById = async (id) => {
    try {
      const ticket = await ticketsModel.findOne({ _id: id }).lean();
      return ticket;
    } catch (error) {
      CustomError.createError({
        name: "Error-ticket-by-id-IN-SERVICE",
        cause: error,
        message: "An error occurred while fetching ticket by ID",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  getTicketsByUser = async (email) => {
    try {
      const user = await UserModel.findOne({ email }).populate(
        "orderHistory.order"
      );
      return user;
    } catch (error) {
      CustomError.createError({
        name: "Error-tickects-by-user-IN-SERVICE",
        cause: error,
        message: "An error occurred while fetching ticket by Email",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  deleteTicket = async (id) => {
    try {
      const deletedTicket = await ticketsModel.deleteOne({ _id: id });
      return deletedTicket;
    } catch (error) {
      CustomError.createError({
        name: "Error-delete-ticket-IN-SERVICE",
        cause: error,
        message: "An error occurred while deleting ticket",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  updateTicket = async (ticketCode, changes) => {
    try {
      const updatedTicket = await ticketsModel.updateOne({ code: ticketCode }, changes);
      return updatedTicket;
    } catch (error) {
      CustomError.createError({
        name: "Error-update-ticket-IN-SERVICE",
        cause: error,
        message: "An error occurred while updating ticket",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  updateProducts = async (id, count) => {
    try {
      const productById = await productService.getProductById(id);
      const updateStock = productById.stock - count;
      const changes = {
        stock: updateStock,
      };
      await productService.updateProduct(id, changes);
    } catch (error) {
      CustomError.createError({
        name: "Error-update-products-IN-SERVICE",
        cause: error,
        message: "An error occurred while updating products",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  getTicketsByStatus = async (status) => {
    try {
      const tickets = await ticketsModel.find({ status: status }).lean();
      return tickets;
    } catch (error) {
      CustomError.createError({
        name: "Error-ticket-by-status-IN-SERVICE",
        cause: error,
        message: "An error occurred while fetching ticket by status",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };
}

export const ticketService = new TicketService();
