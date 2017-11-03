var Dispatcher = require('./dispatcher');
var ResourceDatabase = require('./database/resource.database');
var ComputedProperties = require('./database/computed.properties');
var ResourceUrlParameterMapper = require('./handlers/resource.parameter.mapper');

var _ = require('underscore');
var bodyParser = require('body-parser');
var BackendMiddleware = function () {

    //Export the class definitions for the clients who would customize the standard behavior so that they can comply with domain object needs.

    // Enumeration for request types supported
    this.HTTP_METHODS = require('./utils/http.methods.js');
    // Constructor function for handlers to use
    this.HandlerPayload = require('./handlers/handler.payload');
    this.HandlerResponse = require('./handlers/handler.response');
    this.UrlParser = require('./utils/url.parser');

    this.HELPER_FUNCTIONS = require('./utils/helpers');

    var thisModule = this;

    var resourceUrlParameterMapper, dispatcher, resourceDatabase;

    var init = function(config){
        resourceUrlParameterMapper = new ResourceUrlParameterMapper(config.urlParameterDateFormat, config.resourceUrlParamMapFiles.path, config.resourceUrlParamMapFiles.extension);
        var dispatcherConfig = {
                routes:config.routes,
                routeHandlers:config.handlers,
                parameterMapper:resourceUrlParameterMapper,
                responseTransformerCallback:config.responseTransformerCallback,
                contextPath:config.contextPath
        };
        dispatcher = new Dispatcher(dispatcherConfig);
        resourceDatabase = new ResourceDatabase(resourceUrlParameterMapper, config.dataFiles.path, config.dataFiles.extension);
        resourceDatabase.start();
			  const computedProperties = new ComputedProperties(config.computedProperties);
        global.DATABASE_COMPUTED_PROPERTIES = computedProperties;
		};

    var writeHeaders = function (statusCode, headers, res) {
        if (thisModule.HELPER_FUNCTIONS.isResponseHeader(headers)) {
            for (var headerName in headers) {
                res.setHeader(headerName, headers[headerName]);
            }
        }
        if (statusCode && !isNaN(statusCode)) {
            res.writeHead(statusCode);
        }
    };

   this.create = function(config){
       init(config);
       var jsonBodyParser = bodyParser.json();
       var urlEncodedBodyParser = bodyParser.urlencoded({extended:true});

       return function (req, res, next) {
           var response = dispatcher.dispatch(req);

           if (!response) {
               next();
           }
           else {
               writeHeaders(response.statusCode, response.headers, res);
               res.write(response.body ? response.body : '');
               res.end();
           }
       };
   };
};

BackendMiddleware.prototype.transformers = {
	sort: require('./transformers/sort'),
	pagination: require('./transformers/pagination'),
};

BackendMiddleware.prototype.handlers = {
  getter: require('./handlers/resource.getter'),
  poster: require('./handlers/resource.poster')
};

BackendMiddleware.prototype.dao = require('./database/daos/resource.dao');

module.exports = new BackendMiddleware();
