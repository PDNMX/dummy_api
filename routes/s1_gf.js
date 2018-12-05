var express = require("express");
var router = express.Router();

var dbmongo = require("./database_config");
var profiles = require("./profiles");

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

//definición de permisos
const getPermissions = profile => {
  switch (profile) {
    case "profile_1":
      return profiles.profile_1;
    case "profile_2":
      return profiles.profile_2;
    case "profile_3":
      return profiles.profile_3;
    case "profile_4":
      return profiles.profile_4;
    default:
      return profiles.profile_3;
  }
};

router.get("/", function(req, res, next) {
  res.json({
    version_api: "2.0",
    sistema: {
      id: 1,
      nombre: "Declaraciones"
    }
  });
});

/* GET users listing. */
router.get("/declaraciones", function(req, res, next) {
  let { profile, skip, limit, id, query } = req.body;
  let permissions = getPermissions(profile);

  // console.log(permissions);
  // console.log(id);
  // console.log(req.body);

  MongoClient.connect(
    dbmongo.url,
    {
      useNewUrlParser: true
    }
  )
    .then(client => {
      let db = client.db(dbmongo.dbname);
      let collection = db.collection("s1");

      if (typeof id !== "undefined" && id !== "") {
        console.log("find for objectID ", id);
        collection
          .findOne({ _id: ObjectId(id) }, { projection: permissions })
          .then(data => {
            res.json(data);
          });
      } else {
        //console.log("query ", query);

        if (typeof query === "undefined") {
          res.json({
            version_api: "2.0",
            sistema: {
              id: 1,
              nombre: "Declaraciones"
            }
          });
        } else {
          if (
            typeof query[
              "informacion_personal.informacion_general.fecha_nacimiento"
            ] !== "undefined"
          ) {
            fec_nac =
              query[
                "informacion_personal.informacion_general.fecha_nacimiento"
              ];
            //console.log(fec_nac);
            if (Object.keys(fec_nac).length == 2) {
              if (
                typeof fec_nac.desde !== "undefined" &&
                typeof fec_nac.hasta !== "undefined"
              ) {
                query[
                  "informacion_personal.informacion_general.fecha_nacimiento_bin"
                ] = {
                  $gte: new Date(fec_nac.desde),
                  $lte: new Date(fec_nac.hasta)
                };
              }
            } else {
              query[
                "informacion_personal.informacion_general.fecha_nacimiento_bin"
              ] = new Date(fec_nac.desde + "T00:00:00.000-0600");
            }

            delete query[
              "informacion_personal.informacion_general.fecha_nacimiento"
            ];
          }

          if (
            typeof query["informacion_personal.informacion_general.nombres"] !==
            "undefined"
          ) {
            query["informacion_personal.informacion_general.nombres"] = {
              $regex: query["informacion_personal.informacion_general.nombres"],
              $options: "i"
            };
          }

          if (
            typeof query[
              "informacion_personal.informacion_general.primer_apellido"
            ] !== "undefined"
          ) {
            query[
              "informacion_personal.informacion_general.primer_apellido"
            ] = {
              $regex:
                query[
                  "informacion_personal.informacion_general.primer_apellido"
                ],
              $options: "i"
            };
          }

          if (
            typeof query[
              "informacion_personal.informacion_general.segundo_apellido"
            ] !== "undefined"
          ) {
            query[
              "informacion_personal.informacion_general.segundo_apellido"
            ] = {
              $regex:
                query[
                  "informacion_personal.informacion_general.segundo_apellido"
                ],
              $options: "i"
            };
          }

          console.log("query: ", query);

          let pagination = {
            limit: 10,
            skip: 0
          };

          if (typeof skip !== "undefined") {
            pagination.skip = isNaN(skip) ? 0 : Math.abs(skip);
          }

          if (typeof limit !== "undefined") {
            pagination.limit = isNaN(limit) ? 10 : Math.abs(limit);
          }

          //console.log(pagination);

          let curr = collection.find(query, pagination).project(permissions);

          curr.count().then(count => {
            curr.toArray((err, data) => {
              res.json({
                total: count,
                pagination: pagination,
                results: data
              });
              client.close();
            });
          });
        }
      }
    })
    .catch(error => {
      console.log(error);
    });
});

module.exports = router;
