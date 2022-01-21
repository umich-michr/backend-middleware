const _ = require('underscore');
const helpers = require('../utils/helpers');

function findResourceName({name, options}) {
	if (name.indexOf(' ') !== -1) {
		return name.split(' ')[0];
	} else {
		return options.$resourceName;
	}
}

function HandlerPayload(request, handlerLookup, parameterMapper) {
	this.request = request;
	this.urlParameters = handlerLookup.options;
	this.resourceName = findResourceName(handlerLookup);
	this.parameterMapper = parameterMapper;
	this.attrMap = parameterMapper.RESOURCE_URL_PARAM_MAP[this.resourceName] || {};
	this.URL_PARAMETER_DATE_FORMAT = parameterMapper.URL_PARAMETER_DATE_FORMAT;
	this.getQueryObjFromParams = (params) => parameterMapper.toResourceDaoQueryObject(this.resourceName, params);
}

HandlerPayload.prototype = Object.create(helpers, {
	getParamOrDefault: {
		value(param) {
			const value = this.urlParameters[param] || this.getParameterInfo(param).defaultValue;
			return value && this.parseValue(param, value);
		},
	},

	getAttribute: {
		value(param) {
			return this.getParameterInfo(param).attribute;
		},
	},

	getParameterInfo: {
		value(param) {
			return this.attrMap[param] || {attribute: param};
		},
	},

	getKeyParameterInfo: {
		value() {
			return _.values(this.attrMap).find(paramInfo => paramInfo.key);
		}
	},

	parseValue: {
		value(attr, value) {
			const attrSpec = _.find(this.attrMap, o => o.attribute === attr);
			if (attrSpec && attrSpec.type) {
				return this.castToParamValue(value, attrSpec.type, this.URL_PARAMETER_DATE_FORMAT);
			}
			return value;
		},
	},

	setValue: {
		value(attr, obj, value) {
			value = this.parseValue(attr, value);
			helpers.setValue(attr, obj, value);
		},
	},
});

module.exports = HandlerPayload;
