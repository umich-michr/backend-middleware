// handlerPayload: {request:{},urlParameters:{}, parameterMapper:parameterMapper}
// parameterMapper: {RESOURCE_URL_PARAM_MAP: Object,
//                   urlParameterDateFormat: String,
//                              isQueryById: function(resourceName, urlParameters),
//                 toResourceDaoQueryObject: function(resourceName,urlParameters)}
// responseTransformerCallback: function(handlerResponse:{
//                                                     statusCode,
//                                                     headers,
//                                                     body,
//                                                     resourceName
//                                                    }
//                                                    , urlParameters)
//
var util = require('util');
var _ = require('underscore');
var users = require('./users.json');
var HandlerResponse = require('../../src/handlers/handler.response');
var httpHeaders = {
    'Content-Type': 'application/json;charset=UTF-8'
};
var handlers = {
    login: function(handlerPayload, responseTransformerCallback){
        var credentials = handlerPayload.request.body;
        var authenticatedUser = _.findWhere(users,credentials);
        var handlerResponse = new HandlerResponse(200, httpHeaders, '', 'auth');

        if(!authenticatedUser){
            handlerResponse.statusCode=401;
            global.AUTH_PRINCIPAL = undefined;
            handlerResponse.body='{"operation":"authentication","result":"failed"}';
            return handlerResponse;
        }

        if(!authenticatedUser.roles || authenticatedUser.roles.length===0){
            handlerResponse.statusCode=403;
            handlerResponse.body='{"operation":"authorization","result":"failed"}';
            return handlerResponse;
        }

        handlerResponse.headers['x-user-roles']=authenticatedUser.roles.join(',');
        handlerResponse.body='{"operation":"authentication","result":"success"}';
        //if needed implement a more sophisticated real multi user/session authentication mechanism using cookies.
        //console.log(util.inspect(handlerResponse,showHidden=false, depth=2, colorize=true));
        global.AUTH_PRINCIPAL = _.omit(authenticatedUser,'password');
        return handlerResponse;
    },
    logout: function(handlerPayload, responseTransformerCallback){
        var authenticatedUser = global.AUTH_PRINCIPAL;
        global.AUTH_PRINCIPAL = undefined;
        if(authenticatedUser){
            console.log('logged out');
        }
        return new HandlerResponse(200, httpHeaders, 'user session terminated', 'auth');
    }
};

module.exports = handlers;
