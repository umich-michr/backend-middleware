var moment = require('moment');
var _ = require('underscore');
var fs = require('fs');

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

    this.isResponseHeader = function(object) {
        return object && !_.isArray(object) && _.keys(object).length>0;
    };

    this.getFileNamesInDirectory = function(path) {
        var dataFileNames = [];
        var fileNames = fs.readdirSync(path);

        fileNames.forEach(function(fileName){
            dataFileNames.push(path + fileName);
        });

        return dataFileNames;
    };

}

module.exports = new HelperFunctions();
