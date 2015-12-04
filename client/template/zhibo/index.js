//ZhiBoIndex
Template.ZhiBoIndex.helpers({
    list : function(){
        var sort = {
            createTime : -1
        };

        return DB.ZhiBo.find({}, {
            sort : sort
        }).fetch();
    }
});