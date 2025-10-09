document.addEventListener("DOMContentLoaded", function () {
    getNewsList()

})


async function getNewsList() {

    const newsDiv = document.getElementById("wrapper")
    newsDiv.innerHTML = ""
    let response = await inviaRichiesta("GET", "/api/elenco")
    if (response.status === 200) {

        const allNews = response.data
        console.log(allNews)
        for (const news of allNews) {


            let span = document.createElement("span")
            span.textContent = news.titolo
            span.classList.add("titolo")
            newsDiv.appendChild(span)
            let a = document.createElement("a")
            a.href = "#"
            a.addEventListener("click", function () {
                showDetailsNews(news.file)
            })
            a.textContent = "Leggi"
            newsDiv.appendChild(a)

            span = document.createElement("a")
            span.classList.add("nVis")
            span.textContent = `[visualizzato ${news.visualizzazioni} volte]`
            newsDiv.appendChild(span)

            const br = document.createElement("br")
            newsDiv.appendChild(br)

        }
    } else {
        console.log("Errore caricamento news")
    }
}

async function showDetailsNews(file) {
    console.log(file)
    let response =await inviaRichiesta("POST", "/api/getDetails", {file:file})
    const newsDiv = document.getElementById("news")
    newsDiv.innerHTML=""
    if(response.status===200 ){
        newsDiv.innerHTML=  response.data.file
        incrementViews(file)
    }
    else{
        alert("Errore caricamento dettagli news")
    }
}

async function incrementViews(file){
    let response =await inviaRichiesta("POST", "/api/incrementViews", {file:file})
    if(response.status===200 ){
        console.log("visualizzazioni incrementate")
        getNewsList()
    }
    else{
        alert("Errore incremento visualizzazioni")
    }
}