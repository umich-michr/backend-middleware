var resourceDao = require('../database/daos/resource.dao');
var HandlerResponse = require('./handler.response');

var httpHeaders = {
    'Content-Type': 'application/json;charset=UTF-8'
};

var resourceGetter = function (handlerPayload, responseTransformerCallback) {
    var urlParameters= handlerPayload.urlParameters;
    var parameterMapper = handlerPayload.parameterMapper;
    var resourceName = handlerPayload.resourceName;

    var failedOperationResponse = {operation:'fetch-resource',result:'no matching resource is found'};
    var handlerResponse = new HandlerResponse(404, httpHeaders, JSON.stringify(failedOperationResponse), resourceName);

    var daoQueryObject = parameterMapper.toResourceDaoQueryObject(resourceName, urlParameters);
    var resource = resourceDao.get(resourceName, daoQueryObject);

    if(resource) {
        if (parameterMapper.isQueryById(resourceName, urlParameters) && resource.length) {
            resource = resource[0];
        }
        handlerResponse = new HandlerResponse(200, httpHeaders, JSON.stringify(resource), resourceName);
    }
    if(responseTransformerCallback) {
        var transformedResponse = responseTransformerCallback(handlerPayload, handlerResponse);
        handlerResponse = transformedResponse ? transformedResponse : handlerResponse;
    }

    return handlerResponse;
};

module.exports = resourceGetter;
