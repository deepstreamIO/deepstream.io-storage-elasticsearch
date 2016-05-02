/* global describe, expect, it, jasmine */

if( !process.env.ELASTICSEARCH_HOST ) {
	throw new Error( 'Expected environment variable ELASTICSEARCH_HOST' );
}
var StorageConnector = require( '../src/connector' ),
	EventEmitter = require( 'events' ).EventEmitter,
	settings = { host: process.env.ELASTICSEARCH_HOST };

describe( 'the message connector has the correct structure', function() {
	var storageConnector;
	it( 'throws an error if required connection parameters are missing', function() {
		expect( function() { new StorageConnector( 'gibberish' ); } ).toThrow();
	} );
	
	it( 'creates the storageConnector', function( done ) {
		storageConnector = new StorageConnector( settings );
		expect( storageConnector.isReady ).toBe( false );
		storageConnector.on( 'ready', done );
	} );
	
	it( 'sets the isReady flag on the storageConnector', function() {
		expect( storageConnector.isReady ).toBe( true );
	} );

	it( 'implements the cache/storage connector interface', function() {
			expect( typeof storageConnector.name ).toBe( 'string' );
			expect( typeof storageConnector.version ).toBe( 'string' );
			expect( typeof storageConnector.get ).toBe( 'function' );
			expect( typeof storageConnector.set ).toBe( 'function' );
			expect( typeof storageConnector.delete ).toBe( 'function' );
			expect( storageConnector instanceof EventEmitter ).toBe( true );
	} );
	
	it( 'retrieves a non existing value', function( done ) {
		storageConnector.get( 'someValue', function( error, value ) {
			expect( error ).toBe( null );
			expect( value ).toBe( null );
			done();
		} );
	} );
	
	it( 'sets a value', function( done ) {
		storageConnector.set( 'someValue', { _v: 10, _d: { firstname: 'Wolfram' } }, function( error ) {
			expect( error ).toBe( null );
			done();
		} );
	} );
	
	it( 'retrieves an existing value', function( done ) {
		storageConnector.get( 'someValue', function( error, value ) {
			expect( error ).toBe( null );
			expect( value ).toEqual( { _v: 10, _d: { firstname: 'Wolfram' } } );
			done();
		} );
	} );
	
	it( 'deletes a value', function( done ) {
		storageConnector.delete( 'someValue', function( error ) {
			expect( error ).toBe( null );
			done();
		} );
	} );
	
	it( 'can\'t retrieve a deleted value', function( done ) {
		storageConnector.get( 'someValue', function( error, value ) {
			expect( error ).toBe( null );
			expect( value ).toBe( null );
			done();
		} );
	} );
} );