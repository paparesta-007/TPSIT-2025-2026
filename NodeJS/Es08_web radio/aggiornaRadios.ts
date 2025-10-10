import fs from "fs"
import radios from "./radios.json"
import states from "./states.json"


for(const state of states){
    const name = state.name
    const radiosState=radios.filter((r:any)=>r.state==name)
    state.stationcount=radiosState.length.toString()

}
salvaradios()
function salvaradios(){
    fs.writeFile("./states.json",JSON.stringify(states,null,2), function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("states aggiornati")
        }
    })
}