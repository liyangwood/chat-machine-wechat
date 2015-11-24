KG = {};

if(Meteor.isServer){

    KG.request = function(opts, callback){
        var fn = (function(err, rs){
            var body = rs.content;

            if(opts.json){
                body = JSON.parse(body);
            }

            callback(err, rs, body);
        });

        if(!opts.method){
            opts.method = 'get';
        }

        if(opts.method.toLowerCase() === 'get'){
            Meteor.http.call('get', opts.url, opts, fn);

        }
        else if(opts.method.toLowerCase() === 'post'){
            Meteor.http.call('post', opts.url, opts, fn);
        }
        else{
            //TODO
        }
    };


}