var moment = require('moment');
function HelperFunctions(){
    this.defaultDateFormat = 'YYYY-MM-DDThh.mm.ss.sss';

    this.castToParamValue = function(value,dateFormatForDateValues){
        var dateFormat = dateFormatForDateValues||this.defaultDateFormat;
        var dateValue = moment(value, dateFormat);
        if(!isNaN(value)){
            return Number(value);
        }
        else if(dateValue.isValid()){
            return dateValue;
        }

        else{
            return value;
        }
    };

    this.isArray = Array.isArray || function(obj) {
        return toString.call(obj) === '[object Array]'
    };

    this.isObject = function(obj) {
            var type = typeof obj;
            return type === 'function' || type === 'object' && !!obj;
    };

    this.objectHasKeys = function(object)
    {
        if (!isObject(object)) {
            throw new Error('Object must be specified.');
        }

        if ('undefined' !== Object.keys) {
            // Using ECMAScript 5 feature.
            return (0 === Object.keys(object).length);
        } else {
            // Using legacy compatibility mode.
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        }
    };

    this.isResponseHeader = function(object) {
        return !isArray(obj) && objectHasKeys(obj);
    };

}

module.exports = new HelperFunctions();
