const jwt = require('jsonwebtoken');
// Mongoosee
const mongoose = require('mongoose');
const {ApolloServer} = require ('apollo-server')
//Shemagql
const typeDefs = require('./gql/schema.js')
//Resolvers
const resolvers = require('./gql/resolvers.js')


require("dotenv").config({ path: ".env" });

mongoose.connect(process.env.MDB,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        
    },
    (err, _) => {
        if (err) {
            console.log("error conexión");
        } else {
            server();
        }
    
    });    

function server() {
    const serverApollo = new ApolloServer({
        typeDefs,
        resolvers,
        // context: (headers) => {
        context: ({ req }) => {
            // console.log(req.headers.authorization);
            const token = req.headers.authorization;
            if (token) {
                try {
                    const user = jwt.verify(
                        token.replace("Bearer ",""),
                        //pasamos el key con el que hacemos el Token
                        process.env.SECRET_KEY
                    );
                    return {
                        user,
                    };
                } catch (error) {
                    console.log("###ERROR###");
                    console.log(error);
                    throw new Error("token invalido")
                }
            }
        }
    });

    serverApollo.listen().then(({ url }) => {
        console.log("##############################");
        console.log(`servidor listo en la url ${url}`);
        console.log("##############################");
    });
};