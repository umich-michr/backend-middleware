# Why would you need backend-middleware?

When this module is added as middleware to any nodejs http server it intercepts http requests and returns responses configured by the user. Then you can easily build and test your UI application making http requests to get data to bind to.  

## Example use case

Your application UI needs a json response after making a request to: https://mycompany.com/myAppContextPath/employees/1223  
You will need to write a server application that will respond to an HTTP request and return an http resource in json format implied by the url. That is sometimes too much work. However, if you are already building your UI and testin it using nodejs http servers then you can insert backend-middleware with a basic configuration to return a json document (object) for the url https://mycompany.com/myAppContextPath/employees/1223.


# Quick Start

## Installation

```
npm install backend-middleware
```

## Usage

You need to use body-parser middleware for backend-middleware to work with json objects in http request body.

```javascript
var bodyParser = require('body-parser');

//to insert the pre-req middleware functions 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//When using browsersync, see the example application bundled with the project. (see the server.js under example/server folder)

````
 
The default context path when making calls to the backend-middleware is /backend-middleware. The context path is configurable, you can specify any other string for it. (See the configuration section of the documentation)

e.g.: all calls to http(s)://localhost:<your_server_port>/backend-middleware will be intercepted and based on http verb, the parts of the url an action on server side will be fulfilled. By default all GET requests are fulfilled such that:

The two configurations you have to specify is your data file and resource to url parameter mapping.
A basic configuration example:

```javascript
var config ={
    dataFiles: {
        path: './example/middleware-config/data',
        extension: '.json'
    },
    resourceUrlParamMapFiles: {
        path: './example/middleware-config/mapping',
        extension: '.map.json'
    }
};
```

Explain how minimal config works. e.g.: url parts map to resource names and query string parameters should be mapped to resource attributes using map files. Resource name followed by id and/or query string to specify a resource or a subset of resources specified by the resource name in url.


---
---



!!When you are writing resource url param map files, you should pay attention to map the url param "resourceId" to the object identifier attribute of your resource json representation. If you need to specify another url parameter that you'd like to use with query string for that resource you can add that to the mapping as well without problems. However, resourceId url param name is used by default route handlers so unless those are overridden you should provide a mapping for "resourceId" no matter whatever else you'd like to use for resource id param name.