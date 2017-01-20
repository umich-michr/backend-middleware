var HTTP_METHODS = require('../utils/http.methods.js');
var routes = {
    'getResource': HTTP_METHODS.GET+' /backend-middleware/:resourceName',
    'getResourceById': HTTP_METHODS.GET+' /backend-middleware/:resourceName/:resourceId'
};

module.exports = routes;
