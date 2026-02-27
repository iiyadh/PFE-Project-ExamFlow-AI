const jwt = require('jsonwebtoken');
const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';


const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.exp * 1000 < Date.now()) {
            res.clearCookie('token', {
                httpOnly: true,
                sameSite: IS_PRODUCTION ? 'none' : 'lax',
                secure: IS_PRODUCTION,
                path: "/"
            });
            return res.status(401).json({ message: 'Token expired' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}




module.exports = { verifyToken , authorizeRoles };