const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const axios = require('axios');



const JWT_SECRET = process.env.JWT_SECRET ;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ;
const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';

const cookieOptions = {
    httpOnly: true,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    secure: IS_PRODUCTION,
    path: "/"
};

const generateToken = (user) =>{
    const payload = {
        id: user._id,
        role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const login = async (req , res)=>{
    const { email, password , remmberMe } = req.body;
    try{
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user , user.role);
        user.lastLogin = Date.now();
        await user.save();
        res.cookie('token', token, {...cookieOptions , maxAge: remmberMe ? 7 * 24 * 60 * 60 * 1000 : undefined });
        res.json({message : 'Login successful' , role : user.role});
    }catch(err){
        res.status(500).json({ message: 'Server error' });
    }
}

const register = async (req , res)=>{
    const { username, email, password } = req.body;
    try{
        let user = await User.findOne({ email });
        if(user){
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            username,
            email,
            password: hashedPassword,
            lastLogin: Date.now(),
        });
        await user.save();
        const token = generateToken(user);
        res.cookie('token', token, cookieOptions);
        res.status(201).json({ message: 'User registered successfully' , role : user.role});
    }catch(err){
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const signWithGoogle = async (req, res) =>{
    const { token } = req.params;
    try{
        const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const { sub } = googleRes.data;
        let user = await User.findOne({ googleId : sub });
        if(!user){
            res.status(400).json({ message: 'User not signed with google' });
        }
        user.lastLogin = Date.now();
        await user.save();
        const jwtToken = generateToken(user);
        res.cookie('token', jwtToken, cookieOptions);
        res.json({ message: 'Login with Google successful' , role : user.role});
    }catch(err){
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const logout = (req , res)=>{
    res.clearCookie('token', cookieOptions);
    res.status(200).json({ message: 'Logout successful' });
}

const checkAuth = async (req , res)=> {
    const userStatus = await User.findById(req.user.id).select('status');
    try{
        if(req.user){
            return res.status(200).json({ isAuthenticated: true , role : req.user.role , status : userStatus.status} );
        }
        res.status(400).json({ isAuthenticated: false });
    }catch(err){
        res.status(500).json({ message: 'Server error' });
        console.log(err);
    }
}


module.exports = {
    login,
    register,
    logout,
    checkAuth,
    signWithGoogle
}