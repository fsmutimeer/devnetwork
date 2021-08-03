const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const {check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const authRouter = express.Router();


authRouter.get('/', auth, async (req, res)=>{
   
    try{
        const user = await User.findById(req.user.id).select("-password");
        res.json(user)

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

.post('/', [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res)=>{
   
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const { email, password} = req.body;

    try{
        // Check if user already exists
    let user = await User.findOne({email});

    if(!user){
        return res.status(400).json({errors:[{msg:'Invalid Credentials'}]});
    }

    const passMatch = await bcrypt.compare(password, user.password);

    if (!passMatch){
        return res.status(400).json({errors:[{msg:'Invalid Credentials'}]});
    }

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


module.exports = authRouter;