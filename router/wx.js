
if(Meteor.isServer){

    var wx = WECHAT;
    var fs = Meteor.npmRequire('fs');

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
        },

        sendVideoFile : function(file, req, res){
            if(!fs.existsSync(file)) throw 'file is not exist';

            var range = req.headers.range;
            var positions = range.replace(/bytes=/, "").split("-");
            var start = parseInt(positions[0], 10);

            fs.stat(file, function(err, stats) {
                var total = stats.size;
                var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
                var chunksize = (end - start) + 1;

                res.writeHead(206, {
                    "Content-Range": "bytes " + start + "-" + end + "/" + total,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize,
                    "Content-Type": "video/mp4"
                });

                var stream = fs.createReadStream(file, { start: start, end: end })
                    .on("open", function() {
                        stream.pipe(res);
                    }).on("error", function(err) {
                        res.end(err);
                    });
            });
        }
    };


    //获得登录二维码
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

    Router.route('weixinLoginState', {
        where : 'server',
        path : '/wxapi/login/state'
    }).get(function(){
        var self = this;
        self.response.end(F.result(true, wx.config.loginState));
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




    //聊天信息中的小图片
    Router.route('getLogImage', {
        where : 'server',
        path : '/weixin/log/image'
    }).get(function(){
        var self = this;

        var query = self.request.query,
            id = query.id;

        var path = KG.config.pwd+'/temp/weixinlogimage/'+id+'.png';

        try{
            self.response.end(fs.readFileSync(path));
        }
        catch(e){

            wx.getMessageImage(id, function(buffer){

                Image.saveChatImage(id, buffer, function(err, file){
                    //console.log(file);
                    Meteor.setTimeout(function(){
                        self.response.end(fs.readFileSync(path));
                    }, 1000);
                });

            }, query.type === 'big');
        }

    });

    Router.route('getHeadImage', {
        where : 'server',
        path : '/weixin/user/headimage'
    }).get(function(){
        var self = this;
        var query = self.request.query,
            id = query.id;

        var path = KG.config.pwd+'/temp/headimage/'+id+'.png';

        try{
            self.response.end(fs.readFileSync(path));
        }
        catch(e){
            wx.getHeadImage(id, function(buffer){

                Image.saveHeadImage(id, buffer, function(err, file){
                    Meteor.setTimeout(function(){
                        self.response.end(fs.readFileSync(path));
                    }, 1000);
                });

            });

            //self.response.end('\n');
        }
    });

    Router.route('getWeixinVoice', {
        where : 'server',
        path : '/weixin/log/voice'
    }).get(function(){
        var self = this;
        var query = self.request.query,
            id = query.id;

        var path = KG.config.pwd+'/temp/weixinlogimage/'+id+'.mp3';

        try{
            self.response.end(fs.readFileSync(path));
        }
        catch(e){
            wx.getMessageVoice(id, function(buffer){

                Image.saveChatVoice(id, buffer, function(err, file){
                    Meteor.setTimeout(function(){
                        self.response.end(fs.readFileSync(path));
                    }, 1000);
                });

            });

        }
    });

    Router.route('getWeixinVideo', {
        where : 'server',
        path : '/weixin/log/video'
    }).get(function(){
        var self = this;
        var query = self.request.query,
            id = query.id;

        var path = KG.config.pwd+'/temp/weixinlogimage/'+id+'.mp4';

        var req = self.request,
            res = self.response;

        try{
            F.sendVideoFile(path, req, res);
        }
        catch(e){

            wx.getMessageVideo(id, function(buffer){

                Image.saveChatVideo(id, buffer, function(err, file){
                    Meteor.setTimeout(function(){

                        F.sendVideoFile(path, req, res);

                    }, 1000);
                });

            });

        }
    });


    Router.route('getWxGroupList', {
        where : 'server',
        path : '/wx/group/getlist'
    }).get(function(){
        var group = wx.getGroupList();
        var friend = wx.getFriendList(),
            user = wx.getCurrentUser();

        this.response.end(F.result(true, [group, friend, user, wx.config]));
    });


    Router.route('sendChatMessage', {
        where : 'server',
        path : '/wx/log/send'
    }).post(function(){
        var self = this;
        var query = this.request.body;
        wx.sendMessage(query, function(err, rs){
            self.response.end(F.result(err?false:true, rs));
        });
    });

}






//测试方法
Router.route('testImageGet', {
    where : 'server',
    path : '/api/test/getimg'
}).get(function(){
    var self = this;

    var id = 'bb';
    var path = KG.config.pwd+'/temp/weixinlogimage/'+id+'.mp4';

    var req = self.request,
        res = self.response;

    try{
        F.sendVideoFile(path, req, res);
    }
    catch(e){

        wx.getTestImage(id, function(buffer){

            Image.saveChatVideo(id, buffer, function(err, file){
                Meteor.setTimeout(function(){

                    F.sendVideoFile(path, req, res);

                }, 1000);
            });

        });

        //self.response.end('\n');
    }


});