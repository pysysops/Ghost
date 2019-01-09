var debug = require('ghost-ignition').debug('cache:MemoryCache'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    utils = require('./utils'),
    BaseCache = require('./base');

/**
 * Cache factory for in-memory cache
 *
 * @class MemoryCache
 */
class MemoryCache extends BaseCache {
    /**
    * Creates an instance of MemoryCache
    *
    * @param {object} opts
    *
    * @memberof MemoryCache
    */
    constructor(opts) {
        super(opts);

        // Create an empty cache map
        this.cache = new Map();

        this.timer = setInterval(() => {
            /* istanbul ignore next */
            this.checkTTL();
        }, 30 * 1000);

        this.timer.unref();
    }

    /**
     * Initialize MemoryCache
     */
    init(backend) {
        super.init(backend);
        return this.reset();
    }

    get(key, options) {
        debug('GET', key);

        if (this.cache.has(key)) {
            debug('FOUND', key);

            let item = this.cache.get(key);

            if (this.opts.ttl) {
                // update TTL expiry time
                item.expire = Date.now() + this.opts.ttl * 1000;
            }
            return Promise.resolve(
                (options && options.resolve === false) ? item.value : this.resolveValue(item.value));
        }
        return Promise.resolve(null);
    }

    getAll() {
        // strip prefix from all keys
        let cleanCache = _.cloneDeep(this.cache);

        cleanCache.forEach((object, key) => {
            if (key.startsWith(this.prefix)) {
                cleanCache.set(key.replace(this.prefix,''), object);
                cleanCache.delete(key);
            }
        });
        return Promise.resolve(cleanCache);
    }

    set(key, value, ttl) {
        if (!ttl) {
            ttl = this.opts.ttl;
        }

        this.cache.set(key, {
            value: _.cloneDeep(value),
            expire: ttl ? Date.now() + ttl * 1000 : null
        });

        debug('SET', key);
        return Promise.resolve(value);
    }

    del(keys) {
        keys = Array.isArray(keys) ? keys : [keys];

        keys.forEach((key) => {
            this.cache.delete(key);
            debug('DEL', key);
        });
        return Promise.resolve();
    }

    reset(match = '**') {
        var matches = Array.isArray(match) ?
            match.map(m => m) : [match];

        debug('RESET', matches.join(', '));

        this.cache.forEach((value, key) => {
            if (matches.some(match => utils.match(key, match))) {
                debug('REMOVE', key);
                this.cache.delete(key);
            }
        });

        return Promise.resolve();
    }

    checkTTL() {
        let now = Date.now();
        this.cache.forEach((value, key) => {
            let item = this.cache.get(key);

            if (item.expire && item.expire < now) {
                debug('EXPIRED', key);
                this.cache.delete(key);
            }
        });
    }
}

module.exports = MemoryCache;
