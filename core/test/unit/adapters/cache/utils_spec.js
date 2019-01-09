var should = require('should'),
    utils = require('../../../../server/adapters/cache/utils');

describe('Test match', function () {
    (utils.match('1.2.3', '1.2.3')).should.be.true();
    (utils.match('a.b.c.d', 'a.b.c.d')).should.be.true();
    (utils.match('aa.bb.cc', 'aa.bb.cc')).should.be.true();

    (utils.match('a1c', 'a?c')).should.be.true();
    (utils.match('a2c', 'a?c')).should.be.true();
    (utils.match('a3c', 'a?c')).should.be.true();
    (utils.match('ac', 'a?c')).should.be.false();

    (utils.match('aa.1b.c', 'aa.?b.*')).should.be.true();
    (utils.match('aa.2b.cc', 'aa.?b.*')).should.be.true();
    (utils.match('aa.3b.ccc', 'aa.?b.*')).should.be.true();
    (utils.match('aa.4b.cccc', 'aa.?b.*')).should.be.true();
    (utils.match('aa.5b.ccccc', 'aa.?b.*')).should.be.true();
    (utils.match('aa.5b.ccccc.d', 'aa.?b.*')).should.be.false();

    (utils.match('aa.bb.cc', 'aa.bb.*')).should.be.true();
    (utils.match('aa.bb.cc', '*.bb.*')).should.be.true();
    (utils.match('bb.cc', 'bb.*')).should.be.true();
    (utils.match('dd', '*')).should.be.true();

    (utils.match('abcd', '*d')).should.be.true();
    (utils.match('abcd', '*d*')).should.be.true();
    (utils.match('abcd', '*a*')).should.be.true();
    (utils.match('abcd', 'a*')).should.be.true();

    // --- DOUBLE STARS CASES ---

    (utils.match('aa.bb.cc', 'aa.*')).should.be.false();
    (utils.match('aa.bb.cc', 'a*')).should.be.false();
    (utils.match('bb.cc', '*')).should.be.false();

    (utils.match('aa.bb.cc.dd', '*.bb.*')).should.be.false();
    (utils.match('aa.bb.cc.dd', '*.cc.*')).should.be.false();

    (utils.match('aa.bb.cc.dd', '*bb*')).should.be.false();
    (utils.match('aa.bb.cc.dd', '*cc*')).should.be.false();

    (utils.match('aa.bb.cc.dd', '*b*')).should.be.false();
    (utils.match('aa.bb.cc.dd', '*c*')).should.be.false();

    (utils.match('aa.bb.cc.dd', '**.bb.**')).should.be.true();
    (utils.match('aa.bb.cc.dd', '**.cc.**')).should.be.true();

    (utils.match('aa.bb.cc.dd', '**aa**')).should.be.true();
    (utils.match('aa.bb.cc.dd', '**bb**')).should.be.true();
    (utils.match('aa.bb.cc.dd', '**cc**')).should.be.true();
    (utils.match('aa.bb.cc.dd', '**dd**')).should.be.true();

    (utils.match('aa.bb.cc.dd', '**b**')).should.be.true();
    (utils.match('aa.bb.cc.dd', '**c**')).should.be.true();

    (utils.match('aa.bb.cc', 'aa.**')).should.be.true();
    (utils.match('aa.bb.cc', '**.cc')).should.be.true();

    (utils.match('bb.cc', '**')).should.be.true();
    (utils.match('b', '**')).should.be.true();

    (utils.match('$node.connected', '$node.*')).should.be.true();
    (utils.match('$node.connected', '$node.**')).should.be.true();
    (utils.match('$aa.bb.cc', '$aa.*.cc')).should.be.true();

    // ---
    (utils.match('$aa.bb.cc', '$aa.*.cc')).should.be.true();
    (utils.match('$aa.bb.cc', '$aa.**')).should.be.true();
    (utils.match('$aa.bb.cc', '$aa.**.cc')).should.be.true();
    (utils.match('$aa.bb.cc', '$aa.??.cc')).should.be.true();
    (utils.match('$aa.bb.cc', '?aa.bb.cc')).should.be.true();
    (utils.match('$aa.bb.cc', 'aa.bb.cc')).should.be.false();
    (utils.match('$aa.bb.cc', '**.bb.cc')).should.be.true();
    (utils.match('$aa.bb.cc', '**.cc')).should.be.true();
    (utils.match('$aa.bb.cc', '**')).should.be.true();
    (utils.match('$aa.bb.cc', '*')).should.be.false();
});
