/* jshint -W079 */

var util = require('util');
var URL = require('url');
var md5 = require('MD5');
var debug = require('debug')('rets.js:session');

/**
 * @description Constructs a RETS Session instance
 * @constructor
 * @class
 * @private
 *
 * @param {(string|object)} url - A compliant URL string or URL module compatible url object
 * @param {object} options - Session credentials, user-agent, and version options
 */
function Session(url, options) {

    /**
     * Holds the original options passed by the user.
     *
     * @member {object|string}
     */
    this.options = {};

    /**
     * Holds the final configuration for the instance
     * after processing, defaults, validation, etc.
     *
     * @member {object}
     */
    this.config = {};

    /**
     * Holds default configuration values for the instance.
     *
     * @member {object}
     * @property {string} options.UA - URL module compatible url object.
     * @property {string} options.UAP - The provided user agent for authenticating.
     * @property {string} options.version - The version of RETS to speak: RETS/1.7.2
     */
    this.defaults = {
        UA: 'RETS-Connector1/2',
        UAP: '',
        version: 'RETS/1.7.2'
    };

    /**
     * If options is a string, we expect it to be the URL
     * and proceed to pass its value to config.url. If it's
     * not, extend the config object with the options.
     *
     * @todo validate that url is a valid url and throw accordingly.
     */
    if (typeof url === 'string') {
        this.url = URL.parse(url);
    } else if (typeof url === 'object') {
        this.url = url;
    }

    /**
     * Temporary mapping of options
     *
     * @member {object|string}
     *
     * @todo IMPORTANT! We have a naming problem here.
     *       Internally we call these two UA and UAP but
     *       externally we call them userAgent and
     *       userAgentPassword. We should normalize naming.
     *       Afterwards, we can remove this mapping.
     */
    if (typeof options !== 'undefined') {
        this.options = util._extend(this.defaults, {
            UA: options.userAgent,
            UAP: options.userAgentPassword
        });
    }

    /**
     * Extend defaults with processed config and re-set config to
     * hold final configuration for instance.
     */
    this.config = util._extend(this.defaults, this.options);

    /**
     * Default User Agent
     * @default
     * @member {String} UA - The User Agent for the Session
     */
    this.UA = this.config.UA;

    /**
     * Default User Agent Password
     * @default
     * @member {String} UAP - User Agent Password for the Session
     */
    this.UAP = this.config.UAP;

    /** @member {Object} */
    // this.url = this.config.url;

    /** @member {Object} */
    this.user = {
        name: null,
        pass: null
    };
    if (typeof this.url.auth === 'string' && this.url.auth.indexOf(':') > -1) {
        this.user.name = this.url.auth.split(':')[0];
        this.user.pass = this.url.auth.split(':')[1];
    }

    /** @member {String} */
    this.version = this.config.version;

    /** @member {Object} */
    this.headers = {
        'RETS-UA-Authorization': 'Digest ' + this.hash(),
        'RETS-Version': this.version,
        'User-Agent': this.UA
    };

    /** @member {Object} */
    this.capabilities = {
        Login: this.url.protocol + '//' + this.url.host + this.url.pathname
    };

    /** @member {Object} */
    this.settings = {};
}

/**
 * Calculate Digest hash for RETS-UA-Authorization headers
 * @return {string} MD5 Digest hash
 */
Session.prototype.hash = function () {
    return md5([md5([this.UA, this.UAP].join(':').trim()),'','',this.version].join(':'));
};

module.exports = Session;

