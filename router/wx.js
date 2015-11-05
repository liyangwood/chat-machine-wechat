
if(Meteor.isServer){

    var request = Meteor.npmRequire('request');

    var F = {
        setOption : function(opts){

            opts = _.extend({
                url : ''
            }, opts||{});

            return opts;

        },

        result : function(flag, data){
            var data = {
                status : flag?'ok':'error',
                data : data
            };

            return JSON.stringify(data);
        },


        getLoginQrCode : function(callback){
            var url = 'https://login.weixin.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=zh_CN&_='+Date.now();

            request(F.setOption({
                url : url
            }), function(err, res, body){
                console.log(body);
                //window.QRLogin.code = 200; window.QRLogin.uuid = "oeb5B863ng=="
                var uuid = /"([^"]*)"/g.exec(body)[1];

                callback(true, 'https://login.weixin.qq.com/qrcode/'+uuid+'?t=webwx');

            });
        }
    };



    Router.route('weixinPage', {
        where : 'server',
        path : '/wxapi/login/qr'
    }).get(function(){
        var self = this;
        F.getLoginQrCode(function(b, url){
            self.response.end(F.result(true, {
                url : url
            }));
        });


    });




}



