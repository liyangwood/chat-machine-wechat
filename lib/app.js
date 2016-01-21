KG = {};

DB = {};

KG.config = {
    pwd : ''

};

if(Meteor.isServer){
    KG.config.pwd = process.env.PWD;

    KG.request = function(opts, callback){
        var fn = (function(err, rs){
            if(!rs){
                return false;
            }

            var body = rs.content;

            if(opts.json){
                try{
                    body = JSON.parse(body);
                }catch(e){}

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

KG.util = {};
KG.util.stripTags = function(string){
    return string.replace(/<(.*?)>/g, '');
};