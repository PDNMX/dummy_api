var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectId;
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


const profiles = {
    profile_1: {
        "informacion_personal.informacion_general": 1,
        "informacion_personal.datos_curriculares": 1

    },
    profile_2: {

    },
    profile_3:{
        "informacion_personal.informacion_general" : 1
    }
};

//definición de permisos
const getPermissions = profile => {
    switch(profile){
        case "profile_1":
            return profiles.profile_1;
        case "profile_2":
            return profiles.profile_2;
        case "profile_3":
            return profiles.profile_3;
        default:
            return profiles.profile_3;
    }
};

// buscar declaraciones por nombre/apellidos y por id
router.get('/declaraciones', (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }).then( client => {

        let db = client.db(dbName);
        let collection = db.collection('s1');

        console.log(req.query);

        const {id, profile, nombres, primer_apellido, segundo_apellido} = req.query;

        if (typeof id !== 'undefined'){

            const permissions = getPermissions(profile);
            console.log(permissions);

            collection.findOne({_id: ObjectId(id)}, {projection: permissions}).then(data => {
                res.json(data);
            })

        } else {
            let query ={};

            if (typeof nombres!== 'undefined') {
                query = {
                    "informacion_personal.informacion_general.nombres": {
                        "$regex": nombres, "$options": "i"
                    }
                };
            }

            if (typeof primer_apellido !== 'undefined'){
                query = {
                    "informacion_personal.informacion_general.primer_apellido": {
                        "$regex": primer_apellido, "$options": "i"
                    }
                };
            }

            if (typeof segundo_apellido !== 'undefined'){
                query = {
                    "informacion_personal.informacion_general.segundo_apellido": {
                        "$regex": segundo_apellido, "$options": "i"
                    }
                };
            }


            /*
            let pagination = {
                limit: 2
            };*/

            const projection = {
                id: 1,
                "informacion_personal.informacion_general": 1
            };

            collection.find(query).project(projection).toArray((err, data) =>{
                res.json({
                    results: data
                });
                client.close();
            });
        }

    }).catch(error => {
        console.log(error);
    });

});

module.exports = router;