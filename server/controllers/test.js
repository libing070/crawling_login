var express = require('express');
var router = express.Router();

router.get('/test',function (req, res) {
    res.render('test', { title: 'Express' });
});
router.get('/testsss',function(req, res){
    res.json({"a":1});
});
module.exports = router;