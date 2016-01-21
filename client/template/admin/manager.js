var LISTKEY = 'AdminGroupList-data',
    MEMBERKEY = 'AdminGroupMemberList-data';
var QunName = 'AdminGroupName-data';
var CurrentUser = 'AdminGroup-CurrentUser-data';

Template.AdminGroupList.onCreated(function(){
    util.ajax({
        url : '/wx/group/getlist',
        type : 'get',
        dataType : 'json',
        data : {},
        success : function(flag, rs){
            Session.set(LISTKEY, rs[0]);
            console.log(rs[0]);
        }
    });

});

Template.AdminGroupList.helpers({
    list : function(){
        var rs = Session.get(LISTKEY);

        return util.map(rs, function(item, key){

            return item;
        });
    }
});

Template.AdminGroupList.events({
    'click .js_ck' : function(e){
        var o = $(e.currentTarget),
            uid = o.attr('param');

        Session.set(MEMBERKEY, Session.get(LISTKEY)[uid]);
        Session.set(QunName, Session.get(LISTKEY)[uid]['NickName']);
    }
});

Template.AdminGroupMemberList.helpers({
    list : function(){
        var rs = Session.get(MEMBERKEY);
        if(rs){
            return rs['MemberList'];
        }
        return [];
    },
    info : function(){
        return {
            qunName : Session.get(QunName)
        };
    }
});

Template.AdminGroupRole.helpers({
    list : function(){
        var name = Session.get(QunName) || 'TestRole';
        return DB.QunAdminCommonRole.find({
            GroupName:name,
            type : 1
        }, {
            sort : {
                createTime : -1
            }
        }).fetch();
    },
    QunName : function(){
        return Session.get(QunName) || 'TestRole';
    },
    welcomeRole : function(){
        var name = Session.get(QunName) || 'TestRole';
        return DB.QunAdminCommonRole.findOne({
            GroupName : name,
            type : 10000
        });
    }
});

Template.AdminGroupRole.events({
    'click .js_btn1' : function(e){

        var qunName = Session.get(QunName);

        var key = $('.js_key').val(),
            txt = $('.js_textarea').val();
        if(!key || !txt){
            alert('wrong');
            return;
        }

        var o = $(e.currentTarget);

        var data = {
            GroupName : qunName || 'TestRole',
            key : key,
            result : txt,
            type : 1,
            createTime : Date.now()
        };
        o.button('loading');

        DB.QunAdminCommonRole.insert(data, function(err, rs){
            o.button('reset');

            $('.js_key').val('');
            $('.js_textarea').val('');
        });


    },

    'click .js_btn2' : function(e){
        var qunName = Session.get(QunName);

        var txt = $('.js_textarea1').val();
        if(!txt){
            alert('wrong');
            return;
        }

        var o = $(e.currentTarget);

        var data = {
            GroupName : qunName || 'TestRole',
            key : 'Welcome',
            result : txt,
            type : 10000,
            createTime : Date.now()
        };
        o.button('loading');

        var tmp = DB.QunAdminCommonRole.findOne({
            GroupName : qunName,
            type : 10000
        });


        if(tmp){
            DB.QunAdminCommonRole.update({
                _id : tmp._id
            }, {
                $set : data
            }, function(err, rs){
                o.button('reset');

                $('.js_textarea1').val('');
            });
        }
        else{
            DB.QunAdminCommonRole.insert(data, function(err, rs){
                o.button('reset');

                $('.js_textarea1').val('');
            });
        }


    },

    'click .js_del' : function(e){
        var id = $(e.currentTarget).attr('param');
        DB.QunAdminCommonRole.remove({_id:id});
    }
});

Template.AdminGroupRoleDefine.onCreated(function(){
    var name = Router.current().params['name'];

    util.ajax({
        url : '/wx/group/getlist',
        type : 'get',
        dataType : 'json',
        data : {},
        success : function(flag, rs){
            var tmp = util.find(rs[0], function(item){
                return item.NickName === name;
            });
            Session.set(MEMBERKEY, tmp);

            Session.set('TempQunData', tmp);
            Session.set(CurrentUser, rs[2]);
        }
    });

    Session.set(QunName, name);
});

Template.AdminGroupRoleDefine.events({
    'click .js_btn3' : function(e){

        var from = Session.get(CurrentUser).UserName,
            to = Session.get('TempQunData').UserName;
        var msg = $('.js_msg').val();

        if(!msg){
            alert('wrong');
            return;
        }

        var data = {
            type : 1,
            FromUserName : from,
            ToUserName : to,
            Content : msg
        };

        var o = $(e.currentTarget);
        o.button('loading');
        util.ajax({
            url : '/wx/log/send',
            type : 'post',
            data : data,
            dataType : 'json',
            success : function(flag, rs){
                console.log(flag, rs);

                $('.js_msg').val('');

                o.button('reset');
            }
        })
    }
});