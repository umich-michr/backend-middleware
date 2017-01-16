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

    this.absolutePath = function(pathRelativeToProjectRoot){
        var projectPath = require('path').dirname(__dirname);
        projectPath = (projectPath.lastIndexOf('/')===projectPath.length?projectPath:projectPath+'/');

        var normalizedRelativePath = (pathRelativeToProjectRoot||'./')
            //replace more than 2 dots with 2 dots
            .replace(/\.{3,}/g,'..')
            //replace more than 1 slashes with 1 slash
            .replace(/\/{2,}/g,'/')
            //remove the "/." characters pnly if they are followed by "/" or remove the "/." at the end of the string
            .replace(/\/\.(?=\/)|\/\.$/g,'')
             //remove the preceding ".", "./" or "/" characters
            .replace(/^(\.\/|\/|\.$)/,'');

        return projectPath+normalizedRelativePath;
    };

    this.readFilesToMap = function (path,fileExtensionToUse){
        var expressionToStripFileNameExtension = fileExtensionToUse?new RegExp('^.*(?='+fileExtensionToUse+'$)'):new RegExp();
        var absolutePath = this.absolutePath(path);

        var fileNames = fs.readdirSync(absolutePath);

        var objectMap = {};
		
        fileNames.forEach(function(fileName){
            var qualifiedDataFileName = absolutePath +'/' + fileName;

            var resourceNameMatch = fileName.match(expressionToStripFileNameExtension);

            if(resourceNameMatch && resourceNameMatch[0]){
                var resourceName = resourceNameMatch[0];
                try{
                    objectMap[resourceName] = require(qualifiedDataFileName);
                }
                catch(e){
                }
            }
        });

        return objectMap;
    };

}

module.exports = new HelperFunctions();
