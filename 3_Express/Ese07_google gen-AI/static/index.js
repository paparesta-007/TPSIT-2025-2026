'use strict'

btnInvia.addEventListener("click", richiedi)


async function richiedi (){
	const prompt = txtPrompt.value;
    if(prompt.trim() == ""){
		alert("Inserisci una domanda !")
		return
	}
	
	display.innerHTML = "searching ....."
	let httpResponse =await inviaRichiesta("POST", "/chat", {prompt} )
	if(httpResponse.status==200) {
		display.innerHTML = httpResponse.data.text
	}
	else 
		alert(httpResponse.status + " : " + httpResponse.err)		
}

document.addEventListener('keydown', function(event) {	
    if (event.keyCode == 13)  
	    richiedi();
});



