var rewire = require('rewire'),
    should = require('should'),
    sinon = require('sinon'),
    MemoryCache = rewire('../../../../server/adapters/cache/memory'),
    cache,

    // ID for testing keys
    blog_id = 123456;

should.equal(true, true);

describe('UNIT: MemoryCache', function () {
    it('constructor', function () {
        let cache = new MemoryCache();
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

    it('init should call clean', function () {
        let cache = new MemoryCache();
        cache.reset = sinon.spy();

        cache.init();
        should.not.exist(cache.opts.prefix);
        should.equal(cache.prefix, 'GHOST-');
        cache.reset.calledOnce.should.be.true();
    });

    describe('set and get operations', function () {
        let cachePrefix = 'tests';
        let memoryCache = new MemoryCache({prefix: cachePrefix});
        memoryCache.init();

        let testkey1 = 'test12345';
        let testval1 = {
            a: 1,
            b: false,
            c: 'Test',
            d: {
                e: 42
            }
        };

        it('should save data with a given key', function () {
            memoryCache.set(testkey1, testval1);
            should.exist(memoryCache.cache.get(testkey1));
            (memoryCache.cache.get(
                testkey1).value).should.eql(testval1);
            should.not.exist(memoryCache.cache.get(
                testkey1).expire);
        });

        it('should return data by key', function () {
            return memoryCache.get(testkey1).then(function (result) {
                should.exist(result);
                (result).should.eql(testval1);
            });
        });

        it('should return null if the key does not exist', function () {
            return memoryCache.get('123123123').then(function (result) {
                should.equal(result, null);
            });
        });
    });

    describe('delete operation', function () {
        let cachePrefix = 'tests';
        let memoryCache = new MemoryCache({prefix: cachePrefix});
        memoryCache.init();

        let testkey1 = 'test12345';
        let testval1 = {
            a: 1,
            b: false,
            c: 'Test',
            d: {
                e: 42
            }
        };

        it('should save data with a given key', function () {
            memoryCache.set(testkey1, testval1);
        });

        it('should delete data by key', function () {
            should.exist(memoryCache.cache.get(testkey1));
            memoryCache.del(testkey1);
            should.not.exist(memoryCache.cache.get(
                testkey1));
        });

        it('should return null for the deleted key', function () {
            return memoryCache.get(testkey1).then(function (result) {
                should.equal(result, null);
            });
        });

        it('delete multiple keys', function () {
            memoryCache.set('key1', 'value1');
            memoryCache.set('key2', 'value2');
            memoryCache.set('key3', 'value3');

            memoryCache.del(['key1', 'key3']);

            should.not.exist(memoryCache.cache.get('key1'));
            (memoryCache.cache.get('key2')).should.eql(
                {value: 'value2', expire: null});
            should.not.exist(memoryCache.cache.get('key3'));
        });
    });

    describe('cache reset operations', function () {
        let memoryCache = new MemoryCache({prefix: 'tests'});
        memoryCache.init();

        let testkey1 = 'test12345';
        let testval1 = {
            a: 1,
            b: false,
            c: 'Test',
            d: {
                e: 42
            }
        };

        let testkey2 = 'key2';
        let testval2 = 'value2';

        it('should save data with a given key', function () {
            memoryCache.set(testkey1, testval1);
            memoryCache.set(testkey2, testval2);
        });

        it('should give data by key', function () {
            should.exist(memoryCache.cache.get(testkey1));
            should.exist(memoryCache.cache.get(testkey2));
        });

        it('should reset test* keys', function () {
            memoryCache.reset('test*');
        });

        it('should return null for the deleted testkey1', function () {
            return memoryCache.get(testkey1).then(function (result) {
                should.equal(result, null);
            });
        });

        it('should return data for remaining testkey2', function () {
            return memoryCache.get(testkey2).then(function (result) {
                (result).should.eql(testval2);
            });
        });

        it('should reset all keys', function () {
            memoryCache.reset();
            memoryCache.cache.should.have.size(0);
        });

        it('should now return null for testkey2', function () {
            return memoryCache.get(testkey2).then(function (result) {
                should.equal(result, null);
            });
        });

        it('should clean by multiple patterns', function () {
            memoryCache.set('key.1', 'value1');
            memoryCache.set('key.2', 'value2');
            memoryCache.set('key.3', 'value3');

            memoryCache.set('other.1', 'value1');
            memoryCache.set('other.2', 'value2');
            memoryCache.set('other.3', 'value3');

            memoryCache.reset(['key.*', '*.2']);

            should.not.exist(memoryCache.cache.get('key.1'));
            should.not.exist(memoryCache.cache.get('key.2'));
            should.not.exist(memoryCache.cache.get('key.3'));
            should.exist(memoryCache.cache.get('other.1'));
            should(memoryCache.cache.get('other.2')).be.undefined();
            should.exist(memoryCache.cache.get('other.3'));
        });
    });

    describe('cache expiry operations', function () {
        let cachePrefix = 'tests';
        let memoryCache = new MemoryCache({
            prefix: cachePrefix,
            ttl: 60
        });
        memoryCache.init();

        let testkey1 = 'test12345';
        let testval1 = {
            a: 1,
            b: false,
            c: 'Test',
            d: {
                e: 42
            }
        };

        let testkey2 = 'key2';
        let testval2 = 'value2';

        it('should save data with a given key', function () {
            memoryCache.set(testkey1, testval1);
            memoryCache.set(testkey2, testval2);
        });

        it('should set expire greater than now', function () {
            should.exist((memoryCache.cache.get(testkey1).expire));
            (memoryCache.cache.get(testkey1).expire).should.be.above(Date.now());
        });

        it('should return null for expired testkey1', function () {
            memoryCache.cache.get(testkey1).expire = Date.now() - 10 * 1000;
            memoryCache.checkTTL();
            return memoryCache.get(testkey1).then(function (result) {
                should(result).be.null();
            });
        });

        it('should return data for non-expired testkey2', function () {
            return memoryCache.get(testkey2).then(function (result) {
                should(result).eql(testval2);
            });
        });
    });

    describe('multiple memory caches', function () {
        let test1CachePrefix = 'test1';
        let test1MemoryCache = new MemoryCache({
            prefix: test1CachePrefix
        });
        test1MemoryCache.init();

        let test2CachePrefix = 'test2';
        let test2MemoryCache = new MemoryCache({
            prefix: test2CachePrefix
        });
        test2MemoryCache.init();

        let testkey1 = 'test12345';
        let testval1 = {
            a: 1,
            b: false,
            c: 'Test',
            d: {
                e: 42
            }
        };

        let testkey2 = 'key2';
        let testval2 = 'value2';

        it('should save data with a given key', function () {
            test1MemoryCache.set(testkey1, testval1);
            test2MemoryCache.set(testkey2, testval2);
        });

        it('should return data for key in cache', function () {
            return test2MemoryCache.get(testkey2).then(function (result) {
                should(result).eql(testval2);
                return test1MemoryCache.get(testkey1).then(function (result) {
                    should(result).eql(testval1);
                });
            });
        });

        it('should return null for key not in cache', function () {
            return test2MemoryCache.get(testkey1).then(function (result) {
                should(result).be.null();
                return test1MemoryCache.get(testkey2).then(function (result) {
                    should(result).be.null();
                });
            });
        });
    });
});
