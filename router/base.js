


Router.route('/admin/index', {
    name: 'test',
    loadingTemplate : 'loading',
    waitOn : function(){
        //return Meteor.subscribe('BaseMessage');
    }
});
Router.route('/admin/group/list', {
    name: 'AdminGroupList',
    loadingTemplate : 'loading'
});

Router.route('/admin/group/role/:name', {
    name : 'AdminGroupRoleDefine',
    loadingTemplate : 'loading',
    waitOn : function(){
        return Meteor.subscribe('QunAdminCommonRole');
    }
});


//Router.route('/group/message/list', {
//    name : 'GroupMessageList',
//    waitOn : function(){
//        return Meteor.subscribe('GroupMessage');
//    }
//
//});


//qun start

var setOption = function(opts){
    var rs = _.extend({
        layoutTemplate : 'ZhiBoLayout',
        loadingTemplate : 'loading'
        //name : '',
        //action : null,
        //waitOn : function(){
        //    return true;
        //}
    }, opts);

    return rs;
};

Router.route('/qun/index', setOption({
    name : 'ZhiBoIndex',
    waitOn : function(){
        return [
            function(){
                return Meteor.subscribe('ZhiBo');
            }
        ];
    }
}));

Router.route('/qun/add', setOption({
    name : 'AddZhiBo'
}));

Router.route('/qun/list', {
    name : 'ZhiBoList',
    waitOn : function(){
        return Meteor.subscribe('ZhiBo');
    }
});
Router.route('/qun/:zhiboId/message', setOption({
    name : 'ZhiBoMessageList',
    waitOn : function(){
        return Meteor.subscribe('ZhiBoMessage');
    }
}));