getNewsList()

async function getNewsList() {
    let response= await inviaRichiesta("GET","/api/elenco")
    if(response.status==200){
        console.log(response.data)
    }
    else{

    }
}