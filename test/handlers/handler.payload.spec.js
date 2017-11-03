var assert = require('chai').assert;

var makeParameterMapper = require('../../src/handlers/resource.parameter.mapper');
var HandlerPayload = require('../../src/handlers/handler.payload');

var path = './test/test-data/param-map-files';
var dateFormat = undefined;

describe('Handler Payload', () => {
	it('finds the resource name by url parameter', () => {
		const handlerLookup = {
			name: 'defaultHandler',
			options: {
				$resourceName: 'resource-name',
			},
		};
		const handlerPayload = new HandlerPayload({}, handlerLookup, makeParameterMapper());
		assert.equal(handlerPayload.resourceName, 'resource-name');
	});

	it('finds the resource name by route name, preferring that over url parameter', () => {
		const handlerLookup = {
			name: 'myResource getter',
			options: {
				$resourceName: 'resource-name',
			},
		};
		const handlerPayload = new HandlerPayload({}, handlerLookup, makeParameterMapper());
		assert.equal(handlerPayload.resourceName, 'myResource');
	});

	it('uses the resource name to lookup attributes', () => {
		const parameterMapper = new makeParameterMapper(dateFormat, path);
		const handlerLookup = {
			name: 'people getter',
			options: {},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		assert.equal(handlerPayload.getAttribute('firstName'), 'firstName');
	});

	it('defaults attributes to the parameter name', () => {
		const parameterMapper = new makeParameterMapper(dateFormat, path);
		const handlerLookup = {
			name: 'people getter',
			options: {},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		assert.equal(handlerPayload.getAttribute('unknownParameter'), 'unknownParameter');
	});


	it('can get parameter values from the handler lookup', () => {
		const parameterMapper = new makeParameterMapper(dateFormat, path);
		const handlerLookup = {
			name: 'people getter',
			options: {
				'sort-by': 'last-name'
			},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		assert.equal(handlerPayload.getParamOrDefault('sort-by'), 'last-name');
	});

	it('defaults parameter values to that in the defaults mapping', () => {
		const parameterMapper = new makeParameterMapper(dateFormat, path);
		const handlerLookup = {
			name: 'people getter',
			options: {},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		assert.equal(handlerPayload.getParamOrDefault('sort-by'), 'first-name');// see defaults.url.param.map.json
	});
});
