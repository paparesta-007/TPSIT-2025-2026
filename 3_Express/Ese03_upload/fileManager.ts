import {writeFile} from "fs/promises";
import dotenv from "dotenv";
import cloudinary, { UploadApiResponse } from "cloudinary"; 
// import streamifier from 'streamifier';   

class FileManager {
	constructor(){
		dotenv.config({ path: ".env" });
		cloudinary.v2.config(JSON.parse(process.env.cloudinary!))
	}
	
	async saveBinary(filename: string, binaryBuffer:Buffer){
		let randomName = this.#createRandomString(20)
		// L'estensione si potrebbe anche non mettere però così è più leggibile
		const ext = filename.split(".").pop();
		if (ext) randomName += "." + ext
		// Affinchè restituisca una Promise occorre importarlo da fs/promises
		// Se il file già esiste sovrascive
		await writeFile('./static/img/'+randomName, binaryBuffer)
		// in realtà ritorna una promise a cui verrà iniettato filename
		return randomName
	}	
	
	saveBase64(filename: string, imgBase64: string){
		// elimino l'intestazione \w+ = 1 o più caratteri alfanumerici
		imgBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, "");
		// riconverto in binario (sincrono)
		let buffer = Buffer.from(imgBase64, "base64");
        // ritorno la promise ritornata da saveBinary
		return this.saveBinary(filename, buffer)
		/* oppure 
		let filename = await this.saveBinary(filename, buffer)
		return filename */
	}

	saveBase64Cloudinary(filename: string, imgBase64: string){
		// ritorna la promise restituita da cloudinary a cui viene iniettato 
		// l'oggetto UploadApiResponse restituito da cloudinary
		return cloudinary.v2.uploader.upload(imgBase64, {folder: "Ese03upload"})
	}

	saveBinaryCloudinary(filename: string, binaryBuffer:Buffer){
		return new Promise<UploadApiResponse>((resolve, reject) => {
			// configuro l'upload
			const upload = cloudinary.v2.uploader.upload_stream(
				{"folder":"Ese03upload"},
				function(error: any, result?: UploadApiResponse) {
					if (error) {
						reject(error);
					} else if (result) {
						resolve(result);
					} else {
						reject(new Error("Upload result is undefined"));
					}
				}
		    )
			// avvio l'upload
			upload.end(binaryBuffer)
		})
		//console.log(streamifier.createReadStream(binary).constructor.name)
		//streamifier.createReadStream(binary).pipe(consumer);		
	}

	#createRandomString(len:number){
	   const chs="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	   return Array.from({length:len}, () => chs[this.#random(0,chs.length)]).join('')
	}
	
	#random(min:number, max:number){
		return Math.floor((max-min)*Math.random() + min)
	}
}
  
export default new FileManager