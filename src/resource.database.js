var helpers = require('./helper');

module.exports = function(dataFilePath, dataFileExtension){
    this.dataFilePath = dataFilePath;
    this.start=function(){
        global.DATABASE=helpers.readFilesToMap(this.dataFilePath,dataFileExtension||'.json');
    };
};
