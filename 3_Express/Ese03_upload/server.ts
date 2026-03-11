//A. import delle librerie
import http from "http";
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import queryStringParser from "./queryParser";
import cors from "cors";
import fileupload from "express-fileupload";
import fileManager from "./fileManager";
//B. configurazioni
//riconosce i tipi automaticamente (non è any) -> grazie @types/node in devDependencies (sviluppo)
const app = express();
//stessa cosa -> const app: express.Express = express();
dotenv.config({ path: ".env" });
const connStr = process.env.connectionStringAtlas;
const port = parseInt(process.env.PORT!);
const dbName = process.env.dbName;

//C. creazione ed avvio del server HTTP
const server: http.Server = http.createServer(app);
let paginaErr = "";

//server in ascolto sulla porta 1337
server.listen(port, function () {
    console.log("Server in ascolto sulla porta " + port);

    fs.readFile("./static/error.html", function (err, content) { //content è una sequenza di byte
        if (err)
            paginaErr = "<h1>Risorsa non trovata</h1>";
        else
            paginaErr = content.toString();
    })
});

//D. middleware
//middleware 1: request log
app.use(function (req, res, next) //se si omette => come risorsa "/"
{
    console.log("Ricevuta richiesta: " + req.method + ": " + req.originalUrl);
    next(); //passa al middleware successivo
});

//middleware 2: gestione delle risorse statiche
app.use(express.static("./static"));

//middleware 3: gestione dei parametri post
app.use(express.json({ "limit": "5mb" })); //i parametri post sono restituiti in req.body
//i parametri get invece sono restituiti come json in req.query

//middleware 4: parsing dei parametri GET
app.use("/", queryStringParser);

app.use(fileupload({
    limits: { fileSize: 20 * 1024 * 1024 }, //20 MB
  
}));
//middleware 5: log dei parametri post
app.use("/", (req, res, next) => {
    if (req.query && Object.keys(req.query).length > 0)
        console.log("Parametri query: " + JSON.stringify(req.query));
    if (req.body && Object.keys(req.body).length > 0)
        console.log("Parametri route: " + JSON.stringify(req.body));
    next();
});

//middleware 6: Vincoli CORS (controlli lato server che consentono di accettare richieste anche da fuori dal dominio -> cioè diverso dal server da cui arrivano le pagine)
const corsOptions = {
    origin: function (origin: any, callback: any) {
        return callback(null, true);
    },
    credentials: true
};
app.use("/", cors(corsOptions));




app.get("/api/users", async (req, res, next) => {


    const client = new MongoClient(connStr!);
    await client.connect().catch(err => {
        res.status(503).send("Errore di connessione al DBMS")
        return;
    });

    const collection = client.db(dbName).collection("users");

    const cmd = collection.find({}).toArray();

    //restituisce elenco delle collezioni del db (formato JSON)
    const data = await cmd.catch(err => res.status(500).send("Errore di connessione al dbms: " + err));

    res.send(data);

    client.close();
})




app.post("/api/saveBinary", async (req, res, next) => {
    // 1. I campi di testo rimangono in req.body
    const user = req.body.user; 

    // 2. I file caricati finiscono in req.files
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("Nessun file caricato.");
    }

    // "blob" è il nome del campo usato nel FormData del frontend
    const uploadedFile = req.files.blob as any; 

    // 3. Passiamo i dati corretti al fileManager (uploadedFile.data è il buffer)
    const filename = await fileManager.saveBinary(uploadedFile.name, uploadedFile.data).catch(function(err){
        res.status(500).send(err);
        return null;
    });

    if (filename) {
        const newUser = {
            "username": user,
            "img": filename
        };
        aggiornaDB(newUser, res);
    }
});

async function aggiornaDB(newUser:{},res:any){
    const client = new MongoClient(connStr!);
    await client.connect().catch(err => {
        res.status(503).send("Errore di connessione al DBMS")
        return;
    });

    const collection = client.db(dbName).collection("users");

    const cmd = collection.insertOne(newUser);

    //restituisce elenco delle collezioni del db (formato JSON)
    const data = await cmd.catch(err => res.status(500).send("Errore di connessione al dbms: " + err));

    res.send(data);

    client.close();
}

app.post("/api/saveBase64", async function (req: any, res: any) {
    const user = req.body.user;
    const filename = req.body.filename;
    const imgPayload = req.body.img; // Nel frontend avevi usato 'img'

    if (!user || !imgPayload) {
        return res.status(400).send("Dati mancanti (user o immagine)");
    }

    // 1. Salvataggio fisico dell'immagine tramite fileManager
    // Presumiamo che fileManager abbia un metodo saveBase64 
    // che gestisce la rimozione dell'header "data:image/png;base64,"
    const finalFilename = await fileManager.saveBase64(filename, imgPayload).catch(function (err) {
        res.status(500).send("Errore nel salvataggio del file: " + err);
        return null;
    });

    // 2. Se il salvataggio è riuscito, aggiorniamo il DB
    if (finalFilename) {
        const newUser = {
            "username": user,
            "img": finalFilename
        };
        aggiornaDB(newUser, res);
    }
});

app.post("/api/saveBase64Cloudinary", async function (req: any, res: any) {
    const user = req.body.user;
    const filename = req.body.filename;
    const imgBase64 = req.body.img;

    const result = await fileManager.saveBase64Cloudinary(filename, imgBase64).catch(function (err) {
        res.status(500).send("Errore nel salvataggio del file: " + err);
        return null;
    });

    if (result) {
        const newUser = {
            "username": user,
            "img": result.secure_url //nome immagine
        };
        aggiornaDB(newUser, res);
    }
});

//F. default root e gestione errori
app.use(function(req, res){    
    if(req.originalUrl.startsWith("/api/"))
        res.status(404).send("Risorsa non trovata");
    else if(req.accepts("html")) // se la richiesta è per una pagina html
        res.status(404).send(paginaErr);
    else
        res.sendStatus(404);
        // res.status(404).send(); equivalente
});

//G. gestione errori
app.use(function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.error("*** ERRORE ***:\n" + err.stack); //elenco completo degli errori
    res.status(500).send("Errore interno del server");
});