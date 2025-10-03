"use strict"

const { get } = require("http");

let peopleList;  // vettore enumerativo delle Persone attualmente visualizzate
                 // comodo per gestire i pulsanti di navigazione
let currentPos;   
const lstCountries = document.getElementById("lstCountries")
// i seguenti puntatori sono tutti definiti tramite ID
// let lstCountries 
// let tabStudenti  
// let divDettagli 

btnAdd.addEventListener("click", function(){
	window.location.href = "./inserisci.html"
})

divDettagli.style.display="none"
getCountries()


async function getCountries(){
    let response= await inviaRichiesta("GET", "/api/countries")
    if(response.status=200){
        console.log(response.data)
        for(const country of response.data){
            let a = document.createElement("a")
            a.classList.add("dropdown-item")
            a.href = "#"
            a.textContent = country
            a.addEventListener("click", function(){
                getPeopleByCountry()
            })
            lstCountries.appendChild(a)
        }
    }
    else{
        alert(response.status + ": " + response.err)
    }
}

async function getPeopleByCountry(){
    let response= await inviaRichiesta("GET", "/api/getPeopleByCountry?country=" + this.textContent)
    if(response.status=200){
        console.log(response.data)

    }
    else{
        alert(response.status + ": " + response.err)
    }
}
