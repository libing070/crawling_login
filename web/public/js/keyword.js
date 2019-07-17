new Vue({
    el:'#app',
    data:{
        keyword:'',
        duration:0,
        searchkeywordSum:'',
        sum:0
    },
    watch:{
    },
    methods:{
        //写入数据
        writeDataByKeyWord(keyword){
            let that=this;
            axios.post('/search/crawling', {
                keyword
            }).then((response) => {
                console.log(response);//请求的返回体
                that.duration=response.data.duration;
                t1=setInterval(function () {
                    that.duration--;
                    if(that.duration==0){
                        clearInterval(t1);

                        document.getElementById("searchBtn").disabled=false;
                        that.getCurrTotals(that.keyword);
                    }else{
                        that.searchkeywordSum='数据抓取中.....，预计耗时'+that.duration+"s";
                    }
                },1000);
            }).catch((error) => {
                console.log(error);//异常
            });
        },
        //获取当前时刻抓取的条目数
        getCurrTotals(keyword){
            let that=this;
            axios.post('/search/getCurrTotals',{
             keyword
            }).then((response) => {
                that.sum=response.data.length;
                that.searchkeywordSum='数据抓取完成，入库'+that.sum+"条数据";
                }).catch((error) => {
                console.log(error);//异常
            });
        },
        //点击按钮
         searchBtn(){
            let that=this;
            if(that.keyword==""){
                alert("请输入关键字");
                return;
            }
            try {
                document.getElementById("searchBtn").disabled=true;
                that.writeDataByKeyWord(that.keyword);
                that.searchkeywordSum='连接中......';
            } catch(err) {
                console.log(err);
            }
        }

    }
})