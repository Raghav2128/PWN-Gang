const receivedRequests = [
    {id:'req1', medicine:'Paracetamol 500mg', urgency:'high', quantity: 2},
    {id:'req2', medicine:'Insulin Pen', urgency:'medium', quantity: 1}
];

const myRequests = [
    {id:'myreq3', medicine:'Vitamin D Supplements', urgency:'low', status:'Pending', quantity: 1},
    {id:'myreq4', medicine:'Blood Pressure Monitor', urgency:'medium', status:'Accepted', quantity: 1}
];

function renderRequests() {
    const receivedDiv = document.getElementById('received-requests');
    const myDiv = document.getElementById('my-requests');
    receivedDiv.innerHTML = '';
    myDiv.innerHTML = '';

    receivedRequests.forEach(req=>{
        const card = document.createElement('div');
        card.className = `request-card ${req.urgency}`;
        card.innerHTML = `
            <p><b>${req.medicine}</b></p>
            <p>Urgency: ${req.urgency}</p>
            <p>Quantity: ${req.quantity}</p>
            <div class="buttons">
                <button class="accept" onclick="acceptRequest('${req.id}')">Accept</button>
                <button class="decline" onclick="declineRequest('${req.id}')">Decline</button>
            </div>
        `;
        receivedDiv.appendChild(card);
    });

    myRequests.forEach(req=>{
        const card = document.createElement('div');
        card.className = `request-card ${req.urgency}`;
        card.innerHTML = `
            <p><b>${req.medicine}</b></p>
            <p>Urgency: ${req.urgency}</p>
            <p>Status: ${req.status}</p>
            <p>Quantity: ${req.quantity}</p>
            <div class="buttons">
                <button class="cancel" onclick="cancelRequest('${req.id}')">Cancel</button>
            </div>
        `;
        myDiv.appendChild(card);
    });

    checkEmptyStates();
}

function acceptRequest(id){
    showToast('Accept button clicked - placeholder functionality');
    // Placeholder: Request remains visible for future implementation
}

function declineRequest(id){
    showToast('Request declined');
    // Remove the request from the array
    const index = receivedRequests.findIndex(r => r.id === id);
    if (index > -1) {
        receivedRequests.splice(index, 1);
        renderRequests();
    }
}

function cancelRequest(id){
    showToast('Request canceled');
    // Remove the request from the array
    const index = myRequests.findIndex(r => r.id === id);
    if (index > -1) {
        myRequests.splice(index, 1);
        renderRequests();
    }
}

function checkEmptyStates(){
    document.getElementById('received-empty').style.display = receivedRequests.length? 'none':'block';
    document.getElementById('my-empty').style.display = myRequests.length? 'none':'block';
}

function showToast(msg){
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(()=>{toast.style.display='none';},2000);
}

renderRequests();