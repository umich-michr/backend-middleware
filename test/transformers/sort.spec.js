var assert = require('chai').assert;

var sortTransformer = require('../../src/transformers/sort');
var HandlerPayload = require('../../src/handlers/handler.payload');
var Database = require('../../src/database/resource.database');
var makeParameterMapper = require('../../src/handlers/resource.parameter.mapper');

const urlParamMapFilePath = './test/test-data/param-map-files';
const dataFiles = './test/test-data';

function fromTo(a, b) {
	const l = [];
	for (let i = a; i <= b; i++) {
		l.push(i);
	}
	return l;
}

function makeHandlerPayload(handlerLookup) {
	const parameterMapper = makeParameterMapper(null, urlParamMapFilePath);
	new Database(parameterMapper, dataFiles).start();
	return new HandlerPayload({}, handlerLookup, parameterMapper);
}

describe('Sort transformer', () => {
	it('sorts if sort-by is given, defaulting to descending', () => {
		const handlerLookup = {
			name: 'people GET',
			options: {
				'sort-by': 'first-name',
			},
		};
		const handlerPayload = makeHandlerPayload(handlerLookup);

		const response = {
			body: JSON.stringify(DATABASE.people),
		};
		sortTransformer(handlerPayload, response);
		assert.deepEqual(
			JSON.parse(response.body).map(p => p.firstName),
			["John", "Jane", "Jack"]);
	});

	it('sorts if sort-by is given, defaulting to descending', () => {
		const handlerLookup = {
			name: 'people GET',
			options: {
				'sort-by': 'first-name:asc',
			},
		};
		const handlerPayload = makeHandlerPayload(handlerLookup);

		const response = {
			body: JSON.stringify(DATABASE.people),
		};
		sortTransformer(handlerPayload, response);

		assert.deepEqual(
			JSON.parse(response.body).map(p => p.firstName),
			["Jack", "Jane", "John"]);
	});

	it('sorts by default sort-by if none given', () => {
		const handlerLookup = {
			name: 'people GET',
			options: {},
		};
		const handlerPayload = makeHandlerPayload(handlerLookup);

		handlerPayload.getParameterInfo('sort-by').defaultValue = 'last-name:asc';

		const response = {
			body: JSON.stringify(DATABASE.people),
		};
		sortTransformer(handlerPayload, response);

		assert.deepEqual(
			JSON.parse(response.body).map(p => p.firstName),
			["John", "Jack", "Jane"]);
	});
});

