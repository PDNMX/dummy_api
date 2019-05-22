var express = require("express");
var request = require('request');
var router = express.Router();

var dbmongo = require("./database_config");
var data = {
  version_api: "1.0",
  sistema: {
    id: 1,
    nombre: ""
  }
};
const MongoClient = require("mongodb").MongoClient;

const getFechaNacimiento = function(_edad, _fin = false) {
  let _fechaActual = new Date();
  _edad = parseInt(_edad, 10);

  // console.log("inicio", _fechaActual.toISOString());
  _fechaActual.setFullYear(_fechaActual.getFullYear() - _edad);
  _fechaActual.setHours(0, 0, 0);
  _fechaActual.setMilliseconds(0);
  if (_fin) {
    _fechaActual.setDate(_fechaActual.getDate() + 1);
  }
  // console.log("fin", _fechaActual.toISOString());
  return _fechaActual;
};

// URL de catalagos
const catNivelOrdenGobierno = "https://raw.githubusercontent.com/PDNMX/catalogos/master/catNivelOrdenGobierno.json";
const catGradoAcademico = "https://raw.githubusercontent.com/PDNMX/catalogos/master/catGradoAcademico.json";
const catEntidadesFederativas = "https://gaia.inegi.org.mx/wscatgeo/mgee/";

// Obtiene info de API
let getCatalago = (url) => {
  return new Promise(
    (resolve, reject) => {
      request.get(url, function(error, response, data){
        if (error) reject(error);
        let content = JSON.parse(data);
        // let fact = content.value;
        resolve(content);
      })
   }
 );
};

router.get("/", function(req, res, next) {
  data.sistema.nombre = "Estadisticas";
  res.json(data);
});

router.get("/edad", function(req, res, next) {
  MongoClient.connect(
    dbmongo.url,
    {
      useNewUrlParser: true
    }
  )
    .then(client => {
      let db = client.db(dbmongo.dbname);
      let collection = db.collection("s1");
      let max;
      let min;
      let allDbRequest = [];
      for (i = 18; i < 120; i+=10) {
        let edadMin = parseInt(i);
        let edadMax = parseInt(i+10);
        min = getFechaNacimiento(edadMin);
        max = getFechaNacimiento(edadMax);
        // console.log(max);
        // console.log(min);
        allDbRequest.push(
          collection.find({"informacion_personal.informacion_general.fecha_nacimiento_bin" : {$gte: max, $lte: min}}).count().then((count) => {
            let api = new Object({
              "total": 0,
              "propiedades": {
                "edad": ""
              }
            });
            api.propiedades.edad = `${edadMin}-${edadMax}`;
            api.total = count;
            return api;
          }, (err) => {
            console.log('Unable to fetch', err);
          })
        )// ARRAY Push;
      } // FOR
        Promise.all(allDbRequest).then(function (results) {
            // console.log(results);
            res.json(results);
        }).catch(function (error) {
             console.log(`Error al realizar la consulta: ${error.message}`);
        });
    })
    .catch(error => {
      console.log(`Error al conectar con mongo: ${error.message}`);
    });
  });

router.get("/edad-gobierno", function(req, res, next) {
  getCatalago(catNivelOrdenGobierno).then(
     nivelOrdenGobierno => {
     // MONGO
     MongoClient.connect(
       dbmongo.url,
       {
         useNewUrlParser: true
       }
     )
       .then(client => {
         let db = client.db(dbmongo.dbname);
         let collection = db.collection("s1");
         let max;
         let min;
         let allDbRequest = [];
         for (i = 0; i < nivelOrdenGobierno.length; i++) {
           for (j = 18; j < 120; j+=10) {
             let edadMin = parseInt(j);
             let edadMax = parseInt(j+10);
             min = getFechaNacimiento(edadMin);
             max = getFechaNacimiento(edadMax);
             // console.log(max);
             // console.log(min);
             // console.log(nivelOrdenGobierno[j].valor);
             let gobierno = nivelOrdenGobierno[i].valor;
             allDbRequest.push(
               collection.find({$and: [
                 {"informacion_personal.informacion_general.fecha_nacimiento_bin" : {$gte: max, $lte: min}},
                 {"informacion_personal.datos_encargo_actual.nivel_gobierno.valor": gobierno}
               ]}
             ).count().then((count) => {
                 let api = new Object({
                   "total": 0,
                   "propiedades": {
                     "edad": "",
                     "nivelGobierno": ""
                   }
                 });
                 api.propiedades.edad = `${edadMin}-${edadMax}`;
                 api.propiedades.nivelGobierno = gobierno;
                 api.total = count;
                 return api;
               }, (err) => {
                 console.log('Unable to fetch', err);
               })
             )// ARRAY Push;
           } // FOR Edad
         } // FOR Nivel
         Promise.all(allDbRequest).then(function (results) {
             // console.log(results);
             res.json(results);
         }).catch(function (error) {
              console.log(`Error al realizar la consulta: ${error.message}`);
         });
       })
       .catch(error => {
         console.log(`Error al conectar con mongo: ${error.message}`);
       });
  }).catch(
     error => console.log(error)
  );
});

router.get("/edad-educacion", function(req, res, next) {
  getCatalago(catGradoAcademico).then(
     gradoAcademico => {
       // console.log(gradoAcademico)
     // MONGO
     MongoClient.connect(
       dbmongo.url,
       {
         useNewUrlParser: true
       }
     )
       .then(client => {
         let db = client.db(dbmongo.dbname);
         let collection = db.collection("s1");
         let max;
         let min;
         let allDbRequest = [];
         for (i = 0; i < gradoAcademico.length; i++) {
           for (j = 18; j < 120; j+=10) {
             let edadMin = parseInt(j);
             let edadMax = parseInt(j+10);
             min = getFechaNacimiento(edadMin);
             max = getFechaNacimiento(edadMax);
             // console.log(max);
             // console.log(min);
             // console.log(nivelOrdenGobierno[j].valor);
             let educacion = gradoAcademico[i].valor;
             allDbRequest.push(
               collection.find({$and: [
                 {"informacion_personal.informacion_general.fecha_nacimiento_bin" : {$gte: max, $lte: min}},
                 {"informacion_personal.datos_curriculares.grado_maximo_escolaridad.valor": educacion}
               ]}
             ).count().then((count) => {
                 let api = new Object({
                   "total": 0,
                   "propiedades": {
                     "edad": "",
                     "nivelEducativo": ""
                   }
                 });
                 api.propiedades.edad = `${edadMin}-${edadMax}`;
                 api.propiedades.nivelEducativo = educacion;
                 api.total = count;
                 return api;
               }, (err) => {
                 console.log('Unable to fetch', err);
               })
             )// ARRAY Push;
           } // FOR Edad
         } // FOR Nivel
         Promise.all(allDbRequest).then(function (results) {
             // console.log(results);
             res.json(results);
         }).catch(function (error) {
              console.log(`Error al realizar la consulta: ${error.message}`);
         });
       })
       .catch(error => {
         console.log(`Error al conectar con mongo: ${error.message}`);
       });
  }).catch(
     error => console.log(error)
  );
});

router.get("/gobierno", function(req, res, next) {
  getCatalago(catNivelOrdenGobierno).then(
    nivelOrdenGobierno => {
     // MONGO
     MongoClient.connect(
       dbmongo.url,
       {
         useNewUrlParser: true
       }
     )
       .then(client => {
         let db = client.db(dbmongo.dbname);
         let collection = db.collection("s1");
         let max;
         let min;
         let allDbRequest = [];
         for (i = 0; i < nivelOrdenGobierno.length; i++) {
          let gobierno = nivelOrdenGobierno[i].valor;
          allDbRequest.push(
            collection.find({$and: [
              {"informacion_personal.datos_encargo_actual.nivel_gobierno.valor": gobierno}
            ]}
          ).count().then((count) => {
              let api = new Object({
                "total": 0,
                "propiedades": {
                  "nivelGobierno": ""
                }
              });
              api.propiedades.nivelGobierno = gobierno;
              api.total = count;
              return api;
            }, (err) => {
              console.log('Unable to fetch', err);
            })
          )// ARRAY Push;
         } // FOR Nivel
         Promise.all(allDbRequest).then(function (results) {
             res.json(results);
         }).catch(function (error) {
              console.log(`Error al realizar la consulta: ${error.message}`);
         });
       })
       .catch(error => {
         console.log(`Error al conectar con mongo: ${error.message}`);
       });
  }).catch(
     error => console.log(error)
  );
});

router.get("/gobierno-educacion", function(req, res, next) {
  getCatalago(catNivelOrdenGobierno).then(
    nivelOrdenGobierno => {
      getCatalago(catGradoAcademico).then(
        gradoAcademico => {
          // MONGO
          MongoClient.connect(
            dbmongo.url,
            {
              useNewUrlParser: true
            }
          )
            .then(client => {
              let db = client.db(dbmongo.dbname);
              let collection = db.collection("s1");
              let max;
              let min;
              let allDbRequest = [];
              for (i = 0; i < nivelOrdenGobierno.length; i++) {
                for(j=0; j < gradoAcademico.length; j++){
                  let educacion = gradoAcademico[j].valor;
                  let gobierno = nivelOrdenGobierno[i].valor;
                  allDbRequest.push(
                    collection.find({$and: [
                      {"informacion_personal.datos_encargo_actual.nivel_gobierno.valor": gobierno},
                      {"informacion_personal.datos_curriculares.grado_maximo_escolaridad.valor": educacion}
                    ]}
                  ).count().then((count) => {
                      let api = new Object({
                        "total": 0,
                        "propiedades": {
                          "nivelGobierno": "",
                          "nivelEducativo": ""
                        }
                      });
                      api.propiedades.nivelGobierno = gobierno;
                      api.propiedades.nivelEducativo = educacion;
                      api.total = count;
                      return api;
                    }, (err) => {
                      console.log('Unable to fetch', err);
                    })
                  )// ARRAY Push;
                }
              } // FOR Nivel
              Promise.all(allDbRequest).then(function (results) {
                  res.json(results);
              }).catch(function (error) {
                    console.log(`Error al realizar la consulta: ${error.message}`);
              });
            })
            .catch(error => {
              console.log(`Error al conectar con mongo: ${error.message}`);
            });        
        }).catch(
          error => console.log(error)
      );

  }).catch(
     error => console.log(error)
  );
});

router.get("/estatal", function(req, res, next) {
  getCatalago(catEntidadesFederativas).then(
    entidadesFederativas => {
      console.log(entidadesFederativas);
      // MONGO
      MongoClient.connect(
        dbmongo.url,
        {
          useNewUrlParser: true
        }
      )
        .then(client => {
          let db = client.db(dbmongo.dbname);
          let collection = db.collection("s1");
          let allDbRequest = [];
          for (i = 0; i < entidadesFederativas.datos.length; i++) {
              let entidades = parseInt(entidadesFederativas.datos[i].cve_agee);
              let nombre = entidadesFederativas.datos[i].nom_agee;
              allDbRequest.push(
                collection.find({$and: [
                  {"informacion_personal.datos_encargo_actual.direccion_encargo.entidad_federativa.cve_agee": entidades+""}
                ]}
              ).count().then((count) => {
                  let api = new Object({
                    "total": 0,
                    "propiedades": {
                      "entidadFederativa": ""
                    }
                  });
                  api.propiedades.entidadFederativa = nombre;
                  api.total = count;
                  return api;
                }, (err) => {
                  console.log('Unable to fetch', err);
                })
              )// ARRAY Push;
          } // FOR Nivel
          Promise.all(allDbRequest).then(function (results) {
              res.json(results);
          }).catch(function (error) {
                console.log(`Error al realizar la consulta: ${error.message}`);
          });
        })
        .catch(error => {
          console.log(`Error al conectar con mongo: ${error.message}`);
        });        

  }).catch(
     error => console.log(error)
  );
});


router.get("/educacion", function(req, res, next) {
  getCatalago(catGradoAcademico).then(
    gradoAcademico => {
      //console.log(gradoAcademico);
      // MONGO
      MongoClient.connect(
        dbmongo.url,
        {
          useNewUrlParser: true
        }
      )
        .then(client => {
          let db = client.db(dbmongo.dbname);
          let collection = db.collection("s1");
          let allDbRequest = [];
          for (i = 0; i < gradoAcademico.length; i++) {
              let educacion = gradoAcademico[i].valor;
              allDbRequest.push(
                collection.find({"informacion_personal.datos_curriculares.grado_maximo_escolaridad.valor": educacion}
              ).count().then((count) => {
                  let api = new Object({
                    "total": 0,
                    "propiedades": {
                      "nivelEducativo": ""
                    }
                  });
                  api.propiedades.nivelEducativo = educacion;
                  api.total = count;
                  return api;
                }, (err) => {
                  console.log('Unable to fetch', err);
                })
              )// ARRAY Push;
          } // FOR Nivel
          Promise.all(allDbRequest).then(function (results) {
              res.json(results);
          }).catch(function (error) {
                console.log(`Error al realizar la consulta: ${error.message}`);
          });
        })
        .catch(error => {
          console.log(`Error al conectar con mongo: ${error.message}`);
        });        

  }).catch(
     error => console.log(error)
  );
});


router.get("/superficie-terreno", function(req, res, next) {
  let paramsQuery;
  if(!isNaN(parseInt(req.query.min, 10)) && !isNaN(parseInt(req.query.max, 10)) && req.query.max >= req.query.min)
  {
    let min = Number(req.query.min);
    let max = Number(req.query.max);
    paramsQuery = {"activos.bienes_inmuebles.superficie_terreno": {$gte: min, $lte: max}};
  } else {
    paramsQuery = {};
  }
  MongoClient.connect(
    dbmongo.url,
    {
      useNewUrlParser: true
    }
  )
  .then(client => {
    let db = client.db(dbmongo.dbname);
    let collection = db.collection("s1");
    collection.aggregate(
      { $unwind: "$activos.bienes_inmuebles" },
      { $match: paramsQuery},
      { $group: { "_id": "$activos.bienes_inmuebles.superficie_terreno", "count": { $sum: 1 } } },
      { $project: {"_id": 1, "count": 1 } }
    ).toArray(function(err, docs) {
      let arrayApi = new Array();
      var reformattedArray = docs.map(obj =>{
         var api = {
           "total": 0,
           "propiedades": {
             "superficieTerreno": 0
           }
         };
         api.total = obj.count;
         api.propiedades.superficieTerreno = obj._id;
         arrayApi.push(api);
      });
      res.json(arrayApi);
    });
    // .toArray()
    // .then(results => {
    //   console.log(JSON.stringify(results))
    // })
  })
  .catch(error => {
    console.log(error);
  });
});

router.get("/superficie-construccion", function(req, res, next) {
  let paramsQuery;
  if(!isNaN(parseInt(req.query.min, 10)) && !isNaN(parseInt(req.query.max, 10)) && req.query.max >= req.query.min)
  {
    let min = Number(req.query.min);
    let max = Number(req.query.max);
    paramsQuery = {"activos.bienes_inmuebles.superficie_construccion": {$gte: min, $lte: max}};
  } else {
    paramsQuery = {};
  }
  MongoClient.connect(
    dbmongo.url,
    {
      useNewUrlParser: true
    }
  )
  .then(client => {
    let db = client.db(dbmongo.dbname);
    let collection = db.collection("s1");
    collection.aggregate(
      { $unwind: "$activos.bienes_inmuebles" },
      { $match: paramsQuery},
      { $group: { "_id": "$activos.bienes_inmuebles.superficie_construccion", "count": { $sum: 1 } } },
      { $project: {"_id": 1, "count": 1 } }
    ).toArray(function(err, docs) {
      let arrayApi = new Array();
      var reformattedArray = docs.map(obj =>{
         var api = {
           "total": 0,
           "propiedades": {
             "superficieConstruccion": 0
           }
         };
         api.total = obj.count;
         api.propiedades.superficieConstruccion = obj._id;
         arrayApi.push(api);
      });
      res.json(arrayApi);
    });
    // .toArray()
    // .then(results => {
    //   console.log(JSON.stringify(results))
    // })
  })
  .catch(error => {
    console.log(error);
  });
});

router.get("/ingresos", function(req, res, next) {
  let paramsQuery;
  if(!isNaN(parseInt(req.query.min, 10)) && !isNaN(parseInt(req.query.max, 10)) && req.query.max >= req.query.min)
  {
    let min = Number(req.query.min);
    let max = Number(req.query.max);
    paramsQuery = {"ingresos.sueldos_salarios_publicos.ingreso_bruto_anual.valor": {$gte: min, $lte: max}};
  } else {
    paramsQuery = {};
  }
  MongoClient.connect(
    dbmongo.url,
    {
      useNewUrlParser: true
    }
  )
  .then(client => {
    let db = client.db(dbmongo.dbname);
    let collection = db.collection("s1");
    collection.aggregate(
      { $unwind: "$ingresos.sueldos_salarios_publicos" },
      { $match: paramsQuery},
      { $group: { "_id": "$ingresos.sueldos_salarios_publicos.ingreso_bruto_anual.valor", "count": { $sum: 1 } } },
      { $project: {"_id": 1, "count": 1 } }
    ).toArray(function(err, docs) {
      let arrayApi = new Array();
      var reformattedArray = docs.map(obj =>{
         var api = {
           "total": 0,
           "propiedades": {
             "ingresoAnual": 0
           }
         };
         api.total = obj.count;
         api.propiedades.ingresoAnual = obj._id;
         arrayApi.push(api);
      });
      res.json(arrayApi);
    });
    // .toArray()
    // .then(results => {
    //   console.log(JSON.stringify(results))
    // })
  })
  .catch(error => {
    console.log(error);
  });
});
//
// router.post("/edad", function(req, res, next) {
//   let { edad, tipo } = req.body;
//   let query = {};
//   let date = new Date();
//   let year = parseInt("28", 10);
//
//   if (
//     typeof edad === "undefined" ||
//     typeof edad.minimo === "undefined" ||
//     typeof edad.maximo === "undefined"
//   ) {
//     data.sistema.nombre = "edad";
//     data.error = {
//       numero: 10,
//       mensaje: "numero de parametros de edad incorrecto"
//     };
//
//     delete data.res;
//     res.json(data);
//   } else {
//     let _fInicio = getFechaNacimiento(edad.maximo);
//     let _fFin = getFechaNacimiento(edad.minimo, true);
//
//     query["informacion_personal.informacion_general.fecha_nacimiento_bin"] = {
//       $gte: _fInicio,
//       $lte: _fFin
//     };
//
//     if (typeof tipo === "undefined") {
//       MongoClient.connect(
//         dbmongo.url,
//         {
//           useNewUrlParser: true
//         }
//       )
//         .then(client => {
//           let db = client.db(dbmongo.dbname);
//           let col = db.collection("s1");
//
//           col
//             .aggregate([
//               { $match: query },
//               { $group: { _id: "edad", total: { $sum: 1 } } }
//             ])
//             .toArray(function(err, docs) {
//               console.log(err);
//               console.log(docs);
//
//               data.sistema.nombre = "edad";
//               data.res = {
//                 edad: edad,
//                 total: docs[0].total
//               };
//
//               delete data.error;
//               res.json(data);
//             });
//         })
//         .catch(error => {
//           console.log(error);
//         });
//     } else {
//       switch (tipo) {
//         case "nivelGobierno":
//           MongoClient.connect(
//             dbmongo.url,
//             {
//               useNewUrlParser: true
//             }
//           )
//             .then(client => {
//               let db = client.db(dbmongo.dbname);
//               let col = db.collection("s1");
//
//               col
//                 .aggregate([
//                   { $match: query },
//                   {
//                     $group: {
//                       _id:
//                         "$informacion_personal.datos_encargo_actual.nivel_gobierno.valor",
//                       total: { $sum: 1 }
//                     }
//                   }
//                 ])
//                 .toArray(function(err, docs) {
//                   console.log(docs);
//
//                   let tot = {};
//
//                   tot = docs.map(doc => {
//                     return { nivel: doc._id, total: doc.total };
//                   });
//
//                   data.sistema.nombre = "edad";
//                   data.res = {
//                     edad: edad,
//                     total: tot
//                   };
//
//                   delete data.error;
//                   res.json(data);
//                 });
//             })
//             .catch(error => {
//               console.log(error);
//             });
//           break;
//         case "nivelEducativo":
//           MongoClient.connect(
//             dbmongo.url,
//             {
//               useNewUrlParser: true
//             }
//           )
//             .then(client => {
//               let db = client.db(dbmongo.dbname);
//               let col = db.collection("s1");
//
//               col
//                 .aggregate([
//                   { $match: query },
//                   {
//                     $group: {
//                       _id:
//                         "$informacion_personal.datos_curriculares.grado_maximo_escolaridad.valor",
//                       total: { $sum: 1 }
//                     }
//                   }
//                 ])
//                 .toArray(function(err, docs) {
//                   console.log(docs);
//
//                   let tot = {};
//
//                   tot = docs.map(doc => {
//                     return { nivel: doc._id, total: doc.total };
//                   });
//
//                   data.sistema.nombre = "edad";
//                   data.res = {
//                     edad: edad,
//                     total: tot
//                   };
//
//                   delete data.error;
//                   res.json(data);
//                 });
//             })
//             .catch(error => {
//               console.log(error);
//             });
//           break;
//         default:
//       }
//     }
//
//     console.log("query", query);
//   }
// });
//
// router.post("/nivel_gobierno", function(req, res, next) {
//   let { nivel_gobierno, grado_obtenido, edad } = req.body;
//   let query = {};
//
//   console.log("req.body", req.body);
//
//   if (typeof nivel_gobierno === "undefined") {
//     data.sistema.nombre = "nivel_gobierno";
//     data.error = {
//       numero: 11,
//       mensaje: "parametros incorrectos"
//     };
//
//     delete data.res;
//
//     res.json(data);
//   } else {
//     query[
//       "informacion_personal.datos_encargo_actual.nivel_gobierno.valor"
//     ] = nivel_gobierno;
//
//     if (typeof grado_obtenido !== "undefined") {
//       query[
//         "informacion_personal.datos_curriculares.grado_maximo_escolaridad.valor"
//       ] = grado_obtenido;
//     }
//
//     if (typeof edad !== "undefined") {
//       if (
//         typeof edad.minimo === "undefined" ||
//         typeof edad.maximo === "undefined"
//       ) {
//         data.sistema.nombre = "nivel_gobierno";
//         data.error = {
//           numero: 10,
//           mensaje: "numero de parametros de edad incorrecto"
//         };
//
//         delete data.res;
//         res.json(data);
//       } else {
//         let _fInicio = getFechaNacimiento(edad.maximo);
//         let _fFin = getFechaNacimiento(edad.minimo, true);
//
//         query[
//           "informacion_personal.informacion_general.fecha_nacimiento_bin"
//         ] = {
//           $gte: _fInicio,
//           $lte: _fFin
//         };
//       }
//     }
//
//     MongoClient.connect(
//       dbmongo.url,
//       {
//         useNewUrlParser: true
//       }
//     )
//       .then(client => {
//         let db = client.db(dbmongo.dbname);
//         let collection = db.collection("s1");
//
//         collection
//           .find(query, { projection: { _id: 0 } })
//           .count(function(err, count) {
//             if (err) throw err;
//
//             data.sistema.nombre = "nivel_gobierno";
//             data.res = {
//               edad: edad,
//               nivel_gobierno: nivel_gobierno,
//               total: count
//             };
//
//             if (typeof grado_obtenido !== "undefined") {
//               data.res.grado_obtenido=grado_obtenido;
//             }
//
//             delete data.error;
//             res.json(data);
//           });
//       })
//       .catch(error => {
//         console.log(error);
//       });
//
//     console.log("query", query);
//   }
// });
//
// router.post("/entidad_federativa", function(req, res, next) {
//   let { entidad_federativa } = req.body;
//   let query = {};
//
//   console.log("req.body", req.body);
//
//   if (typeof entidad_federativa === "undefined") {
//     data.sistema.nombre = "entidad_federativa";
//     data.error = {
//       numero: 11,
//       mensaje: "parametros incorrectos"
//     };
//
//     delete data.res;
//
//     res.json(data);
//   } else {
//     query[
//       "informacion_personal.datos_encargo_actual.direccion_encargo.entidad_federativa.nom_agee"
//     ] = entidad_federativa;
//
//     MongoClient.connect(
//       dbmongo.url,
//       {
//         useNewUrlParser: true
//       }
//     )
//       .then(client => {
//         let db = client.db(dbmongo.dbname);
//         let collection = db.collection("s1");
//
//         collection
//           .find(query, { projection: { _id: 0 } })
//           .count(function(err, count) {
//             if (err) throw err;
//
//             data.sistema.nombre = "entidad_federativa";
//             data.res = {
//               entidad_federativa: entidad_federativa,
//               total: count
//             };
//
//             delete data.error;
//             console.log(data);
//
//             res.json(data);
//           });
//       })
//       .catch(error => {
//         console.log(error);
//       });
//
//     console.log("query", query);
//   }
// });
//
// router.post("/grado_obtenido", function(req, res, next) {
//   let { grado_obtenido, nivel_gobierno, edad } = req.body;
//   let query = {};
//
//   console.log("req.body", req.body);
//
//   if (typeof grado_obtenido === "undefined") {
//     data.sistema.nombre = "grado_obtenido";
//     data.error = {
//       numero: 11,
//       mensaje: "parametros incorrectos"
//     };
//
//     delete data.res;
//
//     res.json(data);
//   } else {
//     query[
//       "informacion_personal.datos_curriculares.grado_maximo_escolaridad.valor"
//     ] = grado_obtenido;
//
//     if (typeof nivel_gobierno !== "undefined") {
//       query[
//         "informacion_personal.datos_encargo_actual.nivel_gobierno.valor"
//       ] = nivel_gobierno;
//     }
//
//     if (typeof edad !== "undefined") {
//       if (
//         typeof edad.minimo === "undefined" ||
//         typeof edad.maximo === "undefined"
//       ) {
//         data.sistema.nombre = "grado_obtenido";
//         data.error = {
//           numero: 10,
//           mensaje: "numero de parametros de edad incorrecto"
//         };
//
//         delete data.res;
//         res.json(data);
//       } else {
//         let _fInicio = getFechaNacimiento(edad.maximo);
//         let _fFin = getFechaNacimiento(edad.minimo, true);
//
//         query[
//           "informacion_personal.informacion_general.fecha_nacimiento_bin"
//         ] = {
//           $gte: _fInicio,
//           $lte: _fFin
//         };
//       }
//     }
//
//     MongoClient.connect(
//       dbmongo.url,
//       {
//         useNewUrlParser: true
//       }
//     )
//       .then(client => {
//         let db = client.db(dbmongo.dbname);
//         let collection = db.collection("s1");
//
//         collection
//           .find(query, { projection: { _id: 0 } })
//           .count(function(err, count) {
//             if (err) throw err;
//
//             data.sistema.nombre = "grado_obtenido";
//             data.res = {
//               edad: edad,
//               grado_obtenido: grado_obtenido,
//               total: count
//             };
//
//             if (typeof nivel_gobierno !== "undefined") {
//               data.res.nivel_gobierno = nivel_gobierno;
//             }
//
//             delete data.error;
//             res.json(data);
//           });
//       })
//       .catch(error => {
//         console.log(error);
//       });
//
//     console.log("query", query);
//   }
// });
//
// router.post("/bienes_inmuebles", function(req, res, next) {
//   let { superficie_terreno ,superficie_construccion } = req.body;
//   let query = {};
//   data.sistema.nombre = "bienes_inmuebles";
//
//   if (Object.keys(req.body).length === 0) {
//     data.error = {
//       numero: 11,
//       mensaje: "Solicitud vacia"
//     };
//
//     delete data.res;
//
//     res.json(data);
//   } else {
//     if (typeof superficie_terreno !== "undefined") {
//       if (
//         typeof superficie_terreno.minimo === "undefined" ||
//         typeof superficie_terreno.maximo === "undefined"
//       ) {
//         data.error = {
//           numero: 11,
//           mensaje: "parametros incorrectos para superficie del terreno"
//         };
//
//         delete data.res;
//
//         res.json(data);
//       } else {
//         query["activos.bienes_inmuebles.superficie_terreno"] = {
//           $gte: superficie_terreno.minimo,
//           $lte: superficie_terreno.maximo
//         };
//
//         MongoClient.connect(
//           dbmongo.url,
//           {
//             useNewUrlParser: true
//           }
//         )
//           .then(client => {
//             let db = client.db(dbmongo.dbname);
//             let collection = db.collection("s1");
//
//             collection
//               .find(query, { projection: { _id: 0 } })
//               .count(function(err,count){
//                 if (err) throw err;
//
//                 data.res = {
//                   superficie_terreno: superficie_terreno,
//                   total: count
//                 };
//
//                 delete data.error;
//                 res.json(data);
//               });
//           })
//           .catch(error => {
//             console.log(error);
//           });
//       }
//     }
//
//     if (typeof superficie_construccion !== "undefined") {
//       if (
//         typeof superficie_construccion.minimo === "undefined" ||
//         typeof superficie_construccion.maximo === "undefined"
//       ) {
//         data.error = {
//           numero: 11,
//           mensaje: "parametros incorrectos para superficie del terreno"
//         };
//
//         delete data.res;
//
//         res.json(data);
//       } else {
//         query["activos.bienes_inmuebles.superficie_construccion"] = {
//           $gte: superficie_construccion.minimo,
//           $lte: superficie_construccion.maximo
//         };
//
//         MongoClient.connect(
//           dbmongo.url,
//           {
//             useNewUrlParser: true
//           }
//         )
//           .then(client => {
//             let db = client.db(dbmongo.dbname);
//             let collection = db.collection("s1");
//
//             collection
//               .find(query, { projection: { _id: 0 } })
//               .count(function(err,count){
//                 if (err) throw err;
//
//                 data.res = {
//                   superficie_construccion: superficie_construccion,
//                   total: count
//                 };
//
//                 delete data.error;
//                 res.json(data);
//               });
//           })
//           .catch(error => {
//             console.log(error);
//           });
//       }
//     }
//
//
//   }
// });
//
// router.post("/ingreso_bruto_anual", function(req, res, next) {
//   let { ingreso_bruto_anual } = req.body;
//   let query = {};
//   data.sistema.nombre = "ingreso_bruto_anual";
//
//   if (Object.keys(req.body).length === 0) {
//     data.error = {
//       numero: 11,
//       mensaje: "Solicitud vacia"
//     };
//
//     delete data.res;
//
//     res.json(data);
//
//   }
//
//   if (typeof ingreso_bruto_anual !== "undefined") {
//     if (
//       typeof ingreso_bruto_anual.minimo === "undefined" ||
//       typeof ingreso_bruto_anual.maximo === "undefined"
//     ) {
//       data.error = {
//         numero: 11,
//         mensaje: "parametros incorrectos para ingreso bruto anual"
//       };
//
//       delete data.res;
//
//       res.json(data);
//     } else {
//       query["ingresos.sueldos_salarios_publicos.ingreso_bruto_anual.valor"] = {
//         $gte: ingreso_bruto_anual.minimo,
//         $lte: ingreso_bruto_anual.maximo
//       };
//
//       MongoClient.connect(
//         dbmongo.url,
//         {
//           useNewUrlParser: true
//         }
//       )
//         .then(client => {
//           let db = client.db(dbmongo.dbname);
//           let collection = db.collection("s1");
//
//           collection
//             .find(query, { projection: { _id: 0 } })
//             .count(function(err,count){
//               if (err) throw err;
//
//               data.res = {
//                 ingreso_bruto_anual: ingreso_bruto_anual,
//                 total: count
//               };
//
//               delete data.error;
//               res.json(data);
//             });
//         })
//         .catch(error => {
//           console.log(error);
//         });
//     }
//   }
//
// });

module.exports = router;
