const express = require('express');
const router = express.Router();

//@route GET api/aouth
//@Desc  test route
//@Access public

router.get('/', (req,res) => res.send('Auth Route'));

module.exports = router;