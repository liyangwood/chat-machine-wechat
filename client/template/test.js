Template.test.helpers({

});

var F = {
    addVideo : function(src){
        var xx = $('#js_video');
        if(xx.length < 1){
            $('body').append('<video id="js_video" controls></video>');

            xx = $('#js_video');
        }

        xx.attr('src', src);
        xx[0].play();
    }
};


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
        var url = '/api/test/getimg';

        F.addVideo(url);
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