"use strict";

// Importiamo le librerie http/url/fs (file system)
const http = require("http");
const url = require("url");
const fs = require("fs");
// serve per leggere il tipo di file statico (mime type)
const mime = require("mime-types");

const headers = require("./headers.json");
const port = 1337;
let paginaErr;

const server = http.createServer(function(req, res) {
    console.log("Richiesta ricevuta: " + req.url);

    const metodo = req.method;
    const path = url.parse(req.url, true); 
    let risorsa = path.pathname;
    const param = path.query;
    const dominio = req.headers.host;

    console.log("Metodo:" + metodo, "Risorsa: " + risorsa, "Params: " + JSON.stringify(param), "Dominio: " + dominio);

    if (risorsa == "/") {
        risorsa = "/index.html";
    }

    if (!risorsa.startsWith("/api/")) {
        // gestione risorse statiche
        risorsa = "./static" + risorsa;

        fs.readFile(risorsa, function(err, content) {
            if (!err) {
                let header = {
                    "Content-Type": mime.lookup(risorsa)
                };
                res.writeHead(200, header);
                res.write(content);
            } else {
                res.writeHead(404, headers.html);
                res.write(paginaErr);
            }
            res.end ();  
        });
     }
     else if(risorsa=="/api/risorsa1") {
        res.writeHead(200, headers.json);
        // in corrispondenza del 200 occorre serializzare
        res.write(JSON.stringify({"benvenuto":param.nome + " " + param.cognome}));
        res.end();
     }
     else if(risorsa=="/api/risorsa2") {
        res.writeHead(200, headers.json);
        res.write(JSON.stringify({"benvenuto":"pluto"}));
        res.end();
     }
     else {
        res.writeHead(404, headers.html);
        res.write("<h1>Risorsa non trovata</h1></br>");
        res.end();
     }

});

server.listen(port, function() {
    console.log("Server in ascolto sulla porta " + port);

    fs.readFile("./static/error.html", function(err, content) {
        if (err)
            paginaErr = "<h1>Risorsa non trovata</h1>";
        else
            paginaErr = content.toString();
    });
});
