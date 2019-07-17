var express = require('express');
var db=require('node_db').db;
var logger = require('node_log').logger.getLogger();
var router = express.Router();

//获取最新的十条数据
router.get('/dbList',function(req,res,next){
    var selectSql='select * from crawlings order by createtimestring DESC limit 10';
    logger.info("请求接口：["+req.originalUrl+"]  sql：["+selectSql+"]");
    db.query(selectSql,function(result,fields){
        if(fields.length>0){
            logger.info("返回数据集："+JSON.stringify(fields));
            res.json(fields);
        }else{
            res.end('Error');
            logger.info("Error");
            return next();
        }
    });
})

//获取总数据条数
router.get('/dbListSum',function(req,res,next){
    var selectSql='select count(*) as sum from crawlings';
    logger.info("请求接口：["+req.originalUrl+"]  sql：["+selectSql+"]");
    db.query(selectSql,function(result,fields){
        if(fields.length>0){
            logger.info("返回数据集："+JSON.stringify(fields));
            res.json(fields);
        }else{
            res.end('Error');
            return next();
        }
    });
})


router.post('/dbListByPage',function(req,res,next){
    var prevOrnext=req.body.prevOrnext;//"0"表示上一页  "1"表示下一页;
    var pageNum = req.body.pageNum;
    var firstCreatetimestring=req.body.firstCreatetimestring;
    var lastCreatetimestring=req.body.lastCreatetimestring;
    var selectSql="";
    if(prevOrnext=="0"){
        selectSql ='select * from (select * from crawlings where createtimestring>'+firstCreatetimestring+' LIMIT 10) as tb1 ORDER BY createtimestring DESC';//这里注意是降序
        logger.info("传入的参数：createtimestring=["+firstCreatetimestring+"]  请求接口：["+req.originalUrl+"]  sql：["+selectSql+"]");
    }else{
        selectSql ='select * from crawlings where createtimestring<'+lastCreatetimestring+' ORDER BY createtimestring DESC ,id DESC  LIMIT 10;';//这里注意是降序
        logger.info("传入的参数：createtimestring=["+lastCreatetimestring+"]  请求接口：["+req.originalUrl+"]  sql：["+selectSql+"]");
    }
    db.query(selectSql,function(result,fields){
        if(fields.length>0){
            logger.info("返回数据集："+JSON.stringify(fields));
            res.json(fields);
        }else{
            res.end('Error');
            return next();
        }
    });
})

module.exports = router;