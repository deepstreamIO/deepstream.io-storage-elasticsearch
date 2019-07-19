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

  it( "creates the storageConnector", async ( ) => {
    storageConnector = new StorageConnector( settings );
    storageConnector.init()
    await storageConnector.whenReady()
  } );

  it( "implements the cache/storage connector interface", () => {
    expect( typeof storageConnector.description ).to.equal( "string" );
    expect( typeof storageConnector.get ).to.equal( "function" );
    expect( typeof storageConnector.set ).to.equal( "function" );
    expect( typeof storageConnector.delete ).to.equal( "function" );
  } );

  it( "retrieves a non existing value", ( done ) => {
    storageConnector.get( "someValue", ( error, version, value ) => {
      expect( error ).to.equal( null );
      expect( version ).to.equal( -1 );
      expect( value ).to.equal( null );
      done();
    } );
  } );

  it( "sets a value", ( done ) => {
    storageConnector.set("someValue",  10, { firstname: "Wolfram" }, ( error ) => {
      expect( error ).to.equal( null );
      done();
    } );
  } );

  it( "retrieves an existing value", ( done ) => {
    storageConnector.get( "someValue", ( error, version, value ) => {
      expect( error ).to.equal( null );
      expect( version ).to.equal( 10 );
      expect( value ).to.deep.equal( { firstname: "Wolfram" } );
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
    storageConnector.get( "someValue", ( error, version, value ) => {
      expect( error ).to.equal( null );
      expect( version ).to.equal( -1 );
      expect( value ).to.equal( null );
      done();
    } );
  } );
} );
