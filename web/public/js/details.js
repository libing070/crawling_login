$(function () {
    var url = window.location.href.split("url=")[1];
        $.ajax({
            url:'/weibohotDetails/loadhtml',
            type: 'post',
            data: {url:url},
            headers: {
                Accept: "application/json; charset=utf-8"
            },
            success:function(json){
                if(json!=null&&json.length>0){
                    $(".detailstitle").html("一起疯舔"+json[0].title);
                    $("#details .main_toppic").append(json[0].maintoppic);
                    $("#details .main_editor").append(json[0].maineditor);
                    $("#details .main_editor .WB_editor_iframe_new").css("visibility","");

                }
            }
        });


});
