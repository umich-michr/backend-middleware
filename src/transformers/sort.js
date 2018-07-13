const _ = require('lodash');

function lexicographic(comparatorA, comparatorB) {
	return (x, y) => {
		const r = comparatorA(x, y);
		if (r === 0) return comparatorB(x, y);
		return r;
	};
}

function lexicographicAll(comparators) {
	return comparators.reduce(lexicographic, () => 0);
}

function naturalCompare(x, y) {
	return x < y ? -1 : x > y ? 1 : 0;
}

const compareOnParameter = handlerPayload => orderSpec => {
	let [_param, _order] = orderSpec.split(':');
	const paramInfo = handlerPayload.getParameterInfo(_param);
	const attr = paramInfo.attribute;
	const order = _order || paramInfo.defaultOrder || 'desc';// "bigger" things tend to be interesting, so put them first.
	return (x, y) => (order === 'asc' ? 1 : -1) * naturalCompare(x[attr], y[attr]);
};

function comparatorFor (handlerPayload, sortExpression) {
	const attributes = sortExpression.split(',');
	return lexicographicAll(attributes.map(compareOnParameter(handlerPayload)));
}

module.exports = function sortTransformer(handlerPayload, handlerResponse) {
	if (!handlerPayload.getParamOrDefault('sort-by')) {
		return;
	}

	const resource = JSON.parse(handlerResponse.body);
	if (!_.isArray(resource)) return;

	const sortExpression = handlerPayload.getParamOrDefault('sort-by');
	const comparator = comparatorFor(handlerPayload, sortExpression);
	resource.sort(comparator);

	handlerResponse.body = JSON.stringify(resource);
};

module.exports.comparatorFor = comparatorFor;