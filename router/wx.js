
if(Meteor.isServer){

    var wx = WECHAT;

    //init
    wx.setting({
        processMessage : Message.processMessage,
        processFriend : Message.processFriend
    });


    var F = {
        result : function(status, data){
            return JSON.stringify({
                status : status?1:-1,
                data : data
            });
        }
    };


    Router.route('weixinPage', {
        where : 'server',
        path : '/wxapi/login/qr'
    }).get(function(){
        var self = this;
        wx.getLoginQrCode(function(b, url){
            self.response.end(F.result(true, {
                url : url
            }));
        });

    });


    Router.route('testWenxuecityApi', {
        where : 'server',
        path : '/api/news'
    }).get(function(){
        var self = this;
        WenxuecityAPI.getNewsList({
            success : function(list){
                var rs = '';

                _.each(list, function(item){
                    rs += item.title+' | '+item.url+'\n';
                });

                self.response.end(F.result(true, rs));
            }
        });
    });

    Router.route('testImageGet', {
        where : 'server',
        path : '/api/test/getimg'
    }).get(function(){
        var self = this;
        wx.getTestImage('', function(name){
            self.response.end(F.result(true, name));
        });
    });

}



