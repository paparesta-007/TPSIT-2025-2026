import { MongoClient, ObjectId } from "mongodb";

//porta di ascolto di mongo demone
const connectionString = "mongodb://127.0.0.1:27017";
const dbname = "5BInfo";

const query = 36;

async function executeQuery(query: number) {
    const client = new MongoClient(connectionString);
    await client.connect().catch(function (err) {
        console.log("Errore di connessione al databse");
    });
    let collection = client.db(dbname).collection("biblioteca");
    let cmd;
    let regex;
    switch (query) {
        case 24:
            cmd = collection.find({
                "posizione.stanza": 2,
                "posizione.scaffale": 3
            }).project(
                {
                    _id: 0,
                    titolo: 1,
                    autore: 1,
                    "posizione.stanza": 1,
                    "posizione.scaffale": 1
                }
            ).toArray()
            break;
        case 25:
            let regexEinaudi = new RegExp("einaudi", "i")
            cmd = collection.find({
                "pubblicazioni.editore": regexEinaudi
            }).project(
                {
                    _id: 0,
                    titolo: 1,
                    autore: 1,
                    "pubblicazioni.editore.$": 1
                }
            ).toArray()
            break;
        case 26:
            cmd = collection.distinct(
                "pubblicazioni.editore"
            )
            break;
        case 27:
            let regexProm = new RegExp("Promessi Sposi", "i")
            cmd = collection.find({
                titolo: regexProm,
                "pubblicazioni.editore": "MieEdizioni"
            }).project(
                {
                    _id: 0,
                    titolo: 1,
                    autore: 1,
                    "pubblicazioni.$": 1
                }
            ).toArray()
            break;
        case 28:
            cmd = collection.find({
                titolo: "Il fu Mattia Pascal",
                "pubblicazioni.editore": "Mondadori"
            }).project(
                {
                    _id: 0,
                    titolo: 1,
                    autore: 1,
                    "pubblicazioni.$": 1
                }
            ).toArray()
            break;
        case 30:
            cmd = collection.find({
                "pubblicazioni.editore": "Einaudi"
            }).project(
                {
                    _id: 0,
                    titolo: 1,
                    autore: 1,
                    pubblicazioni: { $elemMatch: { editore: "Einaudi" } }
                }
            ).toArray()
            break;
        case 31:
            cmd = collection.updateOne(
                {
                    titolo: "Il fu Mattia Pascal",
                    pubblicazioni: {
                        $elemMatch: {
                            editore: "Mondadori",
                            anno: 2011
                        }
                    }
                },
                {
                    $set: { "pubblicazioni.$.anno": 2012 }
                }
            )
            break;
        case 32:
            cmd = collection.updateMany(
                {
                    pubblicazioni: {
                        $elemMatch: {
                            editore: "Mondadori"
                        }
                    }
                },
                {
                    $inc: { "pubblicazioni.$[].nPagine": 1 }
                }
            )
            break;
        default:
            break;
    }
    cmd?.then(function (data) {
        console.log(JSON.stringify(data, null, 2));
        if (data instanceof Array) {
            console.log("Numero record trovati: " + data.length);
        }
    });
    cmd?.catch(function (err) {
        console.log("Errore esecuzione query: " + err.message);
    });
    cmd?.finally(function () {
        client.close();
    });
}

executeQuery(32);