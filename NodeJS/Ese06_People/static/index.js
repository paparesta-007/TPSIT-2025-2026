"use strict"

let peopleList;  // vettore enumerativo delle Persone attualmente visualizzate
                 // comodo per gestire i pulsanti di navigazione
let currentPos;   

// i seguenti puntatori sono tutti definiti tramite ID
// let lstCountries 
// let tabStudenti  
// let divDettagli 

btnAdd.addEventListener("click", function(){
	window.location.href = "./inserisci.html"
})

divDettagli.style.display="none"
getCountries()


