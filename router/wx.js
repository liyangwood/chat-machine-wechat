
if(Meteor.isServer){

    var request = Meteor.npmRequire('request');
    var parseXml = Meteor.npmRequire('xml2json');

    var wx = {
        host : 'https://wx.qq.com/cgi-bin',
        device : function(){
            return 'e'+_.random(10000000000, 99999999999);
        },
        originTime : Date.now()
    };
    var reg_a = /"([^"]*)"/g;

    var F = {
        setCookie : function(cookie){
            var rs = '';
            var obj = {};
            _.each(cookie, function(item){
                var tmp = item.substring(0, item.indexOf(';'));
                rs += tmp + '; ';
                var s = tmp.split('=');
                obj[s[0]] = s[1];

                if(s[0]==='wxuin'||s[0]==='wxsid'){
                    wx[s[0]] = s[1];
                }
            });

            console.log(rs, obj);

            wx.cookieObj = obj;
            wx.cookie = rs;
        },

        setSyncKey : function(key){


            /*
            * "SyncKey": {
             "Count": 4,
             "List": [{
             "Key": 1,
             "Val": 644551174
             }
             ,{
             "Key": 2,
             "Val": 644551212
             }
             ,{
             "Key": 3,
             "Val": 644551197
             }
             ,{
             "Key": 1000,
             "Val": 1447063780
             }
            * */
            var list = key.List;
            var rs = '';
            _.each(list, function(item){
                rs += item.Key+'_'+item.Val + '|';
            });

            rs = (rs.slice(0, -1));
console.log(rs);
            wx.sync = key;
            wx.synckey = (rs);
        },

        setOption : function(opts){

            opts = _.extend({
                url : '',
                headers : {
                    'Content-Type':'application/json;charset=UTF-8',
                    'Cookie' : wx.cookie,
                    'Host': 'wx.qq.com',
                    'Origin' : 'https://wx.qq.com',
                    'Referer' : 'https://wx.qq.com/?&lang=zh_CN',
                    'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
                }

            }, opts||{});

            return opts;

        },

        result : function(flag, data){
            var data = {
                status : flag?'ok':'error',
                data : data
            };

            return JSON.stringify(data);
        },


        getLoginQrCode : function(callback){
            var url = 'https://login.weixin.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&f=json&lang=zh_CN&_='+Date.now();

            request(F.setOption({
                url : url
            }), function(err, res, body){
                console.log(body);
                //window.QRLogin.code = 200; window.QRLogin.uuid = "oeb5B863ng=="
                var uuid = reg_a.exec(body)[1];

                wx.uuid = uuid;

                callback(true, 'https://login.weixin.qq.com/qrcode/'+uuid+'?t=webwx');


                var tm = null;
                var okFn = function(rs){
                    if(rs.indexOf('window.redirect_uri=') > -1){


                        var window = {};
                        eval(rs);

                        wx.redirect_uri = window.redirect_uri;
                        F.getWeixinConfigAfterLogin();

                    }
                    else{
                        tm = setTimeout(function(){
                            F.checkWeixinLogin(okFn);
                        }, 2000);
                    }
                };

                F.checkWeixinLogin(okFn);
            });
        },

        checkWeixinLogin : function(callback){

            //step 1 判断用户是否已经扫码成功
            var url = 'https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid='+wx.uuid+'&tip=0&r=296438598&_='+Date.now();

            //window.code=200;
            //window.redirect_uri="https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage?ticket=Ae_qVsP_6oqf3k_ahfZxzXyT@qrticket_0&uuid=gbMu3YHdTw==&lang=zh_CN&scan=1447107539&vcdataticket=AQZKdWEZdOeT2p85QgxNcrNY&vccdtstr=BbGmYLWxIvU6Ra8HTnPmLFFctQKfYTe2YZe6er9cXoTUX0lpev6jaU4HIasURIy4";
            request(F.setOption({
                url : url
            }), function(err, res, body){
                console.log(body);
                callback(body);
            });

        },
        getWeixinConfigAfterLogin : function(){
            //step 2 如果用户扫码成功，开始获得微信的初始化信息
            //var url = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage?ticket=Ae_qVsP_6oqf3k_ahfZxzXyT@qrticket_0&uuid=gbMu3YHdTw==&lang=zh_CN&scan=1447107539&vcdataticket=AQZKdWEZdOeT2p85QgxNcrNY&vccdtstr=BbGmYLWxIvU6Ra8HTnPmLFFctQKfYTe2YZe6er9cXoTUX0lpev6jaU4HIasURIy4&fun=new&version=v2';

            var url = wx.redirect_uri+'&fun=new&version=v2';
            request(F.setOption({
                url : url
            }), function(err, res, body){
                console.log(res.headers);
                F.setCookie(res.headers['set-cookie']);



                var json = JSON.parse(parseXml.toJson(body));

                //{\"error\":{\"ret\":\"0\",\"message\":\"OK\",\"skey\":\"@crypt_de480f64_3680384b4b94318e5a756271fadebd8d\",\"wxsid\":\"ukZ6rZZEjaoRN3kh\",\"wxuin\":\"2919136513\",\"pass_ticket\":\"0qkd6W7WR1gh6X4hbcI4Hko18FMhpR192xd%2BnvkthFrHFv2HT5%2BuxaHmiIw8OeLV\",\"isgrayscale\":\"1\"}}
                if(json.error.message === 'OK'){
                    wx.skey = json.error.skey;
                    wx.wxsid = json.error.wxsid;
                    wx.wxuin = json.error.wxuin;
                    wx.pass_ticket = json.error.pass_ticket;
                    wx.isgrayscale = json.error.isgrayscale;


                    F.getWeixinInitData();
                }


            });

            //<error><ret>0</ret><message>OK</message><skey>@crypt_de480f64_a838cbcae7083430940852f02cc2eaee</skey><wxsid>3H96gkbqhhzIARU1</wxsid><wxuin>2919136513</wxuin><pass_ticket>FnVkCuGvemRMbBmYN7tkD%2Bm%2FUqwh6%2Bbz3ULOFvxjM09ZplOM6ML1EwzLPK3166qS</pass_ticket><isgrayscale>1</isgrayscale></error>
        },

        //获得所有的好友列表
        getAllFriendsList : function(){
            // https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?r=1377482079876
            var url = '/mmwebwx-bin/webwxgetcontact?r='+Date.now();
        },

        getWeixinInitData : function(){
            // step 3 通过2获得的信息获取初始化的聊天信息
            //var url = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r=296514303&pass_ticket=FnVkCuGvemRMbBmYN7tkD%252Bm%252FUqwh6%252Bbz3ULOFvxjM09ZplOM6ML1EwzLPK3166qS';

            var url = [
                wx.host,
                '/mmwebwx-bin/webwxinit?',
                'r='+wx.wxuin
                //'&pass_ticket='+wx.pass_ticket
            ].join('');

            //ContactList
            //User

            var post = request(F.setOption({
                url : url,
                method : 'POST',
                json : true,
                body : {
                    BaseRequest : {
                        DeviceID: wx.device(),
                        Sid: wx.wxsid,
                        Skey: wx.skey,
                        Uin: wx.wxuin
                    }
                }
            }), function(err, res, body){
                console.log(body);
                wx.originTime = body.SystemTime;
                wx.skey = body['SKey'];
                F.setSyncKey(body.SyncKey);

                F.beforeLoopCheck();
            });


        },

        beforeLoopCheck : function(){
            var url = wx.host+'/mmwebwx-bin/webwxsync?sid='+wx.wxsid+'&r='+Date.now();

            request(F.setOption({
                url:url,
                method : 'POST',
                json : true,
                body : {
                    BaseRequest : {
                        DeviceID: wx.device(),
                        Sid: wx.wxsid,
                        Skey: wx.skey,
                        Uin: wx.wxuin
                    },
                    SyncKey : wx.sync,
                    rr : Date.now()
                }
            }), function(err, res, body){
                console.log(body);

                F.setSyncKey(body.SyncKey);

                F.loopCheckNewChats();
            });
        },

        loopCheckNewChats : function(){
            /*
            * https://webpush2.weixin.qq.com/cgi-bin/mmwebwx-bin/synccheck?r=1447115285153&skey=%40crypt_d42cfdc0_d7e6961526317e149a319331d314b6f3&sid=HBdQS6Eu3lC306mJ&uin=733155060&deviceid=e697214123792946&synckey=1_644551174%7C2_644551207%7C3_644551197%7C11_644550578%7C201_1447114869%7C1000_1447063780&_=1447113436199
            *
            * https://webpush2.weixin.qq.com/cgi-bin/mmwebwx-bin/synccheck?r=1447115338299&skey=%40crypt_d42cfdc0_d7e6961526317e149a319331d314b6f3&sid=HBdQS6Eu3lC306mJ&uin=733155060&deviceid=e948746720561758&synckey=1_644551174%7C2_644551208%7C3_644551197%7C11_644550578%7C201_1447115309%7C1000_1447063780&_=1447113436202
            * */


            wx.originTime++;
            var url = [
                'r='+Date.now(),
                '&skey='+(wx.skey),
                '&sid='+(wx.wxsid),
                '&uin='+wx.wxuin,
                '&deviceid='+wx.device(),
                '&f=json',
                '&synckey='+(wx.synckey),
                '&_='+Date.now()
            ].join('');


            url = 'https://webpush.weixin.qq.com/cgi-bin/mmwebwx-bin/synccheck?'+url;

            var cookie = wx.cookie;


            console.log(url);
            request({
                url : url,
                method : 'GET',
                headers : {
                    'Host' : 'webpush.weixin.qq.com',
                    'Referer' : 'https://wx.qq.com/',
                    'Cookie' : cookie,
                    'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
                }
            }, function(err, res, body){
                console.log(body);

                //var window = {};
                //eval(body);
                //window.synccheck={retcode:"0",selector:"2"}
                var json = JSON.parse(body);
                if(json.selector === '2'){
                    F.getNewMessage();
                }
                else{
                    F.loopCheckNewChats();
                }



            });
        },

        getNewMessage : function(){

            var url = wx.host+'/mmwebwx-bin/webwxsync?sid='+wx.wxsid+'&skey='+wx.skey+'';
            var formData = {
                BaseRequest : {
                    DeviceID: wx.device(),
                    Sid: wx.wxsid,
                    Skey: wx.skey,
                    Uin: wx.wxuin
                },
                SyncKey : wx.sync
            };
            request(F.setOption({
                url : url,
                method : 'POST',
                json : true,
                body : formData
            }), function(err, res, body){

                //set cookie
                //F.setCookie(res.headers['set-cookie']);
                F.setSyncKey(body.SyncKey);

                F.process(body);

                F.loopCheckNewChats();

            });
        },

        /*
        * 处理收到的微信信息
        *
        *
        * AddMsgCount: 1
         AddMsgList: [{MsgId: "1079390175004031806", FromUserName: "@0b341ffd27e42cf94f79c85c0e219b68",…}]
         BaseResponse: {Ret: 0, ErrMsg: ""}
         ContinueFlag: 0
         DelContactCount: 0
         DelContactList: []
         ModChatRoomMemberCount: 0
         ModChatRoomMemberList: []
         ModContactCount: 0
         ModContactList: []
         Profile: {BitFlag: 0, UserName: {Buff: ""}, NickName: {Buff: ""}, BindUin: 0, BindEmail: {Buff: ""},…}
         SKey: ""
         SyncKey: {Count: 7, List: [{Key: 1, Val: 633870671}, {Key: 2, Val: 633872001}, {Key: 3, Val: 633871164},…]}
        *
        * */
        process : function(json){
            if(json.AddMsgCount > 0){
                chat.dealChatMessage(json.AddMsgList);
            }
        },


        /*
        * https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg?lang=zh_CN&pass_ticket=Ff9HMOc%252FMlQVcIqJFUGI1ZQeOwAUsaAEL3Auhzr2NncrwvkgkUBROevDuM2zr8h0
        * */
        sendMessage : function(opts, callback){
            var url = '/mmwebwx-bin/webwxsendmsg?lang=zh_CN&pass_ticket='+wx.pass_ticket;

            var localId = _.random(100000000000, 999999999999);

            var data = {
                BaseRequest : {
                    DeviceID: wx.device(),
                    Sid: wx.wxsid,
                    Skey: wx.skey,
                    Uin: wx.wxuin
                },
                Msg : {
                    ClientMsgId : localId,
                    Content: opts.Content,
                    FromUserName: opts.FromUserName,
                    LocalID: localId,
                    ToUserName: opts.ToUserName,
                    Type: opts.type
                }
            };

            request(F.setOption({
                url : wx.host+url,
                method : 'POST',
                json : true,
                body : data
            }), function(err, res, body){
                callback(err, body);
            });
        }



    };


    // 所有数据处理部分
    var chat = {
        /*
        * 处理收到的聊天信息
        *
        *AppInfo: {AppID: "", Type: 0}
         AppMsgType: 0
         Content: "å•Šå•Šå•Š"
         CreateTime: 1447196477
         FileName: ""
         FileSize: ""
         ForwardFlag: 0
         FromUserName: "@0b341ffd27e42cf94f79c85c0e219b68"
         HasProductId: 0
         ImgHeight: 0
         ImgStatus: 1
         ImgWidth: 0
         MediaId: ""
         MsgId: "1079390175004031806"
         MsgType: 1
         NewMsgId: 1079390175004031700
         PlayLength: 0
         RecommendInfo: {UserName: "", NickName: "", QQNum: 0, Province: "", City: "", Content: "", Signature: "", Alias: "",…}
         Status: 3
         StatusNotifyCode: 0
         StatusNotifyUserName: ""
         SubMsgType: 0
         Ticket: ""
         ToUserName: "@e2ef8e126a69919edfae9f03201e2a79457092783ab9cf0c4a10307e76b91a53"
         Url: ""
         VoiceLength: 0
        *
        * */
        dealChatMessage : function(msgList){
            _.each(msgList, function(item){
                chat.dealOneMessage(item);
            });
        },

        dealOneMessage : function(msg){
console.log(msg);
            switch(msg.MsgType){
                case 1:
                    // text

                    //测试，直接发信息给信息发送者
                    F.sendMessage({
                        type : 1,
                        FromUserName : msg.ToUserName,
                        ToUserName : msg.FromUserName,
                        Content : '你发送的信息是 '+msg.Content
                    }, function(err, rs){
                        console.log(rs);
                    });

                    break;

            }
        }
    };



    Router.route('weixinPage', {
        where : 'server',
        path : '/wxapi/login/qr'
    }).get(function(){
        var self = this;
        F.getLoginQrCode(function(b, url){
            self.response.end(F.result(true, {
                url : url
            }));
        });


    });




}



