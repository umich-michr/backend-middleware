var resourceDao = require('../daos/resource.dao');
var HttpResponse = require('./http.response');
var _ = require('underscore');

var resourceGetter = function(urlParameters, parameterMapper, urlParameterDateFormat) {
    var resourceName = urlParameters.resourceName;
    var resource;

    var shouldGetAllResources = function(parameterMap){
        return Object.keys(_.omit(parameterMap, 'resourceName')).length===0;
    };
   /* {
        "resourceName":"service-provided",
        "page":"1",
        "page-size":"20",
        "startDate":["2017-01-13T00.00.00.000","2017-01-26T23.59.59.999"],
        "programId"="100"
    }

    {
        "startDate":[longDateRangeStart, longDateRangeEnd],
        "program":{"id":100}
    }*/

    if(shouldGetAllResources(urlParameters)) {
        resource = resourceDao.getAll(resourceName);
    }
    else{
        var daoResourceQueryObject = parameterMapper.toResourceDaoQueryObject(urlParameters);
        resource = resourceDao.get(resourceName, daoResourceQueryObject);
    }
    var httpHeaders = {
        'Content-Type': 'application/json;charset=UTF-8'
    };
    var httpResponse = new HttpResponse(200, httpHeaders,resource);

    return httpResponse;
};

module.exports = resourceGetter;
