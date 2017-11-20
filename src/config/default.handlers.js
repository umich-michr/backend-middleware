var resourceGetter = require('../handlers/resource.getter');
var resourcePoster = require('../handlers/resource.poster');
var middlewareReloader = require('../handlers/middleware.reloader');
var handlers = {
    getResource: resourceGetter,
    getResourceById: resourceGetter,
    postResource: resourcePoster,
    reloadMiddleware: middlewareReloader
};

module.exports = handlers;
