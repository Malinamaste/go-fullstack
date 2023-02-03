// On importe le Thing car on l'utilise ici :
const Thing = require('../models/thing');
const fs = require('fs');

/******************************************************************
        Enregistrement des Things dans la base de données
******************************************************************/

// Ici on crée une instance de notre modèle Thing en lui passant un objet JavaScript contenant toutes les informations requises du corps de requête analysé (en ayant supprimé en amont le faux_id envoyé par le front-end)
exports.createThing = (req, res, next) => {
  const thingObject = JSON.parse(req.body.thing);
  delete thingObject._id;
  delete thingObject._userId;

  const thing = new Thing({
    ...thingObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  thing.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) });
};

/******************************************************
          Mettez à jour un Thing existant
******************************************************/

exports.modifyThing = (req, res, next) => {
  // On crée un objet thingObject qui regarde si req.file existe ou non
  const thingObject = req.file ? {
    ...JSON.parse(req.body.thing),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete thingObject._userId;
  Thing.findOne({ _id: req.params.id })
    .then((thing) => {
      if (thing.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/******************************************
          Suppression d'un Thing
******************************************/

// La méthode deleteOne() de notre modèle fonctionne comme findOne() et updateOne() dans le sens où nous lui passons un objet correspondant au document à supprimer. On envoie ensuite une réponse de réussite ou d'échec au front-end !
exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then(thing => {
      if (thing.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = thing.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Thing.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

/******************************************************
          Récupération d'un Thing spécifique
******************************************************/

// Dans cette route on utilise la méthode get() pour répondre uniquement aux demandes GET à cet endpoint ET on utilise les deux-points : en face du segment dynamique de la route pour la rendre accessible en tant que paramètre (ici id)
exports.getOneThing = (req, res, next) => {
  // on utilise la méthode findOne() dans notre modèle Thing pour trouver le Thing unique ayant le même _id que le paramètre de la requête
  Thing.findOne({ _id: req.params.id })
    // ce Thing est ensuite retourné dans une Promise et envoyé au front-end
    .then(thing => res.status(200).json(thing))
    // si aucun Thing n'est trouvé ou si une erreur se produit on renvoie une erreur 404 au front-end avec l'erreur générée
    .catch(error => res.status(404).json({ error }));
}

/******************************************************************
          Récupération de la liste de Things en vente
******************************************************************/

// On implémente notre route GET afin qu'elle renvoie tous les Things dans la base de données
exports.getAllThings = (req, res, next) => {
  // On utilise la méthode find() dans notre modèle Mongoose afin de renvoyer un tableau contenant tous les Things dans notre base de données. À présent, si on ajoute un Thing il doit s'afficher immédiatement sur notre page d'articles en vente.
  Thing.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
};
