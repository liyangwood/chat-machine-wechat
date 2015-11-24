Template.GroupMessageList.helpers({
    list : function(){
        var sort = {
            CreateTime : -1
        };

        return GroupMessage.find({}, {
            sort : sort
        }).fetch();
    }
});