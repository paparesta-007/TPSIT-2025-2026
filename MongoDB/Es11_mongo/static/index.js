"use strict"

document.addEventListener("DOMContentLoaded", function() {
    const headers = ["name", "gender", "hair", "weight", "loves"]
    const buttons=document.querySelectorAll(".wrapper  button")
    const tbody = document.querySelector(" table tbody")

    buttons[0].addEventListener("click", getUnicorns)

    buttons[1].addEventListener("click", async() => {
        let unicorn={
            name: txtName.value,
            gender:"m",
            weight:100
        }
        const response = await inviaRichiesta("POST","/api/addUnicorn",unicorn)
        if (response.status ==200) {    
            console.log(response.data)
            getUnicorns()
        }
        else {
            alert(response.status + " - " + response.err)
        }
    })
    async function getUnicorns(){
        tbody.innerHTML="" // svuoto la tabella prima di popolarla
        let gender = document.querySelector("input[type='radio'][name='gender']:checked").value
        const response = await inviaRichiesta("GET","/api/getUnicorns?gender=" + gender)
        if (response.status ==200) {    
            console.log(response.data)
            const unicorns = response.data
            for(const unicorn of unicorns){
                let tr = document.createElement("tr")
                tbody.appendChild(tr)

                for(let key in unicorn){
                    let td = document.createElement("td")
                    td.innerHTML = unicorn[key]
                    tr.appendChild(td)
                }
            }
        }
        else {
            alert(response.status + " - " + response.err)
        }

    }

    buttons[2].addEventListener("click", async() => {
        const name= txtName.value
        const response = await inviaRichiesta("PATCH","/api/updateUnicorn",{"loves":["Papa"], "hair":"brown","name":name})
        if (response.status ==200) {    
            console.log(response.data)
            alert("Unicorn updated")
            getUnicorns()
        }
        else {
            alert(response.status + " - " + response.err)
        }
    })


    buttons[3].addEventListener("click", async() => {
        const name= txtName.value
        const response= await inviaRichiesta("DELETE","/api/deleteUnicorn", {name})
        if (response.status ==200) {    
            console.log(response.data)
            if(response.data.deletedCount==0){
                alert("No unicorn deleted")
            }
            else{
                alert("Unicorn deleted")
                getUnicorns()
            }
        }
        else {
            alert(response.status + " - " + response.err)
        }
    })
})