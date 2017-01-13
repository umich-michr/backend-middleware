var fs = require('fs');

module.exports = function(dataFilePath){
    var projectPath = require('path').dirname(__dirname);
    projectPath = (projectPath.lastIndexOf('/')===projectPath.length?projectPath:projectPath+'/');
    var dataFilePath = (dataFilePath.lastIndexOf('/')===dataFilePath.length?dataFilePath:dataFilePath+'/');
    dataFilePath = projectPath + dataFilePath;

    this.start=function(){
        global.DATABASE={};
        var fileNames = fs.readdirSync(dataFilePath);

        fileNames.forEach(function(fileName){
            var qualifiedDataFileName = dataFilePath + fileName;
            var resourceName = fileName.replace('.json','');

            global.DATABASE[resourceName] = require(qualifiedDataFileName);
        });
    };

};