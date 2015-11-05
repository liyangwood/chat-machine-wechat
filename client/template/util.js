util = {};



_.extend(util, _);


util.ajax = function(opts){


    var setting = {
        url : opts.url,
        type : opts.type || 'get',
        dataType : 'json',
        data : opts.data || {},
        success : function(rs){
            if(rs.status === 'ok'){
                opts.success(true, rs.data);
            }
            else{
                opts.error && opts.error(false, rs.data);
            }
        }
    };


    $.ajax(setting);
};