var HandlerProvider = require('./handler.provider');
var helpers = require('./helper');

var Middleware = function(config){
    var handlers = new HandlerProvider(config.routes,config.handlers, config.urlParameterDateFormat);

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
        var response = handlers.handle(req);
        
        if(!response){
            next();
        } else {
            writeHeaders(response.statusCode, response.headers, res);
            res.write(response.body ? response.body : '');
            //{ name: undefined, options: {} }
        }
    };
};

module.exports=Middleware;
