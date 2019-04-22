var express = require("express");
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

/* GET users listing. */

router.get("/", function(req, res, next) {
  data.sistema.nombre = "Estadisticas";

  res.json(data);
});

router.post("/edad", function(req, res, next) {
  let { edad, tipo } = req.body;
  let query = {};
  let date = new Date();
  let year = parseInt("28", 10);

  if (
    typeof edad === "undefined" ||
    typeof edad.menor === "undefined" ||
    typeof edad.mayor === "undefined"
  ) {
    data.sistema.nombre = "edad";
    data.error = {
      numero: 10,
      mensaje: "numero de parametros de edad incorrecto"
    };

    res.json(data);
  } else {
    let _fInicio = getFechaNacimiento(edad.mayor);
    let _fFin = getFechaNacimiento(edad.menor, true);

    query["informacion_personal.informacion_general.fecha_nacimiento_bin"] = {
      $gte: _fInicio,
      $lte: _fFin
    };

    if (typeof tipo === "undefined") {
      MongoClient.connect(
        dbmongo.url,
        {
          useNewUrlParser: true
        }
      )
        .then(client => {
          let db = client.db(dbmongo.dbname);
          let col = db.collection("s1");

          col
            .aggregate([
              { $match: query },
              { $group: { _id: "edad", total: { $sum: 1 } } }
            ])
            .toArray(function(err, docs) {
              console.log(err);
              console.log(docs);

              data.sistema.nombre = "edad";
              data.res = {
                edad: edad,
                total: docs[0].total
              };

              res.json(data);
            });
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      switch (tipo) {
        case "nivelGobierno":
          MongoClient.connect(
            dbmongo.url,
            {
              useNewUrlParser: true
            }
          )
            .then(client => {
              let db = client.db(dbmongo.dbname);
              let col = db.collection("s1");

              col
                .aggregate([
                  { $match: query },
                  {
                    $group: {
                      _id:
                        "$informacion_personal.datos_encargo_actual.nivel_gobierno.valor",
                      total: { $sum: 1 }
                    }
                  }
                ])
                .toArray(function(err, docs) {
                  console.log(docs);

                  let tot = {};

                  tot = docs.map(doc => {
                    return { nivel: doc._id, total: doc.total };
                  });

                  data.sistema.nombre = "edad";
                  data.res = {
                    edad: edad,
                    total: tot
                  };

                  res.json(data);
                });
            })
            .catch(error => {
              console.log(error);
            });
          break;
        case "nivelEducativo":
          MongoClient.connect(
            dbmongo.url,
            {
              useNewUrlParser: true
            }
          )
            .then(client => {
              let db = client.db(dbmongo.dbname);
              let col = db.collection("s1");

              col
                .aggregate([
                  { $match: query },
                  {
                    $group: {
                      _id:
                        "$informacion_personal.datos_curriculares.grado_maximo_escolaridad.valor",
                      total: { $sum: 1 }
                    }
                  }
                ])
                .toArray(function(err, docs) {
                  console.log(docs);

                  let tot = {};

                  tot = docs.map(doc => {
                    return { nivel: doc._id, total: doc.total };
                  });

                  data.sistema.nombre = "edad";
                  data.res = {
                    edad: edad,
                    total: tot
                  };

                  res.json(data);
                });
            })
            .catch(error => {
              console.log(error);
            });
          break;
        default:
      }
    }

    console.log("query", query);
  }
});

router.post("/nivel_gobierno", function(req, res, next) {
  let { nivel_gobierno, grado_obtenido, edad } = req.body;
  let query = {};

  console.log("req.body", req.body);

  if (typeof nivel_gobierno === "undefined") {
    data.sistema.nombre = "nivel_gobierno";
    data.error = {
      numero: 11,
      mensaje: "parametros incorrectos"
    };

    res.json(data);
  } else {
    query[
      "informacion_personal.datos_encargo_actual.nivel_gobierno.valor"
    ] = nivel_gobierno;

    if (typeof grado_obtenido !== "undefined") {
      query[
        "informacion_personal.datos_curriculares.grado_maximo_escolaridad.valor"
      ] = grado_obtenido;
    }

    if (typeof edad !== "undefined") {
      if (
        typeof edad.menor === "undefined" ||
        typeof edad.mayor === "undefined"
      ) {
        data.sistema.nombre = "nivel_gobierno";
        data.error = {
          numero: 10,
          mensaje: "numero de parametros de edad incorrecto"
        };

        res.json(data);
      } else {
        let _fInicio = getFechaNacimiento(edad.mayor);
        let _fFin = getFechaNacimiento(edad.menor, true);

        query[
          "informacion_personal.informacion_general.fecha_nacimiento_bin"
        ] = {
          $gte: _fInicio,
          $lte: _fFin
        };
      }
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

        collection
          .find(query, { projection: { _id: 0 } })
          .count(function(err, count) {
            if (err) throw err;

            data.sistema.nombre = "nivel_gobierno";
            data.res = {
              edad: edad,
              nivel_gobierno: nivel_gobierno,
              total: count
            };

            if (typeof grado_obtenido !== "undefined") {
              data.res.grado_obtenido=grado_obtenido;
            }

            res.json(data);
          });
      })
      .catch(error => {
        console.log(error);
      });

    console.log("query", query);
  }
});

router.post("/entidad_federativa", function(req, res, next) {
  let { entidad_federativa } = req.body;
  let query = {};

  console.log("req.body", req.body);

  if (typeof entidad_federativa === "undefined") {
    data.sistema.nombre = "entidad_federativa";
    data.error = {
      numero: 11,
      mensaje: "parametros incorrectos"
    };

    delete data.res;

    res.json(data);
  } else {
    query[
      "informacion_personal.datos_encargo_actual.direccion_encargo.entidad_federativa.nom_agee"
    ] = entidad_federativa;

    MongoClient.connect(
      dbmongo.url,
      {
        useNewUrlParser: true
      }
    )
      .then(client => {
        let db = client.db(dbmongo.dbname);
        let collection = db.collection("s1");

        collection
          .find(query, { projection: { _id: 0 } })
          .count(function(err, count) {
            if (err) throw err;

            data.sistema.nombre = "entidad_federativa";
            data.res = {
              entidad_federativa: entidad_federativa,
              total: count
            };

            delete data.error;
            console.log(data);

            res.json(data);
          });
      })
      .catch(error => {
        console.log(error);
      });

    console.log("query", query);
  }
});

router.post("/grado_obtenido", function(req, res, next) {
  let { grado_obtenido, nivel_gobierno, edad } = req.body;
  let query = {};

  console.log("req.body", req.body);

  if (typeof grado_obtenido === "undefined") {
    data.sistema.nombre = "grado_obtenido";
    data.error = {
      numero: 11,
      mensaje: "parametros incorrectos"
    };

    delete data.res;

    res.json(data);
  } else {
    query[
      "informacion_personal.datos_curriculares.grado_maximo_escolaridad.valor"
    ] = grado_obtenido;

    if (typeof nivel_gobierno !== "undefined") {
      query[
        "informacion_personal.datos_encargo_actual.nivel_gobierno.valor"
      ] = nivel_gobierno;
    }

    if (typeof edad !== "undefined") {
      if (
        typeof edad.menor === "undefined" ||
        typeof edad.mayor === "undefined"
      ) {
        data.sistema.nombre = "grado_obtenido";
        data.error = {
          numero: 10,
          mensaje: "numero de parametros de edad incorrecto"
        };

        delete data.res;
        res.json(data);
      } else {
        let _fInicio = getFechaNacimiento(edad.mayor);
        let _fFin = getFechaNacimiento(edad.menor, true);

        query[
          "informacion_personal.informacion_general.fecha_nacimiento_bin"
        ] = {
          $gte: _fInicio,
          $lte: _fFin
        };
      }
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

        collection
          .find(query, { projection: { _id: 0 } })
          .count(function(err, count) {
            if (err) throw err;

            data.sistema.nombre = "grado_obtenido";
            data.res = {
              edad: edad,
              grado_obtenido: grado_obtenido,
              total: count
            };

            if (typeof nivel_gobierno !== "undefined") {
              data.res.nivel_gobierno = nivel_gobierno;
            }

            delete data.error;
            res.json(data);
          });
      })
      .catch(error => {
        console.log(error);
      });

    console.log("query", query);
  }
});

router.post("/bienes_inmuebles", function(req, res, next) {
  let { superficie_terreno ,superficie_construccion } = req.body;
  let query = {};
  data.sistema.nombre = "bienes_inmuebles";

  if (Object.keys(req.body).length === 0) {
    data.error = {
      numero: 11,
      mensaje: "Solicitud vacia"
    };

    delete data.res;

    res.json(data);
  } else {
    if (typeof superficie_terreno !== "undefined") {
      if (
        typeof superficie_terreno.menor === "undefined" ||
        typeof superficie_terreno.mayor === "undefined"
      ) {
        data.error = {
          numero: 11,
          mensaje: "parametros incorrectos para superficie del terreno"
        };

        delete data.res;

        res.json(data);
      } else {
        query["activos.bienes_inmuebles.superficie_terreno"] = {
          $gte: superficie_terreno.menor,
          $lte: superficie_terreno.mayor
        };

        MongoClient.connect(
          dbmongo.url,
          {
            useNewUrlParser: true
          }
        )
          .then(client => {
            let db = client.db(dbmongo.dbname);
            let collection = db.collection("s1");

            collection
              .find(query, { projection: { _id: 0 } })
              .count(function(err,count){
                if (err) throw err;

                data.res = {
                  superficie_terreno: superficie_terreno,
                  total: count
                };

                delete data.error;
                res.json(data);
              });
          })
          .catch(error => {
            console.log(error);
          });
      }
    }

    if (typeof superficie_construccion !== "undefined") {
      if (
        typeof superficie_construccion.menor === "undefined" ||
        typeof superficie_construccion.mayor === "undefined"
      ) {
        data.error = {
          numero: 11,
          mensaje: "parametros incorrectos para superficie del terreno"
        };

        delete data.res;

        res.json(data);
      } else {
        query["activos.bienes_inmuebles.superficie_construccion"] = {
          $gte: superficie_construccion.menor,
          $lte: superficie_construccion.mayor
        };

        MongoClient.connect(
          dbmongo.url,
          {
            useNewUrlParser: true
          }
        )
          .then(client => {
            let db = client.db(dbmongo.dbname);
            let collection = db.collection("s1");

            collection
              .find(query, { projection: { _id: 0 } })
              .count(function(err,count){
                if (err) throw err;

                data.res = {
                  superficie_construccion: superficie_construccion,
                  total: count
                };

                delete data.error;
                res.json(data);
              });
          })
          .catch(error => {
            console.log(error);
          });
      }
    }


  }
});

router.post("/ingreso_bruto_anual", function(req, res, next) {
  let { ingreso_bruto_anual } = req.body;
  let query = {};
  data.sistema.nombre = "ingreso_bruto_anual";

  if (Object.keys(req.body).length === 0) {
    data.error = {
      numero: 11,
      mensaje: "Solicitud vacia"
    };

    delete data.res;

    res.json(data);

  }

  if (typeof ingreso_bruto_anual !== "undefined") {
    if (
      typeof ingreso_bruto_anual.menor === "undefined" ||
      typeof ingreso_bruto_anual.mayor === "undefined"
    ) {
      data.error = {
        numero: 11,
        mensaje: "parametros incorrectos para ingreso bruto anual"
      };

      delete data.res;

      res.json(data);
    } else {
      query["ingresos.sueldos_salarios_publicos.ingreso_bruto_anual.valor"] = {
        $gte: ingreso_bruto_anual.menor,
        $lte: ingreso_bruto_anual.mayor
      };

      MongoClient.connect(
        dbmongo.url,
        {
          useNewUrlParser: true
        }
      )
        .then(client => {
          let db = client.db(dbmongo.dbname);
          let collection = db.collection("s1");

          collection
            .find(query, { projection: { _id: 0 } })
            .count(function(err,count){
              if (err) throw err;

              data.res = {
                ingreso_bruto_anual: ingreso_bruto_anual,
                total: count
              };

              delete data.error;
              res.json(data);
            });
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

});

module.exports = router;
