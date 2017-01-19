var Handler = require('./main.handler');
var helpers = require('./helper');
var ResourceDatabase = require('./resource.database');
var ResourceUrlParameterMapper = require('./handlers/resource.parameter.mapper');

var BackendMiddleware = function () {

    //Export the class definitions for the clients who would customize the standard behavior so that they can comply with domain object needs.
    // Enumeration for request types supported
    this.HttpMethod = require('./http.method.js');
    // Constructor function for handlers to use
    this.HttpHandlerPayload = require('./handlers/handler.payload');
    this.HttpResponse = require('./handlers/http.response');
    this.UrlParser = require('./url.parser');
    this.HelperFunctions = require('./helper');

    this.ResourceUrlParameterMapper = ResourceUrlParameterMapper;

    var thisModule = this;

    var resourceUrlParameterMapper, handler, resourceDatabase;

    var init = function(config){
        resourceUrlParameterMapper = new thisModule.ResourceUrlParameterMapper(config.urlParameterDateFormat, config.resourceUrlParamMapFiles.path, config.resourceUrlParamMapFiles.extension);
        handler = new Handler(config.routes, config.handlers, resourceUrlParameterMapper, config.responseTransformerCallback);
        resourceDatabase = new ResourceDatabase(resourceUrlParameterMapper, config.dataFiles.path, config.dataFiles.extension);
        resourceDatabase.start();
    }

    var writeHeaders = function (statusCode, headers, res) {
        if (helpers.isResponseHeader(headers)) {
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
           var response = handler.handle(req);

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
