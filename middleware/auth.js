const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Étant donné que de nombreux problèmes peuvent se produire, nous insérons tout à l'intérieur d'un bloc try...catch
  try {
    // On extrait le token du header Authorization de la requête entrante. Il contient également le mot-clé Bearer. On utilise donc la fonction split() pour tout récupérer après l'espace dans le header.
    const token = req.headers.authorization.split(' ')[1];
    // On utilise la fonction verify pour décoder notre token. Si celui-ci n'est pas valide, une erreur sera générée
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    // On extrait l'ID utilisateur de notre token et on le rajoute à l’objet Request afin que nos différentes routes puissent l’exploiter.
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId
    };
    next();
    // Les erreurs générées ici s'afficheront dans le bloc catch
  } catch (error) {
    res.status(401).json({ error });
  }
};
