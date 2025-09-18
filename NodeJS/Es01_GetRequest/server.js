"use strict";

const http = require("http");
const url = require("url");
const fs = require("fs");
const headers = require("./headers.json")
const port = 3000;

const server = http.createServer((req, res) => {
    const method = req.method;
    
    // se faccio la richiesta dal browser il metodo sarà sempre GET

    // Parse dell'URL
    const parsedUrl = url.parse(req.url, true); // il true fa in modo che la query string diventi un oggetto
    const resource = parsedUrl.pathname;
    const params = parsedUrl.query;
    const dominio = req.headers.host;

    console.log("Request:", resource);
    console.log("Params:", JSON.stringify(params));
    console.log("Dominio:", dominio);

    if(resource=="/favicon.ico") {
        // leggo il file e lo restituisco
        let favicon= fs.readFileSync("./favicon.ico");
        res.writeHead(200, headers.ico);
        res.write(favicon);
    }
    else {
        
        res.writeHead(200, headers.html);
        res.write("<h1> Informazioni relative alla richiesta ricevuta </h1>");
        res.write("<p>Metodo: " + method + "</p>");
        res.write("<p>Resource: " + resource + "</p>");
        res.write("<p>Params: " + JSON.stringify(params) + "</p>");
        res.write("<p>Dominio: " + dominio + "</p>");
    }
    res.end();
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
