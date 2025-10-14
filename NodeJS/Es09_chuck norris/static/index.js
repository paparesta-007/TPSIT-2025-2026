document.addEventListener("DOMContentLoaded", () => {
    const categoryList = document.getElementById("categoryList")
    const mainWrapper = document.getElementById("mainWrapper")
    const div = document.createElement("div")
    const btnInvia = document.getElementById("btnInvia")
    const chk = []
    mainWrapper.appendChild(div)
    getCategories()



    async function getCategories() {
        let response = await inviaRichiesta("GET", "/api/categories")

        if (response.status == 200) {
            const categories = response.data
            console.log(categories)
            const select = document.createElement("select")
            categoryList.appendChild(select)


            for (const category of categories) {
                let option = document.createElement("option")
                option.value = category
                option.textContent = category
                select.appendChild(option)
            }
            select.selectedIndex = -1
            select.addEventListener("change", function () {
                getFacts(select[this.selectedIndex].value)
            })
        }
        else {
            console.error(response.status + ": " + response.err)
        }
    }


    async function getFacts(category) {
        div.innerHTML = ""
        let response = await inviaRichiesta("GET", "/api/facts?category=" + category)
        if (response.status == 200) {
            const facts = response.data

            for (const fact of facts) {
                const input = document.createElement("input")
                input.value = fact.id
                input.type = "checkbox"
                chk.push(input)
                let span = document.createElement("span")
                span.innerHTML = `${fact.value}: <b>${fact.score}</b>`
                const br = document.createElement("br")

                div.appendChild(input)
                div.appendChild(span)
                div.appendChild(br)
            }
        }
        else {
            console.error(response.status + ": " + response.err)
        }
        console.log(chk)
    }

    btnInvia.addEventListener("click", async () => {
        const selezionati = chk.filter(input => input.checked).map(i => i.value)
        let response = await inviaRichiesta("POST", "/api/rate", { ids: selezionati })
        if (response.status == 200) {
            const select = document.querySelector("select")
            const categoria = select.options[select.selectedIndex].value
            getFacts(categoria)

        }
        else {
            console.error(response.status + ": " + response.err)
        }
    })
})

