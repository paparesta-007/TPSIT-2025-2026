"use strict"

let div = document.querySelector("div")

btnGet.addEventListener("click", async function() {
	let response = await inviaRichiesta("GET", "/api/richiesta1?id=3&par=1", { "nome": "Aurora" , "b":[1,2,3], "c":{x:5, y:7}});
	console.log(response)
	if(response.status==200) {
	   div.innerHTML=JSON.stringify(response.data)
	}
	else
		alert(response.status + " : " + response.err)		
});

btnPost.addEventListener("click", async function() {
	let response = await inviaRichiesta("PATCH", "/api/richiesta2", {"nome": "Unico", "nVampiri": 3});
	if(response.status==200) {
	   div.innerHTML=JSON.stringify(response.data)
	}
	else
		alert(response.status + " : " + response.err)		
});


btnParams.addEventListener("click", async function() {
	// Richiedi gli unicorni di genere maschile e pelo grigio
	let response = await inviaRichiesta("GET", "/api/richiestaParams/m/12");
	if(response.status==200) {
	   div.innerHTML=JSON.stringify(response.data)
	}
	else
		alert(response.status + " : " + response.err)		
});
