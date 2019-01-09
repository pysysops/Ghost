var _ = require('lodash');

var Caches = {
    Base: require('./base'),
    Memory: require('./memory'),
    Redis: require('./redis')
};

function getByName(name) {
    if (!name) {
        return null;
    }

    let n = Object.keys(Caches).find(n => n.toLowerCase() === name.toLowerCase());
    if (n) {
        return Caches[n];
    }
}

function resolve(opt) {
    if (opt instanceof Caches.Base) {
        return opt;
    } else if (opt === true) {
        return new Caches.Memory();
    } else if (_.isString(opt)) {
        let CacheClass = getByName(opt);
        if (CacheClass) {
            return new CacheClass();
        }

        if (opt.startsWith('redis://')) {
            CacheClass = Caches.Redis;
        }

        if (CacheClass) {
            return new CacheClass(opt);
        } else {
            throw new Error('Invalid cache type', opt);
        }
    }
    return null;
}

module.exports = Object.assign({resolve}, Caches);
