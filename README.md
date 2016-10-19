# deepstream.io-storage-elasticsearch [![npm version](https://badge.fury.io/js/deepstream.io-storage-elasticsearch.svg)](http://badge.fury.io/js/deepstream.io-storage-elasticsearch)

[deepstream](http://deepstream.io) storage connector for [elasticsearch](https://www.elastic.co/)

This connector uses [the npm elasticsearch package](https://www.npmjs.com/package/elasticsearch). Please have a look there for detailed options.

##Configuration Options
```yaml
plugins:
  storage:
    name: elasticsearch
    options:
      host: ${ELASTICSEARCH_HOST}
      database: 'someDb'
      defaultTable: 'someTable'
      splitChar: '/'
      settings: '
        {
          "number_of_shards": "1"
        }
      '
      mappings: '
        {
          "properties" : {
            "field1" : { "type" : "string", "index" : "not_analyzed" }
          }
        }
      '
```

```javascript
{
	//The host that elasticsearch should use
	host: 'localhost:9200',

	//(Optional, no default). The authentication to elasticsearch
	auth: 'user:password',

	//(Optional, defaults to 'deepstream'). This is the index in elasticsearch,
	//using database for consistency across all plugins.
	database: 'someDb',

	//(Optional, defaults to 'deepstream_records'). This is the type in elasticsearch,
	//using table for consistency across all plugins
	defaultTable: 'someTable',

	//(Optional, defaults to 1000). This is the ping timeout used
	//when doing the initial ping to ensure the connection is setup correctly
	pingTimeout: 200,

	/* (Optional) A character that's used as part of the
	* record names to split it into a tabel and an id part, e.g.
	*
	* books/dream-of-the-red-chamber
	*
	* would create a type called 'books' and store the record under the name
	* 'dream-of-the-red-chamber'
	*/
	splitChar: '/'

	/* (Optional) Index settings: https://www.elastic.co/guide/en/elasticsearch/reference/2.3/indices-create-index.html
	*/
	settings: {
		number_of_shards: 1
	}

	/* (Optional) Index mapping: https://www.elastic.co/guide/en/elasticsearch/reference/2.3/indices-create-index.html
	*/
	mapping: {
		properties: {
			field1: {
				type: 'string',
				index: 'not_analyzed'
			}
		}
	}
}
```

##Basic Setup
```javascript
var Deepstream = require( 'deepstream.io' ),
    ElasticSearchStorageConnector = require( 'deepstream.io-storage-elasticsearch' ),
    server = new Deepstream();

server.set( 'storage', new ElasticSearchStorageConnector( {
  host: 'localhost:5672',
  pingTimeout: 200,
  splitChar: '/'
}));

server.start();
```
