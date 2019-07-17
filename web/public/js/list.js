$(function () {
    var firstCreatetimestring="",  lastCreatetimestring="";//获取时间戳
    var page=1;
    var sum=0;
    $.ajax({
        url:'/weibohotList/dbList',
        type: 'get',
        headers: {
            Accept: "application/json; charset=utf-8"
        },
        success:function(json){
            if(json!=null&&json.length>0){
                firstCreatetimestring=json[0].createtimestring;//获取当前返回第一条数据的时间戳
                lastCreatetimestring=json[json.length-1].createtimestring;//获取当前返回最后一条数据的时间戳
                getListSum();
                $("#list").append(appendListData(json));
            }
        }
    });

    function getListSum() {
        $.ajax({
            url:'/weibohotList/dbListSum',
            type: 'get',
            headers: {
                Accept: "application/json; charset=utf-8"
            },
            success:function(json){
              sum=json[0].sum;
            }
        });
    }


    function appendListData(json) {
        var html="";
        var arr=[];
        for (var i=0 ;i<json.length;i++){
            html+='<div class="row panel panel-default"><div class="panel-body"><div class="row">';
            html+='<div class="col-sm-4 left-pic"><a style="cursor:pointer"  class="goDetailsHtml" url="'+json[i].url+'" title="'+json[i].title+'"  target="_blank" ><img src="'+(json[i].picurl==null?"img/noimg.png":json[i].picurl)+'"></a></div>';
            html+='<div class="col-sm-8">';
            html+=' <a style="cursor:pointer"  class="goDetailsHtml" url="'+json[i].url+'" title="'+json[i].title+'"  target="_blank"  class="row title"><h4>'+json[i].title+'</h4></a>';
            html+='<div class="row">'+json[i].descs+'</div>';
            html+=' <div class="row icon"><img src="'+json[i].iconurl+'"><span>'+json[i].icontitle+'<span>'+json[i].time+'</span></div>';
            html+='</div></div></div></div>';
            arr.push(json[i].id);
        }
        console.log(arr);
        return html;

    }
    //上一页
    $("#previousListbtn").on("click",function () {
        $("#list").html("");
        getListDataByPages("0");
        page--;
        if(page<=1){
            $("#previousListbtn").hide();
        }else{
            $("#previousListbtn").show();
        }
        var num=sum%10==0?(sum/10):(parseInt(sum/10)+1);
        if(page<num){
            $("#nextListbtn").show();
        }
    });
    //下一页
    $("#nextListbtn").on("click",function () {
        $("#list").html("");
        getListDataByPages("1");
        page++;
        if(page>1){
            $("#previousListbtn").show();
        }else{
            $("#previousListbtn").hide();
        }

        var num=sum%10==0?(sum/10):(parseInt(sum/10)+1);
        if(page<num){
            $("#nextListbtn").show();
        }else{
            $("#nextListbtn").hide();
        }
       // console.log("当前页码："+page+"总条数:"+sum+"====总页数:"+num);
    });
    function getListDataByPages(prevOrnext) {
        $.ajax({
            url:'/weibohotList/dbListByPage',
            type: 'post',
            data: {prevOrnext:prevOrnext,pageNum : page,firstCreatetimestring:firstCreatetimestring,lastCreatetimestring:lastCreatetimestring},
            headers: {
                Accept: "application/json; charset=utf-8"
            },
            success:function(json){
                if(json!=null&&json.length>0){
                    firstCreatetimestring=json[0].createtimestring;//获取当前返回第一条数据的时间戳
                    lastCreatetimestring=json[json.length-1].createtimestring;//获取当前返回最后一条数据的时间戳
                    $("#list").append(appendListData(json));
                }
            }
        });
    }
      //跳转到详情页面
    $("body").on("click",".goDetailsHtml",function () {
     //   var toUrl = "details.html?url=" + $(this).attr("url");
        window.open($(this).attr("url"));
    })

});
