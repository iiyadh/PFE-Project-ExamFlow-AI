const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../libs/emailSender');


const forgotPassword = async (req,res) =>{
    const { email } = req.body;

    try{
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.resetToken = crypto.randomBytes(32).toString('hex');
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset/${user.resetToken}`;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: 'Password Reset',
            text: `You requested a password reset. Click here to reset your password: ${resetLink}`,
            html: `
               <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            line-height: 1.6;
                            color: #1a1a1a;
                            background-color: #ffffff;
                            margin: 0;
                            padding: 40px 20px;
                        }
                        
                        .container {
                            max-width: 500px;
                            margin: 0 auto;
                            background: #ffffff;
                            border: 1px solid #e5e5e5;
                            border-radius: 8px;
                            padding: 40px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                        }
                        
                        .message {
                            color: #1a1a1a;
                            margin-bottom: 24px;
                            font-size: 16px;
                        }
                        
                        .reset-link {
                            display: inline-block;
                            text-decoration: none;
                            color:#111;
                            background-color:#fff;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-weight: 500;
                            margin: 16px 0;
                            border:1px solid #e5e5e5;
                            transition: all .3s ease;
                        }
                      .reset-link:hover{
                        transform:scale(1.1) translateY(-5px);
                      }
                        
                        .note {
                            font-size: 14px;
                            color: #666666;
                            margin-top: 32px;
                            padding-top: 16px;
                            border-top: 1px solid #e5e5e5;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p class="message">You requested a password reset.</p>
                        <p class="message">Click the link below to reset your password:</p>
                        
                        <a href="${resetLink}" class="reset-link">Reset Password</a>
                        
                        <p class="message">Or copy and paste this link:<br>
                        <span style="color: #666666; font-size: 14px;">${resetLink}</span></p>
                        <p class="note">If you didn't request this, please ignore this email.</p>
                    </div>
                </body>
                </html>
            `,
        };
        await sendEmail(mailOptions);
        res.status(200).json({ message: 'Password reset link sent to your email' });
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


const resetPassword = async (req,res) =>{
    const token = req.params.token;
    const { password  } = req.body;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        const hashedPassword = await bcrypt.hash(password , 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully' });
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    forgotPassword,
    resetPassword
}