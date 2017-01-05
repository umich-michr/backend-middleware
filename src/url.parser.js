var helperFunctions = require('./helper');

function UrlParser(queryStringParamObjectAttributeMap, paramValueDateFormat) {

    this.paramValueDateFormat = paramValueDateFormat||helperFunctions.defaultDateFormat;

    this.queryStringToDaoParameter = function(resourceName,queryString) {
        var queryStringKeyValues = this.extractQueryStringParameters(queryString);

        var queryParamObject = {};

        for(var queryStringKeyValuesIndex=0; queryStringKeyValuesIndex<queryStringKeyValues.length;queryStringKeyValuesIndex++) {
            var keyValuePair = queryStringKeyValues[queryStringKeyValuesIndex];

            var objectKey = parseQueryParamName(resourceName, keyValuePair[0]);
            var objectValue = keyValuePair[1];

            updateQueryParamObjectValue(queryParamObject,objectKey,objectValue);
        }

        return queryParamObject;

    };

    var parseQueryParamName = function(resourceName, paramName){
        var key = queryStringParamObjectAttributeMap[resourceName][paramName];
        return key?key:paramName;
    };

    var updateQueryParamObjectValue = function(queryParamObject, key, value){
        var existingObjectKeyValue = queryParamObject[key];
        if(existingObjectKeyValue) {
            if(helperFunctions.isArray(existingObjectKeyValue)) {
                existingObjectKeyValue.push(value);
            }
            else {
                queryParamObject[key] = [existingObjectKeyValue, value];
            }
        }
        else {
            queryParamObject[key] = value;
        }
    };

    /*this.extractResourceName = function(url, httpMethod){
        var httpMethod = httpMethod||requestType.GET;
        var urlComponents = url.split(/[\/\?]/).filter(Boolean);

        var handlerUrlTemplateNames = httpMethodHandlerMap[httpMethod];

        for(var templateNamesIndex=0; templateNamesIndex<handlerUrlTemplateNames.length; templateNamesIndex++) {

        }
    };*/

    this.extractQueryStringParameters = function(queryString) {
        var keyValuePairStrings = queryString.split('&');
        var keyValuePairs = [];

        for(var keyValuePairIndex=0; keyValuePairIndex<keyValuePairStrings.length; keyValuePairIndex++){
            var keyValuePair = keyValuePairStrings[keyValuePairIndex].split('=');
            keyValuePair[1] = helperFunctions.castToParamValue(keyValuePair[1], this.paramValueDateFormat);
            keyValuePairs.push(keyValuePair);
        }

        return keyValuePairs;
    };
}

module.exports = UrlParser;

