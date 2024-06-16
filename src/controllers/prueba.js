import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, // Asegúrate de que esto sea falso para el puerto 587
    auth: {
      user: "importacionesciclopistasas@gmail.com",
      pass: "hmdm kfqn irza ctli",
    },
  });
  
  (async () => {
    try {
      const result = await transport.sendMail({
        from: "importacionesciclopistasas@gmail.com",
        to: 'johan.ardilah@gmail.com', // Cambia esto a una dirección de correo válida para la prueba
        subject: 'Test Email',
        html: '<p>This is a test email.</p>',
      });
      console.log('Test Email sent:', result);
    } catch (error) {
      console.error('Error sending test email:', error);
    }
  })();