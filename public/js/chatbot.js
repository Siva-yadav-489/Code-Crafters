const chatInput = document.querySelector(".chat-input input");
const sendChatBtn = document.querySelector(".send-btn");
const chatbox = document.querySelector(".chatbox");
const chatbotContainer = document.querySelector(".chatbot-container");

let userMessage;

// valid API key
// const CHAT_API_KEY = "";
// const toggleChatbot = () => {
//   chatbotContainer.classList.toggle("hidden");
// };

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add(className);
  chatLi.innerHTML = `<p>${message}</p>`;
  return chatLi;
};

const generateResponse = () => {
  fetch("/chatbot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: userMessage }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      if (data) {
        const botMessage = data;
        const thinkingLi = createChatLi("thinking...", "incoming");
        reinitializeVanta();
        chatbox.appendChild(thinkingLi);

        setTimeout(() => {
          thinkingLi.remove();
          chatbox.appendChild(createChatLi(botMessage, "incoming"));
          reinitializeVanta();
          window.scroll(500, 500);
        }, 1000);
      } else {
        chatbox.appendChild(createChatLi("No response from AI", "incoming"));
        reinitializeVanta();
        window.scroll(500, 500);
      }
      chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch((error) => {
      console.error("API Error:", error);
      chatbox.appendChild(createChatLi(`Error: ${error.message}`, "incoming"));
    });
};

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return alert("type something");
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  reinitializeVanta();
  window.scroll(500, 500);
  chatInput.value = "";
  generateResponse();
};

sendChatBtn.addEventListener("click", handleChat);
