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
    query= query.toLowerCase();
    // RESTful request
    var requestOptions = {
      method: 'GET',
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
