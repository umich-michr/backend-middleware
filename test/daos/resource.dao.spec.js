var assert = require('chai').assert;
var moment = require('moment');
var sinon = require('sinon');

var resourceDao = require('../../src/daos/resource.dao');

var people = [{
	id:1,
    firstName: 'John',
    lastName: 'Doe',
	company:{name:'APPLE'},
	dob: new Date('01/01/1980')
},
{
	id:2,
    firstName: 'Jane',
    lastName: 'Doe',
	company:{name:'APPLE'},
	dob: new Date('05/01/1980')
},
{
	id:3,
    firstName: 'Mike',
    lastName: 'Myer',
	company:{name:'GM'},
	dob: new Date('12/31/1970')
},
{
	id:4,
    firstName: 'Macy',
    lastName: 'Myer',
	company:{name:'GM'},
	dob: new Date('08/12/1990')
},
{
	id:5,
    firstName: 'Jason',
    lastName: 'Tyson',
	company:{name:'TESLA'},
	dob: new Date('11/01/1985')
},
{
	id:6,
    firstName: 'Freddy',
    lastName: 'Sickmyer',
	company:{name:'APPLE'},
	dob: new Date('01/01/1980')
},
];
var globalDB = global.DATABASE;

describe('DAO to query resources in the in-memory JSON object db', function() {
    beforeEach(function() {
        global.DATABASE={};
        global.DATABASE['people']=people;
    });

    afterEach(function() {
        global.DATABASE=globalDB;
    });

    it('testGet(String resourceName, Object daoQueryParam) - should return the whole object collection as resource when no daoQueryParam is specified', function() {
        var resourceName = 'people';

        var actual = resourceDao.get(resourceName);

        assert.deepEqual(actual,people,'If no dao query object is specified then all the people should have been returned.');
		
		actual = resourceDao.get(resourceName,{});

		assert.deepEqual(actual,people,'If empty dao query object is specified then all the people should have been returned.');
				
		actual = resourceDao.get(resourceName, null);

		assert.deepEqual(actual,people,'If null query object is specified then all the people should have been returned');
    });
	
    it('testGet(String resourceName, Object daoQueryParam) - should return an array of objects as specified by the db query object as resource for single value parameters', function() {
        var resourceName = 'people';
		
		var singleValueQuery ={
			lastName:'Tyson',
			company:{name:'TESLA'},
			dob:new Date('11/01/1985')
		};
		
		var expected =[people[4]];

        var actual = resourceDao.get(resourceName,singleValueQuery);

        assert.deepEqual(actual,expected,'Single value query did not return the correct set of people');
		
		singleValueQuery ={
			lastName:'Myer'
		};
		expected = [people[2],people[3]];
		actual = resourceDao.get(resourceName,singleValueQuery);
		
		assert.deepEqual(actual,'Single value query did not return the correct set of people');
		
    });
	
    it('testGet(String resourceName, Object daoQueryParam) - should return an array of objects as specified by the db query object as resource for multi value parameters', function() {
        var resourceName = 'people';
		
		var multiValueQuery ={
			lastName:['Myer','Tyson','Doe'],
			company:{name:['GM','TESLA','APPLE']},
			dob:[new Date('12/31/1970'),new Date('11/01/1985')],
			id:[1,2,3,4,5]
		};
		
		var expected =[people[0],people[2],people[3],people[4]];

        var actual = resourceDao.get(resourceName,multiValueQuery);

        assert.deepEqual(actual,expected,'Multi value query did not return the correct set of people');
		
		actual = resourceDao.get(resourceName,{firstName:'akjjsdsf'});
		
		assert.isUndefined(actual,'Should have returned undefined when a valid query object does not correspond to existing object');
		
    });
	
    it('testGet(String resourceName, Object daoQueryParam) - should return an array of objects as specified by the db query object as resource for multi value parameters', function() {
        var resourceName = 'people';
		
		var multiValueQuery ={
			lastName:['Myer','Tyson','Doe'],
			company:{name:['GM','TESLA','APPLE']},
			dob:[new Date('12/31/1970'),new Date('11/01/1985')],
			id:[1,2,3,4,5]
		};
		
		var expected =[people[0],people[2],people[3],people[4]];

        var actual = resourceDao.get(resourceName,multiValueQuery);

        assert.deepEqual(actual,expected,'Multi value query did not return the correct set of people');
    });
	
    it('testGet(String resourceName, Object daoQueryParam) - should return a single object if only resourceId parameter but no other object parameter is provided.', function() {
        var resourceName = 'people';
		
		var idQuery ={
			resourceId:4
		};
		
		var expected =people[3];

        var actual = resourceDao.get(resourceName,idQuery);

        assert.deepEqual(actual,expected,'Did not return the correct person corresponding to id');
		
		idQuery ={
			resourceId:4,
			firstName:'Mel'
		};
		
		actual = resourceDao.get(resourceName,idQuery);
		
		assert.isUndefined(actual,'Should have returned undefined since there is no person with the given name and resourceId');
		
		idQuery ={
			resourceId:1,
			firstName:'John'
		};
		
		var expected =people[3];
		
		actual = resourceDao.get(resourceName,idQuery);
		
		assert.deepEqual(actual,expected,'Did not return the correct person corresponding to the id and the first name');
    });
});
