

DB.QunAdminCommonRole = new Mongo.Collection('QunAdminCommonRole');

if(Meteor.isServer){
    Meteor.publish('QunAdminCommonRole', function(){
        return DB.QunAdminCommonRole.find();
    });


}