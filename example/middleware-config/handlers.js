// handlerPayload: {request:{},urlParameters:{}}
// parameterMapper: {RESOURCE_URL_PARAM_MAP: Object,
//                   urlParameterDateFormat: String,
//                              isQueryById: function(resourceName, urlParameters),
//                 toResourceDaoQueryObject: function(resourceName,urlParameters)}
// responseTransformerCallback: function(httpResponse:{
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
var HttpResponse = require('../../src/handlers/http.response');
var httpHeaders = {
    'Content-Type': 'application/json;charset=UTF-8'
};
var handlers = {
    login: function(handlerPayload, parameterMapper, responseTransformerCallback){
        var credentials = handlerPayload.request.body;
        var authenticatedUser = _.findWhere(users,credentials);
        var httpResponse = new HttpResponse(200, httpHeaders, '', 'auth');

        if(!authenticatedUser  || !authenticatedUser.roles || authenticatedUser.roles.length===0){
            httpResponse.statusCode=401;
            httpResponse.body='{"operation":"authentication","result":"failed"}';
            return httpResponse;
        }
        httpResponse.headers['x-user-roles']=authenticatedUser.roles.join(',');
        httpResponse.body='{"operation":"authentication","result":"success"}';
        //if needed implement a more sophisticated real multi user/session authentication mechanism using cookies.
        //console.log(util.inspect(httpResponse,showHidden=false, depth=2, colorize=true));
        global.AUTH_PRINCIPAL = _.omit(authenticatedUser,'password');
        return httpResponse;
    },
    logout: function(handlerPayload, parameterMapper, responseTransformerCallback){
        var authenticatedUser = global.AUTH_PRINCIPAL;
        global.AUTH_PRINCIPAL = undefined;
        if(authenticatedUser){
            console.log('logged out');
        }
        return new HttpResponse(200, httpHeaders, 'user session terminated', 'auth');
    }
};

module.exports = handlers;
