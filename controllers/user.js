const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

/******************************************************
          Création de nouveaux utilisateurs
******************************************************/
exports.signup = (req, res, next) => {
  // On appelle la fonction de hachage de bcrypt dans notre mot de passe et on lui demande de « saler » le mot de passe 10 fois
  bcrypt.hash(req.body.password, 10)
    // Il s'agit d'une fonction asynchrone qui renvoie une Promise dans laquelle nous recevons le hash généré
    .then(hash => {
      // Ici on crée un utilisateur
      const user = new User({
        email: req.body.email,
        password: hash
      });
      // On l'enregistre dans la base de données, en renvoyant une réponse de réussite en cas de succès, et des erreurs avec le code d'erreur en cas d'échec
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

/******************************************************************************
        Vérification des informations d'identification d'un utilisateur
******************************************************************************/
exports.login = (req, res, next) => {
  // On utilise notre modèle Mongoose pour vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user === null) {
        res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
      } else {
        // On utilise la fonction compare de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
            } else {
              res.status(200).json({
                userId: user._id,
                // On utilise la fonction sign de jsonwebtoken pour chiffrer un nouveau token
                token: jwt.sign(
                  { userId: user._id },
                  // On utilise une chaîne secrète de développement temporaire RANDOM_SECRET_KEY pour crypter notre token. Elle sert de clé pour le chiffrement et le déchiffrement du token, elle doit être difficile à deviner, sinon n’importe qui pourrait générer un token en se faisant passer pour notre serveur
                  'RANDOM_TOKEN_SECRET',
                  // On définit la durée de validité du token à 24 heures. L'utilisateur devra donc se reconnecter au bout de 24 heures
                  { expiresIn: '24h' }
                )
              });
            }
          })
          .catch(error => res.status(500).json({ error }));
      }
    })
    .catch(error => { res.status(500).json({ error }) });
};
