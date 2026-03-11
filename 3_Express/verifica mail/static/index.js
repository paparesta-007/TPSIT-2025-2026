"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const _login = document.querySelector("#login");
  const _mail = document.querySelector("#mail");

  const _username = document.querySelector("#usr");
  const _password = document.querySelector("#pwd");
  const _lblErrore = document.querySelector("#lblErrore");
  const _btnInvia = document.querySelector("#btnInvia");
  const _btnLogin = document.querySelector("#btnLogin");

  _mail.style.display = "none";
  _lblErrore.style.display = "none";
  let currentEmail = "";

  let txtAttachment = document.getElementById("txtAttachment");
  txtAttachment.addEventListener("change", async function () {
    let blob = txtAttachment.files[0];
    if (blob) {
      console.log("File selezionato:", blob.name);
    }
    const base64img = await base64Convert(blob).catch(function (err) {
      alert(err);
    });
  });

  const btnCloseErrore = _lblErrore.querySelector("button");
  if (btnCloseErrore) {
    btnCloseErrore.addEventListener("click", function () {
      _lblErrore.style.display = "none";
    });
  }
  _username.value = "minnie@gmail.com";
  _password.value = "minnie";
  _btnLogin.addEventListener("click", async function () {
    if (_username.value == "" || _password.value == "") {
      alert("Compilare tutti i campi");
    } else {
      let loginData = {
        username: _username.value,
        pwd: _password.value,
      };
      let response = await inviaRichiesta("POST", "/login", loginData);
      if (response.status == 200) {
        console.log("Data: ", response.data);
        currentEmail = response.data.username;
        caricaMail(response.data.mail);
      } else {
        console.error(response.status + ": " + response.err);
        _lblErrore.style.display = "block";
      }
    }
  });

  async function caricaMail(data) {
    _login.style.display = "none";
    _mail.style.display = "block";
    let mail = data.reverse();
    console.log(mail);
    let tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    for (const singleMail of mail) {
      let tr = document.createElement("tr");

      let td = document.createElement("td");
      td.textContent = singleMail.from;
      tr.appendChild(td);

      td = document.createElement("td");
      td.textContent = singleMail.subject;
      tr.appendChild(td);

      td = document.createElement("td");
      td.textContent = singleMail.body;
      tr.appendChild(td);

      td = document.createElement("td");
      
      // Controlliamo se c'è un allegato e se è una stringa Base64 (inizia con data:)
      if (singleMail.attachment && singleMail.attachment.startsWith("data:")) {
          // Opzione A: Mostriamo una piccola anteprima dell'immagine
          let img = document.createElement("img");
          img.src = singleMail.attachment; // Assegniamo direttamente la stringa base64 alla src
          img.style.maxWidth = "100px"; // Limitiamo la grandezza
          img.style.maxHeight = "100px";
          td.appendChild(img);

          // Opzione B (Facoltativa): Aggiungiamo anche un link per scaricarla
          let br = document.createElement("br");
          td.appendChild(br);
          
          let a = document.createElement("a");
          a.textContent = "Scarica immagine";
          a.href = singleMail.attachment; 
          a.download = "allegato.png"; // Forza il download con un nome file
          td.appendChild(a);
      } else {
          td.textContent = "Nessun allegato";
      }

      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  }

  _btnInvia.addEventListener("click", async function () {
    console.log("Ciao");
    let to = document.getElementById("txtTo").value;
    let subject = document.getElementById("txtSubject").value;
    let message = document.getElementById("txtMessage").value;
    let attachment = document.getElementById("txtAttachment").value;
    let blob = document.getElementById("txtAttachment").files[0];
    if (to == "" || subject == "" || message == "") {
      alert("Compilare tutti i campi");
      return;
    } else {
      let base64Attachment = await resizeAndConvert(blob).catch(function (err) {
        alert(err);
      });
      let data = {
        subject: subject,
        message: message,
        attachment: base64Attachment,
        to: to,
        from: currentEmail,
      };
      let response = await inviaRichiesta("POST", "/sendEmail", data);
      if (response.status == 200) {
        alert("Email inviata!");
        // Opzionale: pulisci i campi
        document.getElementById("txtTo").value = "";
        document.getElementById("txtSubject").value = "";
        document.getElementById("txtMessage").value = "";
      } else {
        console.error(response.status + ": " + response.err);
      }
    }
  });
});







function base64Convert(blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    // restituisce un oggetto IMAGE in formato base 64
    reader.readAsDataURL(blob);

    //reader.addEventListener("load", function () {
    reader.onload = function () {
      resolve(reader.result);
    };

    reader.onerror = function (error) {
      reject(error);
    };
  });
}

/* *********************** resizeAndConvert() ****************************** */

/* riceve un FILE OBJECT (BLOB) e restituisce una immagine base64 con resize  */

function resizeAndConvert(img) {
  /*

   step 1: conversione in base64 (tramite FileReader) del file scelto dall'utente
   step 2: assegnazione del file base64 ad un oggetto Image da passare alla libr pica
   step 3: resize mediante la libreria pica che restituisce un canvas
   step 4: conversione del canvas in blob
   step 5: conversione del blob in base64 da inviare al server                */

  return new Promise(function (resolve, reject) {
    const WIDTH = 640;
    const HEIGHT = 480;
    let type = img.type;
    let reader = new FileReader();
    reader.readAsDataURL(img);
    reader.onload = function () {
      let image = new Image();
      image.src = reader.result;
      image.onload = function () {
        if (image.width < WIDTH && image.height < HEIGHT)
          resolve(reader.result);
        else {
          let canvas = document.createElement("canvas");
          if (image.width > image.height) {
            canvas.width = WIDTH;
            canvas.height = image.height * (WIDTH / image.width);
          } else {
            canvas.height = HEIGHT;
            canvas.width = image.width * (HEIGHT / image.height);
          }
          let _pica = new pica();
          _pica
            .resize(image, canvas, {
              unsharpAmount: 80,
              unsharpRadius: 0.6,
              unsharpThreshold: 2,
            })
            .then(function (resizedImage) {
              // resizedImage è restituita in forma di canvas
              _pica
                .toBlob(resizedImage, type, 0.9)
                .then(function (blob) {
                  var reader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onload = function () {
                    resolve(reader.result); //base 64
                  };
                })
                .catch((err) => reject(err));
            })
            .catch(function (err) {
              reject(err);
            });
        }
      };
    };
  });
}
