/* global describe, expect, it, jasmine */
if( !process.env.ELASTICSEARCH_HOST ) {
  throw new Error( 'Expected environment variable ELASTICSEARCH_HOST' )
}

const StorageConnector = require( '../src/connector' )
const expect = require('chai').expect
const EventEmitter = require( 'events' ).EventEmitter
const elasticsearch = require( 'elasticsearch' )
const clientSettings = { host: process.env.ELASTICSEARCH_HOST }
const settings = { host: process.env.ELASTICSEARCH_HOST, splitChar: '/' }

describe( 'the message connector has the correct structure', () => {
  var storageConnector
  var elasticsearchClient

  before( ( done ) => {
    elasticsearchClient = new elasticsearch.Client( clientSettings )
    elasticsearchClient.ping( {
      requestTimeout: '400'
    }, done )
  } )

  before( ( done ) => {
    storageConnector = new StorageConnector( settings )
    storageConnector.on( 'ready', done )
  } )


  it( 'sets a value', ( done ) => {
    storageConnector.set( 'aType/someValue', { _v: 10, _d: { firstname: 'Bob' } }, ( error ) => {
      expect( error ).to.equal( null )
      done()
    } )
  } )

  it( 'set the value within elasticsearch', ( done ) => {
    elasticsearchClient.get( {
      index: 'deepstream',
      type: 'aType',
      id: 'someValue'
    }, ( error, response ) => {
      expect( response._source ).to.deep.equal( { __ds: { _v: 10 }, firstname: 'Bob' } )
      done()
    } )
  } )

  it( 'retrieves the existing value', ( done ) => {
    storageConnector.get( 'aType/someValue', ( error, value ) => {
      expect( error ).to.equal( null )
      expect( value ).to.deep.equal( { _v: 10, _d: { firstname: 'Bob' } } )
      done()
    } )
  } )

  it( 'deletes a value', ( done ) => {
    storageConnector.delete( 'aType/someValue', ( error ) => {
      expect( error ).to.equal( null )
      done()
    } )
  } )

  it( 'is no long within elasticsearch', ( done ) => {
    elasticsearchClient.get( {
      index: 'deepstream',
      type: 'aType',
      id: 'someValue'
    }, ( error, response ) => {
      expect( response.found ).to.equal( false )
      done()
    } )
  } )

} )