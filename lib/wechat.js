/*
* 微信机器人的微信接口部分
*
* @namespace : WECHAT
* @where : server
* */

WECHAT = {};
(function(){
    if(Meteor.isClient) return;

    var request = Meteor.npmRequire('request');
    var parseXml = Meteor.npmRequire('xml2json');

    var config = {
        host : 'https://wx.qq.com/cgi-bin'
    };

    //缓存好友部分中的群列表
    var groupList = {};

    //缓存好友列表
    var friendList = {};

    //缓存当前用户的信息
    var curentUser = {};

    var F = {
        getRequestHeader : function(){
            return {
                'Content-Type':'application/json;charset=UTF-8',
                'Cookie' : wx.config.cookie,
                'Host': 'wx.qq.com',
                'Origin' : 'https://wx.qq.com',
                'Referer' : 'https://wx.qq.com/?&lang=zh_CN',
                'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
            };
        },

        setCookie : function(cookie){
            var rs = '';
            var obj = {};
            _.each(cookie, function(item){
                var tmp = item.substring(0, item.indexOf(';'));
                rs += tmp + '; ';
                var s = tmp.split('=');
                obj[s[0]] = s[1];

                if(s[0]==='wxuin'||s[0]==='wxsid'){
                    wx.config[s[0]] = s[1];
                }
            });

            console.log(rs, obj);

            wx.config.cookieObj = obj;
            wx.config.cookie = rs;
        },

        setSyncKey : function(key){

            var list = key.List;
            var rs = '';
            _.each(list, function(item){
                rs += item.Key+'_'+item.Val + '|';
            });

            rs = rs.slice(0, -1);
            console.log(rs);
            wx.config.sync = key;
            wx.config.synckey = rs;
        },

        setOption : function(opts){

            opts = _.extend({
                url : '',
                method : 'GET'

            }, opts||{});

            return opts;

        },

        getBaseRequest : function(){
            return {
                DeviceID: wx.getDevice(),
                Sid: wx.config.wxsid,
                Skey: wx.config.skey,
                Uin: wx.config.wxuin
            };
        },


        checkWeixinLogin : function(callback){

            //step 1 判断用户是否已经扫码成功
            var url = 'https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid='+wx.config.uuid+'&tip=0&r=&_='+Date.now();

            request(F.setOption({
                url : url,
                headers : F.getRequestHeader()
            }), function(err, res, body){
                console.log(body);
                callback(body);

            });

        },

        getWeixinConfigAfterLogin : function(){
            //step 2 如果用户扫码成功，开始获得微信的初始化信息

            var url = wx.config.redirect_uri+'&fun=new&version=v2';
            request(F.setOption({
                url : url,
                headers : F.getRequestHeader()
            }), function(err, res, body){
                console.log(res.headers);
                F.setCookie(res.headers['set-cookie']);

                var json = JSON.parse(parseXml.toJson(body));

                //{\"error\":{\"ret\":\"0\",\"message\":\"OK\",\"skey\":\"@crypt_de480f64_3680384b4b94318e5a756271fadebd8d\",\"wxsid\":\"ukZ6rZZEjaoRN3kh\",\"wxuin\":\"2919136513\",\"pass_ticket\":\"0qkd6W7WR1gh6X4hbcI4Hko18FMhpR192xd%2BnvkthFrHFv2HT5%2BuxaHmiIw8OeLV\",\"isgrayscale\":\"1\"}}
                if(json.error.message === 'OK'){
                    wx.config.skey = json.error.skey;
                    wx.config.wxsid = json.error.wxsid;
                    wx.config.wxuin = json.error.wxuin;
                    wx.config.pass_ticket = json.error.pass_ticket;
                    wx.config.isgrayscale = json.error.isgrayscale;

                    F.getWeixinInitData();
                }


            });

        },

        getWeixinInitData : function(){
            // step 3 通过2获得的信息获取初始化的聊天信息
            //var url = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r=296514303&pass_ticket=FnVkCuGvemRMbBmYN7tkD%252Bm%252FUqwh6%252Bbz3ULOFvxjM09ZplOM6ML1EwzLPK3166qS';

            var url = [
                wx.config.host,
                '/mmwebwx-bin/webwxinit?',
                'r='+wx.config.wxuin
                //'&pass_ticket='+wx.pass_ticket
            ].join('');

            //ContactList
            //User

            request(F.setOption({
                url : url,
                headers : F.getRequestHeader(),
                method : 'POST',
                json : true,
                body : {
                    BaseRequest : F.getBaseRequest()
                }
            }), function(err, res, body){
                console.log(body);

                wx.config.skey = body['SKey'];
                F.setSyncKey(body.SyncKey);

                //处理微信的好友list,这里只是部分
                var list = body.ContactList;

                _.each(list, function(item){
                    //item.ContactFlag 2:group
                    if(item.ContactFlag === 2){
                        groupList[item.UserName] = item;

                    }
                    else if(item.ContactFlag === 3){
                        friendList[item.UserName] = item;
                    }
                });

                //x.role.processFriend(||[], wx);

                //set User into Session
                curentUser = body.User;

                F.getAllGroupList();

                F.beforeLoopCheck();
            });


        },

        beforeLoopCheck : function(){
            //开始loop前同步需要的数据

            var url = wx.config.host+'/mmwebwx-bin/webwxsync?sid='+wx.config.wxsid+'&r='+Date.now();

            request(F.setOption({
                url:url,
                method : 'POST',
                json : true,
                headers : F.getRequestHeader(),
                body : {
                    BaseRequest : F.getBaseRequest(),
                    SyncKey : wx.config.sync,
                    rr : Date.now()
                }
            }), function(err, res, body){
                console.log(body);

                F.setSyncKey(body.SyncKey);

                F.loopCheckNewChats();
            });
        },

        loopCheckNewChats : function(){
            var url = [
                'r='+Date.now(),
                '&skey='+wx.config.skey,
                '&sid='+wx.config.wxsid,
                '&uin='+wx.config.wxuin,
                '&deviceid='+wx.getDevice(),
                '&f=json',
                '&synckey='+wx.config.synckey,
                '&_='+Date.now()
            ].join('');
            url = 'https://webpush.weixin.qq.com/cgi-bin/mmwebwx-bin/synccheck?'+url;

            var cookie = wx.config.cookie;

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

                //window.synccheck={retcode:"0",selector:"2"}
                var json = JSON.parse(body);
                if(json.retcode > 0){
                    //出现心跳错误
                    F.getWeixinConfigAfterLogin();
                }
                else if(json.selector > 0){
                    F.getNewMessage();
                }
                else{
                    F.loopCheckNewChats();
                }



            });
        },
        getNewMessage : function(){

            var url = wx.config.host+'/mmwebwx-bin/webwxsync?sid='+wx.config.wxsid+'&skey='+wx.config.skey+'';
            var formData = {
                BaseRequest : F.getBaseRequest(),
                SyncKey : wx.config.sync
            };
            request(F.setOption({
                url : url,
                method : 'POST',
                headers : F.getRequestHeader(),
                json : true,
                body : formData
            }), function(err, res, body){

                F.setSyncKey(body.SyncKey);

                // continue loop
                F.loopCheckNewChats();

                F.process(body);

            });
        },

        process : function(json){
            if(json.AddMsgCount > 0){
                wx.dealChatMessage(json.AddMsgList);
            }
        },

        //获得所有的好友列表
        getFriendsListOther : function(){
            // https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?r=1377482079876
            var url = '/mmwebwx-bin/webwxgetcontact?r='+Date.now();

            //TODO
        },

        // 获得所有的微信群列表
        getAllGroupList : function(){
            var url = wx.config.host+'/mmwebwx-bin/webwxbatchgetcontact?type=ex&r='+Date.now()+'&lang=zh_CN&pass_ticket='+wx.config.pass_ticket;

            var list = _.map(groupList, function(item, key){
                return{
                    UserName : item.UserName,
                    ChatRoomId : ''
                }
            });

            request(F.setOption({
                url : url,
                method : 'POST',
                headers : F.getRequestHeader(),
                json : true,
                body : {
                    BaseRequest : F.getBaseRequest(),
                    Count : list.length,
                    List : list
                }
            }), function(err, res, body){
                console.log(body);

                _.each(body.ContactList, function(item){
                    var mlist = item.MemberList;

                    item.Member = {};

                    _.each(mlist, function(one){
                        item.Member[one.UserName] = one;
                    });

                    groupList[item.UserName] = item;


                });

                console.log(groupList);
            });
        }


    };

    var wx = {
        config : config,
        getDevice : function(){
            return 'e'+_.random(10000000000, 99999999999);
        },

        getGroupList : function(){
            return groupList;
        },

        getCurrentUser : function(){
            return curentUser;
        },

        setting : function(setting){

            wx.role = _.extend({
                //function 返回经过处理的逻辑
                processMessage : setting.processMessage,

                // 处理好友部分
                processFriend : setting.processFriend
            }, setting||{});

        },



        getLoginQrCode : function(callback){
            if(wx.tm){
                clearTimeout(wx.tm);
            }

            var url = 'https://login.weixin.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&f=json&lang=zh_CN&_='+Date.now();

            request(F.setOption({
                url : url
            }), function(err, res, body){
                console.log(body);
                //window.QRLogin.code = 200; window.QRLogin.uuid = "oeb5B863ng=="
                var window = {};
                window.QRLogin = {};
                eval(body);
                if(window.QRLogin.uuid){
                    wx.config.uuid = window.QRLogin.uuid;

                    callback(true, 'https://login.weixin.qq.com/qrcode/'+wx.config.uuid+'?t=webwx');


                    //开始检测用户是否扫码登录
                    wx.tm = null;
                    var okFn = function(rs){
                        if(rs.indexOf('window.redirect_uri=') > -1){


                            var window = {};
                            eval(rs);
                            wx.config.redirect_uri = window.redirect_uri;
                            F.getWeixinConfigAfterLogin();

                        }
                        else{
                            tm = setTimeout(function(){
                                F.checkWeixinLogin(okFn);
                            }, 2000);
                        }
                    };

                    F.checkWeixinLogin(okFn);
                }
                else{
                    //TODO
                }

            });
        },

        dealChatMessage : function(msgList){
            _.each(msgList, function(item){
                wx.dealOneMessage(item);
            });
        },

        dealOneMessage : function(msg){

            var rs = wx.role.processMessage(msg, wx);


        },


        sendMessage : function(opts, callback){

            var url = '/mmwebwx-bin/webwxsendmsg?lang=zh_CN&pass_ticket='+wx.config.pass_ticket;

            var localId = _.random(100000000000, 999999999999);

            var data = {
                BaseRequest : F.getBaseRequest(),
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
                url : wx.config.host+url,
                method : 'POST',
                headers : F.getRequestHeader(),
                json : true,
                body : data
            }), function(err, res, body){
                callback(err, body);
                console.log(body);
            });
        },

        getMessageImage : function(id){
            var url = '/mmwebwx-bin/webwxgetmsgimg?&MsgID='+id+'&skey='+wx.config.skey+'&type=slave';
            return wx.config.host + url;
        },

        getMessageVoice : function(id){
            var url = '/mmwebwx-bin/webwxgetvoice?msgid='+id+'&skey='+wx.config.skey;

            return wx.config.host + url;
        }
    };









    WECHAT = wx;
})();




