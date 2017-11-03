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


### dataFiles

`dataFiles` specifies the location and type of files containing resource representations in JSON. The dataFiles can be viewed as your database which can be queried by the url expressions.    
From the config above if the following was in <project_root_folder>/example/middleware-config/data/employees.json then https://..../backend-middleware/employees would return what was in that file as json. _The file names should be the same as the resource names you would expect in the url using the extension you specified in the config object._

* **When the data files are read, if the mapping file designates an attribute to be of date type then those values will be converted to long numeric date representations using moment.js library and the date format specified in the config (_urlParameterDateFormat_) then stored.**
```javascript
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
```

### resourceUrlParamMapFiles

`resourceUrlParamMapFiles` specifies location and type of files containing the info about which url parameter or url 
query string parameter maps to which resource attribute. The keys of the map are the query parameter names. The values are objects that specifies the resource attribute name, type and if it is a primary key.   
If the resource you are querying is inside another object, the attribute name is the JSON path to that resource attribute using dot notation. _The file names should be the same as the resource names you would expect in the url using the extension you specified in the config object._  
Given the data file example above the following can be in <project_root_folder>/example/middleware-config/mapping/employees.map.json file

When type attribute is not specified it defaults to "string". The types other than string are: "numeric", "date" 
```javascript
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
```  

### Dissecting the Url Parameter to Resource Attribute Mapping
Now the backend-middleware would:  
return the first employee in the data file (as a single object) when the url ../backend-middleware/employees/99 is called.  
return the second employee in the data file (in an array) when the url ../backend-middleware/employees?last-name=Doe&boss-id=1001 is called.


The key for the mapping will be the url parameter i.e. 'last-name' and 'boss-id'. The value of 'last-name' will be like. When type is not specified it defaults to string. 
```javascript
"last-name": {
    "attribute":"lastName"
}
```
Since "boss-id" refers to an attribute inside another object, we need to use JSON path as the attribute such as "boss.id".  
```javascript
"boss-id":{
    "attribute":"boss.id",
    "type":"numeric"
}
```


The default context path when making calls to the backend-middleware is /backend-middleware. The context path is configurable, you can specify any other string for it. (See the configuration section of the documentation)

See the example app for more details about the mapping files under example/middleware-config/mapping

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
    'postEmployees': function(handlerPayload, responseTransformerCallack) {
    }    	
};
module.exports = routes;
```

The `handlerPayload` looks like: 

```javascript
const handlerPayload = {
	urlParameters: {parentResourceName, departmentId, childResourceName},
	parameterMapper,
};
```

Good number of times you will need to add your own routes and handlers because the default behavior of the backend-middleware will not be responding to different use cases.  
For example, the request to get a list employees is https://mycompany.com/myAppContextPath/departments/5/employees. The default behavior is that "departments" is a resource name so there should be a corresponding data and url parameter mapping file and 5 is the id of the json object to be returned from the file and "employees" will be ignored unless you can change the deafult url handling behavior.   
In order to handle requests like this, you need to write your own routes and handlers and specify _**routes**_ and _**handlers**_ in the config by requiring them when creating backend-middleware object.  
An example of _**routes**_ to handle the request may be like  

```javascript
var routes = {
    'getEmployees': 'GET /:parentResourceName/:departmentId/:childResourceName'
};
module.exports = routes;
```

An example of _**handlers**_ that handles the routes will be like

```javascript
var handlers = {
    getEmployees: function(handlerPayload, responseTransformerCallback) {
        //handlerPayLoad is created by the constructor function below
        /*
        function(request,urlParameters,parameterMapper){
              // The request object passed by nodejs to backend-middleware
              this.request = request; 
              
              // url parameter/query string parameter name value map extracted from the url. 
              //e.g.: From the example above you can access departmentId from the url using handlerPayLoad.urlParameters.departmentId
              this.urlParameters = urlParameters;
              
              //Instance of ResourceParameterMapper (resource.parameter.mapper.js) which reads url parameter mapper files to return a json object good for matching with the json objects specified in the corresponding data file.
              this.parameterMapper = parameterMapper;                
        };
        */

        // your handler implementation.....
        var urlParameters= handlerPayload.urlParameters;
        var parameterMapper = handlerPayload.parameterMapper;
        var parentResourceName = urlParameters.parentResourceName;
        var childResourceName = urlParameters.childResourceName;
        // All data files are read into an object whose keys are the data file names without extension and values are 
        // what's inside the file. That object is globally exported for it to be available to your code so that you can 
        // easily write data access objects or directly query. (global.DATABASE)
        var allParentObjects = global.DATABASE[parentResourceName];
       
        var dataQueryingObject = handlerPayload.parameterMapper.toResourceDaoQueryObject(parentResourceName,handlerPayload.urlParameters);
        if(handlerPayload.parameterMapper.isQueryById(parentResourceName,handlerPayload.urlParameters)){
            /*
             * .... using allParentObjects and dataQueryingObject find the object matching (result) and return result[childResourceName]
             */
        }
        else{
            throw new 'No id specified for the resource.';
        }
    }
};
module.exports = handlers;
```  

## contextPath  
Specifies the context path after your server domain. _**The default value is backend-middleware**_. This will replace 'myAppContextPath' in our examples in this README  
## urlParameterDateFormat  
Specifies the date format in your url parameters. **_The default value is 'YYYY-MM-DDThh.mm.ss.sss'**_  Because we are using moment.js to do date/time conversions, you can lookup date/time formats from [moment.js web site](https://momentjs.com/).
For example, if your request is https://mycompany.com/myAppContextPath/department/employees?dob='1975/02/01', you need to set _**urlParameterDateFormat**_ to 'YYYY/MM/DD' so that the date parameter will be extracted correctly.  
## responseTransformerCallback  
Specifies a callback to process the response before returning to the client side. This will allow you to transform the response any way you want. See the example app for a server side pagination example. The function signature for a response transformer is the same as handler signature:
```javascript
function (handlerPayload, handlerResponse) {
// For the explanation of handlerPayload see the handle example above
//handlerResponse is specified by the constructor function in handler.response.js as below(The response that would eventually be returned by backend middleware):
/*
function (httpStatusCode, httpHeadersMap, body, resourceName) {
    this.statusCode = httpStatusCode;
    this.headers = httpHeadersMap;
    this.body = body;
    this.resourceName = resourceName;
};
*/
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

