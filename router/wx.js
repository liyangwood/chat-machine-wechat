
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

                console.log(body);
                F.loopCheckNewChats();

            });
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



