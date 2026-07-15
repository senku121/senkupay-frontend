/*==================================================
                SENKU PAY
                DEPOSIT PAGE
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkustakes-api.onrender.com";

const WALLET_ENDPOINT=
`${API_BASE_URL}/api/wallet`;

const DEPOSIT_ENDPOINT=
`${API_BASE_URL}/api/deposit`;

const CREATE_DEPOSIT_ENDPOINT=
`${API_BASE_URL}/api/deposit/create`;

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

localStorage.removeItem("token");

localStorage.removeItem("currentUser");

sessionStorage.removeItem("token");

sessionStorage.removeItem("currentUser");

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
document.getElementById("depositBalance");

const amountInput=
document.getElementById("depositAmount");

const confirmButton=
document.getElementById("confirmDeposit");

const errorBox=
document.getElementById("depositError");

const messageBox=
document.getElementById("depositMessage");

const statusText=
document.getElementById("depositStatusText");

const gatewayLoader=
document.getElementById("gatewayLoader");

const gatewayPreview=
document.getElementById("gatewayPreview");

const gatewayIcon=
document.getElementById("gatewayIcon");

const gatewayTitle=
document.getElementById("gatewayTitle");

const gatewaySubtitle=
document.getElementById("gatewaySubtitle");

const gatewayDescription=
document.getElementById("gatewayDescription");

const historyContainer=
document.getElementById("depositHistory");

let selectedMethod="card";

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type="info"){

messageBox.hidden=false;

messageBox.className=

`deposit-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

messageBox.hidden=true;

messageBox.className="deposit-message";

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

if(balanceElement){

balanceElement.textContent=

money(balance);

}

if(statusText){

statusText.textContent=

"Wallet connected securely to the Senku Pay server.";

}

return wallet;

}

catch(error){

console.error(error);

showMessage(

error.message||

"Unable to load wallet.",

"error"

);

if(statusText){

statusText.textContent=

"Wallet connection failed.";

}

return null;

}

}

/*==================================
        PAYMENT METHODS
==================================*/

const paymentButtons=

document.querySelectorAll(

".payment-option"

);

const gatewayData={

card:{

icon:"fa-credit-card",

title:"Card Payment",

subtitle:"Visa • Mastercard • American Express",

description:

"You'll be redirected to a secure card payment gateway."

},

cashapp:{

icon:"fa-dollar-sign",

title:"Cash App",

subtitle:"Cash App Secure Checkout",

description:

"You'll continue to the Cash App payment gateway."

},

chime:{

icon:"fa-building-columns",

title:"Chime",

subtitle:"Secure Chime Payment",

description:

"You'll continue to the Chime payment gateway."

},

applepay:{

icon:"fa-apple",

subtitle:"Apple Pay Secure Checkout",

title:"Apple Pay",

description:

"You'll continue using Apple Pay."

},

googlepay:{

icon:"fa-google",

title:"Google Pay",

subtitle:"Google Secure Checkout",

description:

"You'll continue using Google Pay."

}

};

paymentButtons.forEach(button=>{

button.addEventListener(

"click",

()=>{

paymentButtons.forEach(item=>{

item.classList.remove(

"active"

);

item.setAttribute(

"aria-checked",

"false"

);

});

button.classList.add(

"active"

);

button.setAttribute(

"aria-checked",

"true"

);

selectedMethod=

button.dataset.method;

const gateway=

gatewayData[

selectedMethod

];

gatewayIcon.className=

selectedMethod==="applepay"

?

"fa-brands fa-apple"

:

selectedMethod==="googlepay"

?

"fa-brands fa-google"

:

`fa-solid ${gateway.icon}`;

gatewayTitle.textContent=

gateway.title;

gatewaySubtitle.textContent=

gateway.subtitle;

gatewayDescription.innerHTML=

gateway.description;

}

);

});
/*==================================
        LOAD DEPOSIT HISTORY
==================================*/

async function loadDepositHistory(){

if(!historyContainer){

return;

}

try{

const response=

await api(

DEPOSIT_ENDPOINT

);

const deposits=

Array.isArray(response)

? response

: response.deposits||

response.data||

[];

if(deposits.length===0){

return;

}

historyContainer.innerHTML="";

deposits

.slice(0,8)

.forEach(item=>{

const status=

String(

item.status||

"Pending"

).toLowerCase();

let statusClass="pending";

if(status==="approved"||

status==="completed"||

status==="success"){

statusClass="success";

}

if(status==="failed"||

status==="rejected"){

statusClass="failed";

}

historyContainer.insertAdjacentHTML(

"beforeend",

`

<div class="deposit-item">

<div class="deposit-left">

<div class="deposit-icon">

<i class="fa-solid fa-dollar-sign"></i>

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

<div class="deposit-status ${statusClass}">

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

function validateDeposit(){

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

errorBox.style.display=

"none";

return true;

}

amountInput.addEventListener(

"input",

validateDeposit

);
/*==================================
        CREATE DEPOSIT
==================================*/

confirmButton?.addEventListener(

"click",

async()=>{

hideMessage();

if(!validateDeposit()){

return;

}

const amount=

Number(

amountInput.value

);

confirmButton.disabled=true;

gatewayPreview.hidden=true;

gatewayLoader.hidden=false;

confirmButton.innerHTML=`

<i class="fa-solid fa-spinner fa-spin"></i>

<span>

Preparing Payment...

</span>

`;

try{

const deposit=

await api(

CREATE_DEPOSIT_ENDPOINT,

{

method:"POST",

headers:{

"Content-Type":

"application/json"

},

body:JSON.stringify({

amount,

paymentMethod:selectedMethod

})

}

);

gatewayLoader.hidden=true;

gatewayPreview.hidden=false;

showMessage(

deposit.message||

"Deposit request created successfully.",

"success"

);

/*==================================
    PAYMENT REDIRECT
==================================*/

if(deposit.paymentUrl){

window.location.href=

deposit.paymentUrl;

return;

}

if(deposit.checkoutUrl){

window.location.href=

deposit.checkoutUrl;

return;

}

if(deposit.redirectUrl){

window.location.href=

deposit.redirectUrl;

return;

}

/*==================================
    FALLBACK
==================================*/

showMessage(

"Payment gateway integration is ready. Connect your provider API to return a payment URL.",

"info"

);

}

catch(error){

console.error(error);

gatewayLoader.hidden=true;

gatewayPreview.hidden=false;

showMessage(

error.message||

"Unable to create deposit request.",

"error"

);

}

finally{

confirmButton.disabled=false;

confirmButton.innerHTML=`

<i class="fa-solid fa-lock"></i>

<span>

Continue to Payment

</span>

`;

}

});

/*==================================
        PAGE ANIMATION
==================================*/

document

.querySelectorAll(

".deposit-card,.form-card,.payment-card,.payment-details,.confirm-deposit,.deposit-history,.deposit-info"

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

await loadDepositHistory();

}

/*==================================
        END
==================================*/

});