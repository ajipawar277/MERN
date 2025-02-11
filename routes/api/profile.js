const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { validationResult, check } = require('express-validator');

//@route GET api/profile/me
//@Desc  Get current user profile
//@Access Private 

router.get('/me', auth, async (req,res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name','avatar']);
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'})
        }
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route POST api/profile
//@Desc  Create or Update current user profile
//@Access Private
router.post('/', [auth,
    [
        check('status', 'status is required').not().isEmpty(),
        check('skills', 'skills is required').not().isEmpty()
    ]
], async (req,res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()){
            console.log(" --");
            return res.status(400).json({ errors: errors.array() })
        }

    const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body;
    //build profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    profileFields.social = {}

    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({user: req.user.id});

        if(profile){
            //update
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new:true}
            );
            return res.json(profile);
        }
        //Create 
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);

    } catch (err) {
        return res.status(500).send('Server Error')
    }
})


//@route Get api/profile
//@Desc  Get All Profiles
//@Access Public

router.get('/',async (req,res) => {
    try {
        const profiles = await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

//@route Get api/profile/user/:user_id
//@Desc  Get All Profile by id
//@Access Public

router.get('/user/:user_id',async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);
        if(!profile) res.status(400).json({msg:'Profile not found'});
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            res.status(400).json({msg:'Profile not found'})
        }
        res.status(500).send("Server Error");
    }
})

//@route Delete api/profile
//@Desc  Delete profile user post
//@Access Private

router.delete('/', auth , async (req,res) => {
    try {
        //remove profile
        await Profile.findOneAndDelete({ user: req.user.id })
        //Remove User
        await User.findOneAndDelete({ _id: req.user.id});

        res.json({msg:'User deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

//@route Put api/profile/experience
//@Desc  Add Profile Experience
//@Access Private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]],async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors:errors.array() });
    }
    const { title, company, location, from, to, current, description } = req.body;
    const newExp = {
        title, company, location, from, to, current, description
    }
    try {
        const profile = await Profile.findOne({ user : req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

//@route Delete api/profile/experience/:exp_id
//@Desc  Delete Experience from Profile
//@Access Private
router.delete('/experience/:exp_id', auth , async (req,res) => {
    try {
        //Get Profile
        const profile = await Profile.findOne({ user: req.user.id });
        //Get Remove Index
        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

//@route Put api/profile/education
//@Desc  Add Profile Education
//@Access Private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]],async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors:errors.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, description } = req.body;
    const newEdu = { school, degree, fieldofstudy, from, to, current, description }
    try {
        const profile = await Profile.findOne({ user : req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

//@route Delete api/profile/education/:edu_id
//@Desc  Delete Education from Profile
//@Access Private
router.delete('/education/:edu_id', auth , async (req,res) => {
    try {
        //Get Profile
        const profile = await Profile.findOne({ user: req.user.id });
        //Get Remove Index
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

module.exports = router;