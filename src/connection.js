const elasticsearch = require( 'elasticsearch' )
const dataTransform = require( './transform-data' )

/**
 * This class provides a wrapper around the elasticsearch connection.
 *
 * @param {Object}   options  { topic: <String>, pingTimeout: <Number> } + elasticsearch connect options
 * @param {Function} callback function that will be called once the connection has been established
 *
 * @constructor
 */
var Connection = function( options, callback ) {
  this._callback = callback
  this._connection = null

  this._pingTimeout = options.pingTimeout || 1000
  this._index = options.database || 'deepstream'
  this._defaultType = options.defaultTable || 'deepstream_records'
  this._splitChar = options.splitChar || null
  this._settings = options.settings || '{}'
  this._mappings = options.mappings || '{}'

  this.client = new elasticsearch.Client( options )
  this._checkConnection()
}

/**
* Wrapper around elasticsearch.index that extracts the type and id from the record id,
* gets the value from elastic search inverts structure to store the record payload
* within the record
*
* @param {String} recordId The recordName, which may contain one split char to indicate it's topic
* @param {Function} callback function that will be called once the value is retrieved
*/
Connection.prototype.get = function( recordId, callback ) {
  var value
  var params = this._getParams( recordId )

  this.client.get( {
    index: this._index,
    type: params.type,
    id: params.id
  }, ( error, response ) => {
    if( error && response.error && response.error.type == 'index_not_found_exception' ) {
      var body = { settings: {}, mappings: {} }

      body.settings = JSON.parse(this._settings)
      body.mappings[params.type] = JSON.parse(this._mappings)

      this.client.indices.create( {
        index: this._index,
        body: JSON.stringify(body)
      } );
      callback( null, null )
    } else if( error && error.displayName !== 'NotFound' ) {
      callback( error )
    } else if( response.found ) {
      value = dataTransform.transformValueFromStorage( response._source )
      callback( null, value )
    } else {
      callback( null, null )
    }
  } )
}

/**
* Wrapper around elasticsearch.index that extracts the type and id from the record id
* inverts structure to store deepstream values within the data payload and inserts/updates
* it into elasticsearch
*
* @param {String} recordId The recordName, which may contain one split char to indicate it's topic
* @param {Object} value The record data
* @param {Function} callback function that will be called once the value is stored
*/
Connection.prototype.set = function( recordId, value, callback ) {
  value = dataTransform.transformValueForStorage( value )
  var params = this._getParams( recordId )
  this.client.index( {
    index: this._index,
    type: params.type,
    id: params.id,
    body: value
  }, ( error, response ) => {
    if( error ) {
      callback( error )
    } else {
      callback( null )
    }
  } )
}

/**
* Wrapper around elasticsearch.delete that extracts the type and id from the record id
*
* @param {String} recordId The recordName, which may contain one split char to indicate it's topic
* @param {Function} callback function that will be called once the value is retrieved
*/
Connection.prototype.delete = function( recordId, callback ) {
  var params = this._getParams( recordId )
  this.client.delete( {
    index: this._index,
    type: params.type,
    id: params.id
  }, ( error, response ) => {
    if( error ) {
      callback( error )
    } else {
      callback( null )
    }
  } )
}

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
  var parts = key.split( this._splitChar )

  if( parts.length === 2 ) {
    return { type: parts[ 0 ], id: parts[ 1 ] }
  } else {
    return { type: this._defaultType, id: key }
  }
}

/**
 * Ping elastisearch to see if it is up and running
 *
 * @private
 * @returns {void}
 */
Connection.prototype._checkConnection = function() {
  this.client.ping( {
    requestTimeout: this._pingTimeout
  }, ( error ) => {
    if ( error ) {
      this._callback( error )
    } else {
      this._callback()
    }
  } )
}

module.exports = Connection
