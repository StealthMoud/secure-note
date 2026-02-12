const nodemailer = require('nodemailer');

// email service to handle all our sent mail.
// stops us from setupin the transporter a million times.
class EmailService {
    constructor() {
        this._transporter = null;
        this.from = `"Secure Note" <${process.env.EMAIL_USER || 'noreply@securenote.com'}>`;
    }

    // lazy load transport so tests dont blow up if email is down
    get transporter() {
        if (!this._transporter) {
            this._transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'localhost',
                port: process.env.EMAIL_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER || 'test',
                    pass: process.env.EMAIL_PASS || 'test'
                }
            });
        }
        return this._transporter;
    }

    // tell user we got their verification request
    async sendVerificationRequestEmail(user) {
        await this.transporter.sendMail({
            from: this.from,
            to: user.email,
            subject: 'Verification Request Received',
            html: `<p>Your verification request has been received. An admin will review it soon.</p>`
        });
    }

    // send link to verify once admin approves
    async sendVerificationApprovalEmail(user, verificationUrl) {
        await this.transporter.sendMail({
            from: this.from,
            to: user.email,
            subject: 'Email Verification Approved',
            html: `<p>An admin has approved your request. Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
        });
    }

    // send rejection mail if admin says no
    async sendVerificationRejectionEmail(user) {
        await this.transporter.sendMail({
            from: this.from,
            to: user.email,
            subject: 'Email Verification Request Rejected',
            html: `<p>Your email verification request was rejected by an admin. Please contact support for further assistance.</p>`
        });
    }

    // send reset link if they forgot password
    async sendPasswordResetEmail(user, resetURL) {
        await this.transporter.sendMail({
            from: this.from,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click here to reset your password:\n${resetURL}\nIf you didn't request this, ignore this email.`
        });
    }

    // catch-all for any other emails we need to send
    async sendEmail(to, subject, text, html = null) {
        const mailOptions = {
            from: this.from,
            to,
            subject,
            text
        };

        if (html) {
            mailOptions.html = html;
        }

        await this.transporter.sendMail(mailOptions);
    }
}

module.exports = new EmailService();
