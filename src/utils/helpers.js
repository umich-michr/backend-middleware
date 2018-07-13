var moment = require('moment');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

function HelperFunctions() {
    this.defaultDateFormat = 'YYYY-MM-DDThh.mm.ss.sss';

    this.castToParamValue = function (value, dataType, dateFormatForDateValues) {
        if (_.isArray(value)) {
            var resultArray = [];
            for (var i = 0; i < value.length; i++) {
                resultArray.push(this.castToParamValue(value[i], dataType, dateFormatForDateValues));
            }
            return resultArray;
        }
        switch (dataType) {
        case 'numeric':
            return Number(value);
        case 'date':
            var dateFormat = dateFormatForDateValues || this.defaultDateFormat;
            return moment(value, dateFormat);
        case 'boolean':
            var n = Number(value);
            return Number.isFinite(n) ? !!n : value.toLowerCase() === 'true';
        default:
            return value;
        }
    };

    this.isResponseHeader = function (object) {
        return object && !_.isArray(object) && _.keys(object).length > 0;
    };

    this.getFileNamesInDirectory = function (path) {
        var dataFileNames = [];
        var fileNames = fs.readdirSync(path);

        fileNames.forEach(function (fileName) {
            dataFileNames.push(path + fileName);
        });

        return dataFileNames;
    };

    this.absolutePath = function (pathRelativeToProjectRoot) {
        var normalizedRelativePath = (pathRelativeToProjectRoot || './')
            //replace more than 2 dots with 2 dots
            .replace(/\.{3,}/g, '..')
            //replace more than 1 slashes with 1 slash
            .replace(/\/{2,}/g, '/')
            //remove the "/." characters pnly if they are followed by "/" or remove the "/." at the end of the string
            .replace(/\/\.(?=\/)|\/\.$/g, '')
            //remove the preceding ".", "./" or "/" characters
            .replace(/^(\.\/|\/|\.$)/, '');
        return path.resolve(normalizedRelativePath).replace('/node_modules/backend-middleware','');
    };

    this.readFilesToMap = function (path, fileExtensionToUse) {
        var expressionToStripFileNameExtension = fileExtensionToUse ? new RegExp('^.*(?=' + fileExtensionToUse + '$)') : new RegExp();
        var absolutePath = this.absolutePath(path);

        var fileNames = fs.readdirSync(absolutePath);

        var objectMap = {};

        fileNames.forEach(function (fileName) {
            var qualifiedDataFileName = absolutePath + '/' + fileName;

            var resourceNameMatch = fileName.match(expressionToStripFileNameExtension);

            if (resourceNameMatch && resourceNameMatch[0]) {
                var resourceName = resourceNameMatch[0];
                try {
                    objectMap[resourceName] = require(qualifiedDataFileName);
                    delete require.cache[require.resolve(qualifiedDataFileName)];
                }
                catch (e) {
                    console.error('could not read file ' + qualifiedDataFileName);
                }
            }
        });

        return objectMap;
    };

    this.setValue = function (attributeSelectorString, object, value) {
        var atrributeArray = attributeSelectorString.split('.');

        var setObjValue = function (arr, obj) {
            if (arr.length === 1) {
                obj[arr[0]] = value;
                return;
            }
            var firstAttribute = arr.shift();
            var objFirstKeyValue = obj[firstAttribute];
            if (!objFirstKeyValue || (!_.isObject(objFirstKeyValue) && !_.isArray(objFirstKeyValue))) {
                obj[firstAttribute] = {};
            }
            setObjValue(arr, obj[firstAttribute]);
        };

        setObjValue(atrributeArray, object);
    };

    this.getValue = function (attributeSelectorString, object) {

        var atrributeArray = attributeSelectorString.split('.');

        var getObjValue = function (arr, obj) {
            if (arr.length === 1) {
                return obj[arr[0]];
            }
            var firstAttribute = arr.shift();

            if(_.isArray(obj[firstAttribute])){
                var arrayObject = obj[firstAttribute];
                var resultArray = [];
                for(var arrayObjectIndex in arrayObject) {
                    var arrayObjectAttributeValue = getObjValue(arr, arrayObject[arrayObjectIndex]);
                    if(arrayObjectAttributeValue) {
                        resultArray.push(arrayObjectAttributeValue);
                    }
                }

                arr.unshift(firstAttribute);
                return resultArray;
            }

            if (!obj[firstAttribute]) {
                return;
            }
            return getObjValue(arr, obj[firstAttribute]);
        };

        return getObjValue(atrributeArray, object);
    };

    this.isDate = function (object) {
        return (object instanceof moment && object.isValid());
    };

    this.sortParamValueArray = function (array) {
        if (array && array.length !== 0) {
            if (this.isDate(array[0])) {
                var compare = function (a, b) {
                    if (a.isBefore(b)) {
                        return -1;
                    }
                    if (a.isAfter(b)) {
                        return 1;
                    }
                    return 0;
                };
                array.sort(compare);
            }
            else {
                return array.sort();
            }
        }
        return array;
    };
}

module.exports = new HelperFunctions();
