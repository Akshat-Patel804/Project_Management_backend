import Mailgen from "mailgen";

const emailVerificationMailContent = (username,varificationUrl) => {
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
    emailVerificationMailContent,forgotPasswordMailGenConten
}