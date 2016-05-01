/* global describe, expect, it, jasmine */
var StorageConnector = require( '../src/connector' ),
	EventEmitter = require( 'events' ).EventEmitter,
	settings = { host: 'search-test-yeplhfhxvim2hg47siucsdj3gm.eu-central-1.es.amazonaws.com', splitChar: '/' },
	clientSettings = { host: 'search-test-yeplhfhxvim2hg47siucsdj3gm.eu-central-1.es.amazonaws.com' },
	elasticsearch = require( 'elasticsearch' );

describe( 'the message connector has the correct structure', function() {
	var storageConnector;
	var elasticsearchClient;

	beforeAll( function( done ) {
		elasticsearchClient = new elasticsearch.Client( clientSettings );
		elasticsearchClient.ping( {
			requestTimeout: '400'
		}, done );
	} );

	beforeAll( function( done ) {
		storageConnector = new StorageConnector( settings );
		storageConnector.on( 'ready', done );
	} );

	describe( 'sets a value', function() {

		it( 'sets a value', function( done ) {
			storageConnector.set( 'aType/someValue', { _v: 10, _d: { firstname: 'Bob' } }, function( error ) {
				expect( error ).toBe( null );
				done();
			} );
		} );

		it( 'set the value within elasticsearch', function( done ) {
			elasticsearchClient.get( {
				index: 'deepstream',
				type: 'aType',
				id: 'someValue'
			}, function( error, response ) {
				expect( response._source ).toEqual( { __ds: { _v: 10 }, firstname: 'Bob' } );
				done();
			} );
		} );

	} );

	it( 'retrieves the existing value', function( done ) {
		storageConnector.get( 'aType/someValue', function( error, value ) {
			expect( error ).toBe( null );
			expect( value ).toEqual( { _v: 10, _d: { firstname: 'Bob' } } );
			done();
		} );
	} );

	describe( 'deletes a value', function() {

		it( 'deletes a value', function( done ) {
			storageConnector.delete( 'aType/someValue', function( error ) {
				expect( error ).toBe( null );
				done();
			} );
		} );

		it( 'is no long within elasticsearch', function( done ) {
			elasticsearchClient.get( {
				index: 'deepstream',
				type: 'aType',
				id: 'someValue'
			}, function( error, response ) {
				expect( response.found ).toBe( false );
				done();
			} );
		} );

	} );

} );