var resourceGetter = require('../handlers/resource.getter');
var resourcePoster = require('../handlers/resource.poster');
var handlers = {
    getResource: resourceGetter,
    getResourceById: resourceGetter,
    postResource: resourcePoster
};

module.exports = handlers;
