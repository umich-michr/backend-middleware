var Handler = require('./main.handler');
var helpers = require('./helper');
var ResourceDatabase = require('./resource.database');
var ResourceParameterMapper = require('./handlers/resource.parameter.mapper');

var Middleware = function(config){
    var resourceParameterMapper = new ResourceParameterMapper(config.resourceAttributeUrlParameterMap);
    var handler = new Handler(config.routes,config.handlers, resourceParameterMapper, config.urlParameterDateFormat);

    var resourceDatabase = new ResourceDatabase(config.dataFilePath);
    resourceDatabase.start();

    var writeHeaders = function(statusCode, headers, res){
        if(helpers.isResponseHeader(headers)){
            for(var headerName in headers){
                res.setHeader(headerName,headers[headerName]);
            }
        }
        if(statusCode && !isNaN(statusCode)) {
            res.writeHead(statusCode);
        }
    };

    return function (req, res, next) {
        var response = handler.handle(req);

        if(!response){
            next();
        } else {
            writeHeaders(response.statusCode, response.headers, res);
            res.write(response.body ? response.body : '');
        }
    };
};

module.exports=Middleware;
