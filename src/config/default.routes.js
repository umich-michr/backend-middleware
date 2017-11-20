var HTTP_METHODS = require('../utils/http.methods.js');
var routes = {
    'getResource': HTTP_METHODS.GET+' /:$resourceName',
    'getResourceById': HTTP_METHODS.GET+' /:$resourceName/:$resourceId',
    'postResource': HTTP_METHODS.POST + ' /:$resourceName',
    'reloadMiddleware': 'GET /middleware/reload'
};

module.exports = routes;
