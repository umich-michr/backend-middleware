var assert = require('chai').assert;
var moment = require('moment');

var resourceDao = require('../../../src/database/daos/resource.dao');
var dateFormat = 'MM/DD/YYYY';
var people = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        company: {
            name: 'APPLE'
        },
        dob: moment('01/01/1980', dateFormat).toDate().getTime(),
        externalOrganizations: [{
                complicated: [
                    {id: 100, name: 'org100'},
                    {id: 101, name: 'org101'},
                    {id: 200, name: 'org200'},
                    {id: 301, name: 'org301'}
                ]
            }
        ]
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Doe',
        company: {
            name: 'APPLE'
        },
        dob: moment('05/01/1980', dateFormat).toDate().getTime(),
        externalOrganizations: [{
            complicated: [
                {id: 400, name: 'org400'},
                {id: 500, name: 'org500'}

            ]
        }
        ]
    },
    {
        id: 3,
        firstName: 'Mike',
        lastName: 'Myer',
        company: {
            name: 'GM'
        },
        dob: moment('12/31/1970', dateFormat).toDate().getTime(),
        externalOrganizations: [{
            complicated: [
                {id: 600, name: 'org600'},
                {id: 800, name: 'org800'}
            ]
        },
            {
                complicated: [
                    {id: 900, name: 'org900'},
                    {id: 700, name: 'org700'}
                ]
            }
        ]
    },
    {
        id: 4,
        firstName: 'Macy',
        lastName: 'Myer',
        company: {
            name: 'GM'
        },
        dob: moment('08/12/1990', dateFormat).toDate().getTime(),
        externalOrganizations: [{
            complicated: [
                {id: 500, name: 'org500'}
            ]
        },
            {
                complicated: [
                    {id: 900, name: 'org900'},
                    {id: 1000, name: 'org1000'},
                    {id: 700, name: 'org700'},
                    {id: 1100, name: 'org1100'}
                ]
            }
        ]
    },
    {
        id: 5,
        firstName: 'Jason',
        lastName: 'Tyson',
        company: {
            name: 'TESLA'
        },
        dob: moment('11/01/1985', dateFormat).toDate().getTime(),
        externalOrganizations: [{complicated: []}]
    },
    {
        id: 6,
        firstName: 'Freddy',
        lastName: 'Sickmyer',
        company: {
            name: 'APPLE'
        },
        dob: moment('01/01/1980', dateFormat).toDate().getTime(),
        externalOrganizations: []
    },
    {
        id: 7,
        firstName: 'Solomon',
        lastName: 'Islands',
        company: {
            name: 'MICHR'
        },
        dob: moment('01/01/1965', dateFormat).toDate().getTime()
    }
];
var globalDB = global.DATABASE;

describe('DAO to query resources in the in-memory JSON object db', function () {
    beforeEach(function () {
        global.DATABASE = {};
        global.DATABASE['people'] = people;
    });

    afterEach(function () {
        global.DATABASE = globalDB;
    });

    it('testGet(String resourceName, Object daoQueryParam) - should return the whole object collection as resource when no daoQueryParam is specified', function () {
        var resourceName = 'people';

        var actual = resourceDao.get(resourceName);

        assert.deepEqual(actual, people, 'If no dao query object is specified then all the people should have been returned.');

        actual = resourceDao.get(resourceName, {});

        assert.deepEqual(actual, people, 'If empty dao query object is specified then all the people should have been returned.');

        actual = resourceDao.get(resourceName, null);

        assert.deepEqual(actual, people, 'If null query object is specified then all the people should have been returned');
    });

    it('testGet(String resourceName, Object daoQueryParam) - should return an array of objects as specified by the db query object as resource for single value parameters', function () {
        var resourceName = 'people';

        var singleValueQuery = {
            'firstName': 'Jason',
            'lastName': 'Tyson',
            'company.name': 'TESLA',
            'dob': moment('11/01/1985', dateFormat)
        };

        var expected = [people[4]];

        var actual = resourceDao.get(resourceName, singleValueQuery);

        assert.deepEqual(actual, expected, 'Single value query did not return the correct set of people');

        singleValueQuery = {
            'lastName': 'Myer'
        };
        expected = [people[2], people[3]];
        actual = resourceDao.get(resourceName, singleValueQuery);

        assert.deepEqual(actual, expected, 'Single value query did not return the correct set of people');

    });

    it('testGet(String resourceName, Object daoQueryParam) - should be able to query through array attribute values', function () {
        var resourceName = 'people';

        var deepQuery = {
            'externalOrganizations.complicated.id': 700
        };

        var expected = [people[2], people[3]];
        var actual = resourceDao.get(resourceName, deepQuery);

        assert.deepEqual(actual, expected, 'Deep query did not return the correct set of people');

    });

    it('testGet(String resourceName, Object daoQueryParam) - should return an array of objects as specified by the db query object as resource for multi value parameters', function () {
        var resourceName = 'people';

        var multiValueQuery = {
            'lastName': ['Myer', 'Tyson', 'Doe'],
            'company.name': ['GM', 'TESLA', 'APPLE'],
            'dob': [moment('12/31/1970', dateFormat), moment('11/01/1985', dateFormat)],
            'id': [1, 2, 3, 4, 5]
        };

        var expected = [people[0], people[1], people[2], people[4]];

        var actual = resourceDao.get(resourceName, multiValueQuery);

        assert.deepEqual(actual, expected, 'Multi value query did not return the correct set of people');

        actual = resourceDao.get(resourceName, {
            firstName: 'akjjsdsf'
        });

        assert.deepEqual(actual, [], 'Should have returned undefined when a valid query object does not correspond to existing object');

    });

    it('testGet(String resourceName, Object daoQueryParam) - should return an array of objects as specified by the db query object as resource for multi value parameters', function () {
        var resourceName = 'people';

        var multiValueQuery = {
            'lastName': ['Myer', 'Tyson', 'Doe'],
            'company.name': ['GM', 'TESLA', 'APPLE'],
            'dob': [moment('12/31/1970', dateFormat), moment('12/31/1970', dateFormat), moment('11/01/1985', dateFormat)],
            'id': [1, 2, 3, 4, 5]
        };

        var expected = [people[2], people[4]];

        var actual = resourceDao.get(resourceName, multiValueQuery);

        assert.deepEqual(actual, expected, 'Multi value query did not return the correct set of people');
    });

    it('testGet(String resourceName, Object daoQueryParam) - should return a single object if only resourceId parameter but no other object parameter is provided.', function () {
        var resourceName = 'people';

        var idQuery = {
            id: 4
        };

        var expected = [people[3]];

        var actual = resourceDao.get(resourceName, idQuery);

        assert.deepEqual(actual, expected, 'Did not return the correct person corresponding to id');

        idQuery = {
            id: 4,
            firstName: 'Mel'
        };

        actual = resourceDao.get(resourceName, idQuery);

        assert.deepEqual(actual, [], 'Should have returned undefined since there is no person with the given name and resourceId');

        idQuery = {
            id: 1,
            firstName: 'John'
        };

        expected = [people[0]];

        actual = resourceDao.get(resourceName, idQuery);

        assert.deepEqual(actual, expected, 'Did not return the correct person corresponding to the id and the first name');
    });
});
