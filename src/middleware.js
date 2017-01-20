var Dispatcher = require('./dispatcher');
var ResourceDatabase = require('./database/resource.database');
var ResourceUrlParameterMapper = require('./handlers/resource.parameter.mapper');

var BackendMiddleware = function () {

    //Export the class definitions for the clients who would customize the standard behavior so that they can comply with domain object needs.
    // Enumeration for request types supported
    this.HTTP_METHODS = require('./utils/http.methods.js');
    this.HELPER_FUNCTIONS = require('./utils/helpers');
    // Constructor function for handlers to use
    this.HandlerPayload = require('./handlers/handler.payload');
    this.HandlerResponse = require('./handlers/handler.response');
    this.UrlParser = require('./utils/url.parser');

    this.ResourceUrlParameterMapper = ResourceUrlParameterMapper;

    var thisModule = this;

    var resourceUrlParameterMapper, dispatcher, resourceDatabase;

    var init = function(config){
        resourceUrlParameterMapper = new thisModule.ResourceUrlParameterMapper(config.urlParameterDateFormat, config.resourceUrlParamMapFiles.path, config.resourceUrlParamMapFiles.extension);
        dispatcher = new Dispatcher(config.routes, config.handlers, resourceUrlParameterMapper, config.responseTransformerCallback);
        resourceDatabase = new ResourceDatabase(resourceUrlParameterMapper, config.dataFiles.path, config.dataFiles.extension);
        resourceDatabase.start();
    }

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

module.exports = new BackendMiddleware();
