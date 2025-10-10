"use strict";

// A) importing librerie
import http from "http";
import url from "url";
import fs from "fs";
import express from "express";
import states from "./states.json"
import radios from "./radios.json"

// B) configurazione server
const port: number = 3000;
let paginaErr: string = "";
const app: express.Express = express();
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



// E) gestione root dinamiche
app.get("/api/elenco", function (req: express.Request, res: express.Response) {
    res.status(200)
    res.send(states)
})

app.get("/api/getRadios", function (req: express.Request, res: express.Response) {
    let name = req.query.name
    if (!name) {
        res.status(404)
        res.send({ message: "Errore caricamento radios" })
    }
    if (name == "tutti") {
        res.status(200)
        res.send(radios)
    } else {
        let radiosFilter = radios.filter(r => r.state == name)
        res.status(200)
        res.send(radiosFilter)
    }

})

app.patch("/api/like", function (req: express.Request, res: express.Response) {
    let id = req.body.id
    let radio = radios.find(r => r.id == id)
    if (!radio) {
        return res.send({ error: "Radio non trovata" }).status(404)
    }
    else {
        const radio = radios.find((n) => n.id == id);
        if (radio) {
            radio.votes = (parseInt(radio.votes) + 1).toString();
            fs.writeFile("./radios.json", JSON.stringify(radios, null, 2), (err) => {
                if (err) {
                    console.error("Errore scrittura file:", err);
                    res.status(500).send({ error: "Errore scrittura file" });
                }
            });
            res.status(200)
            res.send({ message: "Like aggiunto correttamente" })
        }
    }


})

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