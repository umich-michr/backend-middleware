var resourceDao = require('../database/daos/resource.dao');
var HandlerResponse = require('./handler.response');

var httpHeaders = {
    'Content-Type': 'application/json;charset=UTF-8'
};

var resourcePoster = function (handlerPayload) {
    var resourceName = handlerPayload.resourceName;
    var newResourceObject = handlerPayload.request.body;

    var failedOperationResponse = {operation:'post-resource',result:'can not save the new resource'};
    var handlerResponse = new HandlerResponse(500, httpHeaders, JSON.stringify(failedOperationResponse), resourceName);

    var newResourceId = resourceDao.post(resourceName, newResourceObject);

    if(newResourceId) {
        handlerResponse = new HandlerResponse(200, httpHeaders, JSON.stringify({id: newResourceId}), resourceName);
    }

    return handlerResponse;
};

module.exports = resourcePoster;
