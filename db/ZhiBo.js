

DB.ZhiBo = new Mongo.Collection('ZhiBo');
DB.ZhiBoMessage = new Mongo.Collection('ZhiBoMessage');

DB.ZhiBo.allow({
    remove : function(){
        return true;
    },
    insert : function(){
        return true;
    }
});

DB.ZhiBoMessage.allow({
    remove : function(){
        return true;
    },
    insert : function(){
        return true;
    }
});

if(Meteor.isServer){
    Meteor.publish('ZhiBo', function(){
        return DB.ZhiBo.find();
    });

    Meteor.publish('ZhiBoMessage', function(){
        return DB.ZhiBoMessage.find();
    });
}