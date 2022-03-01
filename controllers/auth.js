const User = require("../models/User");
const {createToken}= require('../utils/TokenHandler');
//const {validateSchema} = require('../models/validate');
const handleErrors = require('../utils/ErrorHandler')


module.exports.signup_Get = (req, res) => {
    res.render('signup');
}

module.exports.signup_Post = async (req, res) => {   
    const {
        email,
        password
    } = req.body;
    
    //"Do not forget to decompose this codes according to their functionality"

    //IN HERE I HAVE TO USE HAPI/JOY TO VALIDATE AND RESPOND WITH EJS
    //I WILL SEND THE ERROR TYPE
    
    // don't forget bcrypt!
    try {
        const user = await User.create({
            email,
            password
        });

        const token = createToken(user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 2.592e+8
        }).json({user:user._id});;
        res.status(201).json({user:user._id});
    }
     catch (err) {
        const errors = handleErrors.handleErrors(err)//IYREBAM
        res.status(400).json({errors});
    }
}


module.exports.login_Get = (req, res) => {
    res.render('login');
}

module.exports.login_Post = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.login(email, password);
      res.json({ user: user._id });
    } catch (err) {
      res.status(400).json({});
    }
}