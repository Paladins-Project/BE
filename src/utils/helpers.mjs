import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import sgMail from '@sendgrid/mail';
dotenv.config();

const saltRounds = 10;
export const hashPassword = (passport) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log(salt);
    return bcrypt.hashSync(passport, salt);
}

export const comparePassword = (plain, hash) =>{
    return bcrypt.compare(plain, hash);
};

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, text, html) => {
    try {
        const msg = {
            to: to,
            from: {
                name: 'DailyMate',
                email: process.env.FROM_EMAIL
            },
            subject: subject,
            text: text,
            html: html,
        };

        await sgMail.send(msg);
        console.log('Email sent successfully to:', to);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('SendGrid error response:', error.response.body);
        }
        return { success: false, message: 'Failed to send email', error: error.message };
    }
};

export const sendVerificationEmail = async (email, verificationCode) => {
    const subject = 'Xác thực tài khoản DailyMate';
    const text = `Mã xác thực của bạn là: ${verificationCode}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Xác thực tài khoản DailyMate</h2>
            <p>Chào bạn,</p>
            <p>Mã xác thực của bạn là:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;">
                ${verificationCode}
            </div>
            <p>Mã này sẽ hết hạn trong 10 phút.</p>
            <p>Trân trọng,<br>Đội ngũ DailyMate</p>
        </div>
    `;
    
    return await sendEmail(email, subject, text, html);
};