const _ = require('lodash');

function ComputedProperties(config) {
	this.config = config;
}

ComputedProperties.prototype.hydrateResource = function (resourceName, resource) {
	const props = this.config && this.config[resourceName];
	if (!props) return resource;
	_.assign(resource, _.mapValues(props, (func) =>
		func.call(props, resource, resourceName)));
	return resource;
};

ComputedProperties.prototype.hydrateResources = function (resourceName, resources) {
	if (!resources) return resources;
	if (_.isArray(resources)) return resources.map(resource => this.hydrateResource(resourceName, resource));
	else return this.hydrateResource(resourceName, resources);
};

ComputedProperties.prototype.getResource = function (resourceName) {
	return this.hydrateResources(resourceName, global.DATABASE[resourceName] || []);
};

module.exports = ComputedProperties;
