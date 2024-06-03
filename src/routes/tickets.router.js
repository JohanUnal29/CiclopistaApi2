import { Router } from "express";
import { ticketController } from "../controllers/tickets.controller.js";
import { ticketValidator } from "../middlewares/tickets.js";
import {checkAdmin} from "../middlewares/auth.js";



//falta el midlleare para validar el ticket

// import {productController} from "../controllers/products.controller.js";
// import { productValidator } from "../middlewares/product.js";


const router = Router();

//productos paginados
router.get("/:uid", checkAdmin, ticketController.getTickets);

router.get("/id/:pid/:uid", checkAdmin, ticketController.getTicketById);

router.get("/status/:status/:uid", ticketController.getTicketsByStatus);

router.get("/ticketsuser/:email", ticketController.getTicketsByUser);

router.post("/addticket", ticketValidator, ticketController.addTicket);

router.put("/:id", ticketController.updateTicket);

router.delete("/:pid/:uid", checkAdmin, ticketController.deleteTicket);

export default router;