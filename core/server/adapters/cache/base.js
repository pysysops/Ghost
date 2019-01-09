var _ = require('lodash'),
    Promise = require('bluebird'),
    config = require('../../config');

/**
 * Abstract BaseCache class
 *
 * @class BaseCache
 */
class BaseCache {
    /**
     * Creates and instance of BaseClass
     *
     * @param {any} opts
     *
     * @memberof BaseCache
     */
    constructor(opts) {
        this.opts = _.defaultsDeep(opts, {
            ttl: null,
            keygen: null,
            maxParamsLength: null
        });

        // We use the blog_id in config or "GHOST" to namespace
        // keys so users can host multiple blogs using 1 external cache.
        this.blog_id = config.get('blog_id') || 'GHOST';
    }

    /**
     * Init cache
     *
     * @memberof BaseCache
     */
    init() {
        // Prefixing helps us configure caches for different use cases such as
        // settings, rss, urls. The prefix is used to form the cache key.
        // Examples: GHOST-settings-object_id, techblog-settings-object_id,
        // 185738-settings-object_id. Only used for external, shared caches.
        if (this.opts.prefix) {
            this.prefix = this.blog_id + '-' + this.opts.prefix + '-';
        } else {
            this.prefix = this.blog_id + '-';
        }
    }

    /**
     * Shutdown cache / cleanup
     *
     * @memberof BaseCache
     */
    shutdown() {
        /* istanbul ignore next */
        return Promise.resolve();
    }

    /**
     * Get value from cache
     *
     * @param {string} key
     * @param {object} options
     * @return {*}
     *
     * @memberof BaseCache
     */
    get(/*key, options*/) {
        /* istanbul ignore next */
        throw new Error('Not implemented!');
    }

    /**
     * Get all values from cache
     */
    getAll(){
        /* istanbul ignore next */
        throw new Error('Not implemented!');
    }

    /**
     * Set value in cache
     */
    set(/*key, value, ttl*/) {
        /* istanbul ignore next */
        throw new Error('Not implemented!');
    }

    /**
    * Delete a value from cache by key
    *
    * @param {string|Array<string>} key
    *
    * @memberof BaseCache
    */
    del(/*key*/) {
        /* istanbul ignore next */
        throw new Error('Not implemented!');
    }

    /**
     * Reset (empty) a cache based on prefix
     *
     * @param {string} prefix
     *
     * @memberof BaseCache
     */
    reset() {
        /* istanbul ignore next */
        throw new Error('Not implemented!');
    }

    resolveValue(value) {
        try {
            // CASE: if a string contains a number e.g. "1", JSON.parse will auto convert into integer
            if (!isNaN(Number(value))) {
                return value;
            }
            return JSON.parse(value);
        } catch (err) {
            return value;
        }
    }
}

module.exports = BaseCache;
