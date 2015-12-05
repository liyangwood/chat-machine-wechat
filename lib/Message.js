
/*
* 处理机器人的主要数据逻辑
*
* namespace Message
* */

//文字逻辑规则定义
var TextRuleJson = [
    {
        key : '群规',
        result : '这是测试的群规内容'
    },
    {
        key : '靠',
        result : '@{GroupUser}, 群内禁止粗口，警告一次'
    },
    {
        key : '我要直播',
        result : '地址：http://b094c2cb.ngrok.io/qun/add'
    }
];

var CommonRule = [
    {
        key : '今日新闻',
        result : function(callback){
            WenxuecityAPI.getNewsList({
                success : function(list){
                    var rs = '';

                    _.each(list, function(item){
                        rs += item.title+' | '+item.url+'\n';
                    });

                    callback(rs);
                }
            });
        }
    }

];


var F = {
    getContent : function(msg){
        var type = msg.MsgType;
        var content = msg.Content;

        var rs = {};


        //text
        var tmp = content.split('<br/>');
        if(tmp.length === 1){
            //好友信息
            rs = {
                content : content
            };
        }
        else if(tmp.length > 1){
            //群信息
            rs = {
                content : tmp[1],
                groupUser : tmp[0].slice(0, -1)
            };
        }




        return rs;
    },

    saveToDB : function(type, data){
        if(!type) return;

        var db;
        if(type === 'Group'){
            db = GroupMessage;
        }

        var insert = (function(data){
            db.insert(data);
        });

        insert(data);
    },

    /*
    * 存数据到群直播的db中
    * 根据群的NickName判断
    * */
    saveToQunDB : function(msg, wx){
        var nick = wx.getGroupList()[msg.FromUserName].NickName;

        msg.GroupName = nick;
        DB.ZhiBoMessage.insert(msg);

    },

    doMessage : function(text, msg, wx, filter, callback){

        if(filter.type === 'Group'){
            //save to GroupMessage db
            msg.nickname = filter.GroupUser;
            msg.OriContent = msg.Content;
            msg.Content = text;
            msg.UserObject = filter.GroupUserObject;

            //F.saveToDB(msg, wx);

            F.saveToQunDB(msg, wx);

        }
        else{
            //F.saveToDB(msg, wx);
        }


        console.log(msg);

        //统一采用异步方式
        switch(msg.MsgType){
            case 1 :
                F.doMessageByText(text, filter, callback);

                break;
            case 3 :
                F.doMessageByImage(msg, wx, callback);

                break;

            case 34:
                //语音
                break;

            case 43:
                //视频
                break;


        }

    },

    doMessageByImage : function(msg, wx, callback){

    },

    doMessageByText : function(text, filter, callback){
        var rule = TextRuleJson;
        var rs = '';
        _.each(rule, function(item){
            if(text === item.key){
                rs = item.result;

                rs = F.replaceFilter(rs, filter);

                return false;
            }
        });

        //过common规则
        var f = true;
        _.each(CommonRule, function(item){
            if(text === item.key){
                var rs = item.result;

                if(_.isFunction(rs)){
                    rs(callback);

                    f = false;
                    return false;
                }
            }
        });

        f && callback(rs);
    },

    replaceFilter : function(str, filter){
        return str.replace(/\{([^\}]*)\}/g, function(match, key, index){
            if(filter[key]){
                return filter[key];
            }
            else{
                return match;
            }
        });
    },


    processMessage : function(msg, wx){
        console.log(msg);
        var cont = F.getContent(msg);
        var groupList = wx.getGroupList();

        var from = msg.FromUserName;


        var groupUser;
        if(groupList[from]){
            //群消息
            if(cont.groupUser){
                var gu = groupList[from]['Member'][cont.groupUser];

                //群成员发的信息
                groupUser = gu.DisplayName || gu.NickName;

                F.doMessage(cont.content, msg, wx, {
                    type : 'Group',
                    'GroupUser' : groupUser,
                    GroupUserObject : gu
                }, function(rs){
                    console.log(rs);


                    if(!rs) return;

                    wx.sendMessage({
                        type : 1,
                        FromUserName : msg.ToUserName,
                        ToUserName : msg.FromUserName,
                        Content : rs
                    }, function(err, rs){
                        console.log(rs);
                    });
                });

            }
            else{
                //其他群消息
            }
        }
        else{
            //TODO
        }


    },

    processFriend : function(list, wx){
        //放到session
        _.each(list, function(item){

        });
    }
};


Message = F;


