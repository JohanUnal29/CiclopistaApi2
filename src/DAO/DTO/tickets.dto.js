export default class TicketDTO {
    constructor(ticketCode, ticket, cart) {
        this.code = ticketCode;
        this.purchase_datetime = new Date().toLocaleString('en-US', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
        this.name = ticket.name;
        this.purchaser = ticket.purchaser;
        this.phone = ticket.phone;
        this.message = ticket.message;
        this.departamento = ticket.departamento;
        this.ciudad_o_municipio = ticket.ciudad_o_municipio;
        this.barrio = ticket.barrio;
        this.direccion = ticket.direccion;
        this.referencias_entrega = ticket.referencias_entrega;
        this.cart = cart.map(item => ({
            _id: item._id,
            title: item.title,
            code: item.code,
            thumbnails: item.thumbnails,
            quantity: item.cantidad,
            price: item.price,
        }));
        this.amount = ticket.amount;
    }
}