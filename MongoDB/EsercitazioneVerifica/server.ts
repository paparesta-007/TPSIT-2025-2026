import { MongoClient, ObjectId } from "mongodb";

//porta di ascolto di mongo demone
const connectionString = "mongodb://127.0.0.1:27017";
const dbname = "aiuole";


async function executeQuery(query: number) {
    const client = new MongoClient(connectionString);
    await client.connect().catch(function (err: Error) {
        console.log("Errore di connessione al databse");
    });
    let collection;
    let cmd;
    let regex;
    switch (query) {
        case 0:

            const regexDistinct = new RegExp("Sense", "i")
            collection = client.db(dbname).collection("aiuole");
            cmd = collection.distinct("sensorePrincipale.modello", { "sensorePrincipale.modello": regexDistinct })
            break;

        case 1:
            /*Trovare tutte le aiuole dove la coltura principale è "Basilico" oppure  "Sedano". 
            Riportare nome della’aiuola, coltura principale e modello del sensore utilizzato*/
            collection = client.db(dbname).collection("aiuole");
            cmd = collection.find({
                colturaPrincipale: { $in: ["Basilico", "Sedano"] }
            }).project(
                {
                    nomeAiuola: 1,
                    _id: 0,
                    colturaPrincipale: 1,
                    "sensorePrincipale.modello": 1
                }
            ).toArray()

            // let regexBasilico = new RegExp("Basilico", "i")
            // let regexSedano = new RegExp("Sedano", "i")
            // cmd = collection.find({
            //     $or: [
            //         { colturaPrincipale: regexBasilico },
            //         { colturaPrincipale: regexSedano }
            //     ]
            // }).project(
            //     {
            //         nomeAiuola: 1,
            //         _id: 0,
            //         colturaPrincipale:1,
            //         "sensorePrincipale.modello":1
            //     }
            // ).toArray()
            break;
        case 2:
            collection = client.db(dbname).collection("aiuole");
            cmd = collection.find(
                { superficie: { $gte: 15 } }
            )
                .sort({ superficie: -1 })
                .project({
                    _id: 0,
                    nomeAiuola: 1,
                    superficie: 1
                }).toArray()
            break;
        case 3:
            collection = client.db(dbname).collection("aiuole");
            cmd = collection.find({
                parassitiRilevati: { $all: ["lumache", "acari"] }
            }).project({
                _id: 0,
                nomeAiuola: 1,
                parassitiRilevati: 1
            }).toArray()

            break;
        case 4:
            let regexCentrale = new RegExp("Centrale", "i")
            collection = client.db(dbname).collection("aiuole");
            cmd = collection.find({
                nomeAiuola: regexCentrale,
                "sensorePrincipale.batteria_percent": { $lt: 80 }
            }).sort({ superficie: -1 }).project({
                _id: 0,
                nomeAiuola: 1,
                superficie: 1,
                "sensorePrincipale": 1
            }).toArray()
            break;
        case 5:
            regex = new RegExp('Nord', 'i');
            collection = collection = client.db(dbname).collection("aiuole");
            cmd = collection
                .find({
                    "nomeAiuola": regex,
                    "rilevazioniGiornaliere": {
                        $elemMatch: {
                            "umidita": { $gt: 40 },
                            "acquaUtilizzata": { $gt: 12 }
                        }
                    }
                })
                .project({
                    "_id": 0,
                    "nomeAiuola": 1,
                    "rilevazioniGiornaliere.$": 1
                })
                .toArray();
            break;
        case 6:
            collection = collection = client.db(dbname).collection("aiuole");
            cmd = collection.updateOne(
                {
                    nomeAiuola: "Aiuola Est-2"
                },
                {
                    $set: { "irrigazioneAutomatica": true }
                }
            )
            break;
        case 7:
            let regexSud = new RegExp("Sud", "i")
            collection = client.db(dbname).collection("aiuole");
            cmd = collection.updateMany({
                "nomeAiuola": regexSud
            }, {
                $addToSet: { "parassitiRilevati": "zecche" }
            })
            break;
        case 8:
            let rgxCentrale = new RegExp("aiuola centrale-1", "i")
            collection = client.db(dbname).collection("aiuole");
            cmd = collection.updateMany({
                nomeAiuola: rgxCentrale
            }, {
                $inc: { "rilevazioniGiornaliere.$[].acquaUtilizzata": 2 }
            })
            break;
        case 9:
            collection = client.db(dbname).collection("aiuole");
            cmd = collection.aggregate([
                {
                    $group: {
                        "_id": "$colturaPrincipale",
                        numeroAiuole: { $sum: 1 },
                        superficieTotale: { $sum: "$superficie" }
                    }
                },
                {
                    $project: {
                        "colturaPrincipale": "$_id",
                        numeroAiuole: "$numeroAiuole",
                        superficieTotale: "$superficieTotale"
                    }
                },
                {
                    $sort: {
                        superficieTotale: 1
                    }
                }
            ]).toArray()
            break;
        case 10:
            collection = client.db(dbname).collection("aiuole");
            cmd = collection.aggregate([
                { $match: { "colturaPrincipale": "Pomodori" } },
                { $unwind: "$rilevazioniGiornaliere" },
                {
                    $group: {
                        _id: null,
                        mediaAcqua: { $avg: "$rilevazioniGiornaliere.acquaUtilizzata" }
                    }
                },
                {
                    $project: {
                        "_id": 0,
                        "coltura": "Pomodori",
                        "mediaAcqua": 1
                    }
                }
            ]).toArray()
            break;
        case 11:

            collection = client.db(dbname).collection("aiuole");
            cmd = collection.find({
                irrigazioneAutomatica: { $exists: false }
            }).project({
                _id: 0,
                nomeAiuola: 1,
                irrigazioneAutomatica: "false"
            }).toArray()

            break;
        case 12:
            collection = client.db(dbname).collection("aiuole");

            cmd = collection.find({
                colturaPrincipale: { $in: ["Lattuga", "Pomodori"] }
            }).project({
                _id: 0,
                nomeAiuola: 1,
                colturaPrincipale: 1
            }).toArray()
            break;
        case 13:
            collection = client.db(dbname).collection("aiuole");

            cmd = collection.find({
                parassitiRilevati: { $nin: ["acari", "lumache", "zecche"] }
            }).project({
                _id: 0,
                nomeAiuola: 1,
                parassitiRilevati: 1
            }).toArray()
            break;
        case 14:
            collection = client.db(dbname).collection("aiuole");

            cmd = collection.find({
                "rilevazioniGiornaliere":{
                    $elemMatch:
                    {
                         "umidita": { $gt: 40 },
                            "acquaUtilizzata": { $gt: 12 }
                    }
                }
            }).project({
                _id: 0,
                nomeAiuola: 1,
                "rilevazioniGiornaliere.umidita": 1,
                "rilevazioniGiornaliere.acquaUtilizzata": 1
            }).toArray()
            break;
        default:
            break;
    }
    cmd?.then(function (data: any) {
        console.log(JSON.stringify(data, null, 2));
        if (data instanceof Array) {
            console.log("Numero record trovati: " + data.length);
        }
    });
    cmd?.catch(function (err: Error) {
        console.log("Errore esecuzione query: " + err.message);
    });
    cmd?.finally(function () {
        client.close();
    });
}
const query = 14;

executeQuery(query);