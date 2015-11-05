
WebApp.connectHandlers.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});


Meteor.publish('BaseMessage', function() {
    return BaseMessage.find({}, {
        limit : 100
    });
});

