
var express = require('express');
var request = require('request');
// Cheerio 是一个Node.js的库， 它可以从html的片断中构建DOM结构，然后提供像jquery一样的css选择器查询
var cheerio = require('cheerio');

var Entities = require('html-entities').XmlEntities;//转换成中文
entities = new Entities();
var db=require('node_db').db;

/* 过滤页面信息 */
function filterSlideList(url,title,html) {
    if (html) {
        // 沿用JQuery风格，定义$
        var $ = cheerio.load(html);
        // 根据class获取列表信息
        var slideList = $('.WB_artical');
        // 轮播图数据
        var slideListData = [];

        var main_toppic_html=entities.decode(slideList.find(".main_toppic").html());
        var main_editor_html=entities.decode(slideList.find(".main_editor").html());
        slideListData.push({
            url:url,
            title:title,
            main_toppic_html:main_toppic_html,
            main_editor_html:main_editor_html
        })
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
            var url=item.url;
            var title=item.title;
            var main_toppic_html = item.main_toppic_html;
            var main_editor_html = item.main_editor_html;
            //添加实例
            var  addSql = 'INSERT INTO details(url,title,maintoppic,maineditor,createtime) VALUES(?,?,?,?,?)';
            var  addSqlParams =[url, title,main_toppic_html,main_editor_html,new Date(),];
            db.query(addSql,addSqlParams,function(result,fields){
                // console.log('添加成功')
            });

        });
    }
}

module.exports={
    weibohotCrawDetails:async function (list) {
        for (var i=0;i<list.length;i++){
            await requestsss(list[i].url,list[i].title);

        }
    },
};
 function  requestsss(url,title) {
    return new Promise((resolve) => {
        request({
            url:url,
            method: 'GET', // 请求方法
            headers: { // 指定请求头
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8', // 指定 Accept-Language
                'Cookie':'SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9W5YEj-j-kzRNorjKoKHzXED; SUB=_2AkMrgau0f8NxqwJRmfodzG3hb4h_wgHEieKd3VpvJRMxHRl-yj9jqhwCtRB6AAGFW3cb63RE5UWrUIaIb2SdMpGAMARm; SINAGLOBAL=9515749621587.707.1557996683748; TC-V5-G0=b1761408ab251c6e55d3a11f8415fc72; _s_tentry=-; Apache=7091301601901.689.1558058138616; ULV=1558058138705:3:3:3:7091301601901.689.1558058138616:1558019241509; YF-V5-G0=d30fd7265234f674761ebc75febc3a9f; YF-Page-G0=6affec4206bb6dbb51f160196beb73f2|1558058940|1558058939; TC-Page-G0=7a922a70806a77294c00d51d22d0a6b7|1558059759|1558059669',
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var slideListData = filterSlideList(url,title,body);
                // 打印信息
                printInfo(slideListData);
            }
        });
        let time = Math.random() * 1000;               //为了模拟每次请求的时长不同，这里每次等待随机时间0到1s
        setTimeout(() => resolve({url,title, time}), time) ;         //请求结束之后，调用回调函数
    })
}