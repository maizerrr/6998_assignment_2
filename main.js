let texts = document.getElementById("texts");
let input = document.getElementById('searchbar')
while (texts == null || input ==null) {
  texts = document.getElementById("texts");
  input = document.getElementById("searchbar");
  console.log("retrieving texts...")

}
const search_url = "https://ookzp1iggd.execute-api.us-east-1.amazonaws.com/live/search?q="
const upload_url = "https://ookzp1iggd.execute-api.us-east-1.amazonaws.com/live/upload/"

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;


const recognition = new SpeechRecognition();
recognition.interimResults = true;


recognition.addEventListener("result", (e) => {

  // texts.appendChild(p);
  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  if (e.results[0].isFinal) {
    input.value += text;
  }
});

function record() {
  document.getElementById("btn1").style = "display: None";
  document.getElementById("btn2").style = "display: block";
  input.value = "";
  recognition.start();
  
}

function stop() {
  document.getElementById("btn1").style = "display: block";
  document.getElementById("btn2").style = "display: None";
  recognition.stop();
}

function search_album(query) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("x-api-key", "BcsoccsCzM87cwZS6XaxQnS1Kil8J0x2woqCDKG6");
    query= query.toLowerCase();
    // RESTful request
    var requestOptions = {
      method: 'GET',
      headers:myHeaders,
      redirect: 'follow'
    };
    fetch(search_url+query, requestOptions)
    .then(response => response.json())
      .then(result => {
        console.log(result);
        console.log(result.body)
        addImages(result.body);
      })
      .catch(error => console.log('error', error));
  } catch (e) {
    console.log(e);
  }
}

input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    search_album(input.value);
  }
});

function addImages(images) {
  var img_wrapper = document.getElementById("img_wrapper")
  var photo = img_wrapper.lastElementChild;
  while (photo) {
    img_wrapper.removeChild(photo);
    photo = img_wrapper.lastElementChild;
  }
  if (images.length === 0) {
    var p = document.createElement("p");
    p.innerText = "Nothing found";
    img_wrapper.append(p);
  }
  for (var image of images) {
    var photo = document.createElement("img");
    photo.src = image;
    img_wrapper.appendChild(photo);
  }
}

// upload images
document.getElementById("uploadButton").onclick = async function () {
  let fileElement = document.getElementById('fileInput')
  let fileName = document.getElementById("fileInput").value.split("\\").pop();
  // check if user had selected a file
  if (fileElement.files.length === 0) {
    alert('please choose file(s)');
    return;
  }

  let files = Array.from(fileElement.files)
  // let formData = new FormData();
  // files.forEach(file => {
  //   formData.append('file', file);
  // });

  var myHeaders = new Headers();

  let labels = document.getElementById('customizedlabel')
  console.log(labels.value)
  labels = labels.value.replace(/[^a-zA-Z0-9,\s]/g, "")
  console.log(labels);

  if (labels.length != 0) {
    myHeaders.append("labels", labels);
  }
  myHeaders.append("Content-Type", "image/jpeg");
  myHeaders.append("x-api-key", "BcsoccsCzM87cwZS6XaxQnS1Kil8J0x2woqCDKG6");

  const base64String = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.replace("data:","").replace(/^.+,/, ""))
    reader.onerror = error => reject(error)
  });

  var requestOptions = {
    mode: 'cors',
    method: 'PUT',
    headers: myHeaders,
    body: files[0],
    redirect: 'follow'
  };

  console.log(requestOptions.body);
  
  fetch("https://ookzp1iggd.execute-api.us-east-1.amazonaws.com/live/upload/"+fileName, requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => {
      console.log('error', error);
  });
}


function displayString() {
  console.log("Base64String about to be printed");
  alert(base64String);
}

function imageUploaded() {
  var file = document.querySelector(
      'input[type="file"]')['files'][0];
  if (file === null) {
    console.log(file);
    return
  }
  var reader = new FileReader();
  reader.onload = function () {
      base64String = reader.result.replace("data:", "")
          .replace(/^.+,/, "");

      // imageBase64Stringsep = base64String;
      // alert(imageBase64Stringsep);
      // console.log(base64String);
      return base64String;
  }
  reader.readAsDataURL(file);
}


// let labels = document.getElementById('customizedlabel')
// labels.addEventListener("keypress", function(event) {
  
//   if (event.key === "Enter") {
//     event.preventDefault();
//     console.log(labels.value)
//     cleaned_labels = labels.value.replace(/[^a-zA-Z0-9,\s]/g, "")
//     console.log(cleaned_labels);

//   }
// });
