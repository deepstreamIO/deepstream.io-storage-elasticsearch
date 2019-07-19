const elasticsearch = require( "elasticsearch" );
const dataTransform = require( "./transform-data" );

/**
 * This class provides a wrapper around the elasticsearch connection.
 *
 * @param {Object}   options  { topic: <String>, pingTimeout: <Number> } + elasticsearch connect options
 * @param {Function} callback function that will be called once the connection has been established
 *
 * @constructor
 */
var Connection = function( options, callback ) {
  this._callback = callback;
  this._connection = null;

  this._pingTimeout = options.pingTimeout || 1000;
  this._index = options.index || "deepstream";
  this._defaultType = options.defaultType || "deepstream_record";
  this._splitChar = options.splitChar || null;
  this._indexSettings = options.indexSettings || "{}";
  this._indexMappings = options.indexMappings || "{}";

  this.client = new elasticsearch.Client( options );

  this._checkConnection();
  this._createIndexTemplate();
};

/**
* Wrapper around elasticsearch.index that extracts the type and id from the record id,
* gets the value from elastic search inverts structure to store the record payload
* within the record
*
* @param {String} recordId The recordName, which may contain one split char to indicate it's topic
* @param {Function} callback function that will be called once the value is retrieved
*/
Connection.prototype.get = function( recordId, callback ) {
  var value;
  var params = this._getParams( recordId );

  this.client.get( {
    index: this._index,
    type: params.type,
    id: params.id,
  }, ( error, response ) => {
    if ( error && error.displayName !== "NotFound" ) {
      callback( error );
    } else if ( response.found ) {
      value = dataTransform.transformValueFromStorage( response._source );
      callback( null, value._v, value._d);
    } else {
      callback( null, -1, null );
    }
  } );
};

/**
* Wrapper around elasticsearch.index that extracts the type and id from the record id
* inverts structure to store deepstream values within the data payload and inserts/updates
* it into elasticsearch
*
* @param {String} recordId The recordName, which may contain one split char to indicate it's topic
* @param {Object} value The record data
* @param {Function} callback function that will be called once the value is stored
*/
Connection.prototype.set = function( recordId, version, value, callback ) {
  value = dataTransform.transformValueForStorage( { _v: version, _d: value } );
  var params = this._getParams( recordId );
  this.client.index( {
    index: `${this._index}-${new Date(new Date().toUTCString()).toJSON().slice(0, 10)}`,
    type: params.type,
    id: params.id,
    body: value,
  }, ( error, response ) => {
    if ( error ) {
      callback( error );
    } else {
      callback( null );
    }
  } );
};

/**
* Wrapper around elasticsearch.delete that extracts the type and id from the record id
*
* @param {String} recordId The recordName, which may contain one split char to indicate it's topic
* @param {Function} callback function that will be called once the value is retrieved
*/
Connection.prototype.delete = function( recordId, callback ) {
  var params = this._getParams( recordId );
  this.client.delete( {
    index: this._index,
    type: params.type,
    id: params.id,
  }, ( error, response ) => {
    if ( error ) {
      callback( error );
    } else {
      callback( null );
    }
  } );
};

/**
 * Parses the provided record name and returns an object
 * containing the type and record name
 *
 * @param {String} key the name of the record
 *
 * @private
 * @returns {Object} params
 */
Connection.prototype._getParams = function( key ) {
  var parts = key.split( this._splitChar );

  if ( parts.length === 2 ) {
    return { type: parts[ 0 ], id: parts[ 1 ] };
  } else {
    return { type: this._defaultType, id: key };
  }
};

/**
 * Ping elastisearch to see if it is up and running
 *
 * @private
 * @returns {void}
 */
Connection.prototype._checkConnection = function() {
  this.client.ping( {
    requestTimeout: this._pingTimeout,
  }, ( error ) => {
    if ( error ) {
      this._callback( error );
    } else {
      this._callback();
    }
  } );
};

/**
 * Create an index template.
 * Can silently fail. The template will be updated
 * if it already exists.
 *
 * @private
 * @returns {void}
 */
Connection.prototype._createIndexTemplate = function() {
  var template = {
        aliases: JSON.parse(`{"${this._index}":{}}`),
        template: this._index + "-*",
        settings: (typeof(this._indexSettings) == "string" ? JSON.parse(this._indexSettings) : this._indexSettings),
        mappings: (typeof(this._indexMappings) == "string" ? JSON.parse(this._indexMappings) : this._indexMappings),
      };

  this.client.indices.putTemplate( {
    name: this._index,
    body: JSON.stringify(template),
  } );
};

module.exports = Connection;
