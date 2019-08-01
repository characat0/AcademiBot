const express = require('express');
const router = express.Router();
const request = require('request');
const middleware = require('../src/middleware');

router.get('/', middleware.activeSession, (req, res) => {
  request(process.env.URL + "webhook/muestra/facultades/"+process.env.PROCESS_KEY, (err, response, body) => {
    console.log(body);
    const raw = JSON.parse(body);
    const facultades = raw.map(facu => {
      return {
        id: facu.id,
        directorio: facu.directorio
      };
    });

    res.render('clasificacion', {facultades: JSON.stringify(facultades), Material:""});
  })
});

router.post('/', middleware.activeSession, (req, res) => {
  console.log(req.body);
});
module.exports = router;