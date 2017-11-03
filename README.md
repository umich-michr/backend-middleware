# About

Backend-middleware is a lightweight middleware for express.js meant to be used to mock
a RESTful JSON web service so that a front-end can be developed rapidly and independently 
of the server.  

## Example use case

Suppose you need to consume a JSON api along the lines of:

    https://mycompany.com/app-context/resource-name/:id
    https://mycompany.com/app-context/resounce-name?attribute=value&other-attribute=otherValue
    https://mycompany.com/app-context/other-resource-name

which return JSON responses along the lines of:

    {
        "id": 1,
        "attribute": "value",
        "otherAttribute": "otherValue",
        "embeddedObject": {
            "anotherAttribute": "differentValue"
        }
    }

You can use backend-middleware to quickly bring up such a service by dumping JSON files
into a single directory:

    backend-middleware-config/data/resource-name.json:
    [
        {
            "id": 1,
            "attribute": "value",
            "otherAttribute": "otherValue",
            "embeddedObject": {
                "anotherAttribute": "differentValue"
            }
        },
        ....
    ]
    
    backend-middleware-config/mapping/resource-name.map.json
    {
        "id": {
            "key": true
        }
    }

And telling your express server to use backend-middleware:

```javascript
const backendMiddleware = require('backend-middleware');

// ...

const backendMiddlewareConfig = {
    dataFiles: {
        path: './backend-middleware-config/data',
        extension: '.json'
    },
    resourceUrlParamMapFiles: {
        path: './backend-middleware-config/mapping',
        extension: '.map.json'
    }
};

// ...

app.use(backendMiddleware.create(backendMiddlewareConfig));

// ...
```

Backend-middleware implements common conventions in RESTful JSON APIs, 
so querying a collection resource will return you a list of all resources in that collection,
filtering a collection can be done with query parameters matching the name of the attributes 
of the resource, and you can get individual resources by id.

# Quick Start

## Installation

```
npm install backend-middleware
```

## Usage

You need to use body-parser middleware for backend-middleware to work with json objects in http request body.

```javascript
var bodyParser = require('body-parser');
var backendMiddleware = require('backend-middleware');
var config = {
    dataFiles: {
        path: './example/middleware-config/data',
        extension: '.json'
    },
    resourceUrlParamMapFiles: {
        path: './example/middleware-config/mapping',
        extension: '.map.json'
    }
};
//to insert the pre-req middleware functions e.g.: when using express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(backendMiddleware.create(config));
//When using browsersync, see the example application bundled with the project. (see the server.js under example/server folder)
````
The two configuration parameters you have to specify at a minimum are your data file and resource to url parameter mapping.  

## Configuration

```javascript
const config = {
	dataFiles: {
		path, 
		extension: '.json'
	},
	resourceUrlParamMapFiles: {
		path, 
		extension: '.url.param.map.json'
	},
	urlParameterDateFormat: 'YYYY-MM-DDThh.mm.ss.sss',
	computedProperties,
	routes,
	handlers,
	responseTransformerCallback,
	contextPath: 'backend-middleware',
};
```

Option  | Explanation
------- | ------------
dataFiles.path | The path to the directory containing the JSON files to read.
dataFiles.extension | The extension of the files.
resourceUrlParamMapFiles | The JSON files that describe how URL parameters are mapped to JSON resource attributes, along with other things, such as defaults, and how to deserialize the parameter value.
resourceUrlParamMapFiles.path | The path to a directory of url parameter mapping files
resourceUrlParamMapFiles.extension | The extension of files to read in that directory
urlParameterDateFormat | The date format to read date strings in the data files, if the parameter mapping file says the attribute has a type of `'date'`.  This uses the moment syntax. 
computedProperties | A Javascript object describing computed properties for all resources.
routes | A Javascript object describing the routes.  There are certain default routes.
handlers | A Javascript object describing the handlers for routes.  There are default handlers for default routes.
responseTransformerCallback | A Javascript function which transforms the response from the middleware.
contextPath | The url path prefix that the middleware will handle.  


### dataFiles and urlParameterDateFormat

Data files contain the JSON of the resources the backend-middleware serves.  The file names have the form:

    ${dataFiles.path}${resourceName}${dataFiles.extension}

So, the file name determines the resource name, 
which is used through the rest of the middleware configuration.

When the data files are read, if the mapping file (see below) designates that an attribute has type `date`,
then that attribute will be parsed as a date using the format specified in the config parameter `urlParameterDateFormat`
using the moment.js library, and then stored as a unix millisecond timestamp (and hence will be served as
a number).


    backend-middleware-config/data/people.json:
    [
        {
            "id":99,
            "firstName":"John",
            "lastName":"Doe",
            "birthDate": "1970-12-31",
            "boss":{
                "id":1001,
                "firstName":"Jackie",
                "lastName":"Chan",
                "team":{
                    "id":100,
                    "name":"Awesome"
                }
            }
        },
        {
            "id":100,
            "firstName":"Jane",
            "lastName":"Doe",
            "birthDate": "1965-11-21",
            "boss":{
                "id":1001,
                "firstName":"Jackie",
                "lastName":"Chan",
                "team":{
                    "id":100,
                    "name":"Awesome"
                }
            }
        }
    ]

### resourceUrlParamMapFiles

`resourceUrlParamMapFiles` specifies location of the url parameter map files.  The file names read have the format:

    ${resourceUrlParamMapFiles.path}${resourceName}${resourceUrlParamMapFiles.extension}

Hence, their file names match up with the resource names specified by the data files.

These files specify information about url parameters, and how they map to the resource attributes,
along with implicitly specifying the type of the resource attributes.  They have the following form:

    /resource-name.url.param.map.json
    {
        "some-url-param": {
            "attribute": "someResourceAttribute",
            "type": "numeric",
            "key": false,
            "defaultValue": "a value",
            "defaultOrder": "asc"
        },
        "another-url-param": {
            "attribute": "some.attribute.in.objects.embedded.in.the.resource"
        }
    }

All properties are optional.  

`defaultOrder` is only used by the sorting response transformer.

`defaultValue` is only used by the `HandlerPayload.getParamOrDefault`; see below. 

`type` can be one of:

- `boolean`
- `numeric`
- `date`
- `string` (default)

`attribute` defines the attribute _path_ on the resource that the url parameter is associated with.
The default getter handler uses this to constrain which resources to return.

`key` defines the attribute to be a part of the database-like primary key of the resource.
The default getter handler notices if the query uses the primary key url parameters to fetch a resource,
and if so, returns a single object, instead of a list of matching objects.

    backend-middleware-config/mapping/people.url.param.json:
    {
        "employee-id":{
            "attribute":"id",
            "type":"numeric",
            "key":true
        },
        "last-name":{
            "attribute":"lastName"
        },
       
        "boss-id":{
            "attribute":"boss.id",
            "type":"numeric"
        }
    }

### computedProperties

The `computedProperties` is a Javascript object mapping resource names to objects of
computed properties.  Computed properties are given the resource, and must return
the value of the computed property named by the name of the function.  The `this` 
psuedo-variable of the function is set to the object holding the computed properties,
so that computed properties can call each other.  For example:

```javascript
const computedProperties = {
	employee: {
		fullName(employee) {
			return `${employee.firstName} ${employee.lastName}`
		},
		isCurrent(employee) {
			return Date.now() < employee.appointment.endDate; 
		},
		isOnPayroll(employee) {
			return employee.appointment.isPaid && this.isCurrent(employee);
		}
	},
	otherResource: {
		otherProp() { /* ... */ }
	}
}
```

The values of computed properties are assigned onto the resource itself, and they are available
when querying the database, and can be referenced in the resourceUrlParamMap files as an 
"attribute."

### routes and handlers

Routes are specified by a Javascript object, mapping the route name to a string
describing the url to match, in the uniloc.js format.  For instance:

```javascript
var routes = {
    'getEmployees': 'GET /:parentResourceName/:departmentId/:childResourceName',
    'postEmployees': 'POST /:parentResourceName/:departmentId/:childResourceName'
};
module.exports = routes;
```

Handlers are specified in the same way, but the route name is instead mapped to a handler function:


```javascript
var routes = {
    'getEmployees': function(handlerPayload, responseTransformerCallback) {
    },
    'postEmployees': function(handlerPayload, responseTransformerCallback) {
    }    	
};
module.exports = routes;
```

The handlers must return a response object that looks like:

```javascript
const handlerReturnValue = { 
  statusCode: 400,
  headers: {
  	headerName: 'headerValue'
  	// ...
  },
  body: 'body string'
};
```

The `handlerPayload` looks like: 

```javascript
const handlerPayload = {
	request: ExpressRequest,
	urlParameters: {parentResourceName, departmentId, childResourceName},
	parameterMapper,
};
```

The handler payload has a number of helper methods available.  See the section below on it.

The `urlParameters` are those bound from the url in the handlers file, along 
with all query parameters.  For example, if the url pattern for a handler was
`GET /resources/:id`, and the url that matched it was `/resources/18?page=2`,
then `urlParameters` would be:

```javascript
const urlParameters = {
    id: '18',
    page: '2'
}
```

### HandlerPayload

The handler payload has a number of helper methods, but they require the handler payload
to know about the resource name this request is meant to access.  There is nothing that requires
a single request to only access a single resource, however since that is typical, 
the handler payload gives you some shortcuts if that is the case.

You can specify the resource name to the handler payload by setting on the object itself:

```javascript
handlerPayload.resourceName = 'myResource';
```

However, it will infer it in two cases:

1. If there are at least two words in the route name, the resource name is taken as the first word.
1. Otherwise, it is the value of the url parameter named `$resourceName`.

An example of the first case:

```javascript
const routes = {
    'employees GET': 'GET /employees',
    'employees PATCH appointment': 'PATCH /employees/:id/appointment',
    'employees PUT': 'PUT /employees/:id'
};
```

and an example of the second case:

```javascript
const routes = {
    'getPublicResource': 'GET /public/:$resourceName',
    'getProtectedResource': 'GET /secure/:$resourceName',
};
```

#### HandlerPayload helper methods

Once the resource name is set or inferred, the following handler methods will work:

MethodName | Description
--- | ---
getParamOrDefault(urlParameterName) | Return the value of a parameter, defaulting it based on the mapping file, and parsing it based on its type if the mapping file. 
getAttribute(urlParameterName) | Return the attribute of the resource that corresponds to the parameter, or itself if there is no explicit mapping.
getParameterInfo(urlParameterName) | Return the JSON object for the parameter name, direct from the mapping file.
parseValue(attributeName, value) | Parse the value for the attribute (not url parameter), according to its type.
setValue(attributeName, resource, value) | Set the value of the attribute on the resource, parsing the value based on the type of the attribute.

### contextPath  

Specifies the context path after your server domain.

### Default Handlers

There are default handlers for getting and posting a resource.  The getter takes a resource like:

    GET https://localhost:3000/${contextPath}/${resourceName}?first-name=Phil

And return a response like:

    [{
        firstName: "Phil",
        lastName: "Smith",
        ...
    }, {
        firstName: "Phil",
        lastName: "Johnson",
        ...
    }]

It uses the url parameter mapping to find a matching attribute for each url parameter provided, and 
filters the JSON objects in the data file to only those that match the provided values (after parsing
the url parameter values based on the parameter type).

Similarly, the following works:

    GET https://localhost:3000/${contextPath}/${resourceName}/87
    
which would return a JSON object of the resource with id equal to 87.

Finally, posting to the resource with a JSON object would add that object to the (in-memory) database.
The data files themselves are never changed.  

Computed properties can be queried in this way, and they are returned in the response of any request.

### responseTransformerCallback  

This config parameter specifies a callback to process the response before returning to the client side. 
This will allow you to transform the response any way you want. 
See the example app for a server side pagination example. 
The function signature for a response transformer is as follows:

```javascript
const responseTransformerCallback = function (handlerPayload, handlerResponse) {
	return handlerResponse;
}
```

# Example app  

## How to run  
```
npm start
```  

## URLs  
* get all employees: https://localhost:3000/employees  
* get one employee by id: https://localhost:3000/employees/1 (you can also try id 2, 3 and 4)
* get employees by query string: https://localhost:3000/employees?last-name='Doe'&boss-id=10 (check the data file: middleware-config/data/employees.json for more details)
* get employees by query string (server side pagination): https://localhost:3000/employees?last-name='Doe'&boss-id=10&page=1&page-size=5  

&nbsp;&nbsp;&nbsp;&nbsp; **If the same query string parameter is specified multiple times, by default numeric and date parameters uses "between" operator if parameter is repeated twice or uses "in" operator.**
* get employees whose birth date is between 1970-12-31 and 1965-01-01: https://localhost:3000/employees?dob=1970-12-31&dob=1965-01-01
* get employees whose birth date is one of 1970-12-31, 1967-11-01, 1978-01-01: https://localhost:3000/employees?dob=1970-12-31&dob=1965-01-01&dob=1978-01-01  
* login (need to use something like Postman to send a POST request, valid usernames and passwords are in example/middleware-config/users.json): https://localhost:3000/login

## Files  
* main file: _example/server/server.js_
* data files: _example/middleware-config/data_
* url parameter to resource attribute mapping files: _example/middleware-config/mapping_
* customized routes: _example/routes.js_
* customized handlers: _example/handlers.js_
* customized response transformer: _example/response.transformer.js_
* valid usernames and passwords for testing login: _example/middleware-config/users.json_

