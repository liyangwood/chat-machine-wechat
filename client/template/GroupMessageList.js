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

Template.GroupMessageList.events({
    'click .js_btn1' : function(){
        util.ajax({
            url : '/wx/group/getlist',
            type : 'get',
            dataType : 'json',
            data : {},
            success : function(flag, rs){
                console.log(rs);
                $('.js_box').html(JSON.stringify(rs[0])+'<br/>'+JSON.stringify(rs[1]))
            }
        });
    }
});