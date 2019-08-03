var express = require('express');
var router = express.Router();

let dbConfig = require('../database_config');

const MongoClient = require('mongodb').MongoClient;

router.get('/', (req, res) => {
    res.send("<p>Sistema 6 - contrataciones</p>")
});

router.get('/summary', (req, res) => {

    //console.log(dbConfig);
    MongoClient.connect(dbConfig.url, {
        useNewUrlParser: true
    }).then(client => {
        let db = client.db(dbConfig.dbname);
        db.collection('edca_records').countDocuments().then( data => {
            res.json({ total: data})
        })
    }).catch(error => {
        console.log(error)
    })

});

module.exports = router;