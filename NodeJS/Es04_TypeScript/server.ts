"use strict";

//importing librerie
import http from "http";
import url from "url";
import fs from "fs";
import headers from "./headers.json";

const port: number = 1337;

const server: http.Server = http.createServer(function (
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  console.log(`Ricevuta richiesta: ${req.url}`);
  const metodo: string = req.method!;
  const path: any = url.parse(req.url!, true);

  const risorsa: string = path.pathname;
  const params: any = path.query;
  const dominio: string = req.headers.host!;

  console.log(
    `Metodo: ${metodo}, Risorsa: ${risorsa}, Params: ${JSON.stringify(
      params
    )}, Dominio: ${dominio}`
  );

  if (risorsa == "/favicon.ico") {
    let favicon: NonSharedBuffer = fs.readFileSync("./favicon.ico"); // se la ris. rich. è favicon.ico, leggo il file
    res.writeHead(200, headers.ico);
    res.write(favicon);
  } else {
    res.writeHead(200, headers.html);
    res.write("<h1>Informazioni richiesta ricevuta</h1>");
    res.write(`<p>Metodo: ${metodo}</p>`);
    res.write(`<p>Risorsa: ${risorsa}</p>`);
    res.write(`<p>Params: ${JSON.stringify(params)}</p>`);
    res.write(`<p>Dominio: ${dominio}</p>`);
  }
  res.end();
});

server.listen(port, function () {
  console.log(`Server in ascolto sulla porta ${port}`);
});
