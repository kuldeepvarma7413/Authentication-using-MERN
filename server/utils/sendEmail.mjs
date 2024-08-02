import nodemailer from "nodemailer";

async function sendEmail(email, subject, text){
  // console.log('Sending email')
  if (!email ||!subject ||!text) {
      throw new Error('Email, subject, and text are required');
  }

  try {
      const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          service: process.env.EMAIL_SERVICE,
          port: Number(process.env.EMAIL_PORT),
          secure: Boolean(process.env.EMAIL_SECURE),
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      });

      await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: subject,
          text: text
      });
  } catch (e) {
      console.error('Error sending email:', e);
      throw new Error('Error sending email');
  }
};

export default sendEmail;