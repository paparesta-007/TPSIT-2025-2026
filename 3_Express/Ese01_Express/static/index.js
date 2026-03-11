"use strict"

// inizializzazione puntatori
const divIntestazione = document.getElementById("divIntestazione")
const divFilters = document.querySelector(".card")
const lstHair = document.getElementById("lstHair")
const divCollections =  document.getElementById("divCollections")
const table = document.getElementById("mainTable")
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody")
const divDettagli = document.getElementById("divDettagli")
const chkGender = divFilters.querySelectorAll("input[type=checkbox]");

// avvio
let currentCollection = "";
divFilters.style.display="none"

btnAdd.disabled = true;
btnUpdate.disabled = true;

GetCollections();

chkGender[0].addEventListener("change", () => {
    chkGender[1].checked = false;
})

chkGender[1].addEventListener("change", () => {
    chkGender[0].checked = false;
})

async function GetCollections()
{
    const response = await inviaRichiesta("GET", "/getCollections");

    if(response.status == 200)
    {
        console.log(response.data);

        let collections = response.data;
        const label = divCollections.querySelector("label");

        for (const collection of collections) {
            const clonedLabel = label.cloneNode(true); //con true clona anche i figli e nipoti
            clonedLabel.querySelector("span").textContent = collection.name;
            clonedLabel.querySelector("input[type='radio']").addEventListener("click", () => {
                currentCollection = collection.name;
                btnAdd.disabled = false;
                btnUpdate.disabled = false;
                GetData();
            });
            divCollections.appendChild(clonedLabel);
        }
        //rimuove la label originale
        label.remove();
    }
    else
        alert(response.status + ": " + response.err);
}

async function GetData(filters = {}) 
{
    const response = await inviaRichiesta("GET", `/${currentCollection}`, filters);
    
    if(response.status == 200)
    {   
        console.log(response.data);

        const strongs = divIntestazione.querySelectorAll("strong");
        strongs[0].textContent = currentCollection;
        strongs[1].textContent = response.data.length;

        tbody.innerHTML = "";

        for (const item of response.data) 
        {
            const tr = document.createElement("tr");
            tbody.append(tr);

            let td = document.createElement("td");
            td.addEventListener("click", () => {
                GetDetails(item._id);
            })
            td.textContent = item._id;
            tr.appendChild(td);

            td = document.createElement("td");
            td.addEventListener("click", () => {
                GetDetails(item._id);
            })
            const secondKey = Object.keys(item)[1];
            td.textContent = item[secondKey];
            tr.appendChild(td);

            thead.querySelector("th:nth-of-type(2)").textContent = secondKey;

            td = document.createElement("td");
            tr.appendChild(td);

            //patch
            let div = document.createElement("div");
            div.addEventListener("click", () => {
                patchCurrentRecord(item);
            })
            td.appendChild(div);
            //put
            div = document.createElement("div");
            td.appendChild(div);
            //delete
            div = document.createElement("div");
            td.appendChild(div);
            div.addEventListener("click", () => {
                Delete(item._id);
            })
        }

        if(currentCollection == "unicorns")
        {
            divFilters.style.display="";
        }
        else
            divFilters.style.display="none";

    }
    else
        alert(response.status + ": " + response.err);
}

async function GetDetails(id)
{
    const response = await inviaRichiesta("GET", `/${currentCollection}/${id}`);

    if(response.status == 200)
    {
        console.log(response.data);
        const item = response.data;

        divDettagli.innerHTML = "";

        for (const key in item) {
            divDettagli.innerHTML += `
                <strong>${key}</strong>: <span>${JSON.stringify(item[key])}</span><br>
            `
        }

    }
    else
        alert(response.status + ": " + response.err);
}

// btnFind.addEventListener("click", () => {
//     GetData(GetFilters());
// })
function GetFilters(){
    const hair = lstHair.value;
    let gender = "";

    const genderChecked = divFilters.querySelector("input[type=checkbox]:checked");
    
    if(genderChecked)
        gender = genderChecked.value;

    let filters = {};

    if(hair != "All")
        filters.hair = hair.toLowerCase();

    if(gender)
        filters.gender = gender.toLowerCase();
    return filters;
}
btnAdd.addEventListener("click", () => {
    divDettagli.innerHTML = "";

    const textArea = document.createElement("textarea");
    divDettagli.append(textArea);

    textArea.style.height = "100px";
    textArea.style.border = "1px solid black";

    textArea.value = '{\n "name":"pippo",\n "example":"modify this"\n}'

    AddTextAreaBtns("POST")
})

function AddTextAreaBtns(method,_id='')
{
    let btn = document.createElement("button");
    divDettagli.append(btn);

    btn.textContent = "Invia";
    btn.classList.add("btn", "btn-success", "btn-sm");
    btn.style.margin = "10px";

    btn.addEventListener("click", async () => {
        let newRecord = divDettagli.querySelector("textarea").value;

        try
        {
            newRecord = JSON.parse(newRecord);
        }
        catch(err)
        {
            alert("JSON non valido\n" + err);
            return;   
        }
        let resource=`/${currentCollection}`
        if(_id){
            resource+=`/`+_id
        }
        const response = await inviaRichiesta(method, resource, newRecord);

        if(response.status == 200)
        {
            console.log(response.data);
            GetData();
        }
        else
            alert("Operazione eseguita correttamente");
    })

    btn = document.createElement("button");
    divDettagli.append(btn);

    btn.textContent = "Chiudi";
    btn.classList.add("btn", "btn-secondary", "btn-sm");
    btn.addEventListener("click", () => {
        divDettagli.innerHTML = "";
    })
}

async function Delete(id)
{
    if(confirm("Vuoi veramente cancellare il record " + id + "?"))
    {
        const response = await inviaRichiesta("DELETE", `/${currentCollection}/${id}`)
        if(response.status == 200)
        {
            console.log(response.data);
            alert("Eliminazione eseguita correttamente");
            GetData();
        }
        else
            alert(response.status + ": " + response.err);
    }
}

btnDelete.addEventListener("click", async () => {
    const filters = GetFilters();
     if(confirm("Vuoi veramente cancellare il record " +JSON.stringify(filters) + "?"))
    {
        const response = await inviaRichiesta("DELETE", `/${currentCollection}/${encodeURIComponent(JSON.stringify(filters))}`, )
        if(response.status == 200)
        {
            console.log(response.data);
            alert("Eliminazione eseguita correttamente");
            GetData();
        }
        else
            alert(response.status + ": " + response.err);
    }
})

btnFind.addEventListener("click", () => {
    const filters={
        weight:600,
        loves:["carrot","papaya"],
        vampires:{$gt:60}
    }
    console.log(filters);
    GetData(filters);
})

async function patchCurrentRecord(item){
    console.log(item._id);
    let httResponse=await inviaRichiesta("GET",`/${currentCollection}/${item._id}`)
    if(httResponse.status == 200)
    {
        console.log(httResponse.data);
        divDettagli.innerHTML='';
        let current=httResponse.data
        delete(current.id)
        const textArea = document.createElement("textarea");
        divDettagli.append(textArea);

        textArea.style.height = "100px";
        textArea.style.border = "1px solid black";

        textArea.value = JSON.stringify(current,null,2)
        AddTextAreaBtns("PATCH",item._id)

    }
    else
        alert(httResponse.status + ": " + httResponse.err);
}