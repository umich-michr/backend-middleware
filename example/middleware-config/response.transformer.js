// handlerResponse ={
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

var paginate = function(handlerPayload, handlerResponse){
    //PAGINATION STARTS
    var page = handlerPayload.urlParameters['page'];
    var pageSize = handlerPayload.urlParameters['page-size'];
    var resource = JSON.parse(handlerResponse.body);

    if (isNaN(page) || isNaN(pageSize) || !resource || !_.isArray(resource)) {
        return handlerResponse;
    }

    page = Number(page);
    pageSize = Number(pageSize);

    if (page !== 0 && pageSize !== 0) {
        var start = (page - 1) * pageSize;
        var end = start + pageSize;
        var paginatedResult = {};
        paginatedResult.totalCount = resource.length;
        paginatedResult.page = resource.slice(start, end);
        handlerResponse.body = JSON.stringify(paginatedResult);
    }
    //PAGINATION ENDS
};

module.exports = function(handlerPayload, handlerResponse) {

    if (global.AUTH_PRINCIPAL) {
        console.log('authenticated setting roles header');
        handlerResponse.headers['x-user-roles'] = global.AUTH_PRINCIPAL.roles.join(',');
    }

    paginate (handlerPayload, handlerResponse);

    return handlerResponse;
};
