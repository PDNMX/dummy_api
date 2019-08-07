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
        let releases = db.collection('edca_releases');
        let totalAmount = db.collection('edca_contracts_total');


        let queries  = [
            releases.countDocuments(),
            releases.distinct("buyer.name"),
            releases.countDocuments({"tender.procurementMethod": { $regex: "open", $options: "i"}}),
            releases.countDocuments({"tender.procurementMethod": { $regex: "selective", $options: "i"}}),
            releases.countDocuments({"tender.procurementMethod": { $regex: "direct", $options: "i"}}),
            totalAmount.findOne()
        ];

        Promise.all(queries).then( d => {
            res.json({
                procedimientos: d[0],
                instituciones: d[1].length,
                open: d[2],
                selective: d[3],
                direct: d[4],
                other: (d[0] - (d[2] + d[3] + d[4])),
                totalAmount: d[5].total
            })
        });

    }).catch(error => {
        console.log(error)
    })

});


router.post('/search', (req, res)=> {
    const MAX_RESULTS = 10;

    let pageSize = req.body.pageSize || MAX_RESULTS;
    let page = req.body.page || 0;
    let {contract_title, ocid} = req.body;

    if (isNaN(page)){
        page = 0;
    } else {
        page = Math.abs(page)
    }

    if (isNaN(pageSize)){
     pageSize = MAX_RESULTS;
    }else{
        pageSize = Math.abs(pageSize);
        pageSize = pageSize > 200?200:pageSize;
    }


    MongoClient.connect(dbConfig.url,{
        useNewUrlParser: true
    }).then( client => {

        let db = client.db(dbConfig.dbname);
        let collection = db.collection('edca_releases');

        let query = {
        };

        if (typeof contract_title !== 'undefined'){
            query["contracts.title"] = {$regex: contract_title, $options: 'i'};
        }

        if (typeof  ocid !==  'undefined'){
            query["ocid"] = ocid
        }

        let options = {
            limit : pageSize,
            skip : page * pageSize,
        };


        collection.countDocuments(query).then ( count => {
           //res.json(count)
            collection.find(query, options).toArray((error, data) => {
                res.json ({
                    pagination: {
                        total : count,
                        page: page,
                        pageSize: pageSize
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


        db.collection('edca_releases').find({ocid: ocid}).toArray((error, data) => {
            //res.json(data);

            const text=JSON.stringify(data, null, 4);
            res.setHeader('Content-type', "application/octet-stream");
            res.setHeader('Content-disposition', 'attachment; filename='+ocid+'.json');

            res.send(text);
        });

    });
});

router.get('/records/:ocid', (req, res) => {

    const ocid = req.params.ocid;

    MongoClient.connect(dbConfig.url, {
        useNewUrlParser: true
    }).then(client => {

        const db = client.db(dbConfig.dbname);

        db.collection('edca_records').find({"records.ocid": ocid}).toArray((error, data) => {
            //res.json(data)

            const text=JSON.stringify(data, null, 4);
            res.setHeader('Content-type', "application/octet-stream");
            res.setHeader('Content-disposition', 'attachment; filename='+ocid+'.json');

            res.send(text);
        });
    })
});

module.exports = router;