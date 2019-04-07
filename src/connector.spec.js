/* global describe, it, expect, jasmine */
if ( !process.env.ELASTICSEARCH_HOST ) {
  process.env.ELASTICSEARCH_HOST = "localhost:9200";
}

const StorageConnector = require( "./connector" );
const expect = require("chai").expect;
const EventEmitter = require( "events" ).EventEmitter;
const settings = {
  host: process.env.ELASTICSEARCH_HOST,
};

describe( "the message connector has the correct structure", () => {
  var storageConnector;
  it( "throws an error if required connection parameters are missing", () => {
    expect( () => { new StorageConnector( "gibberish" ); } ).to.throw();
  } );

  it( "creates the storageConnector", ( done ) => {
    storageConnector = new StorageConnector( settings );
    expect( storageConnector.isReady ).to.equal( false );
    storageConnector.on( "ready", done );
  } );

  it( "sets the isReady flag on the storageConnector", () => {
    expect( storageConnector.isReady ).to.equal( true );
  } );

  it( "implements the cache/storage connector interface", () => {
    expect( typeof storageConnector.name ).to.equal( "string" );
    expect( typeof storageConnector.version ).to.equal( "string" );
    expect( typeof storageConnector.get ).to.equal( "function" );
    expect( typeof storageConnector.set ).to.equal( "function" );
    expect( typeof storageConnector.delete ).to.equal( "function" );
    expect( storageConnector instanceof EventEmitter ).to.equal( true );
  } );

  it( "retrieves a non existing value", ( done ) => {
    storageConnector.get( "someValue", ( error, value ) => {
      expect( error ).to.equal( null );
      expect( value ).to.equal( null );
      done();
    } );
  } );

  it( "sets a value", ( done ) => {
    storageConnector.set("someValue",  { _v: 10, _d: { firstname: "Wolfram" } }, ( error ) => {
      console.log(error);
      expect( error ).to.equal( null );
      done();
    } );
  } );

  it( "retrieves an existing value", ( done ) => {
    storageConnector.get( "someValue", ( error, value ) => {
      expect( error ).to.equal( null );
      expect( value ).to.deep.equal( { _v: 10, _d: { firstname: "Wolfram" } } );
      done();
    } );
  } );

  it( "deletes a value", ( done ) => {
    storageConnector.delete( "someValue", ( error ) => {
      expect( error ).to.equal( null );
      done();
    } );
  } );

  it( "can't retrieve a deleted value", ( done ) => {
    storageConnector.get( "someValue", ( error, value ) => {
      expect( error ).to.equal( null );
      expect( value ).to.equal( null );
      done();
    } );
  } );
} );
