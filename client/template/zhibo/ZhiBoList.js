
var F = {
    addVideo : function(src){
        var xx = $('#js_video');
        if(xx.length < 1){
            $('body').append('<div id="js_video"><video controls></video></div>');

            xx = $('#js_video');

            xx.click(function(e){
                $('#js_video').hide();
            });
        }

        xx = xx.show().find('video');

        xx.empty().append('<source src="'+src+'" type="video/mp4" />');
        //xx[0].play();
    },

    addAudio : function(src, endCallback){
        var xx = $('#js_audio');
        if(xx.length < 1){
            $('body').append('<audio id="js_audio" autoplay></audio>');

            xx = $('#js_audio');
        }

        xx.unbind('ended').bind('ended', endCallback);
        xx.empty().append('<source src="'+src+'" type="audio/mpeg" />');
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
Template.registerHelper('calculateT34Second', function(len){
    return Math.ceil(len/1000);
});
Template.registerHelper('filterInZhiboList', function(type){
    return util.contains([1, 3, 34, 43, 49], type);
});

Template.ZhiBoMessageList.helpers({
    list : function(){
        var zhiboId = Router.current().params['zhiboId'];
        var name = DB.ZhiBo.findOne({
            _id : zhiboId
        }).qunName;


        var query = {
            GroupName : name
        };
        var sort = {
            CreateTime : -1
        };

        return DB.ZhiBoMessage.find(query, {
            sort : sort
        }).fetch();
    },
    info : function(){
        var zhiboId = Router.current().params['zhiboId'];
        var query = {
            _id : zhiboId
        };

        return DB.ZhiBo.findOne(query);
    }
});


Template.ZhiBoMessageList.events({
    'click .js_voice' : function(e){
        var elem = $(e.target).closest('.js_voice');
        var id = elem.attr('voice-id'),
            len = elem.attr('voice-len');
        var url = '/weixin/log/voice?id='+id;
        console.log(url);

        F.addAudio(url, function(){
            elem.removeClass('kg-active');

            //判断next sbiling 是否是t-34
            var next = elem.parents('[role-type]').next('[role-type="34"]');
            //console.log(elem.parents('[role-type]'), next);
            if(next.length === 1){
                next.find('.js_voice').trigger('click');
            }
        });

        elem.addClass('kg-active');


    },

    'mousedown .js_videoplay' : function(e){
        var id = $(e.target).closest('.js_videoplay').attr('video-id');
        var url = '/weixin/log/video?id='+id;
        console.log(url);

        F.addVideo(url);
    }
});