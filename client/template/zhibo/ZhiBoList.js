Template.ZhiBoList.helpers({
    list : function(){
        var sort = {
            createTime : -1
        };

        return DB.ZhiBo.find({}, {
            sort : sort
        }).fetch();
    }
});

Template.ZhiBoMessageList.helpers({
    list : function(){
        var zhiboId = Router.current().params['zhiboId'];
        var query = {
            _zhiboId : zhiboId
        };
        var sort = {
            CreateTime : -1
        };

        return DB.ZhiBoMessage.find(query, sort).fetch();
    }
});