const uniloc = require('../src/uniloc');
var assert = require('chai').assert;

function expectIsomorphic(router, path, result) {
	assert.deepEqual(router.lookup(path), result);
	assert.deepEqual(router.generate(result.name, result.options), path);
}

describe('uniloc', () => {
	it('recognizes hierarchial routes', () => {
		const router = uniloc({
			getResource: 'GET /:$resourceName',
			getResourceById: 'GET /:$resourceName/:$resourceId',
			getLookupValues: 'GET /applications/:id/lookup-values',
		});
		expectIsomorphic(router, '/abc', {
			name: 'getResource',
			options: {
				$resourceName: 'abc',
			},
		});
		expectIsomorphic(router, '/app/1', {
			name: 'getResourceById',
			options: {
				$resourceName: 'app',
				$resourceId: '1',
			},
		});
		expectIsomorphic(router, '/applications/1/lookup-values', {
			name: 'getLookupValues',
			options: {
				id: '1',
			},
		});
	});

	it('returns lists for repeated parameters', () => {
		const router = uniloc({
			appsRoute: 'GET /apps',
			anAppRoute: 'GET /apps/:id',
		});
		expectIsomorphic(router, '/apps?a=1&a=2', {
			name: 'appsRoute',
			options: {
				a: ['1', '2'],
			},
		});
		expectIsomorphic(router, '/apps/1?a=1&a=2', {
			name: 'anAppRoute',
			options: {
				id: '1',
				a: ['1', '2'],
			},
		});
	});

	it('only allows uni-valued path variables', () => {
		const router = uniloc({
			anAppRoute: 'GET /apps/:id',
		});

		assert.deepEqual(router.lookup('/apps/1?id=2&id=3'), {
			name: 'anAppRoute',
			options: {
				id: '1',
			},
		});
		assert.strictEqual(router.generate('anAppRoute', {id: '1'}), '/apps/1');
	});

	it('returns undefined name on unrecognized routes', () => {
		const router = uniloc({
			getResource: 'GET /app',
		});
		assert.strictEqual(router.lookup('/abc'), null);
	});

	it('works in a complex case', () => {
		const router = uniloc({
			"getResource": "GET /:$resourceName",
			"getResourceById": "GET /:$resourceName/:$resourceId",
			"postResource": "POST /:$resourceName",
			'long': 'GET /a/b/c/:id/d',
			"short": "GET /a/b/:$resourceName",
			"other": "GET /z/:$resourceName"
		});

		expectIsomorphic(router, '/a/b/c/1/d', {
			name: 'long',
			options: {
				id: '1'
			}
		});

		expectIsomorphic(router, '/a/b/c?x=y', {
			name: 'short',
			options: {
				$resourceName: 'c',
				x: 'y'
			}
		});
	});
});
