var assert = require('chai').assert;
var moment = require('moment');
var helperFunctions = require('../src/helper');
var sinon = require('sinon');

var UrlParser = require('../src/url.parser');

var queryStringParamMap = {
    'custom-form': {
        'teamId': 'team.id',
        'formTypeId': 'formType.id'
    },
    'services-provided': {
        'programId': 'program.id',
        'teamId': 'team.id',
        'serviceId': 'service.id',
        'rangeStartDate': 'startDate',
        'rangeEndDate': 'startDate',
        'internalProjectId': 'internalProject.id',
        'researchStudyId': 'researchStudy.id',
        'updatedByUserName': 'modifiedBy',
        'organizationId': 'externalServiceClients.organization.id',
        'internalClientId': 'internalServiceClients.client.emplId'
    }
};

var urlParser = new UrlParser(queryStringParamMap);

var startDateString = '2017-01-05T00.00.00.000';
var startDate = moment(startDateString, urlParser.paramValueDateFormat);
var endDateString = '2017-01-06T23.59.59.999';
var endDate = moment(endDateString, urlParser.paramValueDateFormat);
var url = '/mock/services-provided?page=1&page-size=20&programId=2806&teamId=51&rangeStartDate=' + startDateString + '&rangeEndDate=' + endDateString + '&updatedByUserName=johnDoe&a=1&a=2&a=3';
var queryString = url.slice(url.lastIndexOf('?') + 1);

describe('Query String Parser reads the url to build objects the dao could use to query document database', function () {
    // it('should return the resource name from the url', function() {
    //     var resourceName = urlParser.extractResourceName(url);
    //     var expected = 'services-provided';
    //
    //     assert.equal(resourceName,expected,'The resource name is not found correctly in the url.');
    // });

    it('testExtractQueryStringParameters(String queryString) - should return array of key value pair arrays from url', function () {
        sinon.stub(helperFunctions, 'castToParamValue', function (value) {
            if (value === startDateString) {
                return startDate;
            }
            else if (value === endDateString) {
                return endDate;
            }
            else if (!isNaN(value)) {
                return Number(value);
            }
            else {
                return value;
            }
        });
        var queryStringParameters = urlParser.extractQueryStringParameters(queryString);
        var expected = [
                ['page', 1],
                ['page-size', 20],
                ['programId', 2806],
                ['teamId', 51],
                ['rangeStartDate', startDate],
                ['rangeEndDate', endDate],
                ['updatedByUserName', 'johnDoe'],
                ['a', 1],
                ['a', 2],
                ['a', 3]
        ];
        assert.deepEqual(queryStringParameters, expected, 'Array of key value pair arrays is not built correctly.');
    });

    it('testQueryStringToDaoParameter(String resourceName, String queryString) - should return an object that dao could use to query database from a url', function () {

        var daoParameter = urlParser.queryStringToDaoParameter('services-provided', queryString);
        var expected = {
            'page': 1,
            'page-size': 20,
            'program.id': 2806,
            'team.id': 51,
            'startDate': [startDate, endDate],
            'modifiedBy': 'johnDoe',
            'a': [1, 2, 3]
        };

        assert.deepEqual(daoParameter, expected, 'The dao parameter is not correctly built from url query string.');
    });
});
