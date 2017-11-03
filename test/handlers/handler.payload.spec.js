var moment = require('moment');
var assert = require('chai').assert;

var makeParameterMapper = require('../../src/handlers/resource.parameter.mapper');
var HandlerPayload = require('../../src/handlers/handler.payload');

var path = './test/test-data/param-map-files';
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
		const parameterMapper = new makeParameterMapper(undefined, path);
		const handlerLookup = {
			name: 'people getter',
			options: {},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		assert.equal(handlerPayload.getAttribute('firstName'), 'firstName');
	});

	it('defaults attributes to the parameter name', () => {
		const parameterMapper = new makeParameterMapper(undefined, path);
		const handlerLookup = {
			name: 'people getter',
			options: {},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		assert.equal(handlerPayload.getAttribute('unknownParameter'), 'unknownParameter');
	});


	it('can get parameter values from the handler lookup', () => {
		const parameterMapper = new makeParameterMapper(undefined, path);
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
		const parameterMapper = new makeParameterMapper(undefined, path);
		const handlerLookup = {
			name: 'people getter',
			options: {},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		assert.equal(handlerPayload.getParamOrDefault('sort-by'), 'first-name');
	});

	it('defaults parameter values to undefined if there\'s no default', () => {
		const parameterMapper = new makeParameterMapper(undefined, path);
		const handlerLookup = {
			name: 'people getter',
			options: {},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		assert.equal(handlerPayload.getParamOrDefault('other-option'), undefined);
	});

	it('parses a parameter value before setting an attribute', () => {
		const dateFormat = 'MM/DD/YYYY';
		const dateStr = '01/01/1990';

		const parameterMapper = new makeParameterMapper(dateFormat, path);
		const handlerLookup = {
			name: 'people getter',
			options: {},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		const myResource = {};
		handlerPayload.setValue('id', myResource, "88");
		handlerPayload.setValue('dob', myResource, dateStr);
		assert.equal(myResource.id, 88);
		assert.equal(myResource.dob, moment(dateStr, dateFormat).valueOf());
		assert.equal(handlerPayload.parseValue('id', '18'), 18);
	});

	it('parses the parameter value when getting the parameter value', () => {
		const dateFormat = 'MM/DD/YYYY';
		const dateStr = '01/01/1990';

		const parameterMapper = new makeParameterMapper(dateFormat, path);
		const handlerLookup = {
			name: 'people getter',
			options: {
				dob: dateStr
			},
		};

		const handlerPayload = new HandlerPayload({}, handlerLookup, parameterMapper);
		assert.equal(handlerPayload.getParamOrDefault('dob'), moment(dateStr, dateFormat).valueOf());
	});
});
