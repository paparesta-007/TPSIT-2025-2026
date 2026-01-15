"use strict";

// A) importing librerie
import http from "http";
import url from "url";
import fs from "fs";
import express from "express";
import {MongoClient} from "mongodb"
// B) configurazione server
const port: number = 3000;
let paginaErr: string = "";
const app: express.Express = express();
const connectionstring:string="mongodb://localhost:27017"
const dbName:string="unicorns"
//app sarebbe funzione di callback per la creazione del server





// C) creazione server
const server: http.Server = http.createServer(app);

server.listen(port, function () {
    console.log("Server in ascolto sulla porta " + port);

    fs.readFile("./static/error.html", function (err, content) {
        if (err)
            paginaErr = "<h1>Risorsa non trovata</h1>";
        else
            paginaErr = content.toString();
    });
    
});





// D) middleware
//1. request log
app.use("/", function (req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log("Metodo: " + req.method);
    console.log("Original URL: " + req.originalUrl);
    next();
})

// 2. Gestione risorse statiche
app.use("/", express.static("./static"));

// 3. Lettura dei parametri POST
// i parametri post sono restituiti come json all'interno di req.body
// i parametri get sono restituiti come json all'interno di req.query
app.use("/", express.json({ limit: "10mb" }));

app.use("/", function (req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.body && Object.keys(req.body).length > 0) {
        console.log("-------------------\nParametri post: " + JSON.stringify(req.body));
    }
    next();
})

app.get("/api/getUnicorns", async (req, res) => {
    const gender = req.query.gender?.toString();
    const client = new MongoClient(connectionstring);

    try {
        await client.connect();
        const collection = client.db(dbName).collection("unicorns");

        const data = await collection
            .find({ gender: gender })
            .project({_id:0, name: 1, loves: 1, hair:1, weight:1 })
            .sort({ name: 1 })
            .toArray();

        res.status(200).send(data);
    } catch (err) {
        console.error("Errore server:", err);
        res.status(500).send({ err: "Errore esecuzione query o connessione" });
    } finally {
        await client.close();
    }
});

app.post("/api/addUnicorn", async (req, res) => {
    const unicorn = req.body;
    const client = new MongoClient(connectionstring);

    try {
        await client.connect();
        const collection = client.db(dbName).collection("unicorns");

        const result = await collection.insertOne(unicorn);
        res.status(200).send(result);
    } catch (err) {
        console.error("Errore server:", err);
        res.status(500).send({ err: "Errore esecuzione query o connessione" });
    } finally {
        await client.close();
    }
});

app.patch("/api/updateUnicorn", async (req, res) => {
    const name = req.body.name?.toString();
    const loves = req.body.loves
    const client = new MongoClient(connectionstring);

    try {
        await client.connect();
        const collection = client.db(dbName).collection("unicorns");
        const result = await collection.updateOne(
            { name: name },
            { $set: { loves: loves } }
        );
        res.status(200).send(result);
    }
    catch (err) {
        console.error("Errore server:", err);
        res.status(500).send({ err: "Errore esecuzione query o connessione" });
    }
    finally {
        await client.close();
    }
});

app.delete("/api/deleteUnicorn",async function (req,res) {
    const name=req.body.name?.toString();
    const client = new MongoClient(connectionstring);

    try {
        await client.connect();
        const collection = client.db(dbName).collection("unicorns");
        const result = await collection.deleteOne({ name: name });
        res.status(200).send(result);
    }
    catch (err) {
        console.error("Errore server:", err);
        res.status(500).send({ err: "Errore esecuzione query o connessione" });
    }
    finally {
        await client.close();
    }
});
    

// F) default root 
app.use("/", function (req: express.Request, res: express.Response) {
    res.status(404);
    if (!req.originalUrl.startsWith("/api/")) {
        res.send(paginaErr);// send serializza in automatico
    }
    else {
        res.send("Risorsa non trovata");
    }
})

// G) gestione errori
app.use("/", function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    // err.stack contiene l'elenco completo degli errori
    res.status(500);
    res.send(err.message);
    console.log("*********ERROR*********\n" + err.stack)

})