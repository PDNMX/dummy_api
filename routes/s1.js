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
    profile_2:{
        "informacion_personal.informacion_general" : 1
    },
    profile_3: {
        "informacion_personal.informacion_general.nombres": 1,
        "informacion_personal.informacion_general.primer_apellido": 1,
        "informacion_personal.informacion_general.segundo_apellido": 1,
        "informacion_personal.informacion_general.fecha_nacimiento": 1,
        "informacion_personal.informacion_general.correo_electronico": 1,
        "informacion_personal.datos_curriculares": 1
    },
    profile_4:{

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
        case "profile_4":
            return profile.profile_4;
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

        const {id, skip, limit, profile, nombres, primer_apellido, segundo_apellido} = req.query;

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


            let pagination = {
                limit: 10
            };

            if (typeof skip !== 'undefined' ){
                pagination.skip = isNaN(skip)?0:Math.abs(skip)
            }

            if (typeof limit !== 'undefined'){
                pagination.limit = isNaN(limit)?10:Math.abs(limit)
            }


            const projection = {
                id: 1,
                "informacion_personal.informacion_general": 1
            };

            let curr = collection.find(query, pagination).project(projection);

            curr.count().then(count => {
                curr.toArray((err, data) =>{
                    res.json({
                        total: count,
                        results: data
                    });
                    client.close();
                });
            });

        }

    }).catch(error => {
        console.log(error);
    });

});

module.exports = router;