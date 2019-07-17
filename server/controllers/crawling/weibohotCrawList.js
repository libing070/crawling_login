var express = require('express');
var request = require('request');
var logger = require('node_log').logger.getLogger();
// Cheerio 是一个Node.js的库， 它可以从html的片断中构建DOM结构，然后提供像jquery一样的css选择器查询
var cheerio = require('cheerio');

var Entities = require('html-entities').XmlEntities;//转换成中文
entities = new Entities();

var CronJob = require('cron').CronJob;//定时任务


var db=require('node_db').db;
var details=require('./weibohotCrawDetails.js');
new CronJob('10 * * * * *', function() {//每分钟的第十秒执行
    const d = new Date();
    console.log(d);
    request({
        url: 'https://weibo.com/a/aj/transform/loadingmoreunlogin?ajwvr=6&category=1760&page=2&lefnav=0&cursor=&__rnd=1558319103467', // 请求的URL
        method: 'GET', // 请求方法
        headers: { // 指定请求头
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8', // 指定 Accept-Language
           // 'Cookie': 'Ugrow-G0=8751d9166f7676afdce9885c6d31cd61; SUB=_2AkMrhyJ1f8NxqwJRmfodzG3hb4h_wgHEieKd29OuJRMxHRl-yT9jqkUgtRB6AAcMm0DRLw1GHeLdXmZIDmzKRTJobbpU; SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9W5YEj-j-kzRNorjKoKHzXED; login_sid_t=4299ab35c6deb6913526d99578b30fca; cross_origin_proto=SSL; TC-V5-G0=634dc3e071d0bfd86d751caf174d764e; _s_tentry=passport.weibo.com; wb_view_log=1280*7201.5; Apache=3524170772658.133.1557900616633; SINAGLOBAL=3524170772658.133.1557900616633; ULV=1557900616643:1:1:1:3524170772658.133.1557900616633:; YF-V5-G0=70942dbd611eb265972add7bc1c85888; UOR=,,localhost:63342; YF-Page-G0=aedd5f0bc89f36e476d1ce3081879a4e|1557918956|1557918954; TC-Page-G0=45685168db6903150ce64a1b7437dbbb|1557919760|1557919752; WBStorage=e4e08ad1044aa883|undefined' // 指定 Cookie
            'Cookie':'Ugrow-G0=8751d9166f7676afdce9885c6d31cd61; SUB=_2AkMrvoEcf8NxqwJRmfodzG3hb4h_wgHEieKd4nDHJRMxHRl-yT83qm0OtRB6AD6v8nxfGB0kFuUTs0CuqiSgwgtvi949; SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9W5YEj-j-kzRNorjKoKHzXED; login_sid_t=c24c0a0b99cae90b8eacaba35fa7e60a; cross_origin_proto=SSL; YF-V5-G0=8c4aa275e8793f05bfb8641c780e617b; WBStorage=53830d4156ad61ab|undefined; _s_tentry=passport.weibo.com; wb_view_log=1280*7201.5; Apache=3172373771683.963.1558318642381; SINAGLOBAL=3172373771683.963.1558318642381; ULV=1558318642394:1:1:1:3172373771683.963.1558318642381:; YF-Page-G0=afcf131cd4181c1cbdb744cd27663d8d|1558318675|1558318674'
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var slideListData = filterSlideList(JSON.parse(body).data);
            // 打印信息
            printInfo(slideListData);

            //将数据url传给获取详情页函数
            getDetailsData(slideListData);
        }
    });
}, null, true);

/* 过滤页面信息 */
function filterSlideList(html) {
    if (html) {
        // 沿用JQuery风格，定义$
        var $ = cheerio.load(html);
        // 根据class获取列表信息
        var slideList = $('#PCD_pictext_i_v5');
        // 列表图数据
        var slideListData = [];

        /* 列表信息遍历 */
        slideList.find('.pt_ul .UG_list_b').each(function(item) {

            var list = $(this);
            //详情页跳转链接
            var url=list.attr("href");
            //图片链接
            var picurl=list.find(".W_piccut_v").find("img").attr("src");
            //标题
            var title=entities.decode(list.find(".list_des .list_title_b").find("a").html());
            //标题链接
            var titleurl=list.find(".list_des .list_title_b").find("a").attr("href");

            //  图标链接
            var  iconurl=list.find(".list_des .subinfo_box").find("img").attr("src");

            //  图标标题
            var  icontitle=entities.decode(list.find(".list_des .subinfo_box").find("a").eq(1).find(".S_txt2").html());
            //  日期
            var  time=entities.decode(list.find(".list_des .subinfo_box").children("span.S_txt2").html());
            // 向数组插入数据
            slideListData.push({
                url : url,
                picurl : picurl,
                title:title,
                titleurl:titleurl,
                iconurl:iconurl,
                icontitle:icontitle,
                time:time

            });
        });
        // 返回列表信息
        return slideListData;
    } else {
        console.log('无数据传入！');
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

            // 打印信息
            logger.info('第' + (++count) + '条数据');
            logger.info(url);
            logger.info(picurl);
            logger.info(title);
            logger.info(titleurl);
            logger.info(iconurl);
            logger.info(icontitle);
            logger.info(time);
            logger.info('\n');
            //添加实例
            var  addSql = 'INSERT INTO crawlings(url,title,titleurl,picurl,iconurl,icontitle,time,createtime,createtimestring) VALUES(?,?,?,?,?,?,?,?,?)';
            var  addSqlParams =[url, title,titleurl,picurl,iconurl, icontitle,time,new Date(),new Date().getTime()+count];
            console.log(addSqlParams);
            db.query(addSql,addSqlParams,function(result,fields){
                console.log(fields);

            });

        });
    }

}

//抓取详情页数据
//列表插入完成之后开始抓取详情页的数据  参数为传入当前列表集合的url
function getDetailsData(slideListData) {
    details.weibohotCrawDetails(slideListData);
}

