const { Sequelize } = require("sequelize")

// Paramètres de connection
const sequelize = new Sequelize( "sequelize-p7", "root", "noobolife75z$", {
    host:"localhost",
    dialect:"mysql"
})

// authenticate va vérifier si la connection à la DB est ok, puis sync va synchroniser les modèles, sinon, le catch renvoie une erreur
sequelize.authenticate()
    .then(() => {
        console.log("Database connectée!")
        // { force: true }
        // {alter: true}
        sequelize.sync({alter: true})
            .then( sync => {
                console.log("Modèles synchronisés!")
            })
            .catch(error => {
                console.log("Erreur de synchronisation des modèles!" + error)
            })
    }).catch(error => {
        console.log("Non connecté!" + error)
    })

module.exports = sequelize