Template.registerHelper('equal', function(v1, v2) {
    if (typeof v1 === 'object' && typeof v2 === 'object') {
        return _.isEqual(v1, v2); // do a object comparison
    } else {
        return v1 === v2;
    }
});

Template.registerHelper('formatDate', function(date) {

    return util.formatDate(date, 'yy-mm-dd h:m:s');
});