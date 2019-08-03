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


router.get('/search', (req, res)=> {
    MongoClient.connect(dbConfig.url,{
        useNewUrlParser: true
    }).then( client => {

        let db = client.db(dbConfig.dbname);
        let collection = db.collection('edca_releases');

        let query = {
        };

        let options = {
            limit : 2,
            skip : 0,
        };


        collection.countDocuments(query).then ( count => {
           //res.json(count)
            collection.find(query, options).toArray((error, data) => {
                res.json ({
                    pagination: {
                        total : count ,
                        skip: options.skip,
                        limit: options.limit
                    },
                    data: data,
                });
            })

        })
    });
});

router.get('/releases/:ocid', (req, res) => {

    const ocid = req.params.ocid;

    MongoClient.connect(dbConfig.url,{
        useNewUrlParser: true
    }).then( client => {
        const db = client.db(dbConfig.dbname);


        db.collection('edca_releases').find({ocid: ocid}).toArray((error, data) => res.json(data));

    });
});

router.get('/records/:ocid', (req, res) => {

    const ocid = req.params.ocid;

    MongoClient.connect(dbConfig.url, {
        useNewUrlParser: true
    }).then(client => {

        const db = client.db(dbConfig.dbname);

        db.collection('edca_records').find({"records.ocid": ocid}).toArray((error, data) => res.json(data));
    })
});

module.exports = router;