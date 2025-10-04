"use strict"



let peopleList;  // vettore enumerativo delle Persone attualmente visualizzate
                 // comodo per gestire i pulsanti di navigazione

const lstCountries = document.getElementById("lstCountries")
// i seguenti puntatori sono tutti definiti tramite ID
// let lstCountries 
// let tabStudenti  
// let divDettagli 
const btnFirst=document.querySelectorAll("#divDettagli a")[0]
const btnPrev=document.querySelectorAll("#divDettagli a")[1]
const btnNext=document.querySelectorAll("#divDettagli a")[2]
const btnLast=document.querySelectorAll("#divDettagli a")[3]
let cardIndex=0
btnAdd.addEventListener("click", function(){
	window.location.href = "./inserisci.html"
})
const allPeople=[]
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
                getPeopleByCountry(a.textContent)
            })
            lstCountries.appendChild(a)
        }
    }
    else{
        alert(response.status + ": " + response.err)
    }
}

async function getPeopleByCountry(country){
    let response = await inviaRichiesta("GET", "/api/getPeopleByCountry?country=" + country);
    if (response.status === 200) {
        peopleList = response.data;
        createTable(response.data);
    } else {
        alert(response.status + ": " + response.err);
    }
}

function createTable(people){
    let tbody=document.querySelector("#tabStudenti");
    tbody.innerHTML="";
    let count=0
   
    Array.from(people).forEach((person, index) => {
        count++
        let tr=document.createElement("tr")
        let td=document.createElement("td")

        td.textContent=person.name.title + " " + person.name.first + " " + person.name.last
        tr.appendChild(td)

        td=document.createElement("td")
        td.textContent=person.city
        tr.appendChild(td)

        td=document.createElement("td")
        td.textContent=person.state
        tr.appendChild(td)

        td=document.createElement("td")
        td.textContent=person.cell
        tr.appendChild(td)

        let btnDettagli=document.createElement("button")
        btnDettagli.classList.add("btn","btn-secondary")
        btnDettagli.textContent="Dettagli"
        btnDettagli.addEventListener("click", () => {
            cardIndex = index;
            showDetails(cardIndex);
        });

        td=document.createElement("td")
        td.appendChild(btnDettagli)
        tr.appendChild(td)

        let btnElimina=document.createElement("button")
        btnElimina.classList.add("btn","btn-danger")
        btnElimina.textContent="Elimina"
        btnElimina.addEventListener("click", function(){
            deletePerson(person)
        })
        td=document.createElement("td")
        td.appendChild(btnElimina)
        tr.appendChild(td)
        tbody.appendChild(tr)
    })
}

async function showDetails(index){
    if (!peopleList || peopleList.length === 0) return;



    cardIndex = index;
    const person=peopleList[cardIndex]
    let response = await inviaRichiesta("GET", 
        "/api/getPerson?person=" + encodeURIComponent(JSON.stringify(person)));
    if (response.status === 200) {
        const person=response.data
        divDettagli.style.display="block"


        let img=document.querySelector("#divDettagli img")
        img.src=person.picture.large

        let h5=document.querySelector("#divDettagli h5")
        h5.textContent=person.name.first + " " + person.name.last

        let pCardText=document.querySelector("#divDettagli .card-text")
        pCardText.innerHTML=""

        let gender=document.createElement("p")
        gender.innerHTML=`<b>Gender:</b> ${person.gender}`

        let address=document.createElement("p")
        let stringAddress=`<b>Address:</b> ${person.location.street.number} ${person.location.street.name}, ${person.location.city}, ${person.location.state}, ${person.location.country}`
        address.innerHTML=stringAddress

        let email=document.createElement("p")
        email.innerHTML=`<b>Email:</b> ${person.email}`

        let date=document.createElement("p")
        date.innerHTML=`<b>Date of Birth:</b> ${person.dob.date.split("T")[0]}`
        pCardText.appendChild(email)

        pCardText.appendChild(gender)
        pCardText.appendChild(address)
        pCardText.appendChild(date)
    } else {
        alert(response.status + ": " + response.err);
    }
   
}
btnFirst.addEventListener("click", function(){
    
    showDetails(0);
});
btnPrev.addEventListener("click", function(){
    if (cardIndex === 0){
        alert("Non puoi tornare indietro")
        return
    };
    showDetails(cardIndex - 1);
});
btnNext.addEventListener("click", function(){
    if (cardIndex === peopleList.length - 1){
        alert("Non puoi andare avanti")
        return
    };
    showDetails(cardIndex + 1);
});
btnLast.addEventListener("click", function(){
    showDetails(peopleList.length - 1);
});