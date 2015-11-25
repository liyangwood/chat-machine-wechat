

Image = {};

//聊天信息中的图片
Image.Chat = new FS.Collection('image_chat', {
    stores: [new FS.Store.FileSystem("image_chat", {
        path : KG.config.pwd + '/temp/weixinlogimage',
        fileKeyMaker : function(file){
            return file.name();
        }
    })]
});


Image.Chat.allow({
    'insert': function () {
        // add custom authentication code here
        return true;
    }
});


Image.Head = new FS.Collection('image_head', {
    stores: [new FS.Store.FileSystem("image_head", {
        path : KG.config.pwd + '/temp/headimage',
        fileKeyMaker : function(file){
            return file.name();
        }
    })]
});

Image.Head.allow({
    'insert': function () {
        // add custom authentication code here
        return true;
    }
});