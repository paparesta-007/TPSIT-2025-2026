import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';

const connectionString = 'mongodb://localhost:27017';
const dbName = "unicorns"

async function executeQuery(query: number) {
    const client = new MongoClient(connectionString);
    await client.connect().catch(err => {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    });
    const collection = client.db(dbName).collection('unicorns');
    let cmd;

    switch (query) {
        case 1: // Trova tutti gli unicorni con peso maggiore di 400 e minore di 600
            cmd = collection.find({ weight: { $gte: 400, $lte: 600 } }).toArray();// Dentro il json ci sono le condizioni della query
            //Solo con il find devo mettere toArray() per trasformare il cursor in un array di risultati
            //Gli operatori $gte (greater than) e $lte (less than) servono per indicare rispettivamente "maggiore di" e "minore di" con estremi inclusi
            break;
        case 2: // Trova tutti gli unicorni di gender M
            //AND in formato breve
            // cmd=collection.find({gender:'m',loves:'Papa', vampires: {$gte: 60}}).toArray();

            //AND in formato lungo
            cmd = collection.find({ $and: [{ gender: 'm' }, { loves: 'Papa' }, { vampires: { $gte: 60 } }] }).toArray();
            break;
        case 3: // Trova tutti gli unicorni femminili o con peso minore di 500
            cmd = collection.find({ $or: [{ gender: 'f' }, { weight: { $lt: 500 } }] }).toArray();
            break;
        case 4: // Trova tutti gli unicorni che amano le mele o l'uva e che pesano meno di 500x 
            // cmd = collection.find(
            //     { 
            //         $and: [
            //             { $or: [
            //                 { loves: 'apple' }, 
            //                 { loves: 'grape' }] 
            //             }, 
            //             { 
            //                 weight: { $lt: 500 } 
            //             }   
            //         ]  
            //     }).toArray();
            cmd = collection.find(
                {
                    loves: { $in: ['apple', 'grape'] },
                    weight: { $lt: 500 }
                }).toArray();
            break;
        case 5: // sia papaya che carrot e almeno 60 vampires
            cmd = collection.find(
                {
                    loves: { $all: ['carrot', 'papaya'] },
                    vampires: { $gte: 60 }
                }
            )
                .toArray();
            break;
        case 6: // capelli grey o brown
            cmd = collection.find(
                {
                    hair: { $in: ['grey', 'brown'] }
                }
            ).toArray();
            break;
        case 7: // non vaccinati o vaccino non esistente
            cmd = collection.find(
                {
                    $or: [
                        { vaccinated: false },
                        { vaccinated: { $exists: false } }
                    ]
                }
            ).toArray();
        case 8: // maschi che non amano le mele
            cmd = collection.find(
                {
                    gender: "m",
                    loves: { $nin: ['apple'] }
                }
            ).toArray();
            break;
        case 9: // nomi che iniziano con A o a
            const regex = new RegExp("^[aA]")
            const regex2 = new RegExp("^a", "i") // i indica case insensitive
            cmd = collection.find(
                {
                    name: { $regex: regex }
                }
            ).toArray();
            break;
        case 10: // ricerca per id
            let objectId = new ObjectId("68fa12da7286aa74dae68d09");
            cmd = collection.find(
                {
                    _id: objectId
                }
            ).toArray();
            break;
        case 11: // visualizzare nome e vampiri uccisi per tutti gli unicorni di genere maschile
            cmd = collection.find(
                { gender: "m", vampires: { $exists: true } },

            ).project({ name: 1, vampires: 1 })// Posso mettere 1 per includere il campo o 0 per escluderlo
                .sort({ vampires: -1, name: 1 }).limit(3).toArray(); // Sort se 1 ordina in modo crescente, -1 decrescente

            break;
        case 12: // contare numero unicorni che pesano più di 500
            cmd = collection.countDocuments(
                {
                    weight: { $gt: 500 }
                }
            )
            break;

        case 13:
            cmd = collection.find(
                {
                    name: "Aurora"
                },
                {
                    projection: { _id: 0, weight: 1, hair: 1 }
                }).toArray();
            break;
        case 14: // visualizzare frutti amati dai femminile
            cmd = collection.distinct(
                "loves",
                { gender: "f" }
            )
            break;
        case 15: //insert
            let unicorn = {
                name: "Test Unicorn",
                gender: 'f',
                residenza: "Fossano"
            }
            cmd = collection.insertOne(unicorn)
            break;
        case 16: // delete 
            let regexDel = new RegExp("^Test Unicorn$", "i")
            cmd = collection.deleteOne(
                {
                    name: regexDel,
                    residenza: "Fossano"
                }
            )
            break;
        case 17: // update
            cmd = collection.updateOne(
                { name: "Aurora" },
                {
                    $inc: { vampires: 10 } // $inc incrementa il valore del campo vampires di 10
                }
            )
            break;
        case 18: //Aggiungere unicorno Aurara ama carote  e peso è aumentato di 10kg
            cmd = collection.updateOne(
                { name: "Aurora" },
                {
                    $addToSet: { loves: { $each: ["carrot","sugar"] } }, // Aggiunge "carrot" all'array loves se non è già presente
                    $inc: { weight: 10 } // Incrementa il peso di 10
                }
            )
            break;
        case 19:
            cmd = collection.updateOne(
                {name:"Pluto"},
                {$inc:{vampires:1} },
                {upsert:true} // Se non esiste un unicorno con nome Pluto, lo crea con vampires inizializzato a 1
            )
            break;
        case 20: //vaccinated false a tutti gli unicorni che non hanno il campo vaccinated
            cmd = collection.updateMany(
                { vaccinated: { $exists: false } },
                { $set: { vaccinated: false } }
            )
            break;
        case 21: // rimuovere unicorni che amano sia l'uva che carote
            cmd = collection.deleteMany(
                {loves:{$all:['grape','carrot']}}
            )
            break;
        case 22: //trovare unicorno femina che ha ucciso più vampiri
            cmd = collection.find(
                { gender: "f" },
                {
                    sort: { vampires: -1 } // Ordina in modo decrescente per vampires e restituisce il primo risultato
                }).limit(1).project({ name: 1, vampires: 1 }).toArray();
            break;
        case 23: // inserire nuovo unicorno e sostituirlo con un nuovo
            let newUnicorn = {
                name:"Pluto",
                residenza:"Milano"
            }
            cmd = collection.insertOne(newUnicorn)
        default:
            console.log("Query non trovata" )
    }
    cmd?.then(function (res) { // Explicitly type 'res'
        console.log(res);
        if (res instanceof Array) {
            console.log("Numero di risultati: " + res.length);
        }
        client.close();
    }).catch(function (err) {
        console.error('Query failed', err);
        client.close();
    }).finally(() => {
        console.log('Execution completed');
    });
}

executeQuery(22)