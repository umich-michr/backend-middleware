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

function combineTransforms(base, extension) {
	const combined = {
		...base,
		...extension,
	};
	if (base.url && extension.url) {
		combined.url = `${base.url}${extension.url}`;
	}
	delete combined.subroutes;
	return combined;
}

function flattenRoutes(routes, flattened = [], transform = {}) {
	routes.forEach(route => {
		if ('subroutes' in route) {
			flattenRoutes(route.subroutes, flattened, combineTransforms(transform, route));
		} else {
			let urls = getRouteUrls(route);
			if (transform.url) {
				urls = urls.map(url => {
					const [method, path = ''] = url.split(' ');
					return `${method} ${transform.url}${path}`;
				});
			}
			let resource = route.resource || transform.resource;
			let name = route.name || transform.name;
			let handler = route.handler || transform.handler;
			flattened.push({
				urls,
				resource,
				name,
				handler,
			});
		}
	});
	return flattened;
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
	flattenRoutes(routes).forEach(route => {
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
