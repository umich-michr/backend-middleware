var resourceGetter = require('./handlers/resource.getter');

var handlers = {
    getResource: resourceGetter,
    getResourceById: resourceGetter
};

module.exports = handlers;