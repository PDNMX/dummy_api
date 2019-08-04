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
        let collection = db.collection('edca_releases');


        let queries  = [
            collection.countDocuments(),
            collection.distinct("buyer.name"),
            collection.countDocuments({"tender.procurementMethod": { $regex: "open", $options: "i"}}),
            collection.countDocuments({"tender.procurementMethod": { $regex: "selective", $options: "i"}}),
            collection.countDocuments({"tender.procurementMethod": { $regex: "direct", $options: "i"}})
        ];

        Promise.all(queries).then( d => {
            res.json({
                procedimientos: d[0],
                instituciones: d[1],
                open: d[2],
                selective: d[3],
                direct: d[4],
                other: (d[0] - (d[2] + d[3] + d[4]))
            })
        })

    }).catch(error => {
        console.log(error)
    })

});


router.post('/search', (req, res)=> {
    const MAX_RESULTS = 10;

    let limit = req.body.limit || MAX_RESULTS;
    let skip = req.body.skip || 0;

    if (isNaN(skip)){
        skip = 0;
    } else {
        skip = Math.abs(skip)
    }

    if (isNaN(limit)){
     limit = MAX_RESULTS;
    }else{
        limit = Math.abs(limit);
        limit = limit > 200?200:limit;
    }


    MongoClient.connect(dbConfig.url,{
        useNewUrlParser: true
    }).then( client => {

        let db = client.db(dbConfig.dbname);
        let collection = db.collection('edca_releases');

        let query = {
        };

        let options = {
            limit : limit,
            skip : skip,
        };


        collection.countDocuments(query).then ( count => {
           //res.json(count)
            collection.find(query, options).toArray((error, data) => {
                res.json ({
                    pagination: {
                        total : count,
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