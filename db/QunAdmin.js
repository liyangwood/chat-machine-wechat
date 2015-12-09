

DB.QunAdminCommonRole = new Mongo.Collection('QunAdminCommonRole');

DB.QunAdminCommonRole.allow({
    insert : function(){
        return true;
    },
    update : function(){
        return true;
    },
    remove : function(){
        return true;
    }
});

if(Meteor.isServer){
    Meteor.publish('QunAdminCommonRole', function(){
        return DB.QunAdminCommonRole.find();
    });


}