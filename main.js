let texts = document.getElementById("texts");
while (texts == null) {
  texts = document.getElementById("texts");
  console.log("retrieving texts...")
}

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

console.log("after loading window.spechrecognition");

const recognition = new SpeechRecognition();
recognition.interimResults = true;

let p = document.createElement("p");
console.log("after setting p");
recognition.addEventListener("result", (e) => {
  console.log("entering result callback")
  texts.appendChild(p);
  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  p.innerText = text;
  if (e.results[0].isFinal) {
    if (text.includes("how are you")) {
      p = document.createElement("p");
      p.classList.add("replay");
      p.innerText = "I am fine";
      texts.appendChild(p);
    }
    if (
      text.includes("what's your name") ||
      text.includes("what is your name")
    ) {
      p = document.createElement("p");
      p.classList.add("replay");
      p.innerText = "My Name is Cifar";
      texts.appendChild(p);
    }
   
    p = document.createElement("p");
  }
});

recognition.addEventListener("end", () => {
  console.log("before recognition start");
  recognition.start();
});
recognition.start();



