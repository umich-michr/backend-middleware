// httpResponse ={
//      statusCode:200,
//      headers: {
//          'x-user-roles':['a','b'],
//          'Content-Type':'application/json'
//      },
//      body:{id:1, name:'John'},
//      resourceName: 'employee'
// }
// handlerPayload = { request:request, urlParameters:{id:10, 'first-name':'John'}, parameterMapper} **!! the last key parameterMapper in the object is not implemented yet see issue #2 in GitHub.
var _ = require('underscore');
module.exports = function(handlerPayload, httpResponse) {

    if (global.AUTH_PRINCIPAL) {
        console.log('authenticated setting roles header');
        httpResponse.headers['x-user-roles'] = global.AUTH_PRINCIPAL.roles.join(',');
    }
    //PAGINATION STARTS
    var page = handlerPayload.urlParameters['page'];
    var pageSize = handlerPayload.urlParameters['page-size'];
    var resource = JSON.parse(httpResponse.body);

    if (isNaN(page) || isNaN(pageSize) || !resource || !_.isArray(resource)) {
        return httpResponse;
    }

    page = Number(page);
    pageSize = Number(pageSize);

    if (page !== 0 && pageSize !== 0) {
        var start = (page - 1) * pageSize;
        var end = start + pageSize;
        var paginatedResult = {};
        paginatedResult.totalCount = resource.length;
        paginatedResult.page = resource.slice(start, end);
        httpResponse.body = JSON.stringify(paginatedResult);
    }
    //PAGINATION ENDS

    return httpResponse;
};