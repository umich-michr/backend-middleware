var resourceDao = require('../daos/resource.dao');
var HttpResponse = require('./http.response');

var httpHeaders = {
    'Content-Type': 'application/json;charset=UTF-8'
};

var resourceGetter = function (handlerPayload, responseTransformerCallback) {
    var urlParameters= handlerPayload.urlParameters;
    var parameterMapper = handlerPayload.parameterMapper;
    var resourceName = urlParameters.resourceName;

    var failedOperationResponse = {operation:'fetch-resource',result:'no matching resource is found'};
    var httpResponse = new HttpResponse(404, httpHeaders, JSON.stringify(failedOperationResponse), resourceName);

    var daoQueryObject = parameterMapper.toResourceDaoQueryObject(resourceName, urlParameters);
    var resource = resourceDao.get(resourceName, daoQueryObject);

    if(resource) {
        if (parameterMapper.isQueryById(resourceName, urlParameters) && resource.length) {
            resource = resource[0];
        }
        httpResponse = new HttpResponse(200, httpHeaders, JSON.stringify(resource), resourceName);
    }

    if(responseTransformerCallback) {
        var transformedResponse = responseTransformerCallback(handlerPayload, httpResponse);
        httpResponse = transformedResponse ? transformedResponse : httpResponse;
    }

    return httpResponse;
};

module.exports = resourceGetter;
