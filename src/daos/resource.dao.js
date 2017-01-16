var _ = require('underscore');

module.exports={
      get:function(resourceName,daoQueryParam){
		  if(!daoQueryParam || Object.keys(_.omit(daoQueryParam, 'resourceName')).length===0){
		  	return global.DATABASE[resourceName]; 
		  }
      }
};















