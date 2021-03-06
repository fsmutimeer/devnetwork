const express = require('express');
const profileRouter = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const request = require('request');


profileRouter
.get('/me',auth,  async (req, res)=>{

   try{
       const profile = await Profile.findOne({user:req.user.id}).populate('user', ['name','avatar']);
       if(!profile){
           return res.status(400).json({msg:'Not found'})
       }

   }
   catch(err){
       console.error(err.message);
       res.status(500).send('Server Error');
   }
});

profileRouter.post('/',
 [auth, 
    [check('status','Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty()
    ]
], 
async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website= website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){ profileFields.skills = skills.split(',').map(skill=>skill.trim())};
    
    profileFields.social = {}

    if(youtube) profileFields.social.youtube = youtube;
    if(facebook) profileFields.social.facebook = facebook;
    if(twitter) profileFields.social.twitter = twitter;
    if(instagram) profileFields.social.instagram = instagram;
    if(linkedin) profileFields.social.linkedin = linkedin;

    try{
        let profile = await Profile.findOne({user:req.user.id});
        //update
        if(profile){
            profile = await Profile.findOneAndUpdate(
                {user:req.user.id},
                { $set: profileFields },
                {new:true}
                );

            return res.json(profile);
        }
        //create 
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});


profileRouter.get('/', async (req, res)=>{
    try{
        const profiles = await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
profileRouter.get('/user/:user_id', async (req, res)=>{
    try{
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);

        if(!profile) return res.status(400).json({msg:'Profile not found'})
        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg:'Profile not found'})
        }
        res.status(500).send('Server Error');
    }
})

profileRouter.delete('/',auth, async (req, res)=>{

    try{

        await Profile.findOneAndRemove({user:req.user.id});
        await User.findOneAndRemove({_id:req.user.id});
        res.json({msg:"User Deleted"})

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

//Add Experience

profileRouter.put('/experience', auth,
 [check('title', 'Title is required')
    .not()
        .isEmpty(),
    check('company','Company is required')
        .not()
            .isEmpty(),
    check('from','from date is required')
        .not()
            .isEmpty()],
            async (req, res)=>{

                const errors = validationResult(req);
                if(!errors.isEmpty()){
                    res.status(400).json({errors:errors.array()});
                }

                
                    const {
                        title,
                        company,
                        location,
                        from,
                        to,
                        current,
                        description
                    } = req.body;

                    const newExp = {
                        title, 
                        company,
                        location,
                        from,
                        to,
                        current,
                        description
                    }

                try{

                 const profile = await Profile.findOne({user:req.user.id});
                 profile.experience.unshift(newExp);
                 await profile.save()
                 res.json(profile)

                }
                catch(err){
                    console.error(err.message);
                    res.status(500).json('Server Error');
                }
            });

//delete expe
profileRouter.delete('/experience/:exp_id',auth, async (req, res)=>{

    try{

        const profile =await Profile.findOne({user:req.user.id});
        //removeIndex
        const indexRemove = profile.experience
            .map(item=>item.id)
            .indexOf(req.params.exp_id);

        profile.experience.splice(indexRemove, 1);

        await profile.save();
        res.json(profile)

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

//add edu

profileRouter.put('/education', auth,
 [check('school', 'school is required')
    .not()
        .isEmpty(),
    check('degree','degree is required')
        .not()
            .isEmpty(),
    check('fieldofstudy','fieldofstudy is required')
        .not()
            .isEmpty(),
    check('from','from date is required')
        .not()
            .isEmpty()],
            async (req, res)=>{

                const errors = validationResult(req);
                if(!errors.isEmpty()){
                    res.status(400).json({errors:errors.array()});
                }

                
                    const {
                        school,
                        degree,
                        fieldofstudy,
                        from,
                        to,
                        current,
                        description
                    } = req.body;

                    const newEdu = {
                        school,
                        degree,
                        fieldofstudy,
                        from,
                        to,
                        current,
                        description
                    }

                try{

                 const profile = await Profile.findOne({user:req.user.id});
                 profile.education.unshift(newEdu);
                 await profile.save()
                 res.json(profile)

                }
                catch(err){
                    console.error(err.message);
                    res.status(500).json('Server Error');
                }
            });

//delete edu
profileRouter.delete('/education/:edu_id',auth, async (req, res)=>{

    try{

        const profile =await Profile.findOne({user:req.user.id});
        //removeIndex
        const indexRemove = profile.education
            .map(item=>item.id)
            .indexOf(req.params.edu_id);

        profile.education.splice(indexRemove, 1);

        await profile.save();
        res.json(profile)

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

//Get github profile 

profileRouter.get('/github/:username', async (req, res)=>{
    try{
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.git_client_Id}&client_secret=${process.env.git_client_secret}`,
            method:'GET',
            headers:{ 'user-agent':'node.js'}
        };

        request(options, (error, response, body)=>{
            if(error) console.error(error);
            if(response.statusCode !== 200){
               return res.status(404).json({msg:'No Github profile found'});
            }
            res.json(JSON.parse(body));
        })


    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

module.exports = profileRouter;