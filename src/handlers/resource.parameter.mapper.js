var helpers = require('../helper');

module.exports = function (urlParameterDateFormat, urlParamMapFilePath, urlParamFileExtension) {
    //console.log(urlParamMapFilePath+':'+urlParamFileExtension||'.url.param.map.json')
    this.RESOURCE_URL_PARAM_MAP = helpers.readFilesToMap(urlParamMapFilePath, urlParamFileExtension || '.url.param.map.json');
    this.urlParameterDateFormat = urlParameterDateFormat;

    this.toResourceDaoQueryObject = function (resourceName, urlParametersObject) {
        var resourceDaoQueryObject = {};
        var resourceUrlParamMap = this.RESOURCE_URL_PARAM_MAP[resourceName];
        if(!resourceUrlParamMap){
            return;
        }

        for (var queryParam in urlParametersObject) {

            if(!resourceUrlParamMap[queryParam]) {
                continue;
            }
            //queryParam: 'programId'
            //resourceAttributeUrlParameterValue.attribute: 'program.id'

            var resourceAttributeUrlParameterValue = resourceUrlParamMap[queryParam].attribute;
            var resourceAttributeUrlParameterValueType = resourceUrlParamMap[queryParam].type;

            if (resourceAttributeUrlParameterValue) {
                var queryValue = helpers.castToParamValue(urlParametersObject[queryParam], resourceAttributeUrlParameterValueType, this.urlParameterDateFormat);

                var resourceAttributes = resourceAttributeUrlParameterValue.split('.');

                if (resourceAttributes.length >= 2) {
                    resourceDaoQueryObject[resourceAttributes[0]] = {};

                    for (var i = 1; i < resourceAttributes.length; i++) {
                        var resourceAttribute = resourceAttributes[i];

                        resourceDaoQueryObject[resourceAttributes[i - 1]][resourceAttribute] = {};
                    }

                    resourceDaoQueryObject[resourceAttributes[resourceAttributes.length - 2]][resourceAttributes[resourceAttributes.length - 1]] = queryValue;
                } else {
                    resourceDaoQueryObject[resourceAttributes] = queryValue;
                }
            }
        }

        return resourceDaoQueryObject;
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
};

