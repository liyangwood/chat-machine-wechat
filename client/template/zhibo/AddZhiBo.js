var F = {
    ck : null,

    loadCKEditor : function(){

        if(typeof CKEDITOR !== 'undefined'){

            //覆盖image button
            CKEDITOR.on('instanceReady', function (ev) {
                var editor = ev.editor;
                var overridecmd = new CKEDITOR.command(editor, {
                    exec: function(editor){

                        $('[role="upload_image"]').trigger('click');
                    }
                });

                // Replace the old save's exec function with the new one
                ev.editor.commands.image.exec = overridecmd.exec;
                ev.editor.commands.image.on('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            F.ck = CKEDITOR.replace('js_cktextarea', {
                toolbar : [
                    {
                        name : 'basicstyles',
                        items : ['Bold', 'Italic', 'Strike']
                    },
                    {
                        name : 'paragraph',
                        items : ['NumberedList', 'BulletedList']
                    },
                    {
                        name : 'insert',
                        items : []
                    }
                ],
                toolbarLocation : 'top',
                uiColor : '#cccccc',
                extraPlugins : 'autogrow',
                autoGrow_onStartup : true,
                autoGrow_minHeight : 120,
                removePlugins: 'resize',
                contentsCss : 'http://qun.haiwai.com/ckeditor/contents.css',

                //removePlugins : 'image',

                fontSize_sizes : '16/16px;24/24px;48/48px;',
                skin : 'moono'
            });

        }
        else{
            util.delay(F.loadCKEditor, 200);
        }

    }
};

Template.AddZhiBo.events({


    'click .js_btn1' : function(){
        var title = $('.js_title').val(),
            name = $('.js_qun').val();
            //info = F.ck.getData();
        var info = '';

        DB.ZhiBo.insert({
            title : title,
            qunName : name,
            description : encodeURIComponent(info),
            createTime : Date.now()
        }, function(err){
            if(err){
                alert(err);
                return;
            }

            alert('insert success');

            Router.go('/qun/index');
        });


    }


});



Template.AddZhiBo.onRendered(function(){
    F.loadCKEditor();


});