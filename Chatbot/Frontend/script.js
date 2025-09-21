const inputMessage = document.getElementById("inputMessage");
const sendBtn = document.getElementById("sendBtn");
const chatbox = document.getElementById("chatbox");

// Add welcome message when page loads
document.addEventListener('DOMContentLoaded', function() {
    appendMessage("Hello! I'm your medical assistant. How can I help you today?", "bot");
});

function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);

    const textBubble = document.createElement("span");
    textBubble.classList.add("text-bubble");
    textBubble.textContent = text;

    if (sender == "bot") {
        const iconImg = document.createElement("img");
        iconImg.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTQiIGN5PSIxNCIgcj0iMTQiIGZpbGw9IiMwMDdiZmYiLz4KPHN2ZyB4PSI3IiB5PSI3IiB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik03IDFMMTAgNEgxMkwyIDRINUw3IDFaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+";
        iconImg.classList.add("bot-chat-logo");
        iconImg.alt = "bot logo";
        msgDiv.appendChild(iconImg);
    }

    msgDiv.appendChild(textBubble);
    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}



async function sendMessage(){
    const message=inputMessage.value.trim();

    if(!message) return ; 
    appendMessage(message,"user");
    inputMessage.value = '';
    sendBtn.disabled=true;


    try {
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        // data.reply
        appendMessage(data.reply,"bot")

    } catch (error) {
        appendMessage('Sorry, I am currently unavailable. Please try again later.','bot');
    } finally{
        sendBtn.disabled=false;
        inputMessage.focus();
    }
    

}

// event
sendBtn.addEventListener("click",sendMessage)
inputMessage.addEventListener("keypress",function (e){
    if (e.key === "Enter") sendMessage();
})