
WenxuecityAPI = {};
if(Meteor.isServer){

    var request = Meteor.npmRequire('request');




    var F = {

        requestGet : function(opts){
            var host = 'http://api.wenxuecity.com';
            var url = host + opts.url;

            url += '&format=json&version=2';

            request(url, function(err, res, body){
                if(err){
                    opts.error(err);
                    return;
                }

                if(body){
                    opts.success(JSON.parse(body), res);
                }
                else{
                    opts.error({'error' : 'wrong'});
                }
            });
        },

        getNewsList : function(opts){
            var channel = opts.channel || 'news',
                max = opts.max || 5,
                url = '/service/api/?act=index&channel='+channel+'&pagesize='+max;
            F.requestGet({
                url : url,
                success : function(rs){
                    var data = rs.list;

                    if(data.length > max){
                        data = data.slice(0, max);
                    }

                    for(var i= 0, len=data.length; i<len; i++){
                        data[i].url = F.getNewsListUrlByListData(channel, data[i]);
                    }


                    opts.success(data);
                },
                error : opts.error
            });
        },

        getNewsListUrlByListData : function(channel, data){
            var d = data.dateline.substring(0, 10).replace(/\-/g, '/'),
                url = 'http://www.wenxuecity.com/news/'+d+'/';
            if(channel === 'news'){
                url += data.postid+'.html';
            }
            else{
                url += channel+'-'+data.postid+'.html';
            }


            return url;
        }



    };


    WenxuecityAPI = F;
}