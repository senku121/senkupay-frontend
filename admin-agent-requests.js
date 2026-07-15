/*==================================================
                SENKU PAY
          ADMIN AGENT REQUESTS
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkustakes-api.onrender.com";

const AGENT_REQUESTS_ENDPOINT=
`${API_BASE_URL}/api/admin/agent-requests`;

/*==================================
        ADMIN SESSION
==================================*/

function getAdminToken(){

return(

sessionStorage.getItem("adminToken")||

localStorage.getItem("adminToken")

);

}

function getAdmin(){

const raw=

sessionStorage.getItem("currentAdmin")||

localStorage.getItem("currentAdmin")||

sessionStorage.getItem("currentUser")||

localStorage.getItem("currentUser");

if(!raw){

return null;

}

try{

return JSON.parse(raw);

}

catch{

return null;

}

}

function clearAdminSession(){

[
"adminToken",
"currentAdmin",
"currentUser",
"adminRememberDevice"

].forEach(key=>{

sessionStorage.removeItem(key);

localStorage.removeItem(key);

});

}

function logoutAdmin(){

clearAdminSession();

window.location.href=

"admin-login.html";

}

const token=

getAdminToken();

if(!token){

logoutAdmin();

return;

}

/*==================================
        PAGE ELEMENTS
==================================*/

const requestTable=
document.getElementById("requestTable");

const requestSearch=
document.getElementById("requestSearch");

const requestTypeFilter=
document.getElementById("requestTypeFilter");

const statusFilter=
document.getElementById("statusFilter");

const refreshButton=
document.getElementById("refreshRequests");

const messageBox=
document.getElementById("agentRequestsMessage");

const pendingCount=
document.getElementById("pendingCount");

const approvedCount=
document.getElementById("approvedCount");

const rejectedCount=
document.getElementById("rejectedCount");

const requestAmount=
document.getElementById("requestAmount");

const requestEmptyState=
document.getElementById("requestEmptyState");

const requestResultsText=
document.getElementById("requestResultsText");

const previousRequestPage=
document.getElementById("previousRequestPage");

const nextRequestPage=
document.getElementById("nextRequestPage");

const requestPageText=
document.getElementById("requestPageText");

const lastSync=
document.getElementById("agentRequestsLastSync");

const backendStatus=
document.getElementById("agentRequestsBackendStatus");

const logoutButton=
document.getElementById("adminLogoutButton");

const sidebar=
document.getElementById("adminSidebar");

const sidebarOverlay=
document.getElementById("adminSidebarOverlay");

const mobileMenuButton=
document.getElementById("adminMobileMenuButton");

/*==================================
        DETAILS MODAL
==================================*/

const requestModal=
document.getElementById("requestModal");

const closeModalButton=
document.getElementById("closeModal");

const closeDetailsButton=
document.getElementById("closeDetailsBtn");

const requestModalTitle=
document.getElementById("requestModalTitle");

const requestModalSubtitle=
document.getElementById("requestModalSubtitle");

const detailRequestId=
document.getElementById("detailRequestId");

const detailAgentId=
document.getElementById("detailAgentId");

const detailAgentName=
document.getElementById("detailAgentName");

const detailAgentUsername=
document.getElementById("detailAgentUsername");

const detailType=
document.getElementById("detailType");

const detailAmount=
document.getElementById("detailAmount");

const detailStatus=
document.getElementById("detailStatus");

const detailDate=
document.getElementById("detailDate");

const requestNoteBox=
document.getElementById("requestNoteBox");

const detailRequestNote=
document.getElementById("detailRequestNote");

const requestModalMessage=
document.getElementById("requestModalMessage");

const requestModalActions=
document.getElementById("requestModalActions");

const approveModalButton=
document.getElementById("approveModalBtn");

const rejectModalButton=
document.getElementById("rejectModalBtn");

/*==================================
        CONFIRMATION MODAL
==================================*/

const actionModal=
document.getElementById("requestActionModal");

const closeActionModalButton=
document.getElementById("closeRequestActionModal");

const cancelActionButton=
document.getElementById("cancelRequestAction");

const confirmActionButton=
document.getElementById("confirmRequestActionButton");

const actionIcon=
document.getElementById("requestActionIcon");

const actionTitle=
document.getElementById("requestActionTitle");

const actionText=
document.getElementById("requestActionText");

const confirmRequestId=
document.getElementById("confirmRequestId");

const confirmRequestAgent=
document.getElementById("confirmRequestAgent");

const confirmRequestAmount=
document.getElementById("confirmRequestAmount");

const confirmRequestAction=
document.getElementById("confirmRequestAction");

const actionNote=
document.getElementById("requestActionNote");

const actionMessage=
document.getElementById("requestActionMessage");

/*==================================
        STATE
==================================*/

let requests=[];

let filteredRequests=[];

let selectedRequest=null;

let pendingAction=null;

let currentPage=1;

const pageSize=10;

/*==================================
        PAGE MESSAGE
==================================*/

function showMessage(

text,

type="info"

){

if(!messageBox){

return;

}

messageBox.hidden=false;

messageBox.className=

`agent-requests-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

if(!messageBox){

return;

}

messageBox.hidden=true;

messageBox.className=

"agent-requests-message";

messageBox.textContent="";

}

/*==================================
        MODAL MESSAGE
==================================*/

function showModalMessage(

element,

text,

type="error"

){

if(!element){

return;

}

element.hidden=false;

element.className=

`request-modal-message show ${type}`;

element.textContent=text;

}

function hideModalMessage(element){

if(!element){

return;

}

element.hidden=true;

element.className=

"request-modal-message";

element.textContent="";

}

/*==================================
        FORMATTERS
==================================*/

function money(value){

return new Intl.NumberFormat(

"en-US",

{

style:"currency",

currency:"USD"

}

).format(

Number(value||0)

);

}

function formatDate(value){

if(!value){

return "--";

}

const parsed=

new Date(value);

if(Number.isNaN(parsed.getTime())){

return String(value);

}

return parsed.toLocaleString();

}

function normalizeText(value){

return String(value??"")

.trim()

.toLowerCase();

}

function escapeHTML(value){

return String(value??"")

.replaceAll("&","&amp;")

.replaceAll("<","&lt;")

.replaceAll(">","&gt;")

.replaceAll('"',"&quot;")

.replaceAll("'","&#039;");

}
/*==================================
        API
==================================*/

async function api(

url,

options={}

){

const response=

await fetch(

url,

{

...options,

headers:{

Accept:"application/json",

Authorization:

`Bearer ${token}`,

...(options.headers||{})

}

}

);

if(

response.status===401||

response.status===403

){

logoutAdmin();

throw new Error(

"Administrator session expired."

);

}

const contentType=

response.headers.get(

"content-type"

)||"";

let data={};

if(

contentType.includes(

"application/json"

)

){

data=await response.json();

}

else{

const text=

await response.text();

data={

message:

text||

"Unexpected server response."

};

}

if(!response.ok){

throw new Error(

data.message||

data.error||

"Agent-request operation failed."

);

}

return data;

}

/*==================================
        NORMALIZE RESPONSE
==================================*/

function normalizeRequests(response){

const source=

response.data||

response;

const list=

Array.isArray(source)

? source

: source.requests||

source.agentRequests||

source.results||

[];

return Array.isArray(list)

? list

: [];

}

/*==================================
        REQUEST VALUES
==================================*/

function requestIdValue(request){

return(

request.id||

request.requestId||

request.agentRequestId||

""

);

}

function requestAgent(request){

return(

request.agent||

request.subAgent||

request.user||

{}

);

}

function requestAgentId(request){

const agent=

requestAgent(request);

return(

agent.id||

agent.agentId||

request.agentId||

request.subAgentId||

"Not specified"

);

}

function requestAgentName(request){

const agent=

requestAgent(request);

return(

agent.name||

agent.fullName||

agent.username||

request.agentName||

"Unknown Agent"

);

}

function requestAgentUsername(request){

const agent=

requestAgent(request);

return(

agent.username||

request.agentUsername||

request.username||

"Not specified"

);

}

function requestTypeValue(request){

return(

request.type||

request.requestType||

request.category||

"Other"

);

}

function requestStatusValue(request){

return normalizeText(

request.status||

"pending"

);

}

function requestAmountValue(request){

return Number(

request.amount||

request.value||

0

);

}

function requestDateValue(request){

return(

request.createdAt||

request.requestedAt||

request.date||

request.updatedAt

);

}

/*==================================
        UPDATE STATISTICS
==================================*/

function updateStatistics(){

let pending=0;

let approved=0;

let rejected=0;

let total=0;

requests.forEach(request=>{

const status=

requestStatusValue(request);

if(

status==="pending"||

status==="processing"

){

pending++;

}

if(

status==="approved"||

status==="completed"

){

approved++;

}

if(

status==="rejected"||

status==="failed"

){

rejected++;

}

total+=

requestAmountValue(request);

});

if(pendingCount){

pendingCount.textContent=

String(pending);

}

if(approvedCount){

approvedCount.textContent=

String(approved);

}

if(rejectedCount){

rejectedCount.textContent=

String(rejected);

}

if(requestAmount){

requestAmount.textContent=

money(total);

}

}

/*==================================
        APPLY FILTERS
==================================*/

function applyFilters(){

const keyword=

normalizeText(

requestSearch?.value

);

const selectedType=

normalizeText(

requestTypeFilter?.value||

"all"

);

const selectedStatus=

normalizeText(

statusFilter?.value||

"all"

);

filteredRequests=

requests.filter(request=>{

const type=

normalizeText(

requestTypeValue(request)

);

const status=

requestStatusValue(request);

const searchable=[

requestIdValue(request),

requestAgentId(request),

requestAgentName(request),

requestAgentUsername(request),

type,

status,

requestAmountValue(request)

]

.map(normalizeText)

.join(" ");

const keywordMatch=

!keyword||

searchable.includes(keyword);

const typeMatch=

selectedType==="all"||

type===selectedType;

const statusMatch=

selectedStatus==="all"||

status===selectedStatus;

return(

keywordMatch&&

typeMatch&&

statusMatch

);

});

currentPage=1;

renderRequests();

}

/*==================================
        PAGINATION
==================================*/

function totalPages(){

return Math.max(

1,

Math.ceil(

filteredRequests.length/

pageSize

)

);

}

previousRequestPage?.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderRequests();

}

}

);

nextRequestPage?.addEventListener(

"click",

()=>{

if(

currentPage<

totalPages()

){

currentPage++;

renderRequests();

}

}

);

/*==================================
        FILTER EVENTS
==================================*/

requestSearch?.addEventListener(

"input",

applyFilters

);

requestTypeFilter?.addEventListener(

"change",

applyFilters

);

statusFilter?.addEventListener(

"change",

applyFilters

);

/*==================================
        RENDER REQUESTS
==================================*/

function renderRequests(){

if(!requestTable){

return;

}

const pages=

totalPages();

if(currentPage>pages){

currentPage=pages;

}

const start=

(currentPage-1)*

pageSize;

const pageRequests=

filteredRequests.slice(

start,

start+pageSize

);

if(pageRequests.length===0){

requestTable.innerHTML="";

if(requestEmptyState){

requestEmptyState.hidden=false;

}

}

else{

if(requestEmptyState){

requestEmptyState.hidden=true;

}

requestTable.innerHTML="";

pageRequests.forEach(request=>{

const id=

requestIdValue(request);

const agentId=

requestAgentId(request);

const agentName=

requestAgentName(request);

const agentUsername=

requestAgentUsername(request);

const type=

normalizeText(

requestTypeValue(request)

);

const status=

requestStatusValue(request);

const amount=

requestAmountValue(request);

const createdAt=

requestDateValue(request);

requestTable.insertAdjacentHTML(

"beforeend",

`

<tr>

<td>

${escapeHTML(id||"--")}

</td>

<td>

<div class="request-agent">

<div class="request-agent-avatar">

${escapeHTML(

String(agentName)

.charAt(0)

.toUpperCase()||

"A"

)}

</div>

<div>

<strong>

${escapeHTML(agentName)}

</strong>

<span>

${escapeHTML(agentUsername)}

</span>

</div>

</div>

</td>

<td>

${escapeHTML(agentId)}

</td>

<td>

<span class="request-type">

${escapeHTML(

requestTypeValue(request)

)}

</span>

</td>

<td>

${money(amount)}

</td>

<td>

<span class="request-status ${escapeHTML(status)}">

${escapeHTML(

request.status||

status

)}

</span>

</td>

<td>

${escapeHTML(

formatDate(createdAt)

)}

</td>

<td>

<div class="request-actions">

<button
type="button"
class="view-request"
data-id="${escapeHTML(id)}">

View

</button>

${

status==="pending"

? `

<button
type="button"
class="approve-request"
data-id="${escapeHTML(id)}">

Approve

</button>

<button
type="button"
class="reject-request"
data-id="${escapeHTML(id)}">

Reject

</button>

`

: ""

}

</div>

</td>

</tr>

`

);

});

}

if(requestResultsText){

const end=

Math.min(

start+

pageRequests.length,

filteredRequests.length

);

requestResultsText.textContent=

filteredRequests.length===0

? "Showing 0 requests"

: `Showing ${start+1}-${end} of ${filteredRequests.length} requests`;

}

if(requestPageText){

requestPageText.textContent=

`Page ${currentPage} of ${pages}`;

}

if(previousRequestPage){

previousRequestPage.disabled=

currentPage<=1;

}

if(nextRequestPage){

nextRequestPage.disabled=

currentPage>=pages;

}

}
/*==================================
        LOAD REQUESTS
==================================*/

async function loadRequests(){

hideMessage();

if(requestTable){

requestTable.innerHTML=`

<tr class="loading-row">

<td colspan="8">

<i class="fa-solid fa-spinner fa-spin"></i>

Loading agent requests...

</td>

</tr>

`;

}

if(requestEmptyState){

requestEmptyState.hidden=true;

}

try{

const response=

await api(

AGENT_REQUESTS_ENDPOINT

);

requests=

normalizeRequests(

response

);

filteredRequests=[

...requests

];

updateStatistics();

renderRequests();

if(lastSync){

lastSync.textContent=

`Last synchronized ${new Date().toLocaleString()}`;

}

if(backendStatus){

backendStatus.textContent=

"Connected to the Senku Pay agent-request server.";

}

return requests;

}

catch(error){

console.error(

"Agent request load failed:",

error

);

if(requestTable){

requestTable.innerHTML=`

<tr class="loading-row">

<td colspan="8">

Unable to load agent requests.

</td>

</tr>

`;

}

if(backendStatus){

backendStatus.textContent=

"Unable to connect to the agent-request server.";

}

showMessage(

error.message||

"Unable to load agent requests.",

"error"

);

return[];

}

}

/*==================================
        REFRESH REQUESTS
==================================*/

refreshButton?.addEventListener(

"click",

async()=>{

refreshButton.disabled=true;

refreshButton.classList.add(

"loading"

);

try{

await loadRequests();

showMessage(

"Agent requests synchronized successfully.",

"success"

);

setTimeout(()=>{

hideMessage();

},2200);

}

catch(error){

console.error(

"Agent request refresh failed:",

error

);

showMessage(

error.message||

"Unable to refresh agent requests.",

"error"

);

}

finally{

refreshButton.disabled=false;

refreshButton.classList.remove(

"loading"

);

}

}

);

/*==================================
        MODAL HELPERS
==================================*/

function openModal(modal){

if(!modal){

return;

}

modal.classList.add(

"active"

);

modal.setAttribute(

"aria-hidden",

"false"

);

document.body.style.overflow=

"hidden";

}

function closeModal(modal){

if(!modal){

return;

}

modal.classList.remove(

"active"

);

modal.setAttribute(

"aria-hidden",

"true"

);

document.body.style.overflow="";

}

/*==================================
        OPEN REQUEST DETAILS
==================================*/

function openRequestDetails(request){

if(

!request||

!requestModal

){

return;

}

selectedRequest=

request;

const id=

requestIdValue(request);

const agentId=

requestAgentId(request);

const agentName=

requestAgentName(request);

const agentUsername=

requestAgentUsername(request);

const type=

requestTypeValue(request);

const amount=

requestAmountValue(request);

const status=

requestStatusValue(request);

const createdAt=

requestDateValue(request);

const note=

request.note||

request.description||

request.message||

request.reason||

"";

if(requestModalTitle){

requestModalTitle.textContent=

`Agent Request ${id}`;

}

if(requestModalSubtitle){

requestModalSubtitle.textContent=

`Review the request submitted by ${agentName}.`;

}

if(detailRequestId){

detailRequestId.textContent=

id||

"--";

}

if(detailAgentId){

detailAgentId.textContent=

agentId;

}

if(detailAgentName){

detailAgentName.textContent=

agentName;

}

if(detailAgentUsername){

detailAgentUsername.textContent=

agentUsername;

}

if(detailType){

detailType.textContent=

type;

}

if(detailAmount){

detailAmount.textContent=

money(amount);

}

if(detailStatus){

detailStatus.textContent=

request.status||

status;

}

if(detailDate){

detailDate.textContent=

formatDate(createdAt);

}

if(requestNoteBox){

requestNoteBox.hidden=

!note;

}

if(detailRequestNote){

detailRequestNote.textContent=

note||

"No note available.";

}

if(requestModalActions){

requestModalActions.hidden=

status!=="pending";

}

hideModalMessage(

requestModalMessage

);

openModal(

requestModal

);

}

/*==================================
        DETAILS BUTTON
==================================*/

document.addEventListener(

"click",

event=>{

const button=

event.target.closest(

".view-request"

);

if(!button){

return;

}

const id=

button.dataset.id;

const request=

requests.find(item=>

String(

requestIdValue(item)

)===String(id)

);

if(!request){

showMessage(

"Selected agent request could not be found.",

"error"

);

return;

}

openRequestDetails(

request

);

}

);

/*==================================
        CLOSE DETAILS MODAL
==================================*/

function closeRequestDetails(){

closeModal(

requestModal

);

hideModalMessage(

requestModalMessage

);

selectedRequest=null;

}

closeModalButton?.addEventListener(

"click",

closeRequestDetails

);

closeDetailsButton?.addEventListener(

"click",

closeRequestDetails

);

requestModal?.addEventListener(

"click",

event=>{

if(event.target===requestModal){

closeRequestDetails();

}

}

);
/*==================================
        BUTTON LOADING
==================================*/

function setButtonLoading(

button,

loading,

text="Processing..."

){

if(!button){

return;

}

button.disabled=loading;

if(loading){

button.dataset.originalHtml=

button.innerHTML;

button.classList.add(

"loading"

);

button.innerHTML=`

<i class="fa-solid fa-spinner fa-spin"></i>

<span>${escapeHTML(text)}</span>

`;

}

else{

button.classList.remove(

"loading"

);

if(button.dataset.originalHtml){

button.innerHTML=

button.dataset.originalHtml;

delete button.dataset.originalHtml;

}

}

}

/*==================================
        OPEN ACTION CONFIRMATION
==================================*/

function openActionConfirmation(

request,

action

){

if(

!request||

!actionModal

){

return;

}

selectedRequest=request;

pendingAction=action;

const id=

requestIdValue(request);

const agentName=

requestAgentName(request);

const amount=

requestAmountValue(request);

const isApprove=

action==="approve";

if(actionIcon){

actionIcon.className=

isApprove

? "request-modal-icon approve"

: "request-modal-icon reject";

actionIcon.innerHTML=

isApprove

? '<i class="fa-solid fa-circle-check"></i>'

: '<i class="fa-solid fa-circle-xmark"></i>';

}

if(actionTitle){

actionTitle.textContent=

isApprove

? "Approve Agent Request"

: "Reject Agent Request";

}

if(actionText){

actionText.textContent=

isApprove

? "Confirm that this agent request should be approved."

: "Confirm that this agent request should be rejected.";

}

if(confirmRequestId){

confirmRequestId.textContent=

id||

"--";

}

if(confirmRequestAgent){

confirmRequestAgent.textContent=

agentName;

}

if(confirmRequestAmount){

confirmRequestAmount.textContent=

money(amount);

}

if(confirmRequestAction){

confirmRequestAction.textContent=

isApprove

? "Approve"

: "Reject";

}

if(confirmActionButton){

confirmActionButton.classList.remove(

"approve-action",

"reject-action"

);

confirmActionButton.classList.add(

isApprove

? "approve-action"

: "reject-action"

);

confirmActionButton.innerHTML=

isApprove

? `

<i class="fa-solid fa-circle-check"></i>

<span>Approve Request</span>

`

: `

<i class="fa-solid fa-circle-xmark"></i>

<span>Reject Request</span>

`;

}

if(actionNote){

actionNote.value="";

}

hideModalMessage(

actionMessage

);

closeModal(

requestModal

);

openModal(

actionModal

);

}

/*==================================
        TABLE ACTION BUTTONS
==================================*/

document.addEventListener(

"click",

event=>{

const approveButton=

event.target.closest(

".approve-request"

);

const rejectButton=

event.target.closest(

".reject-request"

);

const button=

approveButton||

rejectButton;

if(!button){

return;

}

const id=

button.dataset.id;

const request=

requests.find(item=>

String(

requestIdValue(item)

)===String(id)

);

if(!request){

showMessage(

"Selected agent request could not be found.",

"error"

);

return;

}

openActionConfirmation(

request,

approveButton

? "approve"

: "reject"

);

}

);

/*==================================
        MODAL ACTION BUTTONS
==================================*/

approveModalButton?.addEventListener(

"click",

()=>{

if(!selectedRequest){

showModalMessage(

requestModalMessage,

"No request is selected.",

"error"

);

return;

}

openActionConfirmation(

selectedRequest,

"approve"

);

}

);

rejectModalButton?.addEventListener(

"click",

()=>{

if(!selectedRequest){

showModalMessage(

requestModalMessage,

"No request is selected.",

"error"

);

return;

}

openActionConfirmation(

selectedRequest,

"reject"

);

}

);

/*==================================
        CLOSE ACTION MODAL
==================================*/

function closeActionConfirmation(){

closeModal(

actionModal

);

hideModalMessage(

actionMessage

);

pendingAction=null;

selectedRequest=null;

if(actionNote){

actionNote.value="";

}

}

closeActionModalButton?.addEventListener(

"click",

closeActionConfirmation

);

cancelActionButton?.addEventListener(

"click",

closeActionConfirmation

);

actionModal?.addEventListener(

"click",

event=>{

if(event.target===actionModal){

closeActionConfirmation();

}

}

);

/*==================================
        REFRESH SELECTED REQUEST
==================================*/

async function refreshSelectedRequest(id){

await loadRequests();

return requests.find(item=>

String(

requestIdValue(item)

)===String(id)

);

}

/*==================================
        PROCESS REQUEST ACTION
==================================*/

async function processRequestAction(){

if(

!selectedRequest||

!pendingAction

){

showModalMessage(

actionMessage,

"No pending request action was found.",

"error"

);

return;

}

const id=

requestIdValue(

selectedRequest

);

if(!id){

showModalMessage(

actionMessage,

"Request ID is missing.",

"error"

);

return;

}

const note=

actionNote?.value.trim()||

"";

const isApprove=

pendingAction==="approve";

setButtonLoading(

confirmActionButton,

true,

isApprove

? "Approving..."

: "Rejecting..."

);

hideModalMessage(

actionMessage

);

try{

const response=

await api(

`${AGENT_REQUESTS_ENDPOINT}/${id}/${pendingAction}`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

note

})

}

);

showModalMessage(

actionMessage,

response.message||

(

isApprove

? "Agent request approved successfully."

: "Agent request rejected successfully."

),

"success"

);

const refreshed=

await refreshSelectedRequest(

id

);

setTimeout(()=>{

closeActionConfirmation();

showMessage(

response.message||

(

isApprove

? "Agent request approved successfully."

: "Agent request rejected successfully."

),

"success"

);

if(refreshed){

selectedRequest=refreshed;

}

},900);

}

catch(error){

console.error(

`Agent request ${pendingAction} failed:`,

error

);

showModalMessage(

actionMessage,

error.message||

`Unable to ${pendingAction} this agent request.`,

"error"

);

}

finally{

setButtonLoading(

confirmActionButton,

false

);

}

}

confirmActionButton?.addEventListener(

"click",

processRequestAction

);
/*==================================
        MOBILE SIDEBAR
==================================*/

function openSidebar(){

sidebar?.classList.add(
"mobile-open"
);

sidebarOverlay?.classList.add(
"show"
);

document.body.classList.add(
"admin-sidebar-open"
);

mobileMenuButton?.setAttribute(
"aria-expanded",
"true"
);

}

function closeSidebar(){

sidebar?.classList.remove(
"mobile-open"
);

sidebarOverlay?.classList.remove(
"show"
);

document.body.classList.remove(
"admin-sidebar-open"
);

mobileMenuButton?.setAttribute(
"aria-expanded",
"false"
);

}

mobileMenuButton?.addEventListener(

"click",

()=>{

if(
sidebar?.classList.contains(
"mobile-open"
)
){

closeSidebar();

}
else{

openSidebar();

}

}

);

sidebarOverlay?.addEventListener(
"click",
closeSidebar
);

document
.querySelectorAll(
".admin-sidebar nav a"
)
.forEach(link=>{

link.addEventListener(

"click",

()=>{

if(window.innerWidth<=760){

closeSidebar();

}

}

);

});

/*==================================
        LOGOUT
==================================*/

logoutButton?.addEventListener(

"click",

()=>{

const confirmLogout=()=>{

logoutAdmin();

};

if(
typeof showPopup==="function"
){

showPopup({

type:"warning",

title:"Administrator Logout",

message:
"Are you sure you want to log out of the Senku Pay administration panel?",

confirm:true,

onConfirm:
confirmLogout

});

return;

}

if(
window.confirm(
"Logout from the administration panel?"
)
){

confirmLogout();

}

}

);

/*==================================
        KEYBOARD SUPPORT
==================================*/

document.addEventListener(

"keydown",

event=>{

if(event.key!=="Escape"){

return;

}

if(
actionModal?.classList.contains(
"active"
)
){

closeActionConfirmation();

return;

}

if(
requestModal?.classList.contains(
"active"
)
){

closeRequestDetails();

return;

}

if(
sidebar?.classList.contains(
"mobile-open"
)
){

closeSidebar();

}

}

);

/*==================================
        RESIZE HANDLING
==================================*/

window.addEventListener(

"resize",

()=>{

if(window.innerWidth>760){

closeSidebar();

}

}

);

/*==================================
        ADMIN ROLE VALIDATION
==================================*/

const admin=
getAdmin();

if(admin){

const role=

String(
admin.role||
""
).toUpperCase();

if(
role &&
role!=="ADMIN" &&
role!=="SUPER_ADMIN"
){

logoutAdmin();

return;

}

}

/*==================================
        INITIALIZE
==================================*/

await loadRequests();

/*==================================
        END
==================================*/

});