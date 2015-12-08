Template.test.helpers({
    loginState : function(){
        var rs = Session.get('loginState');
        if(rs){
            return JSON.stringify(rs);
        }
        return '';
    },
    list : function(){
        return Session.get('admin-listdata');
    }
});

Template.test.onCreated(function(){
    var self = this;
    Meteor.http.get('/wx/group/getlist', function(err, res){
        if(res.statusCode > 199){
            var json = JSON.parse(res.content);

            if(json.data){
                Session.set('admin-listdata', json.data[0]);
            }
        }
    });
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
    },


    checkLoginState : function(){
        util.ajax({
            url : '/wxapi/login/state',
            type : 'get',
            dataType : 'json',
            data : {},
            success : function(flag, rs){
                Session.set('loginState', rs);

                if(rs.userAvatar){
                    $('#js_img').attr('src', rs.userAvatar);
                }

                if(rs.code && rs.code === 200){
                    return;
                }

                util.delay(F.checkLoginState, 2000);
            }
        });
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
                $('#js_img').attr('src', rs.url).show();

                util.delay(F.checkLoginState, 2000);
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