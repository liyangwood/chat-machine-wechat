



//
//Router.configure({
//    layoutTemplate: 'layout'
//
//});
Router.route('/', {
    name: 'test',
    loadingTemplate : 'loading',
    waitOn : function(){
        return Meteor.subscribe('BaseMessage');
    }
});

Router.route('/api/collectMessage', {where: 'server'}).get(function(){
    console.log(this.params.query);

    this.response.json({'status':'ok'});
}).post(function(){


    var data = this.request.body;

    var self = this;
    BaseMessage.insert(data, function(err, rs){
        if(err){

            self.response.end(JSON.stringify({
                statue : 'error'
            }));

            return;
        }

        self.response.end(JSON.stringify({
            status : 'ok',
            id : rs
        }));
    });



});