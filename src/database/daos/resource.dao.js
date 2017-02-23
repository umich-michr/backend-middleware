var _ = require('underscore');
var helpers = require('../../../src/utils/helpers');

module.exports = {
    matcherPredicate: function (daoQueryParamValue, valueToCompare) {
        if (_.isArray(daoQueryParamValue) && daoQueryParamValue.length === 2) {
            daoQueryParamValue = helpers.sortParamValueArray(daoQueryParamValue);

            if (!isNaN(valueToCompare)) {
                return function () {
                    return (valueToCompare >= daoQueryParamValue[0] && valueToCompare <= daoQueryParamValue[1]);
                };
            }
            else if (helpers.isDate(daoQueryParamValue[0])) {
                return function () {
                    return  valueToCompare >= daoQueryParamValue[0].toDate().getTime() && valueToCompare<=daoQueryParamValue[1].toDate().getTime();
                };
            }
            else {
                return function () {
                    return _.contains(daoQueryParamValue, valueToCompare);
                };
            }
        }

        if (_.isArray(daoQueryParamValue) && daoQueryParamValue.length > 2) {

            if (helpers.isDate(daoQueryParamValue[0])) {
                return function () {
                    for (var daoQueryParamValueIndex in daoQueryParamValue) {
                        if (daoQueryParamValue[daoQueryParamValueIndex].toDate().getTime()===valueToCompare) {
                            return true;
                        }
                    }
                    return false;
                };
            }
            else {
                return function () {
                    return _.contains(daoQueryParamValue, valueToCompare);
                };
            }
        }

        return function () {
            if (helpers.isDate(daoQueryParamValue)) {
                return daoQueryParamValue.toDate().getTime()===valueToCompare;
            }
            return _.isEqual(daoQueryParamValue, valueToCompare);
        };
    },
    get: function (resourceName, daoQueryParam) {
        var thisModule = this;
        if (!daoQueryParam || Object.keys(_.omit(daoQueryParam, 'resourceName')).length === 0) {
            return global.DATABASE[resourceName];
        }

        var resources = global.DATABASE[resourceName];

        return _.filter(resources, function (resource) {
            var match = true;
            for (var key in daoQueryParam) {
                match = match && thisModule.matcherPredicate(daoQueryParam[key], helpers.getValue(key, resource))();
            }
            return match;
        });

    }
};
