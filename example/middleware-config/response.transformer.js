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

module.exports = function(handlerPayload, handlerResponse) {

    if (global.AUTH_PRINCIPAL) {
        console.log('authenticated setting roles header');
        handlerResponse.headers['x-user-roles'] = global.AUTH_PRINCIPAL.roles.join(',');
    }

    paginate (handlerPayload, handlerResponse);

    return handlerResponse;
};
