var resourceDao = require('../database/daos/resource.dao');
var HandlerResponse = require('./handler.response');

var httpHeaders = {
	'Content-Type': 'application/json;charset=UTF-8',
};

var resourceDeleter = function (handlerPayload) {
	var urlParameters = handlerPayload.urlParameters;
	var parameterMapper = handlerPayload.parameterMapper;
	var resourceName = handlerPayload.resourceName;

	var failedOperationResponse = {operation: 'delete-resource', result: 'no matching resource is found'};
	var handlerResponse = new HandlerResponse(404, httpHeaders, JSON.stringify(failedOperationResponse), resourceName);

	var daoQueryObject = parameterMapper.toResourceDaoQueryObject(resourceName, urlParameters);
	var resource = resourceDao.get(resourceName, daoQueryObject);

	if (resource && resource.length) {
		const resourceList = global.DATABASE[resourceName];
		const index = resourceList.indexOf(resource[0]);
		// todo: cascade to delete foreign keys
		resourceList.splice(index, 1);
		handlerResponse = new HandlerResponse(204, httpHeaders, JSON.stringify(''), resourceName);
	}
	return handlerResponse;
};

module.exports = resourceDeleter;
