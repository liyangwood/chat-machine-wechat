Template.test.helpers({

});


Template.test.events({
    'click .js_btn' : function(){
        var data = {};

        util.ajax({
            url : '/wxapi/login/qr',
            type : 'get',
            dataType : 'json',
            data : data,
            success : function(flag, rs){
                console.log(rs);
                $('body').append('<img src="'+rs.url+'" />');
            }
        });
    },

    'click, .js_btn1' : function(){
        util.ajax({
            url : '/api/news',
            type : 'get',
            dataType : 'json',
            data : {},
            success : function(flag, rs){
                console.log(rs);
            }
        });
    }
});