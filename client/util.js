util = {};



_.extend(util, _);


util.ajax = function(opts){


    var setting = {
        url : opts.url,
        type : opts.type || 'get',
        dataType : 'json',
        data : opts.data || {},
        success : function(rs){
            if(rs.status > 0){
                opts.success(true, rs.data);
            }
            else{
                opts.error && opts.error(false, rs.data);
            }
        }
    };


    $.ajax(setting);
};

_.extend(util, {
    formatDate : function(date, format){
        if(date.toString().length === 10){
            date = parseInt(date)*1000;
        }

        var d = new Date(date);
        var year = d.getFullYear(),
            month = addZero(d.getMonth() + 1),
            day = addZero(d.getDate()),
            hour = addZero(d.getHours()),
            min = addZero(d.getMinutes()),
            sec = addZero(d.getSeconds());

        function addZero(x){
            if(x<10) return '0'+x;
            return x;
        }

        return format.replace('yy', year).replace('mm', month).replace('dd', day).replace('h', hour).replace('m', min).replace('s', sec);
    }
});