const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    //Get token from header
    const token = req.header('x-auth-token');

    //Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'no Token, authenrization denied' });
    }

    //verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        console.log('decoded', decoded);

        req.user = decoded.user; //add user info to every valid req
        next();
    } catch (error) {
        res.status(401).json({ msg: 'token is not valid' });
    }
};
