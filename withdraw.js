/*==================================================
                SENKU PAY
              WITHDRAW PAGE
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkustakes-api.onrender.com";

const WALLET_ENDPOINT=
`${API_BASE_URL}/api/wallet`;

const WITHDRAW_ENDPOINT=
`${API_BASE_URL}/api/withdraw`;

const CREATE_WITHDRAW_ENDPOINT=
`${API_BASE_URL}/api/withdraw/create`;

/*==================================
        STORAGE
==================================*/

function getToken(){

return(

sessionStorage.getItem("token")||

localStorage.getItem("token")

);

}

function logout(){

[
"token",
"currentUser"

].forEach(key=>{

sessionStorage.removeItem(key);

localStorage.removeItem(key);

});

window.location.href="login.html";

}

const token=getToken();

if(!token){

logout();

return;

}

/*==================================
        ELEMENTS
==================================*/

const balanceElement=
document.getElementById("withdrawBalance");

const amountInput=
document.getElementById("withdrawAmount");

const confirmButton=
document.getElementById("confirmWithdraw");

const messageBox=
document.getElementById("withdrawMessage");

const errorBox=
document.getElementById("withdrawError");

const statusText=
document.getElementById("withdrawStatusText");

const historyContainer=
document.getElementById("withdrawHistory");

const paymentFields=
document.getElementById("paymentFields");

const methodButtons=
document.querySelectorAll(".withdraw-option");

let selectedMethod="card";

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type="info"){

messageBox.hidden=false;

messageBox.className=

`withdraw-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

messageBox.hidden=true;

messageBox.className=

"withdraw-message";

messageBox.textContent="";

}

/*==================================
        FORMAT
==================================*/

function money(value){

return new Intl.NumberFormat(

"en-US",

{

style:"currency",

currency:"USD"

}

).format(Number(value||0));

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

logout();

throw new Error(

"Session expired."

);

}

const data=

await response.json();

if(!response.ok){

throw new Error(

data.message||

"Server request failed."

);

}

return data;

}
/*==================================
        LOAD WALLET
==================================*/

async function loadWallet(){

hideMessage();

try{

const wallet=

await api(

WALLET_ENDPOINT

);

const balance=

wallet.balance??

wallet.availableBalance??

0;

balanceElement.textContent=

money(balance);

statusText.textContent=

"Wallet connected securely to the Senku Pay server.";

return wallet;

}

catch(error){

console.error(error);

showMessage(

error.message||

"Unable to load wallet.",

"error"

);

statusText.textContent=

"Wallet connection failed.";

return null;

}

}

/*==================================
        PAYMENT METHODS
==================================*/

const methodTemplates={

card:`

<div class="field-group">

<label>

Card Number

</label>

<input
id="accountInput"
type="text"
placeholder="Enter card number">

</div>

<div class="field-group">

<label>

Cardholder Name

</label>

<input
id="holderInput"
type="text"
placeholder="Enter cardholder name">

</div>

<div class="field-group">

<label>

Optional Note

</label>

<input
id="noteInput"
type="text"
placeholder="Optional note">

</div>

`,

cashapp:`

<div class="field-group">

<label>

Cash App Cashtag

</label>

<input
id="accountInput"
type="text"
placeholder="$username">

</div>

<div class="field-group">

<label>

Registered Email

</label>

<input
id="holderInput"
type="email"
placeholder="Cash App email">

</div>

<div class="field-group">

<label>

Optional Note

</label>

<input
id="noteInput"
type="text"
placeholder="Optional note">

</div>

`,

chime:`

<div class="field-group">

<label>

Chime Username

</label>

<input
id="accountInput"
type="text"
placeholder="Username">

</div>

<div class="field-group">

<label>

Phone or Email

</label>

<input
id="holderInput"
type="text"
placeholder="Phone or email">

</div>

<div class="field-group">

<label>

Optional Note

</label>

<input
id="noteInput"
type="text"
placeholder="Optional note">

</div>

`,

applepay:`

<div class="field-group">

<label>

Apple ID

</label>

<input
id="accountInput"
type="email"
placeholder="Apple ID email">

</div>

<div class="field-group">

<label>

Recipient Name

</label>

<input
id="holderInput"
type="text"
placeholder="Full name">

</div>

<div class="field-group">

<label>

Optional Note

</label>

<input
id="noteInput"
type="text"
placeholder="Optional note">

</div>

`,

googlepay:`

<div class="field-group">

<label>

Google Pay Email

</label>

<input
id="accountInput"
type="email"
placeholder="Google Pay email">

</div>

<div class="field-group">

<label>

Recipient Name

</label>

<input
id="holderInput"
type="text"
placeholder="Full name">

</div>

<div class="field-group">

<label>

Optional Note

</label>

<input
id="noteInput"
type="text"
placeholder="Optional note">

</div>

`

};

function updatePaymentFields(){

paymentFields.innerHTML=

methodTemplates[selectedMethod];

}

methodButtons.forEach(button=>{

button.addEventListener(

"click",

()=>{

methodButtons.forEach(item=>{

item.classList.remove("active");

item.setAttribute(

"aria-checked",

"false"

);

});

button.classList.add("active");

button.setAttribute(

"aria-checked",

"true"

);

selectedMethod=

button.dataset.method;

updatePaymentFields();

}

);

});

updatePaymentFields();
/*==================================
        LOAD WITHDRAW HISTORY
==================================*/

async function loadWithdrawHistory(){

if(!historyContainer){

return;

}

try{

const response=

await api(

WITHDRAW_ENDPOINT

);

const withdrawals=

Array.isArray(response)

? response

: response.withdrawals||

response.data||

[];

if(withdrawals.length===0){

return;

}

historyContainer.innerHTML="";

withdrawals

.slice(0,8)

.forEach(item=>{

const status=

String(

item.status||

"Pending"

).toLowerCase();

let statusClass="pending";

if(

status==="approved"||

status==="completed"||

status==="success"

){

statusClass="success";

}

if(

status==="failed"||

status==="rejected"

){

statusClass="failed";

}

historyContainer.insertAdjacentHTML(

"beforeend",

`

<div class="withdraw-item">

<div class="withdraw-left">

<div class="withdraw-item-icon">

<i class="fa-solid fa-arrow-up"></i>

</div>

<div>

<h3>

${money(item.amount)}

</h3>

<p>

${selectedMethod.toUpperCase()}

</p>

<small>

${new Date(

item.createdAt

).toLocaleString()}

</small>

</div>

</div>

<div class="withdraw-status ${statusClass}">

${item.status}

</div>

</div>

`

);

});

}

catch(error){

console.error(

"History error:",

error

);

}

}

/*==================================
        VALIDATION
==================================*/

function validateWithdraw(){

const amount=

Number(

amountInput.value

);

if(

!Number.isFinite(amount)||

amount<=0

){

errorBox.style.display=

"flex";

return false;

}

const account=

document.getElementById(

"accountInput"

);

if(

account &&

account.value.trim()===""

){

showMessage(

"Please complete the payout information.",

"error"

);

return false;

}

errorBox.style.display=

"none";

return true;

}

amountInput.addEventListener(

"input",

validateWithdraw

);
/*==================================
        CREATE WITHDRAW REQUEST
==================================*/

confirmButton?.addEventListener(

"click",

async()=>{

hideMessage();

if(!validateWithdraw()){

return;

}

const amount=

Number(

amountInput.value

);

const account=

document.getElementById(

"accountInput"

)?.value.trim()||"";

const holder=

document.getElementById(

"holderInput"

)?.value.trim()||"";

const note=

document.getElementById(

"noteInput"

)?.value.trim()||"";

confirmButton.disabled=true;

confirmButton.innerHTML=`

<i class="fa-solid fa-spinner fa-spin"></i>

<span>

Submitting...

</span>

`;

try{

const result=

await api(

CREATE_WITHDRAW_ENDPOINT,

{

method:"POST",

headers:{

"Content-Type":

"application/json"

},

body:JSON.stringify({

amount,

method:selectedMethod,

account,

holder,

note

})

}

);

showMessage(

result.message||

"Withdrawal request submitted successfully.",

"success"

);

amountInput.value="";

updatePaymentFields();

await loadWallet();

await loadWithdrawHistory();

}

catch(error){

console.error(error);

showMessage(

error.message||

"Unable to submit withdrawal request.",

"error"

);

}

finally{

confirmButton.disabled=false;

confirmButton.innerHTML=`

<i class="fa-solid fa-arrow-up"></i>

<span>

Request Withdrawal

</span>

`;

}

});

/*==================================
        PAGE ANIMATION
==================================*/

document

.querySelectorAll(

".withdraw-card,.form-card,.method-card,.account-card,.confirm-withdraw,.withdraw-history,.withdraw-info"

)

.forEach((element,index)=>{

element.style.opacity="0";

element.style.transform=

"translateY(20px)";

setTimeout(()=>{

element.style.transition=

".55s ease";

element.style.opacity="1";

element.style.transform=

"translateY(0)";

},100+(index*80));

});

/*==================================
        INITIALIZE
==================================*/

const wallet=

await loadWallet();

if(wallet){

await loadWithdrawHistory();

}

/*==================================
        END
==================================*/

});