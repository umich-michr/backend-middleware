module.exports = function (httpStatusCode, httpHeadersMap, body) {
    this.statusCode = httpStatusCode;
    this.headers = httpHeadersMap;
    this.body = body;
};
