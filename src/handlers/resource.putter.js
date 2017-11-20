var resourceDao = require('../database/daos/resource.dao');
var HandlerResponse = require('./handler.response');

var httpHeaders = {
	'Content-Type': 'application/json;charset=UTF-8',
};

var resourcePoster = function (handlerPayload) {
	var urlParameters = handlerPayload.urlParameters;
	var parameterMapper = handlerPayload.parameterMapper;
	var resourceName = urlParameters.$resourceName;
	var newResourceObject = handlerPayload.request.body;

	var failedOperationResponse = {operation: 'put-resource', result: 'no matching resource is found'};
	var handlerResponse = new HandlerResponse(404, httpHeaders, JSON.stringify(failedOperationResponse), resourceName);

	var daoQueryObject = parameterMapper.toResourceDaoQueryObject(resourceName, urlParameters);
	var resource = resourceDao.get(resourceName, daoQueryObject);

	if (resource && resource.length) {
		resource.forEach(r => Object.assign(r, newResourceObject));
		handlerResponse = new HandlerResponse(204, httpHeaders, JSON.stringify(''), resourceName);
	}
	return handlerResponse;
};

module.exports = resourcePoster;
