requestHandlerList={};

requestHandlerList[requestType.GET]=[
    'redirect',
    'resource',
    'resourceById',
    'resourceByQueryString'
];
requestHandlerList[requestType.POST]=[
    'resource'
];
requestHandlerList[requestType.PUT]=[
    'resourceById'
];
requestHandlerList[requestType.DELETE]=[
    'resourceById'
];

module.exports=requestHandlerList;