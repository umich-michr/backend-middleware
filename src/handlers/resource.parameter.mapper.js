
	var helpers = require('../helper');

	module.exports=function(urlParamMapFilePath, urlParamFileExtension){
    	//console.log(urlParamMapFilePath+':'+urlParamFileExtension||'.url.param.map.json')
		this.RESOURCE_URL_PARAM_MAP=helpers.readFilesToMap(urlParamMapFilePath,urlParamFileExtension||'.url.param.map.json');
	
	    this.toResourceDaoQueryObject = function(urlParametersObject){

	    };
		/* {
	         "resourceName":"service-provided",
	         "page":"1",
	         "page-size":"20",
	         "startDate":["2017-01-13T00.00.00.000","2017-01-26T23.59.59.999"],
	         "programId"="100"
	     }

	     {
	         "startDate":[longDateRangeStart, longDateRangeEnd],
	         "program":{"id":100}
	     }*/
	};

