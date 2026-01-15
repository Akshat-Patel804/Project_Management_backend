import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanager.com"
        }
    })

    const emailTexual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    // Looking to send emails in production? Check out our Email API/SMTP product!
    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_TRAP_SMTP_HOST,
        port: process.env.MAIL_TRAP_SMTP_PORT,
        auth: {
            user: process.env.MAIL_TRAP_SMTP_USER,
            pass: process.env.MAIL_TRAP_SMTP_PASS
        }
    });

    const mail = {
        from: "mail.demo-taskback@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTexual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
    }catch(error){
        console.error("email service failed scilently");
        console.error("mail trap error",error);
    }
}

const emailVerificationMailContent = (username,verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Wellcome to our project management backend app! we are excited to have you on board",
            action: {
                instructions: "To verify your email please click on this button",
                button: {
                    color: "#22BC66",
                    text: "verify your email",
                    link: verificationUrl,
                }
            },
            outro: "Need Help,or have questions? please reply to this email "
        }
    }
}

const forgotPasswordMailGenContent = (username,passwordResetUrl) => {
    return {
            body: {
            name: username,
            intro: "We got request to reset for the password of your account",
            action: {
                instructions: "to reset the password please click on this button",
                button: {
                    color: "#22bc66",
                    text: "reset password",
                    link: passwordResetUrl ,
                }
            },
            outro: "Need Help,or have questions? please reply to this email "
        }
    }
}

export {
    emailVerificationMailContent,forgotPasswordMailGenContent,sendEmail
}