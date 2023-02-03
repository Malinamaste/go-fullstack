const express = require('express');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const router = express.Router();

// On importe notre Controller Stuff :
const stuffCtrl = require('../controllers/stuff');

/******************************************************************
          Récupération de la liste de Things en vente
******************************************************************/
router.get('/', auth, stuffCtrl.getAllThings);

/******************************************************************
        Enregistrement des Things dans la base de données
******************************************************************/
router.post('/', auth, multer, stuffCtrl.createThing);

/******************************************************
          Récupération d'un Thing spécifique
******************************************************/
router.get('/:id', auth, stuffCtrl.getOneThing);

/******************************************************
          Mettez à jour un Thing existant
******************************************************/
router.put('/:id', auth, multer, stuffCtrl.modifyThing);

/******************************************
          Suppression d'un Thing
******************************************/
router.delete('/:id', auth, stuffCtrl.deleteThing);

// On exporte le router de ce fichier
module.exports = router;
