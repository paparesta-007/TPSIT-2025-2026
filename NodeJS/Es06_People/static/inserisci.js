"use strict";

// i seguenti puntatori sono tutti definiti tramite ID
// let btnSalva  
// let btnAnnulla  
// let lstCountries  

document.addEventListener("DOMContentLoaded", function () {
    getCountries()
})
const lstCountries = document.getElementById("lstCountries")
async function getCountries(){
    let response= await inviaRichiesta("GET", "/api/countries")
    if(response.status=200){
        console.log(response.data)
        for(const country of response.data){
            let option = document.createElement("option")
            option.value = country
            option.textContent = country
            lstCountries.appendChild(option)
        }
        lstCountries.selectedIndex = -1
    }
    else{
        alert(response.status + ": " + response.err)
    }
}

const btnAnnulla=document.getElementById("btnAnnulla")
btnAnnulla.addEventListener("click", function(){
    window.history.back()
})

const btnSalva=document.getElementById("btnSalva")
btnSalva.addEventListener("click", async function(){
    let gender=document.querySelector('input[name="gender"]:checked').value
    if(lstCountries.selectedIndex === -1 ) {
        alert("Selezionare un paese")
        return
    }
    if(gender === undefined) {
        alert("Selezionare un sesso")
        return
    }
    let person={
        name: {
            title: document.getElementById("txtTitle").value,
            first: document.getElementById("txtFirst").value,
            last: document.getElementById("txtLast").value
        },
        gender: gender,
        location: {
             city: document.getElementById("txtCity").value,
            state: document.getElementById("txtState").value,
            country: lstCountries.options[lstCountries.selectedIndex].value,
        },
        picture: {
            medium: "./img/user.png"
        },
        cell: document.getElementById("txtCell").value,
        mail: document.getElementById("txtMail").value,
        dob: {
            
        }
    }
    console.log(person)
    let response=await inviaRichiesta("POST", "/api/addPerson", person)
    if(response.status===200){
        console.log(response.data)
        alert("Persona aggiunta con successo")
        window.history.back()
    }
    else{
        alert(response.status + ": " + response.err)
        console.log(response.data)
    }
})