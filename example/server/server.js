/*jshint esversion: 6 */
const args = process.argv.slice(2);
const baseDir = args[0];
const openBrowser = (args[1]==='true');

var bodyParser = require('body-parser');

//Offline Database Middleware to mock responses to backend requests.
const BackendMiddleware = require('../../src/middleware.js');
const config ={
    routes:require('../middleware-config/routes.js'),
    handlers:require('../middleware-config/handlers.js'),
    urlParameterDateFormat: 'YYYY-MM-DD',
    dataFiles: {
        path: './example/middleware-config/data',
        extension: '.json'
    },
    resourceUrlParamMapFiles: {
        path: './example/middleware-config/mapping',
        extension: '.map.json'
    },
    responseTransformerCallback:require('../middleware-config/response.transformer.js')
};

var bs = require('browser-sync').create();

// init starts the server
bs.init(
    {
        notify: false,
        server: baseDir,
        middleware: [bodyParser.json(),bodyParser.urlencoded({extended:true}),new BackendMiddleware().createMiddleware(config)],
        https: {
            key : "example/server/certs/server.key",
            cert: "example/server/certs/server.crt"
        },
        open: Boolean(openBrowser)
    }
);

bs.watch('./example/**',  {ignored: './example/server/**'} , function (event, file) {
    if (event === 'change') {
        console.log('File changed, reloading: '+file);
        var exec = require('child_process').exec;
        bs.reload(file);
    }
});
