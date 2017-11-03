var helpers = require('../utils/helpers');
var _ = require('underscore');

const RESOURCEID_URL_PARAM_NAME = '$resourceId';

function ParameterMapper() {
	this.RESOURCE_URL_PARAM_MAP = {};
	this.URL_PARAMETER_DATE_FORMAT = helpers.defaultDateFormat;
}

ParameterMapper.prototype.isQueryById = function (resourceName, urlParametersObject) {
	var resourceUrlParamMap = this.RESOURCE_URL_PARAM_MAP[resourceName];
	if (resourceUrlParamMap && urlParametersObject[RESOURCEID_URL_PARAM_NAME]) {
		return true;
	} else {
		return false;
	}
};

ParameterMapper.prototype.extractKeyParameterMap = function (resourceName) {
	var resourceUrlParamMap = this.RESOURCE_URL_PARAM_MAP[resourceName];
	if (!resourceUrlParamMap) {
		throw 'No url parameter mapping was found for the resource ' + resourceName;
	}
	var keyAttributes = _.pick(resourceUrlParamMap, function (value, key, object) {
		return value.key
	});
	var keyAttributesObjectKeys = Object.keys(keyAttributes);

	if (keyAttributesObjectKeys.length > 1) {
		throw 'When url is used to query for resource we do not support composite keys for resources.';
	}
	else if (keyAttributesObjectKeys.length === 0) {
		throw 'When url parameter is used to query for resource using id the url object mapping file should have specified a resource attribute to be key by setting mapping attribute key to true';
	}
	else {
		return keyAttributes[keyAttributesObjectKeys[0]];
	}
};

ParameterMapper.prototype.toResourceDaoQueryObject = function (resourceName, urlParametersObject) {
	var resourceDaoQueryObject = {};
	var resourceUrlParamMap = this.RESOURCE_URL_PARAM_MAP[resourceName];

	if (!resourceUrlParamMap) {
		return;
	}

	for (var queryParam in urlParametersObject) {

		var mappedResourceAttributeMap = undefined;
		if (queryParam === RESOURCEID_URL_PARAM_NAME) {
			mappedResourceAttributeMap = this.extractKeyParameterMap(resourceName);
		}
		mappedResourceAttributeMap = !mappedResourceAttributeMap ? resourceUrlParamMap[queryParam] : mappedResourceAttributeMap;

		if (!mappedResourceAttributeMap) {
			continue;
		}

		var attributeSelector = mappedResourceAttributeMap.attribute;
		var resourceAttributeUrlParameterValueType = mappedResourceAttributeMap.type;

		if (attributeSelector) {
			var queryValue = helpers.castToParamValue(urlParametersObject[queryParam], resourceAttributeUrlParameterValueType, this.URL_PARAMETER_DATE_FORMAT);
			resourceDaoQueryObject[attributeSelector] = queryValue;
		}
	}

	return resourceDaoQueryObject;
};

ParameterMapper.prototype.loadDirectory = function (dir, extension) {
	_.assign(this.RESOURCE_URL_PARAM_MAP, helpers.readFilesToMap(dir, extension || '.url.param.map.json'));
};

module.exports = function (urlParameterDateFormat, urlParamMapFilePath, urlParamFileExtension) {
	const parameterMapper = new ParameterMapper();
	if (urlParamMapFilePath)
		parameterMapper.loadDirectory(urlParamMapFilePath, urlParamFileExtension);
	if (urlParameterDateFormat)
		parameterMapper.URL_PARAMETER_DATE_FORMAT = urlParameterDateFormat;
	return parameterMapper;
};
