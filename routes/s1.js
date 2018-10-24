var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.json({
        version_api: '1.0',
        sistema: {
            id:1,
            nombre: 'Declaraciones'
        }});
});


router.get('/declaraciones', (req, res) => {
    res.json({"declaraciones": true});
});

module.exports = router;