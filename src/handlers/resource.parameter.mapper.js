var helpers = require('../helper');

module.exports = function (urlParameterDateFormat, urlParamMapFilePath, urlParamFileExtension) {

    this.RESOURCE_URL_PARAM_MAP = helpers.readFilesToMap(urlParamMapFilePath, urlParamFileExtension || '.url.param.map.json');
    this.urlParameterDateFormat = urlParameterDateFormat || helpers.defaultDateFormat;

    this.isQueryById = function (resourceName, urlParametersObject) {
        var resourceUrlParamMap = this.RESOURCE_URL_PARAM_MAP[resourceName];

        if (!resourceUrlParamMap) {
            return false;
        }

        var hasKey;
        for (var resourceUrlParamKey in resourceUrlParamMap) {
            var resourceUrlParam = resourceUrlParamMap[resourceUrlParamKey];
            if (!resourceUrlParam || !resourceUrlParam.key) {
                continue;
            }

            hasKey = true;
            if (!urlParametersObject[resourceUrlParamKey]) {
                return false;
            }
        }

        return hasKey;
    };

    this.toResourceDaoQueryObject = function (resourceName, urlParametersObject) {
        var resourceDaoQueryObject = {};
        var resourceUrlParamMap = this.RESOURCE_URL_PARAM_MAP[resourceName];

        if (!resourceUrlParamMap) {
            return;
        }

        for (var queryParam in urlParametersObject) {

            if (!resourceUrlParamMap[queryParam]) {
                continue;
            }

            var attributeSelector = resourceUrlParamMap[queryParam].attribute;
            var resourceAttributeUrlParameterValueType = resourceUrlParamMap[queryParam].type;

            if (attributeSelector) {
                var queryValue = helpers.castToParamValue(urlParametersObject[queryParam], resourceAttributeUrlParameterValueType, this.urlParameterDateFormat);
                resourceDaoQueryObject[attributeSelector] = queryValue;
            }
        }

        return resourceDaoQueryObject;
    };
};
