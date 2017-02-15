var uniloc = require('uniloc-michr-fork');
var defaultRoutes = require('./config/default.routes');
var defaultHandlers = require('./config/default.handlers');
var HandlerPayload = require('./handlers/handler.payload');
var _ = require('underscore');
//uniloc lookup response: { name: handlerName, options: {query and/or url parameters} }

/**
 * @param config Configuration parameters to help dispatcher to decide where to dispatch the request to be handled for response to be built and returned.
 *  routes An object that maps routes as represented by http method and url fragments with query string combinations to function names that will handle those routes by returning stringified json objects and http headers
 *  routeHandlers An object that maps route handling function names to functions.
 *  parameterMapper An object that transforms url parameters and url query string parameters to an object dao could use to query in memory database
 *  responseTransformerCallback An optional user provided callback method that will transform the http response returned by the route handler to any other form before being returned to client. It should accept resource to be returned and url parameter value map to apply custom logic to transfor it into the other form the callback function will return.
 *  contextPath (Optional - default backedn-middleware) The url path appearing after host name/IP address in the url specifying the context of the application. (Application Root Url)
 * @constructor
 */
var Dispatcher = function (config) {
    this.router = uniloc(_.extend(defaultRoutes, config.routes));
    this.routeHandlers = _.extend(defaultHandlers, config.routeHandlers);

    this.dispatch = function (request) {

        config.contextPath = config.contextPath||'backend-middleware';
        var lookupUrl;
        if(config.contextPath === '/') {
            lookupUrl = request.url;
        } else {
            lookupUrl = request.url.replace(config.contextPath,'').replace(/^(\.\/|\/|\.$)/, '');
        }
        var handlerLookup = this.router.lookup(lookupUrl, request.method);
        if (handlerLookup && handlerLookup.name) {
            var requestHandler = this.routeHandlers[handlerLookup.name];
            if (requestHandler) {
                var handlerPayload = new HandlerPayload(request, handlerLookup.options, config.parameterMapper);
                return requestHandler(handlerPayload, config.responseTransformerCallback);
            }
        }

        return undefined;
    };
};

module.exports = Dispatcher;
