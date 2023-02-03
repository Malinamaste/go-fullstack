const express = require('express');
const app = express();
// On importe Mongoose dans notre fichier :
const mongoose = require('mongoose');

// On importe nos routers :
const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');

// Pour accéder au path de notre serveur :
const path = require('path');

/*********************************************************
        Connexion à la base de données Mongoose
*********************************************************/
mongoose.connect('mongodb+srv://malinamaste:niokman4ever@cluster0.g6opnco.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

/******************************************************************
        Erreurs de CORS : « Cross Origin Resource Sharing »
******************************************************************/
// Pour permettre des requêtes cross-origin (et empêcher des erreurs CORS), des headers spécifiques de contrôle d'accès doivent être précisés pour tous nos objets de réponse.

// Ces headers permettent :
app.use((req, res, next) => {
  // d'accéder à notre API depuis n'importe quelle origine ( '*' )
  res.setHeader('Access-Control-Allow-Origin', '*');
  // d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.)
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  // d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Pour gérer la requête POST venant de l'application front-end on a besoin d'en extraire le corps JSON. Pour cela, vous avez juste besoin d'un middleware très simple, mis à disposition par le framework Express
app.use(express.json());
// Avec ceci, Express prend toutes les requêtes qui ont comme Content-Type application/json et met à disposition leur body directement sur l'objet req.

// Pour ces routes là, on utlise ces routers :
app.use('/api/stuff', stuffRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
