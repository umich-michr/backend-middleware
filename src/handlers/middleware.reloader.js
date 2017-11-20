var HandlerResponse = require('./handler.response');

var httpHeaders = {
	'Content-Type': 'application/json;charset=UTF-8',
};

module.exports = function (handlerPayload, callback, middleware) {
	var handlerResponse = new HandlerResponse(200, httpHeaders, JSON.stringify({message: 'Reloaded middleware.'}), 'middleware');
	try {
		middleware.reload();
	} catch (e) {
		console.error(e.stack);
		handlerResponse = new HandlerResponse(500, httpHeaders, JSON.stringify({
			message: 'Failed to reload middleware.',
			stack: e.stack,
		}), 'middleware');
	}

	return handlerResponse;
};
