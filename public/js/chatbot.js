// const chatInput = document.querySelector(".chat-input input");
// const sendChatBtn = document.querySelector(".send-btn");
// const chatbox = document.querySelector(".chatbox");
// const chatbotContainer = document.querySelector(".chatbot-container");

// let userMessage;

// // valid API key
// // const CHAT_API_KEY = "";
// // const toggleChatbot = () => {
// //   chatbotContainer.classList.toggle("hidden");
// // };

// const createChatLi = (message, className) => {
//   const chatLi = document.createElement("li");
//   chatLi.classList.add(className);
//   chatLi.innerHTML = `<p>${message}</p>`;
//   return chatLi;
// };

// const generateResponse = () => {
//   fetch("/chatbot", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ question: userMessage }),
//   })
//     .then((res) => {
//       if (!res.ok) {
//         throw new Error(`HTTP error! Status: ${res.status}`);
//       }
//       return res.json();
//     })
//     .then((data) => {
//       if (data) {
//         const botMessage = data;
//         const thinkingLi = createChatLi("thinking...", "incoming");
//         // reinitializeVanta();
//         chatbox.appendChild(thinkingLi);

//         setTimeout(() => {
//           thinkingLi.remove();
//           chatbox.appendChild(createChatLi(botMessage, "incoming"));
//           // reinitializeVanta();
//           // window.scroll(500, 500);
//         }, 1000);
//       } else {
//         chatbox.appendChild(createChatLi("No response from AI", "incoming"));
//         // reinitializeVanta();
//         // window.scroll(500, 500);
//       }
//       chatbox.scrollTop = chatbox.scrollHeight;
//     })
//     .catch((error) => {
//       console.error("API Error:", error);
//       chatbox.appendChild(createChatLi(`Error: ${error.message}`, "incoming"));
//     });
// };

// const handleChat = () => {
//   userMessage = chatInput.value.trim();
//   if (!userMessage) return alert("type something");
//   chatbox.appendChild(createChatLi(userMessage, "outgoing"));
//   // reinitializeVanta();
//   // window.scroll(500, 500);
//   chatInput.value = "";
//   generateResponse();
// };

// sendChatBtn.addEventListener("click", handleChat);

const form = document.getElementById("chatForm");

form.addEventListener("submit", async (event) => {
  if (!form.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
    form.classList.add("was-validated");
    return;
  }
  //req-response
  event.preventDefault();
  const questionInput = document.getElementById("question");
  document.querySelector(".submit-btn").disabled = true;
  const question = questionInput.value;

  //valid req
  //you
  let que = document.createElement("p");
  que.classList.add(
    "bg-primary",
    "text-light",
    "rounded",
    "p-2",
    "row",
    "align-self-end",
    "doto-font",
    "me-2",
    "mt-2",
    "source-sans-3-regular"
  );
  que.style.maxWidth = "75%";
  que.innerText = "You: " + question;

  //chat window
  const chatWindow = document.getElementById("chat-window");
  chatWindow.appendChild(que);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  //bot loading
  let ans = document.createElement("p");
  ans.classList.add(
    "bg-secondary-subtle",
    "text-dark",
    "rounded",
    "p-2",
    "row",
    "align-self-start",
    "doto-font",
    "ms-2",
    "source-sans-3-regular"
  );
  ans.style.maxWidth = "75%";

  ans.innerText = "Bot: ";
  let spinner = document.createElement("span");
  spinner.classList.add("spinner-border");

  ans.appendChild(spinner);
  questionInput.value = "";
  chatWindow.appendChild(ans);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch("/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question }),
    });

    const data = await response.json();
    //bot
    if (typeof data !== "string") {
      ans.removeChild(spinner);
      ans.innerText = "Bot: " + data.message;
      document.querySelector(".submit-btn").disabled = false;
    } else {
      ans.removeChild(spinner);
      ans.innerText = "Bot: " + data;
      document.querySelector(".submit-btn").disabled = false;
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("chat-window").innerText =
      "An error occurred: " + error.message;
  }
});
