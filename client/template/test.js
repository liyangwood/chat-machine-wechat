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

    'click .js_btn1' : function(){
        util.ajax({
            url : '/api/news',
            type : 'get',
            dataType : 'json',
            data : {},
            success : function(flag, rs){
                console.log(rs);
            }
        });
    },

    'click .js_btn2' : function(){
        util.ajax({
            url : '/api/test/getimg',
            type : 'get',
            dataType : 'json',
            data : {},
            success : function(flag, rs){
                var img = new Image();
                img.src = rs;
                $(img).css({
                    width : '100px'
                });

                $('body').append(img);
            }
        });
    },

    'click .js_btn3' : function(){
        util.ajax({
            url : '/wx/group/getlist',
            type : 'get',
            dataType : 'json',
            data : {},
            success : function(flag, rs){
                console.log(rs);
            }
        });
    }
});