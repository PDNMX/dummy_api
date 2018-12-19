var express = require("express");
var router = express.Router();

var dbmongo = require("./database_config");

const MongoClient = require("mongodb").MongoClient;

/* GET users listing. */
router.get("/", function(req, res, next) {
  let { codigo, valor } = req.query;

  let query = {};

  if (typeof valor !== "undefined") {
    query.valor = {
      $regex: valor,
      $options: "i"
    };
  }

  if (typeof codigo !== "undefined") {
    query.codigo = codigo;
  }

  console.log(req.query);
  console.log(query);

  MongoClient.connect(
    dbmongo.url,
    {
      useNewUrlParser: true
    }
  )
    .then(client => {
      let db = client.db(dbmongo.dbname);
      let collection = db.collection("catMedidasPlazos");

      collection
        .find(query, { projection: { _id: 0 } })
        .toArray(function(err, result) {
          if (err) throw err;
          res.json(result);
        });
    })
    .catch(error => {
      console.log(error);
    });
});

module.exports = router;
