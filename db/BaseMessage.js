

BaseMessage = new Mongo.Collection('BaseMessage');



GroupMessage = new Mongo.Collection('GroupMessage');

GroupMessage.allow({
    insert : function(){
        return true;
    }
});

if(Meteor.isServer){
    Meteor.publish('GroupMessage', function(){
        return GroupMessage.find();
    });
}