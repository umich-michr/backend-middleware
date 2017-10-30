const RouteRecognizer = require('route-recognizer');
const _ = require('lodash');

function transformQueryParts(url, transform) {
	const i = url.indexOf('?');
	if (i === -1) return url;
	const query = url.substring(i + 1);
	return url.substring(0, i) + '?' + transform(query.split('&')).join('&');
}

// abc?x=2&x=2    ==>   abc?x[]=2&x[]=2
function toBraces(url) {
	return transformQueryParts(url, parts => {
		const keyCount = {};
		parts.forEach(part => {
			const [key, value] = part.split('=');
			keyCount[key] = (keyCount[key] || 0) + 1;
		});
		return parts.map(part => {
			const [key, value] = part.split('=');
			if (keyCount[key] > 1)
				return `${key}[]=${value}`;
			return part;
		});
	});
}

// abc?x[]=2&x[]=2   ===>   abc?x=2&x=2
function fromBraces(url) {
	return transformQueryParts(url, parts => {
		return  parts.map(part => {
			let [key, value] = part.split('=');
			if (key.endsWith('[]'))
				key = key.substring(0, key.length - 2);
			return `${key}=${value}`;
		});
	});
}

function makeRouter(routes) {
	// GET ==> a router for gets
	const methodToRouter = {};
	// studiesRoute ==> the router holding the route named "studiesRoute"
	const routeToRouter = {};// ie, route name to router

	routes = _.toPairs(routes);
	var i;

	for (i = 0; i < routes.length; i++) {
		const routeName = routes[i][0];
		const [method, url] = routes[i][1].split(' ');
		if (!methodToRouter[method]) methodToRouter[method] = [];
		methodToRouter[method].push([{path: url, handler: routeName}]);
	}
	const methods = _.keys(methodToRouter);
	for (i = 0; i < methods.length; i++) {
		var method = methods[i];
		const router = new RouteRecognizer();
		methodToRouter[method].forEach(function (route) {
			var routeName = route[0].handler;// the "handler" is the route name
			router.add(route, {as: routeName});
			routeToRouter[routeName] = router;
		});
		methodToRouter[method] = router;
	}

	function lookup(url, method) {
		method = method || 'GET';
		const router = methodToRouter[method];
		if (!router) {
			throw new Error('No route for HTTP method ' + method);
		}
		const results = router.recognize(toBraces(url));
		if (!results) {
			return null;
		}
		const options = _.assign({}, results.queryParams, results[0].params);
		return {
			name: results[0].handler,
			options: options,
		};
	}

	function generate(name, options) {
		const router = routeToRouter[name];
		if (!router) throw new Error('Unknown route name ' + name);
		const url = router.generate(name, options);
		var params = router.recognize(url)[0].params;
		const queryParams = _.pickBy(options, function (value, key) {
			return !params.hasOwnProperty(key);
		});
		params = _.pickBy(options, function (value, key) {
			return params.hasOwnProperty(key);
		});
		params.queryParams = queryParams;
		return fromBraces(router.generate(name, params));
	}

	return {
		lookup: lookup,
		generate: generate,
	}
}

module.exports = makeRouter;
