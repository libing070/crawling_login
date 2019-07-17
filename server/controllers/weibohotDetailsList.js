var express = require('express');
var db=require('node_db').db;
var logger = require('node_log').logger.getLogger();
var router = express.Router();

//获取最新的十条数据
router.post('/loadhtml',function(req,res,next){
    var url = req.body.url;
    var selectSql='select  * from details where url = "'+url+'" LIMIT 1';
    logger.info('传入的参数：url=['+url+']  请求接口：['+req.originalUrl+']  sql：['+selectSql+']');
    db.query(selectSql,function(result,fields){
        if(fields.length>0){
         //   logger.info("返回数据集："+JSON.stringify(fields));
            res.json(fields);
        }else{
            res.end('Error');
            return next();
        }
    });
})
module.exports = router;