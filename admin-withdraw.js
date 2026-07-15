/*==================================================
                SENKU PAY
            ADMIN WITHDRAW REQUESTS
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkupay-api.onrender.com";

const WITHDRAWS_ENDPOINT=
`${API_BASE_URL}/api/admin/withdraws`;

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
        ELEMENTS
==================================*/

const requestTable=
document.getElementById("withdrawRequests");

const searchInput=
document.getElementById("withdrawSearch");

const statusFilter=
document.getElementById("withdrawStatusFilter");

const refreshButton=
document.getElementById("refreshWithdrawButton");

const messageBox=
document.getElementById("withdrawMessage");

const pendingCount=
document.getElementById("pendingCount");

const pendingAmount=
document.getElementById("pendingAmount");

const approvedCount=
document.getElementById("approvedCount");

const rejectedCount=
document.getElementById("rejectedCount");

const emptyState=
document.getElementById("withdrawEmpty");

const resultsText=
document.getElementById("withdrawResultsText");

const pageText=
document.getElementById("withdrawPageText");

const previousPageButton=
document.getElementById("withdrawPreviousPage");

const nextPageButton=
document.getElementById("withdrawNextPage");

const lastSync=
document.getElementById("lastWithdrawSync");

const backendStatus=
document.getElementById("withdrawBackendStatus");

const logoutButton=
document.getElementById("adminLogoutButton");

const sidebar=
document.getElementById("adminSidebar");

const sidebarOverlay=
document.getElementById("adminSidebarOverlay");

const mobileMenuButton=
document.getElementById("adminMobileMenuButton");

/*==================================
        MODAL ELEMENTS
==================================*/

const withdrawModal=
document.getElementById("withdrawModal");

const closeModalButton=
document.getElementById("closeWithdrawModal");

const closeDetailsButton=
document.getElementById("closeWithdrawDetailsButton");

const modalTitle=
document.getElementById("withdrawModalTitle");

const modalSubtitle=
document.getElementById("withdrawModalSubtitle");

const detailId=
document.getElementById("detailWithdrawId");

const detailUser=
document.getElementById("detailWithdrawUser");

const detailEmail=
document.getElementById("detailWithdrawEmail");

const detailAmount=
document.getElementById("detailWithdrawAmount");

const detailMethod=
document.getElementById("detailWithdrawMethod");

const detailAccount=
document.getElementById("detailWithdrawAccount");

const detailStatus=
document.getElementById("detailWithdrawStatus");

const detailDate=
document.getElementById("detailWithdrawDate");

const noteBox=
document.getElementById("withdrawNoteBox");

const noteText=
document.getElementById("detailWithdrawNote");

const modalMessage=
document.getElementById("withdrawModalMessage");

const modalActions=
document.getElementById("withdrawModalActions");

const approveButton=
document.getElementById("approveWithdrawButton");

const rejectButton=
document.getElementById("rejectWithdrawButton");

/*==================================
        STATE
==================================*/

let withdrawRequests=[];

let filteredRequests=[];

let selectedRequest=null;

let currentPage=1;

const pageSize=10;

/*==================================
        MESSAGE
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

`withdraw-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

if(!messageBox){

return;

}

messageBox.hidden=true;

messageBox.className=

"withdraw-message";

messageBox.textContent="";

}

function showModalMessage(

text,

type="error"

){

if(!modalMessage){

return;

}

modalMessage.hidden=false;

modalMessage.className=

`withdraw-modal-message show ${type}`;

modalMessage.textContent=text;

}

function hideModalMessage(){

if(!modalMessage){

return;

}

modalMessage.hidden=true;

modalMessage.className=

"withdraw-modal-message";

modalMessage.textContent="";

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

if(

Number.isNaN(

parsed.getTime()

)

){

return "--";

}

return parsed.toLocaleString();

}

function escapeHTML(value){

return String(value??"")

.replaceAll("&","&amp;")

.replaceAll("<","&lt;")

.replaceAll(">","&gt;")

.replaceAll('"',"&quot;")

.replaceAll("'","&#039;");

}

function normalizeText(value){

return String(value??"")

.trim()

.toLowerCase();

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

"Unable to load withdrawal requests."

);

}

return data;

}

/*==================================
        NORMALIZE RESPONSE
==================================*/

function normalizeWithdrawals(response){

const list=

Array.isArray(response)

? response

: response.withdrawals||

response.withdraws||

response.requests||

response.data||

response.results||

[];

return Array.isArray(list)

? list

: [];

}

/*==================================
        WITHDRAW VALUES
==================================*/

function withdrawUser(request){

return(

request.user||

request.owner||

request.accountUser||

{}

);

}

function withdrawUsername(request){

const user=

withdrawUser(request);

return(

user.username||

user.fullName||

user.name||

request.username||

"Unknown User"

);

}

function withdrawEmail(request){

const user=

withdrawUser(request);

return(

user.email||

request.email||

"No email"

);

}

function withdrawMethod(request){

return(

request.method||

request.paymentMethod||

request.payoutMethod||

request.channel||

"Not specified"

);

}

function withdrawAccount(request){

return(

request.account||

request.accountNumber||

request.walletAddress||

request.destination||

request.paymentDetails||

"Not specified"

);

}

function withdrawStatus(request){

return normalizeText(

request.status||

"pending"

);

}

/*==================================
        SUMMARY
==================================*/

function updateSummary(){

let pending=0;

let approved=0;

let rejected=0;

let amount=0;

withdrawRequests.forEach(request=>{

const status=

withdrawStatus(

request

);

if(status==="pending"){

pending++;

amount+=Number(

request.amount||

0

);

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

});

if(pendingCount){

pendingCount.textContent=

String(pending);

}

if(pendingAmount){

pendingAmount.textContent=

money(amount);

}

if(approvedCount){

approvedCount.textContent=

String(approved);

}

if(rejectedCount){

rejectedCount.textContent=

String(rejected);

}

}

/*==================================
        FILTER REQUESTS
==================================*/

function applyFilters(){

const keyword=

normalizeText(

searchInput?.value

);

const selectedStatus=

normalizeText(

statusFilter?.value||

"all"

);

filteredRequests=

withdrawRequests.filter(request=>{

const status=

withdrawStatus(

request

);

const searchable=[

request.id,

request.withdrawId,

withdrawUsername(request),

withdrawEmail(request),

withdrawMethod(request),

withdrawAccount(request),

request.amount,

status

]

.map(normalizeText)

.join(" ");

const keywordMatch=

!keyword||

searchable.includes(keyword);

const statusMatch=

selectedStatus==="all"||

status===selectedStatus;

return(

keywordMatch&&

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

previousPageButton?.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderRequests();

}

}

);

nextPageButton?.addEventListener(

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

searchInput?.addEventListener(

"input",

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

(currentPage-1)*pageSize;

const pageRequests=

filteredRequests.slice(

start,

start+pageSize

);

if(pageRequests.length===0){

requestTable.innerHTML="";

if(emptyState){

emptyState.hidden=false;

}

}

else{

if(emptyState){

emptyState.hidden=true;

}

requestTable.innerHTML="";

pageRequests.forEach(request=>{

const id=

request.id||

request.withdrawId||

"--";

const username=

withdrawUsername(

request

);

const method=

withdrawMethod(

request

);

const account=

withdrawAccount(

request

);

const status=

withdrawStatus(

request

);

const amount=

Number(

request.amount||

0

);

const createdAt=

request.createdAt||

request.requestedAt||

request.date;

requestTable.insertAdjacentHTML(

"beforeend",

`

<tr>

<td>

${escapeHTML(username)}

</td>

<td>

${escapeHTML(method)}

</td>

<td>

${escapeHTML(account)}

</td>

<td>

${money(amount)}

</td>

<td>

<span class="withdraw-status ${escapeHTML(status)}">

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

<button
type="button"
class="withdraw-details-btn"
data-id="${escapeHTML(id)}">

Details

</button>

</td>

</tr>

`

);

});

}

if(resultsText){

const end=

Math.min(

start+

pageRequests.length,

filteredRequests.length

);

resultsText.textContent=

filteredRequests.length===0

? "Showing 0 requests"

: `Showing ${start+1}-${end} of ${filteredRequests.length} requests`;

}

if(pageText){

pageText.textContent=

`Page ${currentPage} of ${pages}`;

}

if(previousPageButton){

previousPageButton.disabled=

currentPage<=1;

}

if(nextPageButton){

nextPageButton.disabled=

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

<td colspan="7">

<i class="fa-solid fa-spinner fa-spin"></i>

Loading withdrawal requests...

</td>

</tr>

`;

}

if(emptyState){

emptyState.hidden=true;

}

try{

const response=

await api(

WITHDRAWS_ENDPOINT

);

withdrawRequests=

normalizeWithdrawals(

response

);

filteredRequests=[

...withdrawRequests

];

updateSummary();

renderRequests();

if(lastSync){

lastSync.textContent=

`Last synchronized ${new Date().toLocaleString()}`;

}

if(backendStatus){

backendStatus.textContent=

"Connected to the Senku Pay withdrawal server.";

}

return withdrawRequests;

}

catch(error){

console.error(

"Withdrawal load failed:",

error

);

if(requestTable){

requestTable.innerHTML=`

<tr class="loading-row">

<td colspan="7">

Unable to load withdrawal requests.

</td>

</tr>

`;

}

if(backendStatus){

backendStatus.textContent=

"Unable to connect to the withdrawal server.";

}

showMessage(

error.message||

"Unable to load withdrawal requests.",

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

"Withdrawal requests synchronized successfully.",

"success"

);

setTimeout(()=>{

hideMessage();

},2200);

}

catch(error){

console.error(

"Withdrawal refresh failed:",

error

);

showMessage(

error.message||

"Unable to refresh withdrawal requests.",

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
        OPEN WITHDRAW MODAL
==================================*/

function openWithdrawModal(request){

if(
!withdrawModal||
!request
){

return;

}

selectedRequest=request;

const id=

request.id||

request.withdrawId||

"--";

const username=

withdrawUsername(

request

);

const email=

withdrawEmail(

request

);

const amount=

Number(

request.amount||

0

);

const method=

withdrawMethod(

request

);

const account=

withdrawAccount(

request

);

const status=

withdrawStatus(

request

);

const createdAt=

request.createdAt||

request.requestedAt||

request.date;

const note=

request.note||

request.description||

request.message||

"";

if(modalTitle){

modalTitle.textContent=

`Withdrawal Request ${id}`;

}

if(modalSubtitle){

modalSubtitle.textContent=

`Review the payout request submitted by ${username}.`;

}

if(detailId){

detailId.textContent=

id;

}

if(detailUser){

detailUser.textContent=

username;

}

if(detailEmail){

detailEmail.textContent=

email;

}

if(detailAmount){

detailAmount.textContent=

money(amount);

}

if(detailMethod){

detailMethod.textContent=

method;

}

if(detailAccount){

detailAccount.textContent=

account;

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

if(noteBox){

noteBox.hidden=

!note;

}

if(noteText){

noteText.textContent=

note||

"No note available.";

}

if(modalActions){

modalActions.hidden=

status!=="pending";

}

hideModalMessage();

withdrawModal.classList.add(

"active"

);

withdrawModal.setAttribute(

"aria-hidden",

"false"

);

document.body.style.overflow=

"hidden";

}

/*==================================
        CLOSE WITHDRAW MODAL
==================================*/

function closeWithdrawModal(){

if(!withdrawModal){

return;

}

withdrawModal.classList.remove(

"active"

);

withdrawModal.setAttribute(

"aria-hidden",

"true"

);

document.body.style.overflow="";

selectedRequest=null;

hideModalMessage();

}

/*==================================
        DETAILS BUTTON
==================================*/

document.addEventListener(

"click",

event=>{

const button=

event.target.closest(

".withdraw-details-btn"

);

if(!button){

return;

}

const id=

button.dataset.id;

const request=

withdrawRequests.find(item=>

String(

item.id||

item.withdrawId||

""

)===String(id)

);

if(!request){

showMessage(

"Withdrawal request details could not be found.",

"error"

);

return;

}

openWithdrawModal(

request

);

}

);

/*==================================
        MODAL CLOSE EVENTS
==================================*/

closeModalButton?.addEventListener(

"click",

closeWithdrawModal

);

closeDetailsButton?.addEventListener(

"click",

closeWithdrawModal

);

withdrawModal?.addEventListener(

"click",

event=>{

if(

event.target===withdrawModal

){

closeWithdrawModal();

}

}

);

/*==================================
        MODAL BUTTON LOADING
==================================*/

function setActionLoading(

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

<span>${text}</span>

`;

}

else{

button.classList.remove(

"loading"

);

if(

button.dataset.originalHtml

){

button.innerHTML=

button.dataset.originalHtml;

delete button.dataset.originalHtml;

}

}

}
/*==================================
        PROCESS WITHDRAW REQUEST
==================================*/

async function processWithdrawRequest(

action,

button

){

if(!selectedRequest){

showModalMessage(

"No withdrawal request is selected.",

"error"

);

return;

}

const id=

selectedRequest.id||

selectedRequest.withdrawId;

if(!id){

showModalMessage(

"Withdrawal request ID is missing.",

"error"

);

return;

}

const actionLabel=

action==="approve"

? "Approving..."

: "Rejecting...";

setActionLoading(

button,

true,

actionLabel

);

hideModalMessage();

try{

const response=

await api(

`${WITHDRAWS_ENDPOINT}/${id}/${action}`,

{

method:"POST"

}

);

showModalMessage(

response.message||

(

action==="approve"

? "Withdrawal request approved successfully."

: "Withdrawal request rejected successfully."

),

"success"

);

await loadRequests();

const updatedRequest=

withdrawRequests.find(item=>

String(

item.id||

item.withdrawId||

""

)===String(id)

);

if(updatedRequest){

selectedRequest=

updatedRequest;

openWithdrawModal(

updatedRequest

);

showModalMessage(

response.message||

"Withdrawal request updated successfully.",

"success"

);

}

else{

setTimeout(()=>{

closeWithdrawModal();

},900);

}

}

catch(error){

console.error(

`Withdraw ${action} failed:`,

error

);

showModalMessage(

error.message||

`Unable to ${action} this withdrawal request.`,

"error"

);

}

finally{

setActionLoading(

button,

false

);

}

}

/*==================================
        APPROVE REQUEST
==================================*/

approveButton?.addEventListener(

"click",

async()=>{

await processWithdrawRequest(

"approve",

approveButton

);

}

);

/*==================================
        REJECT REQUEST
==================================*/

rejectButton?.addEventListener(

"click",

async()=>{

await processWithdrawRequest(

"reject",

rejectButton

);

}

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

withdrawModal?.classList.contains(

"active"

)

){

closeWithdrawModal();

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