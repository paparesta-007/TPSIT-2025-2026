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

    let newUnicorn = {
        name: "Pluto",
        residenza: "Milano"
    }
    cmd = collection.insertOne(newUnicorn)

    cmd?.then(function (res) {
        console.log(res);
        const _id = res.insertedId
        const newData = {
            name: "Pluto",
            vampires: 100
        }
        let cmd2 = collection.replaceOne({ "_id": _id }, newData)
        cmd2.then(function (data) {

        }).catch(function (err) {
            console.error('Query failed', err);
        }).finally(() => {
            console.log('Execution completed');
            client.close();
        });
        if (res instanceof Array) {
            console.log("Numero di risultati: " + res.length);
        }
        client.close();
    }).catch(function (err) {
        console.error('Query failed', err);
    }).finally(() => {
        client.close();
        console.log('Execution completed');
    });
}

executeQuery(22)