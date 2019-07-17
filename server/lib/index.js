"use strict";
const weiboLogin = require('./weibo_login.js').weiboLogin;
const request = require('request');
const fs = require('fs');
const querystring = require('querystring');
var logger = require('node_log').logger.getLogger();
// Cheerio 是一个Node.js的库， 它可以从html的片断中构建DOM结构，然后提供像jquery一样的css选择器查询
var cheerio = require('cheerio');
var CronJobs = require('cron').CronJob;//定时任务
var Entities = require('html-entities').XmlEntities;//转换成中文


var db=require('node_db').db;
module.exports={
    crawling: async function (keyword) {
        console.log("关键字："+keyword);
        // 读取获取到的cookies文件
        let cookies = fs.readFileSync(__dirname + '/cookies.txt');
        if(cookies.toString()==""){//不存在进行登录
            const userInfoHTML = await new weiboLogin('18046536574', 'lb8561070').init();
            let userInfoData=userInfoHTML.match(/{(.*)}/gi);
            userInfoData = JSON.parse(userInfoData);
           // console.log('userInfo ===================== ', userInfoData);
        }
        let result;
        try{
            let  res=await keywordSearch(keyword,1,0);
            let totals= await getPageCount(res).totals;
            console.log("总页数："+totals);
            let currPage=0;
            let cronJobs= await new CronJobs('*/1 * * * * *', function() {//1秒执行一次
              currPage++;
              keywordSearch(keyword,currPage,totals);
              if(currPage>=totals){//抓取结束
                cronJobs.stop();
                console.log("数据抓取完成！");
              }
            }, null, true);
           return await totals;
        } catch(e){
            console.log(e);
            return;
        }

    }
}
  function keywordSearch(keyword,currPage,totals) {
      // 构造
      // 读取获取到的cookies文件
      let cookies = fs.readFileSync(__dirname + '/cookies.txt');
      let headers = {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:48.0) Gecko/20100101 Firefox/48.0",
          'Accept-Language': 'en-US,en;q=0.5',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'Keep-Alive',
          'cookie': cookies.toString()
      };
      let options = {
          method: 'GET',
          url: 'https://s.weibo.com/article?q='+encodeURI(keyword)+'&Refer=pic_article&page='+currPage, // 此url可以自己构造
          headers: headers,
          gzip: true
      }
      return  new Promise((resolve, reject) => {
          request(options, (error, response, body) => {
              if (!error && response.statusCode == 200) {
                  response.setEncoding('utf-8');
                  if(totals!=0){//获取总页数 进行数据写入
                      var slideListData =  filterSlideList(response.body,currPage,totals,keyword);
                      if(slideListData!=undefined&&slideListData.length>0){
                          console.log(slideListData.length);
                          // 打印信息
                          printInfo(slideListData);
                      }
                  }else{
                      resolve(response.body);
                  }
              } else {
                  reject(error);
              }
          })
      }).catch(new Function());
  }

  //获取总页数
  function getPageCount(html){
      let totals=0,sum=0;
      if (html) {
          let  entities = new Entities();
          // 沿用JQuery风格，定义$
          var $ = cheerio.load(html);
          var pages = $('.m-page');
          totals=pages.find('ul li').length;

          var sums = $('.m-error');
          sum=entities.decode(sums.html()).split("，")[0];
      }
      return  {
          sum:sum,//总条数
          totals:totals//总页数
      };
  }

/* 过滤页面信息 */
  function filterSlideList(html,currPage,totals,keyword) {
    if (html) {
        let  entities = new Entities();
        // 沿用JQuery风格，定义$
        var $ = cheerio.load(html);
        // 根据class获取列表信息
        var pages = $('.m-page');
        // 列表图数据
        //console.log(entities.decode(pages.find('.pagenum').html()).split("<i")[0]);
        if(currPage==totals){
            // console.log("数据抓取完成！");
        }else{
            var slideList = $('#pl_feed_main');
            var slideListData = [];
            /* 列表信息遍历 */
            slideList.find('.card-wrap').each(function(item) {

                var list = $(this);
                //详情页跳转链接
                var url=list.find("h3").find("a").attr("href");
                //图片链接
                var picurl=list.find(".content .pic").find("a").find("img").attr("src");
                //标题
                var reg1 = new RegExp('<em class="s-color-red">', "g");
                var reg2 = new RegExp('</em>', "g");
                var title=(entities.decode(list.find("h3").find("a").html())).replace(reg1,"").replace(reg2,"");
                //标题链接
                var titleurl=list.find("h3").find("a").attr("href");
                //文本描述
                var descs=(entities.decode(list.find('.content .detail .txt').html())).replace(reg1,"").replace(reg2,"");
                //  图标链接
                var  iconurl='';

                //  图标标题

                var hasAtagLen=list.find(".content .detail .act div").children("span").eq(0).children().length;
                if(hasAtagLen==0){//不含子元素
                    var  icontitle=entities.decode(list.find(".content .detail .act div").children("span").eq(0).html());
                }else{
                    var  icontitle=entities.decode(list.find(".content .detail .act div").children("span").eq(0).find('a').eq(0).html());
                }
                //  日期
                var  time=entities.decode(list.find(".content .detail .act div").children("span").eq(1).html());
                //向数组插入数据
                if(url!=undefined){
                    slideListData.push({
                        url : url,
                        type:0,//文章
                        descs:descs,
                        picurl : picurl,
                        title:title,
                        titleurl:titleurl,
                        iconurl:iconurl,
                        icontitle:icontitle,
                        time:time,
                        keyword:keyword
                    });
                }

            });
            // 返回列表信息
            return slideListData;
        }

    }
}


/* 打印信息 */
function printInfo(slideListData) {
    // 计数
    var count = 0;
    // 遍历信息列表
    if(slideListData!=null&&slideListData!=undefined&&slideListData.length>0){
        slideListData.forEach(function(item) {
            // 获取图片
            var url = item.url;
            var picurl = item.picurl;
            var title = item.title;
            var titleurl = item.titleurl;
            var iconurl = item.iconurl;
            var icontitle=item.icontitle;
            var time = item.time;
            var descs =item.descs;
            var type=item.type;
            var keyword=item.keyword;

            // 打印信息
            logger.info('第' + (++count) + '条数据');
            logger.info(url);
            logger.info(descs);
            logger.info(type);
            logger.info(picurl);
            logger.info(title);
            logger.info(titleurl);
            logger.info(iconurl);
            logger.info(icontitle);
            logger.info(time);
            logger.info(keyword);
            logger.info('\n');
            //添加实例
            var  addSql = 'INSERT INTO crawlings(url,title,type,titleurl,descs,keyword,picurl,iconurl,icontitle,time,createtime,createtimestring) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
            var  addSqlParams =[url, title,type,titleurl,descs,keyword,picurl,iconurl, icontitle,time,new Date(),new Date().getTime()+count];
            console.log(addSqlParams);
            db.query(addSql,addSqlParams,function(result,fields){
            });

        });
    }

}




































// 获取登录成功后的html的一个示例
function getHtml(url) {
    // 构造
    // 读取获取到的cookies文件
    let cookies = fs.readFileSync(__dirname + '/cookies.txt');
    let headers = {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:48.0) Gecko/20100101 Firefox/48.0",
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'Keep-Alive',
        'cookie': cookies.toString()
    };
    let options = {
        method: 'GET',
        url: 'https://s.weibo.com/article?q=%E4%B8%B0%E7%94%B0&Refer=weibo_article', // 此url可以自己构造，这里是某个微博评论页面：http://weibo.com/1745602624/D6L8QhaFs?type=repost 的json接口，
        headers: headers,
        gzip: true
    }
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                response.setEncoding('utf-8');
                resolve(response.body);
            } else {
                reject(error);
            }
        })
    })

}

function toggleLike(mid = 4283811094856047, chaohua = '1008089470188e683443b4ac25eafac100278f') {
    let cookies = fs.readFileSync('./cookies.txt');
    let headers = {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:48.0) Gecko/20100101 Firefox/48.0",
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'Keep-Alive',
        "Referer": `https://weibo.com/p/${chaohua}/super_index`,
        'cookie': cookies.toString()
    };
    let options = {
        method: 'POST',
        url: 'https://weibo.com/aj/v6/like/add?ajwvr=6&__rnd=',
        headers: headers,
        gzip: true
    }
    return new Promise((resolve, reject) => {
        request({
            ...options,
            credentials: "include", // include, same-origin, *omit
            body: `mid=${mid}`,
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                response.setEncoding('utf-8');
                resolve(response.body);
            } else {
                reject(error);
            }
        })
    })
}

function follow(uid=2216389422, chaohua = '1008089470188e683443b4ac25eafac100278f'){
    let cookies = fs.readFileSync('./cookies.txt');
    let headers = {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:48.0) Gecko/20100101 Firefox/48.0",
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'Keep-Alive',
        "Referer": `https://weibo.com/p/${chaohua}/super_index`,
        'cookie': cookies.toString()
    };
    let options = {
        method: 'POST',
        url: 'https://weibo.com/aj/proxy?ajwvr=6&__rnd=',
        headers: headers,
        gzip: true
    }
    return new Promise((resolve, reject) => {
        request({
            ...options,
            credentials: "include", // include, same-origin, *omit
            body: querystring.stringify({
                uid: uid,
                objectid:`1022%3A${chaohua}`,
                f:1,
                location: `page_${chaohua.slice(0, 6)}_super_index`,
                oid: `${chaohua.slice(6)}`,
                wforce: 1,
                nogroup: 1,
                template: 4,
                isinterest: true,
                api: `http://i.huati.weibo.com/aj/superfollow`,
                pageid: `${chaohua}`,
                reload: 1,
                _t:0
            })
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                response.setEncoding('utf-8');
                resolve(response.body);
            } else {
                reject(error);
            }
        })
    })
}

function checkin(chaohua = '1008089470188e683443b4ac25eafac100278f'){
    let url = `https://weibo.com/p/aj/general/button`;

    let cookies = fs.readFileSync('./cookies.txt');
    let headers = {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:48.0) Gecko/20100101 Firefox/48.0",
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'Keep-Alive',
        "Referer": `https://weibo.com/p/${chaohua}/super_index`,
        'cookie': cookies.toString()
    };
    let options = {
        method: 'GET',
        url: `${url}?ajwvr=6&api=http://i.huati.weibo.com/aj/super/checkin&status=1&id=${chaohua}&location=page_${chaohua.slice(0, 6)}_super_index`,
        headers: headers,
        gzip: true
    }
    return new Promise((resolve, reject) => {
        request({
            ...options,
            credentials: "include"
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                response.setEncoding('utf-8');
                resolve(response.body);
            } else {
                reject(error);
            }
        })
    })
}