var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
 var loggermorgan = require('morgan');
var logger=require('./server/node_modules/node_log').logger.getLogger();
var bodyParser = require('body-parser');
var testRouter=require('./server/controllers/test');
var searchKeyWordRouter=require('./server/lib/searchKeyWord');
//var crawling=require('./server/controllers/crawling/weibohotCrawList');//app.js引入weibohotCrawList.js定时任务内部执行 不需要路由
//var weiboLogin=require('./server/lib/index');//app.js引入server/lib/index 实现模拟登录定时任务内部执行 不需要路由

var weibohotListRouter = require('./server/controllers/weibohotList');
var weibohotDetailsListRouter = require('./server/controllers/weibohotDetailsList');


var ejs=require('ejs');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'web/views'));
// app.set('view engine', 'ejs');
app.engine('.html',ejs.__express);//使用html
app.set('view engine', 'html');

 app.use(loggermorgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'web/public')));
app.use(express.static(path.join(__dirname, 'web/views')));//访问views目录下的html

app.use('/test', testRouter);
app.use('/search', searchKeyWordRouter);

app.use('/weibohotList', weibohotListRouter);
app.use('/weibohotDetails', weibohotDetailsListRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = app.listen(3000, function () {
    logger.info("-----------------------------------[服务器已开启。端口号为:3000]-------------------------------------------");
});

