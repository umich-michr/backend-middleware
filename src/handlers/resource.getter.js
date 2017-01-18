var resourceDao = require('../daos/resource.dao');
var HttpResponse = require('./http.response');

var resourceGetter = function (urlParameters, parameterMapper) {
    var resourceName = urlParameters.resourceName;

    var daoQueryObject = parameterMapper.toResourceDaoQueryObject(resourceName, urlParameters);
    var resource = resourceDao.get(resourceName, daoQueryObject);

    if (parameterMapper.isQueryById(resourceName, urlParameters)) {
        resource = resource[0];
    }

    var httpHeaders = {
        'Content-Type': 'application/json;charset=UTF-8'
    };
    var httpResponse = new HttpResponse(200, httpHeaders, JSON.stringify(resource));

    return httpResponse;
};

module.exports = resourceGetter;
