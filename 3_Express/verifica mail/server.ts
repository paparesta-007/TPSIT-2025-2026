//A. import delle librerie
import http from "http";
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import queryStringParser from "./queryParser";
import cors from "cors";
import fileManager from "./fileManager"
//B. configurazioni
//riconosce i tipi automaticamente (non è any) -> grazie @types/node in devDependencies (sviluppo)
const app = express();
//stessa cosa -> const app: express.Express = express();
// dotenv.config({ path: ".env" });
// const connStr = process.env.connectionStringLocal;
// console.log(connStr)
const port = 3000;
// const dbName = process.env.dbName;
const connStr = "mongodb://localhost:27017";
const dbName = "mail";
//C. creazione ed avvio del server HTTP
const server: http.Server = http.createServer(app);
let paginaErr = "";

//server in ascolto sulla porta 1337
server.listen(port, function(){
    console.log("Server in ascolto sulla porta " + port);

    fs.readFile("./static/error.html", function(err, content){ //content è una sequenza di byte
        if(err)
            paginaErr = "<h1>Risorsa non trovata</h1>";
        else
            paginaErr = content.toString();
    })
});

//D. middleware
//middleware 1: request log
app.use(function(req, res, next) //se si omette => come risorsa "/"
{
    console.log("Ricevuta richiesta: " + req.method + ": " + req.originalUrl);
    next(); //passa al middleware successivo
});

//middleware 2: gestione delle risorse statiche
app.use(express.static("./static"));

//middleware 3: gestione dei parametri post
app.use(express.json({"limit": "5mb"})); //i parametri post sono restituiti in req.body
//i parametri get invece sono restituiti come json in req.query

//middleware 4: parsing dei parametri GET
app.use("/", queryStringParser);

//middleware 5: log dei parametri post
app.use("/", (req, res, next) => {
    if(req.query && Object.keys(req.query).length > 0)
        console.log("Parametri query: " + JSON.stringify(req.query));
    if(req.body && Object.keys(req.body).length > 0)
        console.log("Parametri route: " + JSON.stringify(req.body));
    next();
});

//middleware 6: Vincoli CORS (controlli lato server che consentono di accettare richieste anche da fuori dal dominio -> cioè diverso dal server da cui arrivano le pagine)
const corsOptions = {
    origin: function(origin: any, callback: any) {
        return callback(null, true);
    },
    credentials: true
};
app.use("/", cors(corsOptions));


//E. gestione delle root dinamiche
// Cambiato in app.post
app.post("/api/login", async function(req, res) {
    // Nota: i dati arrivano in req.body.loginData se inviati come oggetto annidato
    console.log("Prova")
    console.log(req.body.username)
    const formData= req.body.loginData;

    let username=req.body.username
    let pwd=req.body.pwd
    const client = new MongoClient(connStr!);

    try {
        await client.connect();
        const db = client.db(dbName);
        const user = await db.collection("mail").findOne({ username, password:pwd });

        if (user) {
            res.status(200).send(user);
        } else {
            res.status(401).send("Credenziali non valide");
        }
    } catch (err) {
        res.status(500).send("Errore interno");
    } finally {
        await client.close();
    }
});

app.post("/api/sendEmail", async function(req, res) {
    const { to, from, subject, message, attachment } = req.body;
    const client = new MongoClient(connStr!);

    try {
        await client.connect();
        const db = client.db(dbName);

        // 1. Creiamo l'oggetto mail rispettando la struttura del tuo DB
        const nuovaMail = {
            "from": from,
            "subject": subject,
            "body": message,
            "attachment": attachment || "" // Stringa vuota se non c'è allegato
        };
        console.log(nuovaMail)
        // 2. Eseguiamo il $push cercando l'utente tramite il campo 'username' (che è il destinatario 'to')
        const result = await db.collection("mail").updateOne(
            { "username": to }, 
            { "$push" : { "mail": nuovaMail } as any}
        );

        if (result.matchedCount > 0) {
            res.status(200).send({ "message": "Email inviata con successo" });
        } else {
            res.status(404).send({ "message": "Destinatario non trovato" });
        }

    } catch (err: any) {
        console.error("Errore:", err.message);
        res.status(500).send("Errore interno del server");
    } finally {
        await client.close();
    }
});
//F. default root e gestione errori
app.use(function(req, res){
    res.status(404);
    
    if(!req.originalUrl.startsWith("/api/"))
        res.send(paginaErr);
    else
        res.send("Risorsa non trovata");
});

//G. gestione errori
app.use(function(err: Error, req: express.Request, res: express.Response, next: express.NextFunction){
    console.error("*** ERRORE ***:\n" + err.stack); //elenco completo degli errori
    res.status(500).send("Errore interno del server");
});