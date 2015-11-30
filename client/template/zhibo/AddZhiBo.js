Template.AddZhiBo.events({


    'click .js_btn1' : function(){
        var title = $('.js_title').val(),
            name = $('.js_qun').val(),
            info = $('.js_info').val();

        DB.ZhiBo.insert({
            title : title,
            qunName : name,
            description : info,
            createTime : Date.now()
        }, function(err){
            if(err){
                alert(err);
                return;
            }

            alert('insert success');

            Router.go('/qun/list');
        });


    }



});