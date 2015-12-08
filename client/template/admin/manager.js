var LISTKEY = 'AdminGroupList-data',
    MEMBERKEY = 'AdminGroupMemberList-data';
var QunName = 'AdminGroupName-data';

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
    }
});

Template.AdminGroupRole.helpers({
    list : function(){
        var name = Session.get(QunName) || 'TestRole';
        return DB.QunAdminCommonRole.find({GroupName:name}, {
            sort : {
                createTime : -1
            }
        }).fetch();
    },
    QunName : function(){
        return Session.get(QunName) || 'TestRole';
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
            createTime : Date.now()
        };
        o.button('loading');

        DB.QunAdminCommonRole.insert(data, function(err, rs){
            o.button('reset');

            $('.js_key').val('');
            $('.js_textarea').val('');
        });


    },

    'click .js_del' : function(e){
        var id = $(e.currentTarget).attr('param');
        DB.QunAdminCommonRole.remove({_id:id});
    }
});

Template.AdminGroupRoleDefine.onCreated(function(){
    var name = Router.current().params['name'];

    Session.set(QunName, name);
});