/*==================================================
                SENKU PAY
            TRANSACTIONS PAGE
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkupay-api.onrender.com";

const TRANSACTIONS_ENDPOINT=
`${API_BASE_URL}/api/transactions`;

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

const transactionList=
document.getElementById("transactionList");

const totalTransactions=
document.getElementById("totalTransactions");

const totalDeposits=
document.getElementById("totalDeposits");

const totalWithdrawals=
document.getElementById("totalWithdrawals");

const searchInput=
document.getElementById("transactionSearch");

const filterButtons=
document.querySelectorAll(".filter");

const messageBox=
document.getElementById("transactionsMessage");

let transactions=[];

let currentFilter="all";

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type="info"){

messageBox.hidden=false;

messageBox.className=

`transactions-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

messageBox.hidden=true;

messageBox.className=

"transactions-message";

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

function formatDate(value){

if(!value){

return "--";

}

const date=new Date(value);

if(Number.isNaN(date.getTime())){

return "--";

}

return date.toLocaleString();

}

/*==================================
        ESCAPE HTML
==================================*/

function escapeHtml(value){

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

async function api(url){

const response=

await fetch(

url,

{

headers:{

Accept:"application/json",

Authorization:

`Bearer ${token}`

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

let data={};

try{

data=await response.json();

}

catch{

data={};

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
        LOAD TRANSACTIONS
==================================*/

async function loadTransactions(){

hideMessage();

try{

const response=

await api(

TRANSACTIONS_ENDPOINT

);

transactions=

Array.isArray(response)

? response

: response.transactions||

response.data||

[];

renderTransactions(

transactions

);

}

catch(error){

console.error(error);

showMessage(

error.message||

"Unable to load transactions.",

"error"

);

}

}

/*==================================
        ANIMATE NUMBERS
==================================*/

function animateNumber(

element,

target,

currency=false

){

let current=0;

const increment=

target/30;

const timer=

setInterval(()=>{

current+=increment;

if(current>=target){

current=target;

clearInterval(timer);

}

element.textContent=

currency

? money(current)

: Math.floor(current);

},20);

}

/*==================================
        RENDER
==================================*/

function renderTransactions(list){

let deposits=0;

let withdrawals=0;

list.forEach(tx=>{

const amount=

Number(tx.amount||0);

const type=

String(

tx.type||

""

).toLowerCase();

if(

type.includes("deposit")

){

deposits+=amount;

}

if(

type.includes("withdraw")

){

withdrawals+=amount;

}

});

animateNumber(

totalTransactions,

list.length,

false

);

animateNumber(

totalDeposits,

deposits,

true

);

animateNumber(

totalWithdrawals,

withdrawals,

true

);

if(list.length===0){

transactionList.innerHTML=`

<div class="empty-transactions">

<i class="fa-solid fa-clock-rotate-left"></i>

<h3>

No Transactions Found

</h3>

<p>

Your deposits and withdrawals will appear here.

</p>

</div>

`;

return;

}

transactionList.innerHTML="";

list

.slice()

.reverse()

.forEach(tx=>{

const type=

String(

tx.type||

"Transaction"

);

const lower=

type.toLowerCase();

const amount=

Number(

tx.amount||0

);

const status=

String(

tx.status||

"Completed"

).toLowerCase();

let icon=

"fa-money-bill-transfer";

let rowClass="";

let sign="";

if(

lower.includes("deposit")

){

icon="fa-arrow-down";

rowClass="deposit";

sign="+";

}

else if(

lower.includes("withdraw")

){

icon="fa-arrow-up";

rowClass="withdrawal";

sign="-";

}

transactionList.insertAdjacentHTML(

"beforeend",

`

<div class="transaction-item ${rowClass}">

<div class="transaction-left">

<div class="transaction-icon">

<i class="fa-solid ${icon}"></i>

</div>

<div>

<h3>

${escapeHtml(type)}

</h3>

<p>

${formatDate(tx.createdAt)}

</p>

<span class="transaction-status ${escapeHtml(status)}">

${escapeHtml(tx.status||"Completed")}

</span>

</div>

</div>

<div class="transaction-amount">

${sign}${money(amount)}

</div>

</div>

`

);

});

}
/*==================================
        SEARCH
==================================*/

function applyFilters(){

const keyword=

searchInput.value

.trim()

.toLowerCase();

const filtered=

transactions.filter(tx=>{

const type=

String(

tx.type||

""

).toLowerCase();

const status=

String(

tx.status||

""

).toLowerCase();

const amount=

String(

tx.amount??

""

).toLowerCase();

const matchesSearch=

type.includes(keyword)||

status.includes(keyword)||

amount.includes(keyword);

let matchesFilter=true;

if(currentFilter!=="all"){

if(

currentFilter==="deposit"

){

matchesFilter=

type.includes("deposit");

}

else if(

currentFilter==="withdrawal"

){

matchesFilter=

type.includes("withdraw");

}

else{

matchesFilter=

status===currentFilter;

}

}

return(

matchesSearch&&

matchesFilter

);

});

renderTransactions(

filtered

);

}

searchInput?.addEventListener(

"input",

applyFilters

);

/*==================================
        FILTERS
==================================*/

filterButtons.forEach(button=>{

button.addEventListener(

"click",

()=>{

filterButtons.forEach(item=>{

item.classList.remove(

"active"

);

});

button.classList.add(

"active"

);

currentFilter=

button.dataset.filter||

"all";

applyFilters();

}

);

});

/*==================================
        PAGE ANIMATION
==================================*/

document

.querySelectorAll(

".summary-grid,.filter-card,.transactions-card,.transactions-info"

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

await loadTransactions();

/*==================================
                END
==================================*/

});