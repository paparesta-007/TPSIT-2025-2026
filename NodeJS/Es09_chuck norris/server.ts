"use strict"

// import
import http from 'http'
import fs from 'fs'
import express from "express"
import facts from "./facts.json"
// configurazioni
const icon_url = "https://assets.chucknorris.host/img/avatar/chuck-norris.png";
const api_url = "https://api.chucknorris.io"

const categories: string[] = []
//const categories = ["career","money","explicit","history","celebrity","dev","fashion","food","movie","music","political","religion","science","sport","animal","travel"]
const base64Chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_"]
const port: number = 3000;
let paginaErr: string = "";
const app: express.Express = express();



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

app.get("/api/categories", function (req: express.Request, res: express.Response) {
    const fatti = facts.facts
    for (const fatto of fatti) {
        for (const categoria of fatto.categories) {
            categories.push(categoria)
        }
    }
    res.status(200)
    res.send(Array.from(new Set(categories)))
})

app.get("/api/facts", function (req: express.Request, res: express.Response) {
    let category: any = req.query.category
    let factss = []
    if (!category) {
        res.status(500)
        res.send({ message: "categoria mancante" })
    }
    const fatti = facts.facts
    for (const fatto of fatti) {
        for (const categoria of fatto.categories) {
            if (categoria.includes(category)) {
                factss.push(fatto)
                break;
            }
        }
    }
    factss.sort((a, b) => b.score - a.score)
    res.status(200)
    res.send(factss)
})


app.post("/api/rate", function (req: express.Request, res: express.Response) {
    let ids = req.body.ids
    const fatti = facts.facts
    for (const id of ids) {
        const fact = fatti.find(f => f.id == id)
        if (fact) {
            fact.score++
        }

    }
    if (facts) {
        fs.writeFile("./facts.json", JSON.stringify(facts, null, 2), (err) => {
            if (err) {
                console.error("Errore scrittura file:", err);
                res.status(500).send({ error: "Errore scrittura file" });
            }
        });
        res.status(200)
        res.send({ message: "Like aggiunto correttamente" })
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