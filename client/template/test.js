Template.test.helpers({

});


Template.test.events({
    'click .js_btn' : function(){
        var data = {
            a : 1,
            b : 2
        };

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
    }
});