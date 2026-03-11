"use strict"

document.addEventListener("DOMContentLoaded",function(){

    let idStudente;

    let txtUser=document.getElementById("txtUser")
    let txtPwd=document.getElementById("txtPwd")
    let lblErrore=document.getElementById("lblErrore")
    lblErrore.style.display="none"
    let btnLogin=document.getElementById("btnLogin")

    let login=document.getElementById("login")
    txtPwd.value="pippo"
    txtUser.value="pippo"
    btnLogin.addEventListener("click",async function(params) {
        if(txtUser.value=='' || txtPwd.value==''){
            alert("Compilare tutti i campi")
        }
        else{
            let response=await inviaRichiesta("POST","/login",{username:txtUser.value,pwd:txtPwd.value})
            if(response.status==200){
                // alert("Login avvenuto con successo")
                idStudente=response.data.id
                caricaDomande()
            }
            else{
                console.log("Errore: "+response.status+" "+response.err)
                lblErrore.style.display="block"
            }
        }
    })

    async function caricaDomande() {
       
        login.style.display="none"
        let response=await inviaRichiesta("GET","/getDomande",)
        if(response.status==200){
            console.log(response.data)
            let elencoDomande=document.querySelector(".elencoDomande")
            elencoDomande.innerHTML=""
            for(const domanda of response.data){
                let div=document.createElement("div")
                div.id="wrapperDomande"
                elencoDomande.appendChild(div)

                let p=document.createElement("p")
                p.textContent=domanda.domanda
                div.appendChild(p)

                let risposte=domanda.risposte
                 let index=0
                risposte.forEach(risposta => {
                    let div1=document.createElement("div")
                    let input=document.createElement("input")
                    input.type="radio"
                    input.value=index
                    input.name=domanda.id

                    div1.appendChild(input)
                    let span=document.createElement("span")
                    span.textContent=risposta
                    div1.appendChild(span)

                    div.appendChild(div1)
                    index++
                });

            }

            let btnInvia=document.createElement("button")
            btnInvia.textContent="Invia"
            btnInvia.classList.add("btn","btn-primary")
            document.querySelector("#test").append(btnInvia)


            btnInvia.addEventListener("click",async function(){
                let inputs=document.querySelectorAll("input[type=radio]:checked")
                let risposte=[]
                inputs.forEach(input => {
                    let idDomanda = input.name
                    let indiceRisposta = input.value

                    let riga={
                        idDomanda:idDomanda,
                        indiceRisposta:indiceRisposta
                    }
                    risposte.push(riga)
                })
                let data={
                    idStudente:idStudente,
                    risposte
                }
                console.log(data)
                let response=await inviaRichiesta("POST","/inviaRisposte",data)
                if(response.status==200){
                    let punteggio=response.data
                    alert("Complimenti, hai totalizzato un punteggio di: "+response.data)
                    let response2=await inviaRichiesta("POST","/inviaPunteggio",{punteggio,idStudente})
                    if(response2.status==200){
                        alert("Voto caricato")
                    }
                    else{
                    console.log("Errore: "+response.status+" "+response.err)
            
                }
                }
                else{
                    console.log("Errore: "+response.status+" "+response.err)
                    
                }
            })
        }
        else{
            console.log("Errore: "+response.status+" "+response.err)
          
        }
    }
})


