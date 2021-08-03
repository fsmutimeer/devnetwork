const express = require('express');

const User = require('../../models/User');
const {check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const userRouter = express.Router();

userRouter
.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please use a valid email').isEmail(),
    check('password', 'Password must be 6 or more').isLength({min:6})
], async (req, res)=>{
   
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {name, email, password} = req.body;

    try{
        // Check if user already exists
    let user = await User.findOne({email});

    if(user){
        return res.status(400).json({errors:[{msg:'User Already Exists'}]});
    }
        //Get user gravatar
        const avatar = gravatar.url(email, {
            s:'200',
            r:'pg',
            m:'mm'
        })
       
        user =  new User({
            name,
            email,
            avatar,
            password
        })

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
           user: {
               id:user.id
            }
        };

        jwt.sign(
            payload,
            process.env.secret,
            {expiresIn:36000},
            (err, token)=>{
                if (err) throw err;
                res.json({token});
            })

        //return jsonwebtoken
    }
    catch(err){
        console.log(err.message);
        return res.status(500).send('Server Error');
    }
})


module.exports = userRouter;