var resourceDao = require('../daos/resource.dao');
var HttpResponse = require('./http.response');

var resourceGetter = function(urlParameters, parameterMapper) {
    var resourceName = urlParameters.resourceName;

    var daoResourceQueryObject = parameterMapper.toResourceDaoQueryObject(resourceName, urlParameters);
    var resource = resourceDao.get(resourceName, daoResourceQueryObject);

    var httpHeaders = {
        'Content-Type': 'application/json;charset=UTF-8'
    };
    var httpResponse = new HttpResponse(200, httpHeaders,resource);

    return httpResponse;
};

module.exports = resourceGetter;
