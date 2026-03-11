"use strict";

/**
 * TPSIT NOTES:
 * - GET: Si usa per recuperare dati. I parametri passano nell'URL (query string).
 * - POST: Si usa per inviare dati (creazione). I parametri passano nel 'body' della richiesta.
 * - ASYNC/AWAIT: Serve a gestire operazioni asincrone (che richiedono tempo) 
 * senza bloccare il browser, rendendo il codice leggibile come se fosse sincrono.
 */

const tbody = mainTable.querySelector("tbody");
const buttons = document.querySelectorAll("button.btn-success");
\
// Caricamento iniziale dei dati
getUsers();

async function getUsers() {
  // Richiesta asincrona al server per ottenere la lista utenti
  const HTTPresponse = await inviaRichiesta("GET", "/users");

  if (HTTPresponse.status == 200) {
    let users = HTTPresponse.data;
    tbody.innerHTML = ""; // Pulizia della tabella prima del refresh

    for (const user of users) {
      let tr = document.createElement("tr");
      tr.classList.add("text-center");

      // Colonna Username
      let td = document.createElement("td");
      td.textContent = user.username;
      tr.appendChild(td);

      // Gestione Percorso Immagine
      // Il server restituisce solo il nome del file, qui aggiungiamo il percorso relativo
      if (!user.img.startsWith("https://res.cloudinary.com")) // Se l'img non è già un URL completo
        user.img = "./img/" + user.img;
      // Colonna Immagine
      td = document.createElement("td");
      let img = document.createElement("img");
      img.src = user.img;

      // GESTIONE ERRORE: Se l'immagine non esiste sul server, carichiamo un placeholder (user.png)
      img.addEventListener("error", function () {
        this.src = "./img/user.png";
      });

      td.appendChild(img);
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  } else {
    // Nota: alert.log era un errore nel tuo codice originale, corretto in alert
    alert("Errore: " + HTTPresponse.status + ": " + HTTPresponse.err);
  }
}

// Preview immediata quando l'utente seleziona un file locale
txtFile.addEventListener("change", async function () {
  const blob = txtFile.files[0]; // Il file scelto è un oggetto 'Blob' (Binary Large Object)
  // Convertiamo il blob in stringa Base64 solo per mostrarlo nell'anteprima <img>
  const base64img = await base64Convert(blob).catch(function (err) {
    alert(err)
  })
  imgPreview.src = base64img
})

/**
 * GESTIONE INVIO DATI (BINARY vs BASE64)
 */
for (const button of buttons) {
  button.addEventListener("click", async function () {
    let user = txtUser.value.trim()
    let blob = txtFile.files[0]

    if (!user || !blob) {
      alert("Inserire username e immagine");
      return;
    }

    let HTTPresponse;
    let imgBase64;

    switch (button.id) {
      case "btnBinary":
        /**
         * METODO 1: BINARY (Multipart/FormData)
         * Si usa l'oggetto FormData per simulare un form HTML. 
         * È efficiente perché non aumenta la dimensione del file.
         */
        let formData = new FormData();
        formData.append("user", user); // Campo testo
        formData.append("blob", blob); // Campo file (binario puro)

        HTTPresponse = await inviaRichiesta("POST", "/saveBinary", formData);

        if (HTTPresponse.status == 200) {
          alert("Immagine salvata con successo (binary)!");
          getUsers();
        } else {
          alert("Errore: " + HTTPresponse.status + ": " + HTTPresponse.err);
        }
        break;

      case "btnBase64":
        /**
         * METODO 2: BASE64 (JSON)
         * Trasformiamo l'immagine in una stringa di testo.
         * Vantaggio: Inviamo un oggetto JSON standard.
         * Svantaggio: Il file pesa il 33% in più.
         */
        try {
          // Utilizziamo Pica.js per ridimensionare lato client PRIMA dell'invio
          // Questo risparmia banda e tempo di risposta del server
          imgBase64 = await resizeAndConvert(blob);

          const params = {
            user: user,
            filename: blob.name,
            img: imgBase64 // Stringa Base64
          };

          HTTPresponse = await inviaRichiesta("POST", "/saveBase64", params);

          if (HTTPresponse.status == 200) {
            alert("Immagine ridimensionata e salvata con successo (base64)!");
            getUsers();
          } else {
            alert("Errore: " + HTTPresponse.status + ": " + HTTPresponse.err);
          }
        } catch (error) {
          alert("Errore durante il ridimensionamento: " + error);
        }
        break;
      case "btnBase64Cloudinary":
        imgBase64 = await resizeAndConvert(blob);

        const params = {
          user: user,
          filename: blob.name,
          img: imgBase64 // Stringa Base64
        };

        HTTPresponse = await inviaRichiesta("POST", "/saveBase64Cloudinary", params);

        if (HTTPresponse.status == 200) {
          alert("Immagine ridimensionata e salvata con successo (base64)!");
          getUsers();
        } else {
          alert("Errore: " + HTTPresponse.status + ": " + HTTPresponse.err);
        }


        break;
    }
  })
}

/**
 * FILE READER: Converte un file fisico (Blob) in stringa Base64 
 * sfrutta le Promise per gestire l'evento asincrono 'onload' del reader.
 */
function base64Convert(blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsDataURL(blob); // Avvia la lettura
    reader.onload = () => resolve(reader.result); // Successo
    reader.onerror = (error) => reject(error); // Fallimento
  });
}

/**
 * CLIENT-SIDE RESIZING (PICA.JS)
 * Concetto TPSIT: Ridurre il carico sul server delegando il calcolo al client.
 */
function resizeAndConvert(img) {
  return new Promise(function (resolve, reject) {
    const WIDTH = 640;
    const HEIGHT = 480;
    let type = img.type;
    let reader = new FileReader();

    reader.readAsDataURL(img);
    reader.onload = function () {
      let image = new Image(); // Creiamo un oggetto immagine DOM
      image.src = reader.result;

      image.onload = function () {
        // Se l'immagine è già piccola, non facciamo nulla
        if (image.width < WIDTH && image.height < HEIGHT)
          resolve(reader.result);
        else {
          let canvas = document.createElement("canvas");
          // Calcolo proporzioni (Aspect Ratio)
          if (image.width > image.height) {
            canvas.width = WIDTH;
            canvas.height = image.height * (WIDTH / image.width);
          } else {
            canvas.height = HEIGHT;
            canvas.width = image.width * (HEIGHT / image.height);
          }

          // Utilizzo libreria PICA per ridimensionamento di alta qualità
          let _pica = new pica();
          _pica.resize(image, canvas, { unsharpAmount: 80 })
            .then(resizedImage => _pica.toBlob(resizedImage, type, 0.9)) // Canvas -> Blob
            .then(blob => {
              // Blob -> Base64 finale per l'invio JSON
              var reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = () => resolve(reader.result);
            })
            .catch(err => reject(err));
        }
      };
    };
  });
}