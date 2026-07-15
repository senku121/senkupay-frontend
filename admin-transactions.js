/*==================================================
                SENKU PAY
            ADMIN TRANSACTIONS
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkustakes-api.onrender.com";

const TRANSACTIONS_ENDPOINT=
`${API_BASE_URL}/api/admin/transactions`;

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

const transactionTable=
document.getElementById("transactionTable");

const searchInput=
document.getElementById("transactionSearch");

const typeFilter=
document.getElementById("typeFilter");

const statusFilter=
document.getElementById("statusFilter");

const dateFilter=
document.getElementById("dateFilter");

const refreshButton=
document.getElementById("refreshTransactionsButton");

const messageBox=
document.getElementById("adminTransactionsMessage");

const depositTotal=
document.getElementById("depositTotal");

const depositCount=
document.getElementById("depositCount");

const withdrawTotal=
document.getElementById("withdrawTotal");

const withdrawCount=
document.getElementById("withdrawCount");

const pendingTotal=
document.getElementById("pendingTotal");

const totalVolume=
document.getElementById("totalVolume");

const emptyState=
document.getElementById("emptyTransactions");

const resultsText=
document.getElementById("transactionResultsText");

const pageText=
document.getElementById("transactionPageText");

const previousPageButton=
document.getElementById("previousTransactionPage");

const nextPageButton=
document.getElementById("nextTransactionPage");

const lastSync=
document.getElementById("lastTransactionSync");

const backendStatus=
document.getElementById("transactionsBackendStatus");

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

const transactionModal=
document.getElementById("transactionModal");

const closeModalButton=
document.getElementById("closeTransactionModal");

const closeDetailsButton=
document.getElementById("closeTransactionDetailsButton");

const modalIcon=
document.getElementById("transactionModalIcon");

const modalTitle=
document.getElementById("transactionModalTitle");

const modalSubtitle=
document.getElementById("transactionModalSubtitle");

const detailId=
document.getElementById("detailTransactionId");

const detailUser=
document.getElementById("detailTransactionUser");

const detailEmail=
document.getElementById("detailTransactionEmail");

const detailType=
document.getElementById("detailTransactionType");

const detailMethod=
document.getElementById("detailTransactionMethod");

const detailAmount=
document.getElementById("detailTransactionAmount");

const detailStatus=
document.getElementById("detailTransactionStatus");

const detailDate=
document.getElementById("detailTransactionDate");

const referenceBox=
document.getElementById("transactionReferenceBox");

const referenceText=
document.getElementById("detailTransactionReference");

const noteBox=
document.getElementById("transactionNoteBox");

const noteText=
document.getElementById("detailTransactionNote");

/*==================================
        STATE
==================================*/

let transactions=[];

let filteredTransactions=[];

let currentPage=1;

const pageSize=12;

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

`admin-transactions-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

if(!messageBox){

return;

}

messageBox.hidden=true;

messageBox.className=

"admin-transactions-message";

messageBox.textContent="";

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

return String(

value??""

)

.replaceAll("&","&amp;")

.replaceAll("<","&lt;")

.replaceAll(">","&gt;")

.replaceAll('"',"&quot;")

.replaceAll("'","&#039;");

}

function normalizeText(value){

return String(

value??""

)

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

"Unable to load transactions."

);

}

return data;

}

/*==================================
        NORMALIZE RESPONSE
==================================*/

function normalizeTransactions(response){

const list=

Array.isArray(response)

? response

: response.transactions||

response.data||

response.results||

[];

return Array.isArray(list)

? list

: [];

}

/*==================================
        TRANSACTION VALUES
==================================*/

function transactionType(transaction){

const value=

normalizeText(

transaction.type||

transaction.transactionType

);

if(value.includes("deposit")){

return "deposit";

}

if(value.includes("withdraw")){

return "withdrawal";

}

return value||

"transaction";

}

function transactionStatus(transaction){

return normalizeText(

transaction.status||

"pending"

);

}

function transactionUser(transaction){

return(

transaction.user||

transaction.owner||

transaction.account||

{}

);

}

function transactionUsername(transaction){

const user=

transactionUser(

transaction

);

return(

user.username||

user.fullName||

user.name||

transaction.username||

"Unknown User"

);

}

function transactionEmail(transaction){

const user=

transactionUser(

transaction

);

return(

user.email||

transaction.email||

"No email"

);

}

function transactionMethod(transaction){

return(

transaction.paymentMethod||

transaction.method||

transaction.gateway||

transaction.channel||

"Not specified"

);

}

/*==================================
        SUMMARY
==================================*/

function updateSummary(){

let depositAmount=0;

let withdrawalAmount=0;

let deposits=0;

let withdrawals=0;

let pending=0;

transactions.forEach(transaction=>{

const amount=

Number(

transaction.amount||

0

);

const type=

transactionType(

transaction

);

const status=

transactionStatus(

transaction

);

if(type==="deposit"){

depositAmount+=amount;

deposits++;

}

if(type==="withdrawal"){

withdrawalAmount+=amount;

withdrawals++;

}

if(

status==="pending"||

status==="processing"

){

pending++;

}

});

if(depositTotal){

depositTotal.textContent=

money(

depositAmount

);

}

if(depositCount){

depositCount.textContent=

`${deposits} transaction${deposits===1?"":"s"}`;

}

if(withdrawTotal){

withdrawTotal.textContent=

money(

withdrawalAmount

);

}

if(withdrawCount){

withdrawCount.textContent=

`${withdrawals} transaction${withdrawals===1?"":"s"}`;

}

if(pendingTotal){

pendingTotal.textContent=

String(

pending

);

}

if(totalVolume){

totalVolume.textContent=

money(

depositAmount+

withdrawalAmount

);

}

}

/*==================================
        DATE FILTER
==================================*/

function matchesDateFilter(

transaction,

filter

){

if(filter==="all"){

return true;

}

const rawDate=

transaction.createdAt||

transaction.date||

transaction.updatedAt;

const parsedDate=

new Date(

rawDate

);

if(

Number.isNaN(

parsedDate.getTime()

)

){

return false;

}

const now=

new Date();

if(filter==="today"){

return(

parsedDate.getFullYear()===

now.getFullYear() &&

parsedDate.getMonth()===

now.getMonth() &&

parsedDate.getDate()===

now.getDate()

);

}

const difference=

now.getTime()-

parsedDate.getTime();

const days=

difference/

(

1000*

60*

60*

24

);

if(filter==="week"){

return days<=7;

}

if(filter==="month"){

return days<=30;

}

return true;

}

/*==================================
        APPLY FILTERS
==================================*/

function applyFilters(){

const keyword=

normalizeText(

searchInput?.value

);

const selectedType=

normalizeText(

typeFilter?.value||

"all"

);

const selectedStatus=

normalizeText(

statusFilter?.value||

"all"

);

const selectedDate=

normalizeText(

dateFilter?.value||

"all"

);

filteredTransactions=

transactions.filter(transaction=>{

const type=

transactionType(

transaction

);

const status=

transactionStatus(

transaction

);

const searchable=[

transaction.id,

transaction.transactionId,

transaction.reference,

transactionUsername(

transaction

),

transactionEmail(

transaction

),

type,

status,

transaction.amount,

transactionMethod(

transaction

)

]

.map(normalizeText)

.join(" ");

const matchesKeyword=

!keyword||

searchable.includes(

keyword

);

const matchesType=

selectedType==="all"||

type===selectedType;

const matchesStatus=

selectedStatus==="all"||

status===selectedStatus;

const matchesDate=

matchesDateFilter(

transaction,

selectedDate

);

return(

matchesKeyword&&

matchesType&&

matchesStatus&&

matchesDate

);

});

currentPage=1;

renderTransactions();

}

/*==================================
        PAGINATION
==================================*/

function totalPages(){

return Math.max(

1,

Math.ceil(

filteredTransactions.length/

pageSize

)

);

}

previousPageButton?.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderTransactions();

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

renderTransactions();

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

typeFilter?.addEventListener(

"change",

applyFilters

);

statusFilter?.addEventListener(

"change",

applyFilters

);

dateFilter?.addEventListener(

"change",

applyFilters

);
/*==================================
        RENDER TRANSACTIONS
==================================*/

function renderTransactions(){

if(!transactionTable){

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

const pageTransactions=

filteredTransactions.slice(

start,

start+pageSize

);

if(pageTransactions.length===0){

transactionTable.innerHTML="";

if(emptyState){

emptyState.hidden=false;

}

}

else{

if(emptyState){

emptyState.hidden=true;

}

transactionTable.innerHTML="";

pageTransactions.forEach(transaction=>{

const id=

transaction.id||

transaction.transactionId||

"--";

const type=

transactionType(

transaction

);

const status=

transactionStatus(

transaction

);

const method=

transactionMethod(

transaction

);

const username=

transactionUsername(

transaction

);

const amount=

Number(

transaction.amount||

0

);

const date=

transaction.createdAt||

transaction.date||

transaction.updatedAt;

transactionTable.insertAdjacentHTML(

"beforeend",

`

<tr>

<td>

${escapeHTML(id)}

</td>

<td>

${escapeHTML(username)}

</td>

<td>

<span class="transaction-type ${escapeHTML(type)}">

${escapeHTML(

type==="withdrawal"

? "Withdrawal"

: type==="deposit"

? "Deposit"

: transaction.type||

"Transaction"

)}

</span>

</td>

<td>

${escapeHTML(method)}

</td>

<td>

${money(amount)}

</td>

<td>

<span class="transaction-status ${escapeHTML(status)}">

${escapeHTML(

transaction.status||

status

)}

</span>

</td>

<td>

${escapeHTML(

formatDate(date)

)}

</td>

<td>

<button
type="button"
class="details-btn"
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

pageTransactions.length,

filteredTransactions.length

);

resultsText.textContent=

filteredTransactions.length===0

? "Showing 0 transactions"

: `Showing ${start+1}-${end} of ${filteredTransactions.length} transactions`;

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
        LOAD TRANSACTIONS
==================================*/

async function loadTransactions(){

hideMessage();

if(transactionTable){

transactionTable.innerHTML=`

<tr class="loading-row">

<td colspan="8">

<i class="fa-solid fa-spinner fa-spin"></i>

Loading transactions...

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

TRANSACTIONS_ENDPOINT

);

transactions=

normalizeTransactions(

response

);

filteredTransactions=[

...transactions

];

updateSummary();

renderTransactions();

if(lastSync){

lastSync.textContent=

`Last synchronized ${new Date().toLocaleString()}`;

}

if(backendStatus){

backendStatus.textContent=

"Connected to the Senku Pay transaction server.";

}

return transactions;

}

catch(error){

console.error(

"Transaction load failed:",

error

);

if(transactionTable){

transactionTable.innerHTML=`

<tr class="loading-row">

<td colspan="8">

Unable to load transactions.

</td>

</tr>

`;

}

if(backendStatus){

backendStatus.textContent=

"Unable to connect to the transaction server.";

}

showMessage(

error.message||

"Unable to load transaction records.",

"error"

);

return[];

}

}

/*==================================
        REFRESH
==================================*/

refreshButton?.addEventListener(

"click",

async()=>{

refreshButton.disabled=true;

refreshButton.classList.add(

"loading"

);

try{

await loadTransactions();

showMessage(

"Transactions synchronized successfully.",

"success"

);

setTimeout(()=>{

hideMessage();

},2200);

}

catch(error){

console.error(

"Transaction refresh failed:",

error

);

showMessage(

error.message||

"Unable to refresh transactions.",

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
        TRANSACTION DETAILS MODAL
==================================*/

function openTransactionModal(transaction){

if(

!transactionModal||

!transaction

){

return;

}

const id=

transaction.id||

transaction.transactionId||

"--";

const type=

transactionType(

transaction

);

const status=

transactionStatus(

transaction

);

const username=

transactionUsername(

transaction

);

const email=

transactionEmail(

transaction

);

const method=

transactionMethod(

transaction

);

const amount=

Number(

transaction.amount||

0

);

const createdAt=

transaction.createdAt||

transaction.date||

transaction.updatedAt;

const reference=

transaction.reference||

transaction.referenceId||

transaction.transactionReference||

transaction.gatewayReference||

"";

const note=

transaction.note||

transaction.description||

transaction.message||

"";

if(modalIcon){

modalIcon.className=

`transaction-modal-icon ${type}`;

modalIcon.innerHTML=

type==="deposit"

? '<i class="fa-solid fa-arrow-down"></i>'

: type==="withdrawal"

? '<i class="fa-solid fa-arrow-up"></i>'

: '<i class="fa-solid fa-money-bill-transfer"></i>';

}

if(modalTitle){

modalTitle.textContent=

type==="deposit"

? "Deposit Transaction"

: type==="withdrawal"

? "Withdrawal Transaction"

: "Transaction Details";

}

if(modalSubtitle){

modalSubtitle.textContent=

`Review the complete record for transaction ${id}.`;

}

if(detailId){

detailId.textContent=id;

}

if(detailUser){

detailUser.textContent=username;

}

if(detailEmail){

detailEmail.textContent=email;

}

if(detailType){

detailType.textContent=

type==="deposit"

? "Deposit"

: type==="withdrawal"

? "Withdrawal"

: transaction.type||

"Transaction";

}

if(detailMethod){

detailMethod.textContent=method;

}

if(detailAmount){

detailAmount.textContent=

money(amount);

}

if(detailStatus){

detailStatus.textContent=

transaction.status||

status;

}

if(detailDate){

detailDate.textContent=

formatDate(createdAt);

}

/*==================================
        REFERENCE
==================================*/

if(referenceBox){

referenceBox.hidden=

!reference;

}

if(referenceText){

referenceText.textContent=

reference||

"--";

}

/*==================================
        NOTE
==================================*/

if(noteBox){

noteBox.hidden=

!note;

}

if(noteText){

noteText.textContent=

note||

"No note available.";

}

transactionModal.classList.add(

"active"

);

transactionModal.setAttribute(

"aria-hidden",

"false"

);

document.body.style.overflow=

"hidden";

}

/*==================================
        CLOSE MODAL
==================================*/

function closeTransactionModal(){

if(!transactionModal){

return;

}

transactionModal.classList.remove(

"active"

);

transactionModal.setAttribute(

"aria-hidden",

"true"

);

document.body.style.overflow="";

}

/*==================================
        DETAILS BUTTON
==================================*/

document.addEventListener(

"click",

event=>{

const button=

event.target.closest(

".details-btn"

);

if(!button){

return;

}

const id=

button.dataset.id;

const transaction=

transactions.find(item=>

String(

item.id||

item.transactionId||

""

)===String(id)

);

if(!transaction){

showMessage(

"Transaction details could not be found.",

"error"

);

return;

}

openTransactionModal(

transaction

);

}

);

closeModalButton?.addEventListener(

"click",

closeTransactionModal

);

closeDetailsButton?.addEventListener(

"click",

closeTransactionModal

);

transactionModal?.addEventListener(

"click",

event=>{

if(

event.target===transactionModal

){

closeTransactionModal();

}

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
transactionModal?.classList.contains(
"active"
)
){

closeTransactionModal();

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

await loadTransactions();

/*==================================
        END
==================================*/

});