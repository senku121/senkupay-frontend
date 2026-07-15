/*==================================================
                SENKU PAY
          ADMIN PLATFORM WITHDRAW
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkustakes-api.onrender.com";

const PLATFORM_WITHDRAW_ENDPOINT=
`${API_BASE_URL}/api/admin/platform-withdraw`;

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

const platformBalance=
document.getElementById("platformBalance");

const platformBalanceStatus=
document.getElementById("platformBalanceStatus");

const todayWithdraw=
document.getElementById("todayWithdraw");

const totalWithdraw=
document.getElementById("totalWithdraw");

const platformWithdrawCount=
document.getElementById("platformWithdrawCount");

const amountInput=
document.getElementById("withdrawAmount");

const methodSelect=
document.getElementById("withdrawMethod");

const paymentDetailsBox=
document.getElementById("paymentDetailsBox");

const accountLabel=
document.getElementById("accountLabel");

const accountInput=
document.getElementById("accountInput");

const accountInputError=
document.getElementById("accountInputError");

const holderName=
document.getElementById("holderName");

const holderNameError=
document.getElementById("holderNameError");

const amountError=
document.getElementById("withdrawAmountError");

const noteInput=
document.getElementById("withdrawNote");

const withdrawButton=
document.getElementById("platformWithdrawBtn");

const selectedMethodSummary=
document.getElementById("selectedMethodSummary");

const selectedAmountSummary=
document.getElementById("selectedAmountSummary");

const remainingBalanceSummary=
document.getElementById("remainingBalanceSummary");

const messageBox=
document.getElementById("platformWithdrawMessage");

const historySearch=
document.getElementById("historySearch");

const historyStatusFilter=
document.getElementById("historyStatusFilter");

const refreshHistoryButton=
document.getElementById("refreshPlatformHistoryButton");

const historyTable=
document.getElementById("withdrawHistory");

const historyEmpty=
document.getElementById("platformHistoryEmpty");

const historyResults=
document.getElementById("platformHistoryResults");

const historyPrevious=
document.getElementById("platformHistoryPrevious");

const historyNext=
document.getElementById("platformHistoryNext");

const historyPageText=
document.getElementById("platformHistoryPageText");

const lastSync=
document.getElementById("platformWithdrawLastSync");

const logoutButton=
document.getElementById("adminLogoutButton");

const sidebar=
document.getElementById("adminSidebar");

const sidebarOverlay=
document.getElementById("adminSidebarOverlay");

const mobileMenuButton=
document.getElementById("adminMobileMenuButton");

const adminIcon=
document.getElementById("platformAdminIcon");

const adminName=
document.getElementById("platformAdminName");

const adminRole=
document.getElementById("platformAdminRole");

/*==================================
        CARD ELEMENTS
==================================*/

const savedCardSection=
document.getElementById("savedCardSection");

const savedCardList=
document.getElementById("savedCardList");

const addCardButton=
document.getElementById("addCardBtn");

const selectedCardId=
document.getElementById("selectedCardId");

/*==================================
        ADD CARD MODAL
==================================*/

const addCardModal=
document.getElementById("addCardModal");

const closeAddCardModal=
document.getElementById("closeAddCardModal");

const cancelAddCard=
document.getElementById("cancelAddCard");

const saveWithdrawalCard=
document.getElementById("saveWithdrawalCard");

const cardHolderName=
document.getElementById("cardHolderName");

const cardNumber=
document.getElementById("cardNumber");

const cardExpiry=
document.getElementById("cardExpiry");

const cardCvv=
document.getElementById("cardCvv");

const cardBillingAddress=
document.getElementById("cardBillingAddress");

const addCardModalMessage=
document.getElementById("addCardModalMessage");

/*==================================
        CONFIRM MODAL
==================================*/

const confirmModal=
document.getElementById("platformConfirmModal");

const closeConfirmModal=
document.getElementById("closePlatformConfirmModal");

const cancelPlatformWithdrawal=
document.getElementById("cancelPlatformWithdrawal");

const confirmPlatformWithdrawal=
document.getElementById("confirmPlatformWithdrawal");

const confirmAmount=
document.getElementById("confirmWithdrawAmount");

const confirmMethod=
document.getElementById("confirmWithdrawMethod");

const confirmDestination=
document.getElementById("confirmWithdrawDestination");

const confirmHolder=
document.getElementById("confirmWithdrawHolder");

const confirmNote=
document.getElementById("confirmWithdrawNote");

const confirmMessage=
document.getElementById("platformConfirmMessage");

/*==================================
        HISTORY MODAL
==================================*/

const historyModal=
document.getElementById("platformHistoryModal");

const closeHistoryModal=
document.getElementById("closePlatformHistoryModal");

const closeHistoryDetails=
document.getElementById("closePlatformHistoryDetails");

const historyModalTitle=
document.getElementById("platformHistoryModalTitle");

const historyModalSubtitle=
document.getElementById("platformHistoryModalSubtitle");

const historyDetailId=
document.getElementById("historyDetailId");

const historyDetailAmount=
document.getElementById("historyDetailAmount");

const historyDetailMethod=
document.getElementById("historyDetailMethod");

const historyDetailDestination=
document.getElementById("historyDetailDestination");

const historyDetailHolder=
document.getElementById("historyDetailHolder");

const historyDetailStatus=
document.getElementById("historyDetailStatus");

const historyDetailDate=
document.getElementById("historyDetailDate");

const historyDetailNoteBox=
document.getElementById("historyDetailNoteBox");

const historyDetailNote=
document.getElementById("historyDetailNote");

/*==================================
        STATE
==================================*/

let platformData={

balance:0,

todayWithdraw:0,

totalWithdraw:0,

history:[]

};

let platformHistory=[];

let filteredHistory=[];

let savedCards=[];

let pendingWithdrawal=null;

let currentPage=1;

const pageSize=10;

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type="info"){

if(!messageBox){

return;

}

messageBox.hidden=false;

messageBox.className=

`platform-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

if(!messageBox){

return;

}

messageBox.hidden=true;

messageBox.className=

"platform-message";

messageBox.textContent="";

}

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

`platform-modal-message show ${type}`;

element.textContent=text;

}

function hideModalMessage(element){

if(!element){

return;

}

element.hidden=true;

element.className=

"platform-modal-message";

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

"Platform withdrawal request failed."

);

}

return data;

}

/*==================================
        ADMIN PROFILE
==================================*/

function formatRole(value){

return String(

value||

"SUPER_ADMIN"

)

.replaceAll("_"," ")

.toLowerCase()

.replace(

/\b\w/g,

letter=>

letter.toUpperCase()

);

}

function populateAdminProfile(){

const admin=

getAdmin()||

{};

const name=

admin.fullName||

admin.name||

admin.username||

"Administrator";

const role=

formatRole(

admin.role||

"SUPER_ADMIN"

);

if(adminName){

adminName.textContent=

name;

}

if(adminRole){

adminRole.textContent=

`${role} • Treasury Access`;

}

if(adminIcon){

adminIcon.textContent=

String(name)

.trim()

.charAt(0)

.toUpperCase()||

"A";

}

}

/*==================================
        NORMALIZE PLATFORM DATA
==================================*/

function normalizePlatformData(response){

const source=

response.platform||

response.treasury||

response.data||

response||

{};

const history=

Array.isArray(source.history)

? source.history

: Array.isArray(source.withdrawals)

? source.withdrawals

: Array.isArray(source.transactions)

? source.transactions

: [];

return{

balance:

source.balance??

source.platformBalance??

source.availableBalance??

0,

todayWithdraw:

source.todayWithdraw??

source.todayWithdrawals??

source.withdrawToday??

0,

totalWithdraw:

source.totalWithdraw??

source.totalWithdrawals??

source.withdrawnTotal??

0,

history

};

}

/*==================================
        HISTORY VALUES
==================================*/

function historyStatus(item){

return normalizeText(

item.status||

"completed"

);

}

function historyMethod(item){

return(

item.method||

item.paymentMethod||

item.payoutMethod||

"Not specified"

);

}

function historyDestination(item){

return(

item.destination||

item.account||

item.accountNumber||

item.walletAddress||

item.cardLast4

? `Card ending ${item.cardLast4}`

: "Not specified"

);

}

function historyHolder(item){

return(

item.holder||

item.holderName||

item.accountHolder||

"Not specified"

);

}

/*==================================
        UPDATE BALANCE DISPLAY
==================================*/

function updatePlatformSummary(){

const balance=

Number(

platformData.balance||

0

);

if(platformBalance){

platformBalance.textContent=

money(balance);

}

if(todayWithdraw){

todayWithdraw.textContent=

money(

platformData.todayWithdraw

);

}

if(totalWithdraw){

totalWithdraw.textContent=

money(

platformData.totalWithdraw

);

}

if(platformWithdrawCount){

platformWithdrawCount.textContent=

String(

platformHistory.length

);

}

if(platformBalanceStatus){

platformBalanceStatus.textContent=

"Platform treasury balance synchronized.";

}

updateWithdrawalSummary();

}

/*==================================
        LOAD PLATFORM DATA
==================================*/

async function loadPlatformData(){

hideMessage();

if(historyTable){

historyTable.innerHTML=`

<tr class="loading-row">

<td colspan="8">

<i class="fa-solid fa-spinner fa-spin"></i>

Loading withdrawal history...

</td>

</tr>

`;

}

if(historyEmpty){

historyEmpty.hidden=true;

}

try{

const response=

await api(

PLATFORM_WITHDRAW_ENDPOINT

);

platformData=

normalizePlatformData(

response

);

platformHistory=

Array.isArray(

platformData.history

)

? platformData.history

: [];

filteredHistory=[

...platformHistory

];

updatePlatformSummary();

renderHistory();

if(lastSync){

lastSync.textContent=

`Last synchronized ${new Date().toLocaleString()}.`;

}

return platformData;

}

catch(error){

console.error(

"Platform data load failed:",

error

);

if(platformBalanceStatus){

platformBalanceStatus.textContent=

"Unable to synchronize platform balance.";

}

if(historyTable){

historyTable.innerHTML=`

<tr class="loading-row">

<td colspan="8">

Unable to load platform withdrawals.

</td>

</tr>

`;

}

showMessage(

error.message||

"Unable to load platform treasury data.",

"error"

);

return null;

}

}

/*==================================
        METHOD LABEL
==================================*/

function methodLabel(value){

const labels={

cashapp:"Cash App",

paypal:"PayPal",

chime:"Chime",

applepay:"Apple Pay",

googlepay:"Google Pay",

card:"Debit / Credit Card"

};

return labels[value]||

String(value||"Payment Method");

}

/*==================================
        WITHDRAW SUMMARY
==================================*/

function updateWithdrawalSummary(){

const amount=

Number(

amountInput?.value||

0

);

const balance=

Number(

platformData.balance||

0

);

const remaining=

Math.max(

0,

balance-amount

);

if(selectedMethodSummary){

selectedMethodSummary.textContent=

methodLabel(

methodSelect?.value

);

}

if(selectedAmountSummary){

selectedAmountSummary.textContent=

money(amount);

}

if(remainingBalanceSummary){

remainingBalanceSummary.textContent=

money(remaining);

}

}

amountInput?.addEventListener(

"input",

()=>{

amountError.textContent="";

updateWithdrawalSummary();

}

);
/*==================================
        PAYMENT METHOD FIELDS
==================================*/

const paymentMethodConfig={

cashapp:{

label:"Cash App Username / Cashtag",

placeholder:"$Cashtag",

type:"text"

},

paypal:{

label:"PayPal Email",

placeholder:"name@example.com",

type:"email"

},

chime:{

label:"Chime Username / Email / Phone",

placeholder:"Enter Chime account details",

type:"text"

},

applepay:{

label:"Apple Pay Email / Phone",

placeholder:"Enter Apple Pay details",

type:"text"

},

googlepay:{

label:"Google Pay Email / Phone",

placeholder:"Enter Google Pay details",

type:"text"

},

card:{

label:"Payout Card",

placeholder:"",

type:"text"

}

};

function updatePaymentMethodFields(){

const method=

methodSelect?.value||

"cashapp";

const config=

paymentMethodConfig[method]||

paymentMethodConfig.cashapp;

if(selectedMethodSummary){

selectedMethodSummary.textContent=

methodLabel(method);

}

if(method==="card"){

if(paymentDetailsBox){

paymentDetailsBox.hidden=true;

}

if(savedCardSection){

savedCardSection.hidden=false;

}

}

else{

if(paymentDetailsBox){

paymentDetailsBox.hidden=false;

}

if(savedCardSection){

savedCardSection.hidden=true;

}

if(accountLabel){

accountLabel.textContent=

config.label;

}

if(accountInput){

accountInput.type=

config.type;

accountInput.placeholder=

config.placeholder;

accountInput.value="";

}

if(selectedCardId){

selectedCardId.value="";

}

}

if(accountInputError){

accountInputError.textContent="";

}

updateWithdrawalSummary();

}

methodSelect?.addEventListener(

"change",

updatePaymentMethodFields

);

/*==================================
        CARD STORAGE
==================================*/

function loadSavedCards(){

try{

const stored=

JSON.parse(

localStorage.getItem(

"platformWithdrawalCards"

)||

"[]"

);

savedCards=

Array.isArray(stored)

? stored

: [];

}

catch{

savedCards=[];

}

renderSavedCards();

}

function saveCardsToStorage(){

localStorage.setItem(

"platformWithdrawalCards",

JSON.stringify(

savedCards

)

);

}

/*==================================
        MASK CARD NUMBER
==================================*/

function normalizeCardNumber(value){

return String(value||"")

.replace(/\D/g,"")

.slice(0,19);

}

function maskCardNumber(number){

const digits=

normalizeCardNumber(number);

return digits

? `•••• •••• •••• ${digits.slice(-4)}`

: "Card";

}

/*==================================
        RENDER SAVED CARDS
==================================*/

function renderSavedCards(){

if(!savedCardList){

return;

}

if(savedCards.length===0){

savedCardList.innerHTML=`

<div class="saved-card-empty">

<i class="fa-solid fa-credit-card"></i>

<p>No payout card saved.</p>

</div>

`;

if(selectedCardId){

selectedCardId.value="";

}

return;

}

savedCardList.innerHTML="";

savedCards.forEach(card=>{

const active=

String(

selectedCardId?.value||

""

)===String(card.id);

savedCardList.insertAdjacentHTML(

"beforeend",

`

<button
type="button"
class="saved-card-item ${active?"active":""}"
data-card-id="${escapeHTML(card.id)}">

<div>

<strong>

${escapeHTML(

maskCardNumber(

card.number

)

)}

</strong>

<p>

${escapeHTML(card.holder)}

• Expires ${escapeHTML(card.expiry)}

</p>

</div>

<i class="fa-solid fa-circle-check"></i>

</button>

`

);

});

}

savedCardList?.addEventListener(

"click",

event=>{

const button=

event.target.closest(

".saved-card-item"

);

if(!button){

return;

}

if(selectedCardId){

selectedCardId.value=

button.dataset.cardId||

"";

}

renderSavedCards();

}

);

/*==================================
        CARD INPUT FORMATTING
==================================*/

cardNumber?.addEventListener(

"input",

()=>{

const digits=

normalizeCardNumber(

cardNumber.value

);

cardNumber.value=

digits.replace(

/(.{4})/g,

"$1 "

).trim();

}

);

cardExpiry?.addEventListener(

"input",

()=>{

let digits=

String(cardExpiry.value)

.replace(/\D/g,"")

.slice(0,4);

if(digits.length>2){

digits=

`${digits.slice(0,2)}/${digits.slice(2)}`;

}

cardExpiry.value=digits;

}

);

cardCvv?.addEventListener(

"input",

()=>{

cardCvv.value=

String(cardCvv.value)

.replace(/\D/g,"")

.slice(0,4);

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
        OPEN ADD CARD MODAL
==================================*/

addCardButton?.addEventListener(

"click",

()=>{

hideModalMessage(

addCardModalMessage

);

openModal(

addCardModal

);

setTimeout(()=>{

cardHolderName?.focus();

},50);

}

);

closeAddCardModal?.addEventListener(

"click",

()=>{

closeModal(

addCardModal

);

}

);

cancelAddCard?.addEventListener(

"click",

()=>{

closeModal(

addCardModal

);

}

);

addCardModal?.addEventListener(

"click",

event=>{

if(event.target===addCardModal){

closeModal(

addCardModal

);

}

}

);

/*==================================
        SAVE WITHDRAWAL CARD
==================================*/

saveWithdrawalCard?.addEventListener(

"click",

()=>{

hideModalMessage(

addCardModalMessage

);

const holder=

cardHolderName?.value.trim()||

"";

const number=

normalizeCardNumber(

cardNumber?.value

);

const expiry=

cardExpiry?.value.trim()||

"";

const cvv=

cardCvv?.value.trim()||

"";

const billingAddress=

cardBillingAddress?.value.trim()||

"";

if(!holder){

showModalMessage(

addCardModalMessage,

"Enter the cardholder name.",

"error"

);

return;

}

if(number.length<13){

showModalMessage(

addCardModalMessage,

"Enter a valid card number.",

"error"

);

return;

}

if(!/^\d{2}\/\d{2}$/.test(expiry)){

showModalMessage(

addCardModalMessage,

"Enter the expiry date in MM/YY format.",

"error"

);

return;

}

if(cvv.length<3){

showModalMessage(

addCardModalMessage,

"Enter a valid CVV.",

"error"

);

return;

}

if(!billingAddress){

showModalMessage(

addCardModalMessage,

"Enter the billing address.",

"error"

);

return;

}

const card={

id:

`card_${Date.now()}`,

holder,

number,

expiry,

billingAddress

};

savedCards.push(card);

saveCardsToStorage();

if(selectedCardId){

selectedCardId.value=

card.id;

}

renderSavedCards();

cardHolderName.value="";

cardNumber.value="";

cardExpiry.value="";

cardCvv.value="";

cardBillingAddress.value="";

closeModal(

addCardModal

);

showMessage(

"Withdrawal card saved locally for frontend testing.",

"success"

);

}

);

/*==================================
        FORM VALIDATION
==================================*/

function validateWithdrawalForm(){

let valid=true;

const amount=

Number(

amountInput?.value

);

const method=

methodSelect?.value||

"cashapp";

const destination=

accountInput?.value.trim()||

"";

const holder=

holderName?.value.trim()||

"";

if(amountError){

amountError.textContent="";

}

if(accountInputError){

accountInputError.textContent="";

}

if(holderNameError){

holderNameError.textContent="";

}

if(

!Number.isFinite(amount)||

amount<=0

){

if(amountError){

amountError.textContent=

"Enter a valid withdrawal amount.";

}

valid=false;

}

else if(

amount>

Number(

platformData.balance||

0

)

){

if(amountError){

amountError.textContent=

"Amount exceeds the available platform balance.";

}

valid=false;

}

if(method==="card"){

if(

!selectedCardId?.value

){

showMessage(

"Select or add a payout card.",

"error"

);

valid=false;

}

}

else if(!destination){

if(accountInputError){

accountInputError.textContent=

"Enter the withdrawal destination.";

}

valid=false;

}

if(!holder){

if(holderNameError){

holderNameError.textContent=

"Enter the account holder name.";

}

valid=false;

}

return valid;

}
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

<span>${text}</span>

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
        GET WITHDRAWAL DESTINATION
==================================*/

function getWithdrawalDestination(){

const method=

methodSelect?.value||

"cashapp";

if(method==="card"){

const card=

savedCards.find(item=>

String(item.id)===

String(

selectedCardId?.value||

""

)

);

if(!card){

return"";

}

return maskCardNumber(

card.number

);

}

return accountInput?.value.trim()||

"";

}

/*==================================
        REVIEW WITHDRAWAL
==================================*/

withdrawButton?.addEventListener(

"click",

()=>{

hideMessage();

if(!validateWithdrawalForm()){

showMessage(

"Please correct the highlighted withdrawal details.",

"error"

);

return;

}

const amount=

Number(

amountInput?.value

);

const method=

methodSelect?.value||

"cashapp";

const destination=

getWithdrawalDestination();

const holder=

holderName?.value.trim()||

"";

const note=

noteInput?.value.trim()||

"";

pendingWithdrawal={

amount,

method,

destination,

holder,

note,

cardId:

method==="card"

? selectedCardId?.value||

""

: null

};

if(confirmAmount){

confirmAmount.textContent=

money(amount);

}

if(confirmMethod){

confirmMethod.textContent=

methodLabel(method);

}

if(confirmDestination){

confirmDestination.textContent=

destination||

"Not specified";

}

if(confirmHolder){

confirmHolder.textContent=

holder;

}

if(confirmNote){

confirmNote.textContent=

note||

"No note";

}

hideModalMessage(

confirmMessage

);

openModal(

confirmModal

);

}

);

/*==================================
        CLOSE CONFIRM MODAL
==================================*/

function closeConfirmationModal(){

closeModal(

confirmModal

);

hideModalMessage(

confirmMessage

);

}

closeConfirmModal?.addEventListener(

"click",

closeConfirmationModal

);

cancelPlatformWithdrawal?.addEventListener(

"click",

closeConfirmationModal

);

confirmModal?.addEventListener(

"click",

event=>{

if(event.target===confirmModal){

closeConfirmationModal();

}

}

);

/*==================================
        RESET WITHDRAWAL FORM
==================================*/

function resetWithdrawalForm(){

if(amountInput){

amountInput.value="";

}

if(holderName){

holderName.value="";

}

if(noteInput){

noteInput.value="";

}

if(accountInput){

accountInput.value="";

}

if(selectedCardId){

selectedCardId.value="";

}

if(amountError){

amountError.textContent="";

}

if(accountInputError){

accountInputError.textContent="";

}

if(holderNameError){

holderNameError.textContent="";

}

pendingWithdrawal=null;

updatePaymentMethodFields();

renderSavedCards();

updateWithdrawalSummary();

}

/*==================================
        CREATE PLATFORM WITHDRAWAL
==================================*/

async function createPlatformWithdrawal(){

if(!pendingWithdrawal){

showModalMessage(

confirmMessage,

"No pending withdrawal information was found.",

"error"

);

return;

}

setButtonLoading(

confirmPlatformWithdrawal,

true,

"Submitting..."

);

hideModalMessage(

confirmMessage

);

try{

const response=

await api(

PLATFORM_WITHDRAW_ENDPOINT,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

amount:

pendingWithdrawal.amount,

method:

pendingWithdrawal.method,

destination:

pendingWithdrawal.destination,

holder:

pendingWithdrawal.holder,

note:

pendingWithdrawal.note,

cardId:

pendingWithdrawal.cardId

})

}

);

showModalMessage(

confirmMessage,

response.message||

"Platform withdrawal created successfully.",

"success"

);

await loadPlatformData();

resetWithdrawalForm();

setTimeout(()=>{

closeConfirmationModal();

showMessage(

response.message||

"Platform withdrawal completed successfully.",

"success"

);

},900);

}

catch(error){

console.error(

"Platform withdrawal failed:",

error

);

showModalMessage(

confirmMessage,

error.message||

"Unable to create the platform withdrawal.",

"error"

);

}

finally{

setButtonLoading(

confirmPlatformWithdrawal,

false

);

}

}

confirmPlatformWithdrawal?.addEventListener(

"click",

createPlatformWithdrawal

);

/*==================================
        LIVE FIELD CLEANUP
==================================*/

accountInput?.addEventListener(

"input",

()=>{

if(accountInputError){

accountInputError.textContent="";

}

hideMessage();

}

);

holderName?.addEventListener(

"input",

()=>{

if(holderNameError){

holderNameError.textContent="";

}

hideMessage();

}

);
/*==================================
        HISTORY FILTERS
==================================*/

function applyHistoryFilters(){

const keyword=

normalizeText(

historySearch?.value

);

const selectedStatus=

normalizeText(

historyStatusFilter?.value||

"all"

);

filteredHistory=

platformHistory.filter(item=>{

const status=

historyStatus(item);

const searchable=[

item.id,

item.withdrawId,

item.reference,

item.amount,

historyMethod(item),

historyDestination(item),

historyHolder(item),

status,

item.note

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

renderHistory();

}

historySearch?.addEventListener(

"input",

applyHistoryFilters

);

historyStatusFilter?.addEventListener(

"change",

applyHistoryFilters

);

/*==================================
        HISTORY PAGINATION
==================================*/

function historyTotalPages(){

return Math.max(

1,

Math.ceil(

filteredHistory.length/

pageSize

)

);

}

historyPrevious?.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderHistory();

}

}

);

historyNext?.addEventListener(

"click",

()=>{

if(

currentPage<

historyTotalPages()

){

currentPage++;

renderHistory();

}

}

);

/*==================================
        RENDER HISTORY
==================================*/

function renderHistory(){

if(!historyTable){

return;

}

const totalPages=

historyTotalPages();

if(currentPage>totalPages){

currentPage=totalPages;

}

const start=

(currentPage-1)*

pageSize;

const pageItems=

filteredHistory.slice(

start,

start+pageSize

);

if(pageItems.length===0){

historyTable.innerHTML="";

if(historyEmpty){

historyEmpty.hidden=false;

}

}

else{

if(historyEmpty){

historyEmpty.hidden=true;

}

historyTable.innerHTML="";

pageItems.forEach(item=>{

const id=

item.id||

item.withdrawId||

"--";

const amount=

Number(

item.amount||

0

);

const method=

historyMethod(item);

const destination=

historyDestination(item);

const holder=

historyHolder(item);

const status=

historyStatus(item);

const createdAt=

item.createdAt||

item.date||

item.updatedAt;

historyTable.insertAdjacentHTML(

"beforeend",

`

<tr>

<td>

${escapeHTML(id)}

</td>

<td>

${money(amount)}

</td>

<td>

${escapeHTML(

methodLabel(method)||

method

)}

</td>

<td>

${escapeHTML(destination)}

</td>

<td>

${escapeHTML(holder)}

</td>

<td>

<span class="platform-status ${escapeHTML(status)}">

${escapeHTML(

item.status||

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
class="platform-details-button"
data-id="${escapeHTML(id)}">

Details

</button>

</td>

</tr>

`

);

});

}

if(historyResults){

const end=

Math.min(

start+

pageItems.length,

filteredHistory.length

);

historyResults.textContent=

filteredHistory.length===0

? "Showing 0 withdrawals"

: `Showing ${start+1}-${end} of ${filteredHistory.length} withdrawals`;

}

if(historyPageText){

historyPageText.textContent=

`Page ${currentPage} of ${totalPages}`;

}

if(historyPrevious){

historyPrevious.disabled=

currentPage<=1;

}

if(historyNext){

historyNext.disabled=

currentPage>=totalPages;

}

}

/*==================================
        REFRESH HISTORY
==================================*/

refreshHistoryButton?.addEventListener(

"click",

async()=>{

refreshHistoryButton.disabled=true;

refreshHistoryButton.classList.add(

"loading"

);

try{

await loadPlatformData();

showMessage(

"Platform withdrawal history synchronized successfully.",

"success"

);

setTimeout(()=>{

hideMessage();

},2200);

}

catch(error){

console.error(

"Platform history refresh failed:",

error

);

showMessage(

error.message||

"Unable to refresh platform withdrawal history.",

"error"

);

}

finally{

refreshHistoryButton.disabled=false;

refreshHistoryButton.classList.remove(

"loading"

);

}

}

);

/*==================================
        OPEN HISTORY DETAILS
==================================*/

function openHistoryDetails(item){

if(

!historyModal||

!item

){

return;

}

const id=

item.id||

item.withdrawId||

"--";

const amount=

Number(

item.amount||

0

);

const method=

historyMethod(item);

const destination=

historyDestination(item);

const holder=

historyHolder(item);

const status=

item.status||

historyStatus(item);

const createdAt=

item.createdAt||

item.date||

item.updatedAt;

const note=

item.note||

item.reference||

item.description||

"";

if(historyModalTitle){

historyModalTitle.textContent=

`Platform Withdrawal ${id}`;

}

if(historyModalSubtitle){

historyModalSubtitle.textContent=

"Review the complete treasury withdrawal record.";

}

if(historyDetailId){

historyDetailId.textContent=

id;

}

if(historyDetailAmount){

historyDetailAmount.textContent=

money(amount);

}

if(historyDetailMethod){

historyDetailMethod.textContent=

methodLabel(method)||

method;

}

if(historyDetailDestination){

historyDetailDestination.textContent=

destination;

}

if(historyDetailHolder){

historyDetailHolder.textContent=

holder;

}

if(historyDetailStatus){

historyDetailStatus.textContent=

status;

}

if(historyDetailDate){

historyDetailDate.textContent=

formatDate(createdAt);

}

if(historyDetailNoteBox){

historyDetailNoteBox.hidden=

!note;

}

if(historyDetailNote){

historyDetailNote.textContent=

note||

"--";

}

openModal(

historyModal

);

}

/*==================================
        HISTORY DETAILS BUTTON
==================================*/

document.addEventListener(

"click",

event=>{

const button=

event.target.closest(

".platform-details-button"

);

if(!button){

return;

}

const id=

button.dataset.id;

const item=

platformHistory.find(entry=>

String(

entry.id||

entry.withdrawId||

""

)===String(id)

);

if(!item){

showMessage(

"Platform withdrawal details could not be found.",

"error"

);

return;

}

openHistoryDetails(

item

);

}

);

/*==================================
        CLOSE HISTORY MODAL
==================================*/

function closeHistoryDetailsModal(){

closeModal(

historyModal

);

}

closeHistoryModal?.addEventListener(

"click",

closeHistoryDetailsModal

);

closeHistoryDetails?.addEventListener(

"click",

closeHistoryDetailsModal

);

historyModal?.addEventListener(

"click",

event=>{

if(event.target===historyModal){

closeHistoryDetailsModal();

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
        ESCAPE KEY
==================================*/

document.addEventListener(

"keydown",

event=>{

if(event.key!=="Escape"){

return;

}

if(
addCardModal?.classList.contains(
"active"
)
){

closeModal(
addCardModal
);

return;

}

if(
confirmModal?.classList.contains(
"active"
)
){

closeConfirmationModal();

return;

}

if(
historyModal?.classList.contains(
"active"
)
){

closeHistoryDetailsModal();

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
        RESIZE
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

populateAdminProfile();

loadSavedCards();

updatePaymentMethodFields();

updateWithdrawalSummary();

await loadPlatformData();

/*==================================
        END
==================================*/

});