var events = require( 'events' ),
  util = require( 'util' ),
  Connection = require( './connection' ),
  pckg = require( '../package.json' )

/**
 * Connects deepstream to a elasticsearch. Users can then query ElasticSearch on the side and benefit from
 * it's powerfully querying abilities.
 *
 * Similar to other storage connectors (e.g. RethinkDB ), this connector supports saving records to multiple tables
 * ( defined in ElasticSearch as types ).
 *
 * In order to do this, specify a splitChar, e.g. '/' and use it in your record names. Naming your record
 *
 * user/i4vcg5j1-16n1qrnziuog
 *
 * for instance will create a user type and store it in it. This will allow for more sophisticated queries as
 * well as speed up read operations since there are less entries to look through.
 *
 * @param {Object} options ElasticSearch driver options. See elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html
 *
 * e.g.
 *
 * {
*   host: 'localhost:9200',
*   auth: 'user:password',
*   log: 'trace',
*   apiVersion: '2.2'
*   plugins: [],
*
*   database: 'deepstream',
*   defaultTable: 'deepstream_records',
*   splitChar: '/'
* }
*
* Please note the three additional, optional keys:
*
* database  specifies which database to use. Defaults to 'deepstream'
* defaultTable specifies which table records will be stored in that don't specify a table. Defaults to deepstream_records
* splitChar   specifies a character that separates the record's id from the table it should be stored in. defaults to null
*
* @constructor
*/
var Connector = function( options ) {
  this.isReady = false
  this.name = pckg.name
  this.version = pckg.version
  this._checkOptions( options )
  this._options = options
  this._connection = new Connection( options, this._onConnection.bind( this ) )
}

util.inherits( Connector, events.EventEmitter )

/**
 * Writes a value to the database. If the specified table doesn't exist yet, it will be created
 * before the write is excecuted. If a table creation is already in progress, create table will
 * only add the method to its array of callbacks
 *
 * @param {String}  key
 * @param {Object}  value
 * @param {Function} callback Will be called with null for successful set operations or with an error message string
 *
 * @public
 * @returns {void}
 */
Connector.prototype.set = function( key, value, callback ) {
  this._connection.set( key, value, callback )
}

/**
 * Retrieves a value from storage
 *
 * @param {String}  key
 * @param {Function} callback Will be called with null and the stored object
 * for successful operations or with an error message string
 *
 * @public
 * @returns {void}
 */
Connector.prototype.get = function( key, callback ) {
  this._connection.get( key, callback )
}

/**
 * Deletes an entry from storage.
 *
 * @param {String}  key
 * @param {Function} callback Will be called with null for
            successful deletions or with an error message string
 *
 * @public
 * @returns {void}
 */
Connector.prototype.delete = function( key, callback ) {
  this._connection.delete( key, callback )
}

/**
 * Callback for established connections
 *
 * @param {Error} error
 *
 * @private
 * @returns {void}
 */
Connector.prototype._onConnection = function( error ) {
  if( error ) {
    this.emit( 'error', error )
  } else {
    this.isReady = true
    this.emit( 'ready' )
  }
}

/**
 * Makes sure that the options object contains all mandatory
 * settings
 *
 * @param {Object} options
 *
 * @private
 * @returns {void}
 */
Connector.prototype._checkOptions = function( options ) {
  if( options.hosts === undefined && typeof options.host !== 'string' ) {
    throw new Error( 'Missing option host or hosts' )
  }
}

module.exports = Connector
