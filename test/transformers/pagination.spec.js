var assert = require('chai').assert;

var paginationTransformer = require('../../src/transformers/pagination');
var HandlerPayload = require('../../src/handlers/handler.payload');
var makeParameterMapper = require('../../src/handlers/resource.parameter.mapper');

function fromTo(a, b) {
	const l = [];
	for (let i = a; i <= b; i++) {
		l.push(i);
	}
	return l;
}

describe('Pagination transformer', () => {
	it('paginates if page is given', () => {
		const handlerLookup = {
			name: 'resource GET',
			options: {
				page: '1',
				'page-size': 10,
			},
		};
		const handlerPayload = new HandlerPayload({}, handlerLookup, makeParameterMapper());

		const response = {
			body: JSON.stringify(fromTo(1, 100)),
		};
		paginationTransformer(handlerPayload, response);

		assert.deepEqual(JSON.parse(response.body), {totalCount: 100, page: fromTo(1, 10)});
	});

	it('does\'t paginate if no page or no page size is given', () => {
		const possibleOptions = [{page: '1'}, {'page-size': '10'}, {}];
		possibleOptions.forEach(options => {
			const handlerLookup = {
				name: 'resource GET',
				options,
			};
			const handlerPayload = new HandlerPayload({}, handlerLookup, makeParameterMapper());

			const response = {
				body: JSON.stringify(fromTo(1, 100)),
			};
			const bodyFromBefore = response.body;
			paginationTransformer(handlerPayload, response);

			assert.deepEqual(response.body, bodyFromBefore);
		});
	});
});

