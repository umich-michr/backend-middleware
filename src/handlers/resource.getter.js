var resourceDao = require('../daos/resource.dao');
var HttpResponse = require('./http.response');

var resourceGetter = function (handlerPayload, parameterMapper, responseTransformerCallback) {

    var urlParameters= handlerPayload.urlParameters;

    var resourceName = urlParameters.resourceName;

    var daoQueryObject = parameterMapper.toResourceDaoQueryObject(resourceName, urlParameters);
    var resource = resourceDao.get(resourceName, daoQueryObject);

    if (parameterMapper.isQueryById(resourceName, urlParameters)) {
        resource = resource[0];
    }

    var httpHeaders = {
        'Content-Type': 'application/json;charset=UTF-8'
    };

    var httpResponse = new HttpResponse(200, httpHeaders, JSON.stringify(resource), resourceName);

    if(responseTransformerCallback) {
        var transformedResponse = responseTransformerCallback(httpResponse, urlParameters);
        httpResponse = transformedResponse ? transformedResponse : httpResponse;
    }

    return httpResponse;
};

module.exports = resourceGetter;