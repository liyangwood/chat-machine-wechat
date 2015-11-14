
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

        if(type === 1){
            //text
            var tmp = content.split('<br/>');
            if(tmp.length === 1){
                //好友信息
                rs = {
                    content : content
                };
            }
            else if(tmp.length === 2){
                //群信息
                rs = {
                    content : tmp[1],
                    groupUser : tmp[0].slice(0, -1)
                };
            }
        }


        return rs;
    },

    doMessage : function(text, msg, filter, callback){
        //统一采用异步方式
        switch(msg.MsgType){
            case 1 :
                F.doMessageByText(text, filter, callback);

                break;
        }

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
                //群成员发的信息
                groupUser = groupList[from]['Member'][cont.groupUser].NickName;

                F.doMessage(cont.content, msg, {
                    'GroupUser' : groupUser
                }, function(rs){
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


