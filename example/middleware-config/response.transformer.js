var _ = require('lodash');
var paginate = require('../../src/transformers/pagination');

module.exports = function(handlerPayload, handlerResponse) {

    if (global.AUTH_PRINCIPAL) {
        console.log('authenticated setting roles header');
        handlerResponse.headers['x-user-roles'] = global.AUTH_PRINCIPAL.roles.join(',');
    }

    paginate (handlerPayload, handlerResponse);

    return handlerResponse;
};
