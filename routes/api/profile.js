const express = require('express');
const router = express.Router();

//@route GET api/profile
//@Desc  test route
//@Access public

router.get('/', (req,res) => res.send('Profile Route'));

module.exports = router;