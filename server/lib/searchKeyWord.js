var express = require('express');
var router = express.Router();
var db=require('node_db').db;
var logger = require('node_log').logger.getLogger();
var index=require('./index.js');
router.get('/keyword',function (req, res) {
    res.render('keyword', { title: 'Express' });
});

router.post('/crawling',function(req,res,next){
    var keyword=req.body.keyword;
     index.crawling(keyword).then((result)=>{
        setTimeout(function () {
            let json={duration:result-2};//延迟2秒 减去2秒
            res.json(json);
        },2000);
    });//进行数据写入
});
router.post('/getCurrTotals',function (req, res,next) {
    var keyword=req.body.keyword;
    var selectSql='SELECT * from crawlings where keyword ="'+keyword+'"';
    logger.info('传入的参数：keyword=['+keyword+']  请求接口：['+req.originalUrl+']  sql：['+selectSql+']');
    db.query(selectSql,function(result,fields){
        if(fields.length>0){
            res.json(fields);
        }else{
            res.end('Error');
            return next();
        }
    });
});
module.exports = router;