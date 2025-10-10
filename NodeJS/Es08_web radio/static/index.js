"use strict"



document.addEventListener("DOMContentLoaded", function () {
    const tbody = document.getElementById("tbody")
    const lstRegioni = document.getElementById("lstRegioni")
    getRadios("tutti")
    lstRegioni.addEventListener("change", function () {
        const selectedOption = lstRegioni[lstRegioni.selectedIndex]
        getRadios(selectedOption.value)
    })
    getElenco()



    async function getElenco() {
        let response = await inviaRichiesta("GET", "/api/elenco")
        if (response.status == 200) {
            console.log("Elenco caricato:")
            const regioni = response.data
            for (const regione of regioni) {

                let opt = document.createElement("option")
                opt.value = regione.name
                opt.innerHTML = `${regione.name} [${regione.stationcount} elementi]`

                lstRegioni.appendChild(opt)


            }
        }
    }

    async function getRadios(name) {

        tbody.innerHTML = ""
        let response = await inviaRichiesta("GET", "/api/getRadios?name=" + name)
        if (response.status == 200) {
            const radios = response.data
            console.log(radios.i)

            if (radios.length == 0 || !radios) {
                const tr = document.createElement("tr");
                const td = document.createElement("td");
                td.colSpan = 6; // numero di colonne della tua tabella
                td.style.textAlign = "center"; // opzionale, per centrare il testo
                td.innerHTML = "<b>Non ci sono stazioni radio per questa regione</b>";
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
            else {
                for (const radio of radios) {
                    const tr = document.createElement("tr")

                    let td = document.createElement("td")
                    let img = document.createElement("img")
                    img.width = 40
                    img.height = 40
                    img.src = radio.favicon
                    td.appendChild(img)
                    tr.appendChild(td)

                    td = document.createElement("td")
                    td.textContent = radio.name
                    tr.appendChild(td)

                    td = document.createElement("td")
                    td.textContent = radio.codec
                    tr.appendChild(td)

                    td = document.createElement("td")
                    td.textContent = radio.bitrate
                    tr.appendChild(td)

                    td = document.createElement("td")
                    td.textContent = radio.votes
                    tr.appendChild(td)

                    td = document.createElement("td")
                    img = document.createElement("img")
                    img.width = 40
                    img.height = 40
                    img.src = "./like.jpg"
                    img.alt = "like"
                    img.addEventListener("click", () => {
                        aggiungiLike(radio.id)
                    })
                    td.appendChild(img)
                    tr.appendChild(td)

                    tbody.appendChild(tr)


                }
            }
        }
        else {
            console.log("Errore:" + response.status)
        }
    }

    async function aggiungiLike(id) {
        let response = await inviaRichiesta("PATCH", "/api/like", { id: id })
        if (response.status == 200) {
            console.log("Agggiunto like correttamente: ")
            const selectedOption = lstRegioni.options[lstRegioni.selectedIndex]
            tbody.innerHTML = ""
            await getRadios(selectedOption.value)
        }
    }
});
