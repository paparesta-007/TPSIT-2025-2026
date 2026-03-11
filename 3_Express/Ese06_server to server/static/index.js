'use strict'


btnPeople.addEventListener("click", async function(){		
	let httpResponse = await inviaRichiesta("GET", "/api/people")
	if(httpResponse.status==200){			
		let data = httpResponse.data.results
		console.log(data)
		tabDati.innerHTML=""
		
		for (let item of data) {
			let text = JSON.stringify(item, null, 5)
			 .replaceAll("\n", "<br>")  
			 // inserisco 5 spazi veri
			 .replaceAll("     ", "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;") 		 
			tabDati.innerHTML += text + "<hr>"
		}
	}
	else
		alert(httpResponse.status + " : " + httpResponse.err)
})	



