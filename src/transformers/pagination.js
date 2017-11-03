const _ = require('lodash');

module.exports = function paginationTransformer(handlerPayload, handlerResponse){
	var page = handlerPayload.urlParameters['page'];
	var pageSize = handlerPayload.urlParameters['page-size'];
	var resource = JSON.parse(handlerResponse.body);

	if (isNaN(page) || isNaN(pageSize) || !resource || !_.isArray(resource)) {
		return handlerResponse;
	}

	page = Number(page);
	pageSize = Number(pageSize);

	if (page !== 0 && pageSize !== 0) {
		var start = (page - 1) * pageSize;
		var end = start + pageSize;
		var paginatedResult = {};
		paginatedResult.totalCount = resource.length;
		paginatedResult.page = resource.slice(start, end);
		handlerResponse.body = JSON.stringify(paginatedResult);
	}
};

