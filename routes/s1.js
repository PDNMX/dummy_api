var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'datagen';


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.json({
        version_api: '1.0',
        sistema: {
            id:1,
            nombre: 'Declaraciones'
        }});
});


router.get('/declaraciones', (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }).then( client => {

        let db = client.db(dbName);

        let collection = db.collection('s1');

        collection.find({}, {limit: 2}).toArray((err, data) =>{
            res.json({
                results: data
            });
            client.close();
        });

    }).catch(error => {
        console.log(error);
    });

});

module.exports = router;