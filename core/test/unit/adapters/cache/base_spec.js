var rewire = require('rewire'),
    should = require('should'),
    sinon = require('sinon'),
    configUtils = require('../../../utils/configUtils'),
    sandbox = sinon.sandbox.create(),
    BaseCache = rewire('../../../../server/adapters/cache/base'),
    cache,

    // ID for testing keys
    blog_id = 123456;

should.equal(true, true);

describe('UNIT: BaseCache', function () {
    afterEach(function () {
        cache = null;
        configUtils.restore();
        sandbox.restore();
    });

    it('constructor', function () {
        let cache = new BaseCache();
        should.exist(cache);
        should.exist(cache.opts);
        should.equal(cache.opts.ttl, null);
        should.equal(cache.opts.maxParamsLength, null);
        should.equal(cache.opts.keygen, null);
        should.exist(cache.init);
        should.exist(cache.shutdown);
        should.exist(cache.get);
        should.exist(cache.set);
        should.exist(cache.getAll);
        should.exist(cache.del);
        should.exist(cache.reset);
        should.exist(cache.resolveValue);
    });

    it('constructor with empty options', function () {
        let opts = {};
        let cache = new BaseCache(opts);
        should.exist(cache);
        should.exist(cache.opts);
        should.equal(cache.opts.ttl, null);
        should.equal(cache.opts.maxParamsLength, null);
        should.equal(cache.opts.keygen, null);
    });

    it('constructor with options', function () {
        let opts = {ttl: 3600, maxParamsLength: 256};
        let cache = new BaseCache(opts);
        should.exist(cache);
        should.exist(cache.opts);
        (cache.opts.ttl).should.eql(3600);
        (cache.opts.maxParamsLength).should.eql(256);
        should.equal(cache.opts.keygen, null);
    });

    it('init', function () {
        let cache = new BaseCache();
        cache.init();
        should.not.exist(cache.opts.prefix);
        (cache.prefix).should.eql('GHOST-');
    });

    it('init with blog_id', function () {
        configUtils.set({blog_id: blog_id});
        let cache = new BaseCache();
        cache.init();
        should.not.exist(cache.opts.prefix);
        (cache.prefix).should.eql(blog_id + '-');
    });

    it('init with prefix', function () {
        let cachePrefix = 'settings';
        let cache = new BaseCache({prefix: cachePrefix});
        cache.init();
        (cache.opts.prefix).should.eql(cachePrefix);
        (cache.prefix).should.eql('GHOST-' + cachePrefix + '-');
    });

    it('init with blog_id and prefix', function () {
        configUtils.set({blog_id: blog_id});
        let cachePrefix = 'settings';
        let cache = new BaseCache({prefix: cachePrefix});
        cache.init();
        (cache.opts.prefix).should.eql(cachePrefix);
        (cache.prefix).should.eql(blog_id + '-' + cachePrefix + '-');
    });

    it('resolveValue does not auto convert string into number', function () {
        let cache = new BaseCache();
        (typeof cache.resolveValue('1')).should.eql('string');
    });

    it('resolveValue does not auto convert string into number: float', function () {
        let cache = new BaseCache();
        (typeof cache.resolveValue('1.4')).should.eql('string');
    });

    it('resolveValue stringified JSON get\'s parsed', function () {
        let cache = new BaseCache();
        let value = '{"a":"1","b":"hallo","c":{"d":[]},"e":2}';
        let resolvedValue = cache.resolveValue(value);
        (typeof resolvedValue).should.eql('object');
        resolvedValue.a.should.eql('1');
        resolvedValue.b.should.eql('hallo');
        resolvedValue.c.should.eql({d: []});
        resolvedValue.e.should.eql(2);
    });
});
