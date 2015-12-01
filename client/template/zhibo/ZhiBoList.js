
var F = {
    addVideo : function(src){
        var xx = $('#js_video');
        if(xx.length < 1){
            $('body').append('<video id="js_video" control autoplay></video>');

            xx = $('#js_video');
        }

        xx.attr('src', src);
        xx[0].play();
    }
};

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

Template.registerHelper('calculateT34Width', function(len){
    len = len || 4680;
    return (40+7*len/1000)+'px';
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

        return DB.ZhiBoMessage.find(query, {
            sort : sort
        }).fetch();
    }
});


Template.ZhiBoMessageList.events({
    'click .js_voice' : function(e){
        var id = $(e.target).closest('.js_voice').attr('voice-id');
        var url = '/weixin/log/voice?id='+id;
        console.log(url);

        F.addAudio(url);
    },

    'click .js_videoplay' : function(e){
        var id = $(e.target).closest('.js_videoplay').attr('video-id');
        var url = '/weixin/log/video?id='+id;
        console.log(url);

        F.addVideo(url);
    }
});