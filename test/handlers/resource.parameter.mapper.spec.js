var assert = require('chai').assert;
var moment = require('moment');

var ResourceParameterMapper = require('../../src/handlers/resource.parameter.mapper');

var path = './test/test-data/param-map-files';
var dateFormat = undefined;

describe('Maps the query string and url parameters for a given resource to JSON object attributes', function () {

    it('constructor(String path, String extension) - read the resource url param map files and store them', function () {

        var resourceParameterMapper = new ResourceParameterMapper(dateFormat, path);

        assert.equal(4, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP).length);
        assert.equal(7, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['people']).length);
        assert.equal(4, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['company-departments']).length);
        assert.equal(4, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['composite-primary-key']).length);
        assert.equal(4, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['no-primary-key']).length);

        //Test file extension configuration with existing files
        resourceParameterMapper = new ResourceParameterMapper(dateFormat, path, '.url.param.map.json');

        assert.equal(4, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP).length);
        assert.equal(7, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['people']).length);
        assert.equal(4, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['company-departments']).length);
        assert.equal(4, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['composite-primary-key']).length);
        assert.equal(4, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP['no-primary-key']).length);

        //Test file extension configuration with non existing files
        resourceParameterMapper = new ResourceParameterMapper(dateFormat, path, '.url.param.map.jsonx');

        assert.equal(0, Object.keys(resourceParameterMapper.RESOURCE_URL_PARAM_MAP).length);
    });

    it('testToResourceDaoQueryObject(Object urlParametersObject) - should return a map a resource dao could use to query in memory JSON resource db.', function () {
        var resourceParameterMapper = new ResourceParameterMapper(dateFormat, path);

        var urlParametersObject = {
            '$resourceName': 'company-departments',
            '$resourceId': '1',
            'dept-name': 'HR',
            'company-name': 'MICHR',
            'creation-date': ['2017-01-13T00.00.00.000', '2017-01-26T23.59.59.999'],
            'page': '1',
            'page-size': '10'
        };
        var expected = {
            'id': 1,
            'name': 'HR',
            'company.name': 'MICHR',
            'creationDate': [moment('2017-01-13T00.00.00.000', 'YYYY-MM-DDThh.mm.ss.sss'), moment('2017-01-26T23.59.59.999', 'YYYY-MM-DDThh.mm.ss.sss')]
        };

        var actual = resourceParameterMapper.toResourceDaoQueryObject(urlParametersObject['$resourceName'], urlParametersObject);

        assert.deepEqual(expected, actual, 'The url param/value pairs are not correctly converted to the object that represents the resource.');

    });

    it('testIsQueryById(String resourceName, Object urlQueryParameterObject) - reading the url query parameter map should return if the url query implies a fetch resource by id', function () {
        var resourceParameterMapper = new ResourceParameterMapper(dateFormat, path);

        var urlParameterObjectWithoutPrimaryKey = {
            a: 1,
            b: 2,
            d: 3
        };

        assert.isFalse(resourceParameterMapper.isQueryById('composite-primary-key', urlParameterObjectWithoutPrimaryKey));

        var urlParameterObjectWithPrimaryKey = {
            $resourceId:5,
            a: 1,
            d: 4,
            b: 2,
            c: 3
        };

        assert.isTrue(resourceParameterMapper.isQueryById('composite-primary-key', urlParameterObjectWithPrimaryKey));
    });

    it('extractKeyParameterMap(String resourceName, Object urlQueryParameterObject) - finds the resource attribute that is marked as key and returns all mapping information for it', function () {
        var resourceParameterMapper = new ResourceParameterMapper(dateFormat, path);


        assert.throws(resourceParameterMapper.extractKeyParameterMap.bind(resourceParameterMapper, 'unmapped-resource-name'),
            'No url parameter mapping was found for the resource unmapped-resource-name');

        assert.throws(resourceParameterMapper.extractKeyParameterMap.bind(resourceParameterMapper, 'composite-primary-key'),
            'When url is used to query for resource we do not support composite keys for resources.');

        assert.throws(resourceParameterMapper.extractKeyParameterMap.bind(resourceParameterMapper, 'no-primary-key'),
            'When url parameter is used to query for resource using id the url object mapping file should have specified a resource attribute to be key by setting mapping attribute key to true');


        var expected = {
            "attribute": "id",
            "key": true,
            "type": "numeric"
        };
        var actual = resourceParameterMapper.extractKeyParameterMap('company-departments');

        assert.deepEqual(expected, actual);

    });
});
