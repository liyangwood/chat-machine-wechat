Template.GroupMessageList.helpers({
    list : function(){
        return GroupMessage.find().fetch();
    }
});