/* global describe, expect, it, jasmine */
if ( !process.env.ELASTICSEARCH_HOST ) {
  process.env.ELASTICSEARCH_HOST = "localhost:9200";
}

const StorageConnector = require( "./connector" );
const expect = require("chai").expect;
const elasticsearch = require( "elasticsearch" );
const clientSettings = {
  host: process.env.ELASTICSEARCH_HOST,
};
const settings = {
  host: process.env.ELASTICSEARCH_HOST,
  splitChar: "/",
};

describe( "the message connector has the correct structure", () => {
  var storageConnector;
  var elasticsearchClient;

  before( ( done ) => {
    elasticsearchClient = new elasticsearch.Client( clientSettings );
    elasticsearchClient.ping( {
      requestTimeout: "400",
    }, done );
  } );

  before( async ( ) => {
    storageConnector = new StorageConnector( settings );
    storageConnector.init()
    await storageConnector.whenReady();
  } );

  it( "sets a value", ( done ) => {
    storageConnector.set( "deepstream_record/someValue", 10, { firstname: "Bob" }, ( error ) => {
      expect( error ).to.equal( null );
      done();
    } );
  } );

  it( "get the value within elasticsearch", ( done ) => {
    elasticsearchClient.get( {
      index: "deepstream",
      type: "deepstream_record",
      id: "someValue",
    }, ( error, response ) => {
      expect( response._source ).to.deep.equal( { __ds: { _v: 10 }, firstname: "Bob" } );
      done();
    } );
  } );

  it( "retrieves the existing value", ( done ) => {
    storageConnector.get( "deepstream_record/someValue", ( error, version, value ) => {
      expect( error ).to.equal( null );
      expect( version ).to.equal( 10 );
      expect( value ).to.deep.equal({ firstname: "Bob" } );
      done();
    } );
  } );

  it( "deletes a value", ( done ) => {
    storageConnector.delete( "deepstream_record/someValue", ( error ) => {
      expect( error ).to.equal( null );
      done();
    } );
  } );

  it( "is no long within elasticsearch", ( done ) => {
    elasticsearchClient.get( {
      index: "deepstream",
      type: "deepstream_record",
      id: "someValue",
    }, ( error, response ) => {
      expect( response.found ).to.equal( false );
      done();
    } );
  } );

} );
