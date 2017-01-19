var helpers = require('./helper');
var moment = require('moment');

module.exports = function (resourceUrlParameterMapper, dataFilePath, dataFileExtension) {
    this.dataFilePath = dataFilePath;
    this.dataFileExtension = dataFileExtension || '.json';
    this.start = function () {
        global.DATABASE = helpers.readFilesToMap(this.dataFilePath, this.dataFileExtension);
        castDateValuesInDatabase(global.DATABASE);
    };
    var castDateValuesInDatabase = function (db) {
        var dateFormat = resourceUrlParameterMapper.URL_PARAMETER_DATE_FORMAT;

        for (var resourceName in db) {
            var resources = db[resourceName];
            var urlParamAttributeMap = resourceUrlParameterMapper.RESOURCE_URL_PARAM_MAP[resourceName];

            for (var index in resources) {
                castResourceValuesUsingParamAttributeMap(urlParamAttributeMap, resources[index], dateFormat);
            }
        }
    };

    var castResourceValuesUsingParamAttributeMap = function (urlParamAttributeMap, resource, dateFormat) {
        for (var key in urlParamAttributeMap) {
            var mapping = urlParamAttributeMap[key];

            if (mapping.type !== 'date') {
                continue;
            }

            var resourceAttributeValue = helpers.getValue(mapping.attribute, resource);
            if (resourceAttributeValue) {
                var dateValue = moment(resourceAttributeValue, dateFormat);
                helpers.setValue(mapping.attribute, resource, dateValue);
            }
        }
    };
};
