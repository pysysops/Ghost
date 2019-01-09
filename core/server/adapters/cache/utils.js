const RegexCache = new Map();

const utils = {
    /**
     * String matcher to handle dot-separated event/action names.
     *
     * @param {String} text
     * @param {String} pattern
     * @returns {Boolean}
     */
    match(text, pattern) {
        // Simple patterns
        if (pattern.indexOf('?') === -1) {
            // Exact match (eg. "prefix.event")
            const firstStarPosition = pattern.indexOf('*');
            if (firstStarPosition === -1) {
                return pattern === text;
            }

            // Eg. "prefix**"
            const len = pattern.length;
            if (len > 2 && pattern.endsWith('**') && firstStarPosition > len - 3) {
                pattern = pattern.substring(0, len - 2);
                return text.startsWith(pattern);
            }

            // Eg. "prefix*"
            if (len > 1 && pattern.endsWith('*') && firstStarPosition > len - 2) {
                pattern = pattern.substring(0, len - 1);
                if (text.startsWith(pattern)) {
                    return text.indexOf('.', len) === -1;
                }
                return false;
            }

            // Accept simple text, without point character (*)
            if (len === 1 && firstStarPosition === 0) {
                return text.indexOf('.') === -1;
            }

            // Accept all inputs (**)
            if (len === 2 && firstStarPosition === 0 && pattern.lastIndexOf('*') === 1) {
                return true;
            }
        }

        // Regex (eg. "prefix.ab?cd.*.foo")
        let regex = RegexCache.get(pattern);
        if (!regex) {
            if (pattern.startsWith('$')) {
                pattern = '\\' + pattern;
            }
            pattern = pattern.replace(/\?/g, '.');
            pattern = pattern.replace(/\*\*/g, '§§§');
            pattern = pattern.replace(/\*/g, '[^\\.]*');
            pattern = pattern.replace(/§§§/g, '.*');

            pattern = '^' + pattern + '$';

            // eslint-disable-next-line security/detect-non-literal-regexp
            regex = new RegExp(pattern, 'g');
            RegexCache.set(pattern, regex);
        }
        return regex.test(text);
    }
};

module.exports = utils;
