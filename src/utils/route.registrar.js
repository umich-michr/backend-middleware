function push(l, x) {
	if (!x) return;
	if (Array.isArray(x)) {
		l.push(...x);
	} else {
		l.push(x);
	}
}

function getRouteUrls(route) {
	const urls = [];
	push(urls, route.url);
	push(urls, route.urls);
	return urls;
}

function getRouteNames(route) {
	let name = '';
	if (route.resource) {
		name = route.resource + ' ' + name;
	}

	const urls = getRouteUrls(route);
	if (urls.length > 1) {
		return urls.map(url => name + url.replace(/ /g, ''));
	} else if (!route.name) {
		name = name + urls[0].replace(/ /g, '');
	} else {
		name = name + route.name;
	}

	return [name];
}

function getRouteHandler(route) {
	return route.handler;
}

function RouteRegistrar(routes) {
	this.routes = {};
	this.handlers = {};
	routes.forEach(route => {
		const urls = getRouteUrls(route);
		const routeNames = getRouteNames(route);
		const routeHandler = getRouteHandler(route);
		for (let i = 0; i < urls.length; i++) {
			const routeName = routeNames[i];
			this.routes[routeName] = urls[i];
			this.handlers[routeName] = routeHandler;
		}
	});
}

module.exports = RouteRegistrar;
