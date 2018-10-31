var express = require('express');
var router = express.Router();
var cors = require('cors');
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectId;

// Connection URL
process.env.DB_USER = process.env.DB_USER || 'demo';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'd3m0';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '27017';
process.env.DB_NAME = process.env.DB_NAME || 'datagen';

const url = 'mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME;
//const url = 'mongodb://root:password@mongo:27017'

// Database Name
const dbName = process.env.DB_NAME;


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
    //perfil público
    profile_3: {
        "informacion_personal.informacion_general.curp": 0,
        "informacion_personal.informacion_general.rfc": 0,
        "informacion_personal.informacion_general.numero_identificacion_oficial": 0,
        "informacion_personal.informacion_general.correo_electronico.personal": 0,
        "informacion_personal.informacion_general.correo_electronico.telefono": 0,
        "informacion_personal.informacion_general.correo_electronico.domicilio": 0,
        "informacion_personal.datos_dependientes_economicos.nombres": 0,
        "informacion_personal.datos_dependientes_economicos.primer_apellido": 0,
        "informacion_personal.datos_dependientes_economicos.segundo_apellido": 0,
        "informacion_personal.datos_dependientes_economicos.nacionalidades": 0,
        "informacion_personal.datos_dependientes_economicos.curp": 0,
        "informacion_personal.datos_dependientes_economicos.rfc": 0,
        "informacion_personal.datos_dependientes_economicos.fecha_nacimiento": 0,
        "informacion_personal.datos_dependientes_economicos.numero_identificacion_oficial": 0,
        "informacion_personal.datos_dependientes_economicos.habita_domicilio_declarante": 0,
        "informacion_personal.datos_dependientes_economicos.domicilio": 0,
        "informacion_personal.datos_dependientes_economicos.medio_contacto": 0,
        "informacion_personal.datos_dependientes_economicos.ingresos_propios": 0,
        "informacion_personal.datos_dependientes_economicos.ocupacion_profesion": 0,

        "intereses.representacion_activa.nombre_parte_representada":0,
        "intereses.representacion_activa.curp_parte":0,
        "intereses.representacion_activa.rfc_parte":0,
        "intereses.representacion_activa.fecha_nacimiento_parte":0,
        "intereses.representacion_activa.ocupacion_profesion_parte":0,

        "intereses.representacion_pasiva.nacionalidades_representante":0,
        "intereses.representacion_pasiva.curp_representante":0,
        "intereses.representacion_pasiva.rfc_representante":0,
        "intereses.representacion_pasiva.fecha_nacimiento_representante":0,

        "intereses.socios_comerciales.nombre_socio":0,
        "intereses.socios_comerciales.curp_socio":0,
        "intereses.socios_comerciales.rfc_socio":0,
        "intereses.socios_comerciales.lugar_nacimiento_socio":0,
        "intereses.socios_comerciales.fecha_nacimiento_socio":0,
        "intereses.socios_comerciales.porcentaje_participacion":0,

        "intereses.clientes_principales.dueno_encargado": 0,
        "intereses.clientes_principales.nombre_cliente": 0,
        "intereses.clientes_principales.rfc_cliente": 0,
        "intereses.clientes_principales.domicilio_cliente": 0,
        "intereses.clientes_principales.porcentaje_facturacion": 0,

        "intereses.otras_partes.nombre_denominacion_parte": 0,
        "intereses.otras_partes.nacionalidades": 0,
        "intereses.otras_partes.curp": 0,
        "intereses.otras_partes.rfc": 0,
        "intereses.otras_partes.fecha_nacimiento": 0,

        "intereses.beneficios_gratuitos.origen_beneficio":0,

        "ingresos.sueldos_salarios_otros_empleos.nombre_denominacion_razon_social": 0,
        "ingresos.sueldos_salarios_otros_empleos.rfc": 0,
        "ingresos.sueldos_salarios_otros_empleos.curp": 0,
        "ingresos.sueldos_salarios_otros_empleos.domicilio_persona_recibe_ingreso": 0,

        "ingresos.actividad_profesional.nombre_denominacion_razon_social": 0,
        "ingresos.actividad_profesional.rfc": 0,
        "ingresos.actividad_profesional.curp": 0,
        "ingresos.actividad_profesional.domicilio_persona_recibe_ingreso": 0,

        "ingresos.actividad_empresarial.nombre_denominacion_razon_social": 0,
        "ingresos.actividad_empresarial.rfc": 0,
        "ingresos.actividad_empresarial.curp": 0,
        "ingresos.actividad_empresarial.domicilio_actividad_empresarial": 0,

        "ingresos.actividad_economica_menor.nombre_denominacion_razon_social": 0,
        "ingresos.actividad_economica_menor.rfc": 0,
        "ingresos.actividad_economica_menor.curp": 0,
        "ingresos.actividad_economica_menor.domicilio_actividad": 0,

        "ingresos.arrendamiento.nombre_denominacion_razon_social": 0,
        "ingresos.arrendamiento.rfc": 0,
        "ingresos.arrendamiento.curp": 0,
        "ingresos.arrendamiento.domicilio_actividad": 0,
    },
    profile_4:{
        //perfil con todos los permisos
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
router.get('/declaraciones',cors(), (req, res) => {
    //console.log(url);
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
                limit: 10,
                skip: 0
            };

            if (typeof skip !== 'undefined' ){
                pagination.skip = isNaN(skip)?0:Math.abs(skip)
            }

            if (typeof limit !== 'undefined'){
                pagination.limit = isNaN(limit)?10:Math.abs(limit)
            }

            console.log(pagination);

            const projection = {
                id: 1,
                "informacion_personal.informacion_general": 1
            };

            let curr = collection.find(query, pagination).project(projection);

            curr.count().then(count => {
                curr.toArray((err, data) =>{
                    res.json({
                        total: count,
                        pagination: pagination,
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
