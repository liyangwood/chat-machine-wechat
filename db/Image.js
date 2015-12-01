

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


Image.saveChatImage = function(name, buffer, callback){

    var newFile = new FS.File();
    newFile.attachData(buffer, {type: 'image/png'}, (function(error){
        if(error) throw error;
        if(name.indexOf('.png')>0){
            newFile.name(name);
        }
        else{
            newFile.name(name+'.png');
        }


        Image.Chat.insert(newFile, function(err, file){
            callback(err, file);
        });

    }));
};

Image.saveHeadImage = function(name, buffer, callback){
    var newFile = new FS.File();
    newFile.attachData(buffer, {type: 'image/png'}, (function(error){
        console.log(buffer);
        if(error) throw error;
        newFile.name(name+'.png');

        Image.Head.insert(newFile, function(err, file){
            callback(err, file);
        });
    }));
};

Image.saveChatVoice = function(name, buffer, callback){
    var newFile = new FS.File();
    newFile.attachData(buffer, {type: 'audio/mp3'}, (function(error){
        if(error) throw error;
        newFile.name(name+'.mp3');

        Image.Chat.insert(newFile, function(err, file){
            callback(err, file);
        });
    }));
};

Image.saveChatVideo = function(name, buffer, callback){
    var newFile = new FS.File();
    newFile.attachData(buffer, {type: 'video/mp4'}, (function(error){
        if(error) throw error;
        newFile.name(name+'.mp4');

        Image.Chat.insert(newFile, function(err, file){
            callback(err, file);
        });
    }));
};