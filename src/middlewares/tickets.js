export const ticketValidator = (req, res, next) => {
    const { name, purchaser, phone, cart, amount } = req.body;

    if (!name || !purchaser || !phone || !cart || !amount) {
        return res.status(400).send({
            status: "Error",
            error: "Error, faltan campos por rellenar!",
        });
    } else {
        return next();
    }
};