var assert = require('chai').assert;
var sinon = require('sinon');
var moment = require('moment');

var ResourceParameterMapper = require('../../src/handlers/resource.parameter.mapper');

var path = './test/test-data/param-map-files';
var dateFormat = undefined;

describe('Maps the query string and url parameters for a given resource to JSON object attributes', function() {

    it('constructor(String path, String extension) - read the resource url param map files and store them', function() {

        var resourceParameterMapper = new ResourceParameterMapper(dateFormat, path);

        assert.equal(2,Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP).length);
        assert.equal(3,Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['people']).length);
        assert.equal(5,Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['company-departments']).length);

        //Test file extension configuration with existing files
        resourceParameterMapper = new ResourceParameterMapper(dateFormat, path,'.url.param.map.json');

        assert.equal(2,Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP).length);
        assert.equal(3,Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['people']).length);
        assert.equal(5,Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['company-departments']).length);

        //Test file extension configuration with non existing files
        resourceParameterMapper = new ResourceParameterMapper(dateFormat, path,'.url.param.map.jsonx');

        assert.equal(0,Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP).length);
    });

    it('testToResourceDaoQueryObject(Object urlParametersObject) - should return a map a resource dao could use to query in memory JSON resource db.', function() {
        var resourceParameterMapper = new ResourceParameterMapper(dateFormat, path);

        var urlParametersObject = {
				"resourceName":"company-departments",
				"resourceId":"1",
				"dept-name":"HR",
				"company-name":"MICHR",
				"creation-date":["2017-01-13T00.00.00.000","2017-01-26T23.59.59.999"],
				"page":"1",
				"page-size":"10"
		};
		var expected = {
				"id":1,
				"name":"HR",
				"company":{"name":"MICHR"},
				"creationDate":[moment("2017-01-13T00.00.00.000", "YYYY-MM-DDThh.mm.ss.sss"),moment("2017-01-26T23.59.59.999", "YYYY-MM-DDThh.mm.ss.sss")],

		};
		
		var actual = resourceParameterMapper.toResourceDaoQueryObject(urlParametersObject.resourceName, urlParametersObject);
		
		assert.deepEqual(expected, actual, 'The url param/value pairs are not correctly converted to the object that represents the resource.');

    });
});
