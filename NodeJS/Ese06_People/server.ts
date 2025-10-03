"use strict";

// A) importing librerie
import http from "http";
import url from "url";
import fs from "fs";
import express from "express";
import people from "./people.json"
// B) configurazione server
const port: number = 1337;
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
    if(req.body && Object.keys(req.body).length > 0) {
        console.log("-------------------\nParametri post: " + JSON.stringify(req.body));
      }
      next();
})


app.get("/api/countries", function (req: express.Request, res: express.Response) {
    let countries: string[] =[];
    // prima soluzione tradizionale
    // for(const person of people.results){
    //     if(!countries.includes(person.location.country)){
    //       countries.push(person.location.country);
    //     }
    // }
    // countries.sort()
    // res.send(countries);

    // seconda soluzione più efficiente
    for(const person of people.results){
        countries.push(person.location.country);

    }

    res.send(Array.from(new Set(countries.sort())));
    
})

// F) default root 
app.use("/", function (req: express.Request, res: express.Response) {
    res.status(404);
    if(!req.originalUrl.startsWith("/api/")) {
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
    console.log("*********ERROR*********\n"+err.stack)
  
})