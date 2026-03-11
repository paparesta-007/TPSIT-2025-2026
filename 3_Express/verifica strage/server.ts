//A. import delle librerie
import http from "http";
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import queryStringParser from "./queryStringParser";
import cors from "cors";

//B. configurazioni
//riconosce i tipi automaticamente (non è any) -> grazie @types/node in devDependencies (sviluppo)
const app = express();
//stessa cosa -> const app: express.Express = express();
dotenv.config({ path: ".env" });
const connStr = process.env.connectionStringLocal;
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

//middleware 5: log dei parametri
app.use((req: any, res, next) => {
    if (req.body && Object.keys(req.body).length > 0)
        console.log("   Parametri body: " + JSON.stringify(req.body));

    if (req["parsedQuery"] && Object.keys(req["parsedQuery"]).length > 0)
        console.log("   Parametri query: " + JSON.stringify(req["parsedQuery"]));

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

app.post("/api/login", async function (req, res) {
    let username = req.body.username
    let pwd = req.body.pwd

    // console.log("Dati:"+username+" "+pwd)
    const client = new MongoClient(connStr!);
    try {
        await client.connect()
        const db = client.db(dbName);
        const user = await db.collection("studenti").findOne({ user:username, pwd })
        if (user) {
            res.status(200)
            res.send(user)
        }
        else {
            res.status(401).send("Credenziali non valide");
        }
    } catch (error:any) {
        console.error("Errore DB Login:", error.message); 
        res.status(500).send("Errore interno del server: " + error.message);
    }
    finally{
        await client.close()
    }
})

app.get("/api/getDomande", async function (req, res) {
    const client = new MongoClient(connStr!);
    try {
        await client.connect()
        const db = client.db(dbName);
        const domande = await db.collection("domande").find().project(
            {
                correct:0,
                _id:0
            }
        ).toArray()
        
        if (domande) {
            res.status(200)
            res.send(domande)
        }
        else {
            res.status(500).send("Errore");
        }
    } catch (error:any) {
        console.error("Errore DB Login:", error.message); 
        res.status(500).send("Errore interno del server: " + error.message);
    }
    finally{
        await client.close()
    }
})

app.post("/api/inviaRisposte", async function (req, res) {
    let idStudente=req.body.idStudente
    let risposte=req.body.risposte

    console.log("Arrivati i dati di:"+idStudente+" "+risposte)

    // console.log("Dati:"+username+" "+pwd)
    const client = new MongoClient(connStr!);
    let punteggio=0
    try {
        await client.connect()
        const db = client.db(dbName);
        const domande = await db.collection("domande").find().project({}
        ).toArray()
        
        if (domande) {
            for(const risposta of risposte){
                let idDomanda=risposta.idDomanda
                const domanda=domande.find(domanda=>domanda.id==idDomanda)
                let indiceRisposta=risposta.indiceRisposta
                if(indiceRisposta==domanda?.correct)
                    punteggio+=1
                else{
                    punteggio-=0.25
                }

            }
            res.send(punteggio)
            res.status(200)
        }
        else {
            res.status(500).send("Errore");
        }
    } catch (error:any) {
        console.error("Errore DB Login:", error.message); 
        res.status(500).send("Errore interno del server: " + error.message);
    }
    finally{
        await client.close()
    }
})
app.post("/api/inviaPunteggio",async function (req, res) {
    let punteggio=req.body.punteggio
    let idStudente=req.body.idStudente
    const client=new MongoClient(connStr!)
     try {
        await client.connect()
        const db = client.db(dbName);
        const risultato = await db.collection("studenti").updateOne(
            {id:idStudente},
            {$set:{voto:punteggio}}

        )
        
        if (risultato) {
            res.status(200)
            res.send(risultato)
        }
        else {
            res.status(500).send("Errore");
        }
    } catch (error:any) {
        console.error("Errore DB Login:", error.message); 
        res.status(500).send("Errore interno del server: " + error.message);
    }
    finally{
        await client.close()
    }
})
//F. default root e gestione errori
app.use(function (req, res) {
    res.status(404);

    if (!req.originalUrl.startsWith("/api/"))
        res.send(paginaErr);
    else
        res.send("Risorsa non trovata");
});

//G. gestione errori
app.use(function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.error("*** ERRORE ***:\n" + err.stack); //elenco completo degli errori
    res.status(500).send("Errore interno del server");
});