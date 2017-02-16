# Why would you need backend-middleware?

When this module is added as middleware to any nodejs http server it intercepts http requests and returns responses configured by the user. Then you can easily build and test your UI application making http requests to get data to bind to.  

## Example use case

Your application UI needs a json response after making a request to: https://mycompany.com/myAppContextPath/employees/1223  
You will need to write a server application that will respond to an HTTP request and return an http resource in json format implied by the url. That is sometimes too much work. However, if you are already building your UI and testing it using nodejs then you can use backend-middleware with a basic configuration to return a json document (object) for the urls such as  https://mycompany.com/myAppContextPath/employees (identifies employees list), https://mycompany.com/myAppContextPath/employees/1223 (identifies employee with id 1223).


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

_**dataFiles**_ specifies the location and type of files containing resource representations in JSON. The dataFiles can be viewed as your database which can be queried by the url expressions.    
From the config above if the following was in <project_root_folder>/example/middleware-config/data/employees.json then https://..../backend-middleware/employees would return what was in that file as json. _The file names should be the same as the resource names you would expect in the url using the extension you specified in the config object._  
```
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

_**resourceUrlParamMapFiles**_ specifies location and type of files containing the info about which url parameter or url query string parameter maps to which resource attribute. The keys of the map are the query parameter names. The values are objects that specifies the resource attribute name, type and if it is a primary key.   
If the resource you are querying is inside another object, the attribute name is the JSON path to that resource attribute using dot notation. _The file names should be the same as the resource names you would expect in the url using the extension you specified in the config object._  
Given the data file example above the following can be in <project_root_folder>/example/middleware-config/mapping/employees.map.json file
```
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
```
"last-name": {
    "attribute":"lastName"
}
```
Since 'boss-id' is an attribute inside another object, we need to use JSON path as the attribute such as 'boss.id'.  
```
"boss-id":{
    "attribute":"boss.id",
    "type":"numeric"
}
```


The default context path when making calls to the backend-middleware is /backend-middleware. The context path is configurable, you can specify any other string for it. (See the configuration section of the documentation)

e.g.: all calls to http(s)://localhost:<your_server_port>/backend-middleware will be intercepted then depending on http verb and the parts of the url an action on server side will be fulfilled. By default all GET requests are fulfilled such that:




There are two ways to get one specific resource or resources. _**resourceName/resourceId**_ will return one specific resource that matches _**resourceId**_. _**resourceName?queryParams**_ will get an array of resources that match the queryParams.


The attribute type can be string, numeric and date. If no type is specified, the default type is string

For example, Your application makes a request to get all the employees whose last name is Doe and boss' id is 1001: https://mycompany.com/myAppContextPath/employees?last-name='Doe'&boss-id=1001
and in your data file, you store the employees as this:




See the example app for more details about the mapping files under example/middleware-config/mapping

# Other configurations

* contextPath - Specifies the context path after your server domain. The default value is backend-middleware
* routes - the default routes only support GET. You can specify your customized routes such other POST, PUT, login, logout and etc.
* handlers - If you specify your customized routes, you also need to implement the customized handlers for those routes. The default handler supports only GET
* urlParameterDateFormat - Specifies the date format in your data json file (your database). The default value is 'YYYY-MM-DDThh.mm.ss.sss'
* responseTransformerCallback - Specifies a callback to process the response before returning to the client side. This is especially useful when your backend will process the data fetched from the database such as server side pagination
