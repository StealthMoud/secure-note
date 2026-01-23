const nodemailer = require('nodemailer');

/**
 * email service for centralized email operations
 * eliminates duplicate transporter configuration and email logic
 */
class EmailService {
    constructor() {
        this._transporter = null;
        this.from = `"Secure Note" <${process.env.EMAIL_USER || 'noreply@securenote.com'}>`;
    }

    // lazy load transporter to avoid initialization errors in tests
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

    /**
     * send verification request received email
     * @param {Object} user - user document
     */
    async sendVerificationRequestEmail(user) {
        await this.transporter.sendMail({
            from: this.from,
            to: user.email,
            subject: 'Verification Request Received',
            html: `<p>Your verification request has been received. An admin will review it soon.</p>`
        });
    }

    /**
     * send verification approval email with token
     * @param {Object} user - user document
     * @param {string} verificationUrl - verification url with token
     */
    async sendVerificationApprovalEmail(user, verificationUrl) {
        await this.transporter.sendMail({
            from: this.from,
            to: user.email,
            subject: 'Email Verification Approved',
            html: `<p>An admin has approved your request. Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
        });
    }

    /**
     * send verification rejection email
     * @param {Object} user - user document
     */
    async sendVerificationRejectionEmail(user) {
        await this.transporter.sendMail({
            from: this.from,
            to: user.email,
            subject: 'Email Verification Request Rejected',
            html: `<p>Your email verification request was rejected by an admin. Please contact support for further assistance.</p>`
        });
    }

    /**
     * send password reset email
     * @param {Object} user - user document
     * @param {string} resetURL - password reset url with token
     */
    async sendPasswordResetEmail(user, resetURL) {
        await this.transporter.sendMail({
            from: this.from,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click here to reset your password:\n${resetURL}\nIf you didn't request this, ignore this email.`
        });
    }

    /**
     * send generic email
     * @param {string} to - recipient email
     * @param {string} subject - email subject
     * @param {string} text - plain text content
     * @param {string} html - html content (optional)
     */
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

// export singleton instance
module.exports = new EmailService();
