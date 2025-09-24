"use strict";
btnInvia1.addEventListener("click", async function() {
    // Non potrà mai andare in errore perché è gestito internamente in libreria.js
    let response = await inviaRichiesta("GET", "/api/risorsa1",{nome:"Michele",cognome:"Rossi"})
    console.log(response);
    if(response.status==200){
        alert(JSON.stringify(response.data));
    }
    else{
        alert(response.status + " : " + response.statusText);
    }
})


btnInvia2.addEventListener("click", async function() {
    let response = await inviaRichiesta("POST", "/api/risorsa2",{nome:"pluto"})
    console.log(response);
    if(response.status==200){
        alert(JSON.stringify(response.data));
    }
    else{
        alert(response.status + " : " + response.statusText);
    }

})
	
