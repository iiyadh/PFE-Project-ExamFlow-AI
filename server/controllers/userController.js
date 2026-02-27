const User = require('../models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { sendEmail } = require('../libs/emailSender');



const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};



const fetchUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleBlockUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = user.status === 'active' ? 'suspended' : 'active';
        await user.save();
        res.json({ message: `User ${user.status === 'active' ? 'unblocked' : 'blocked'} successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};


const linkWithGoogle = async (req, res) =>{
    const { token } = req.params;
    const uid = req.user.id;
    try{
        const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const { sub } = googleRes.data;
        let user = await User.findById(uid);

        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        if(user.googleId && user.googleId !== sub){
            return res.status(400).json({ message: 'Google account already linked to another user' });
        }
        user.googleId = sub;
        await user.save();
        res.json({ message: 'Google account linked successfully' ,googleId : sub});
    }catch(err){
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}


const sendOTPCode = async (req,res) =>{
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const OTPCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.OTPCode = OTPCode;
        user.OTPCodeExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your OTP Code for Password Reset',
            html: `
                <html>
                <head>
                    <style>
                        .container {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            background-color: #f9f9f9;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            text-align: center;
                        }
                        .otp-code {
                            font-size: 24px;
                            font-weight: bold;
                            color: #333;
                            margin: 20px 0;
                        }
                        .message {
                            font-size: 16px;
                            color: #555;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p class="message">You requested a password reset. Use the following OTP code to reset your password. This code is valid for 10 minutes.</p>
                        <div class="otp-code">${OTPCode}</div>
                    </div>
                </body>
                </html>
            `
        };
        await sendEmail(mailOptions);
        res.json({ message: 'OTP code sent to email' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyOTPCode = async (req,res) =>{
    const { email , OTPCode } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.OTPCode !== OTPCode || user.OTPCodeExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP code' });
        }
        user.OTPCode = null;
        user.OTPCodeExpiry = null;
        user.status = 'active';
        await user.save();
        res.json({ message: 'OTP code verified' });
    }catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
};


const changePassword = async (req,res) =>{
    const { currentPassword , newPassword } = req.body;
    const uid = req.user.id;
    try {
        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        const hashedPassword = await bcrypt.hash(newPassword , 10);
        user.password = hashedPassword;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    }catch(err){
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const editProfile = async (req,res) =>{
    const uid = req.user.id;

    const { username, numTel, address , pfpUrl } = req.body;
    try{
        const user = await User.findById(uid);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        user.username = username || user.username;
        user.numTel = numTel || user.numTel;
        user.address = address || user.address;
        user.pfpUrl = pfpUrl || user.pfpUrl;
        await user.save();
        res.json({ message: 'Profile updated successfully' });
    }catch(err){
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    getUserProfile,
    fetchUsers,
    toggleBlockUser,
    deleteUser,
    linkWithGoogle,
    sendOTPCode,
    verifyOTPCode,
    changePassword,
    editProfile
};