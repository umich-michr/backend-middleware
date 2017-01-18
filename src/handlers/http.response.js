module.exports = function (httpStatusCode, httpHeadersMap, body, resourceName) {
    this.statusCode = httpStatusCode;
    this.headers = httpHeadersMap;
    this.body = body;
    this.resourceName = resourceName;
};