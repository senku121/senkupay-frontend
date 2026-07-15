/*==================================================
                SENKU PAY
             USER DASHBOARD
==================================================*/

document.addEventListener("DOMContentLoaded", async () => {

const API_BASE_URL =
"https://senkustakes-api.onrender.com";

const WALLET_ENDPOINT =
`${API_BASE_URL}/api/wallet`;

const TRANSACTIONS_ENDPOINT =
`${API_BASE_URL}/api/transactions`;

/*==================================
        STORAGE HELPERS
==================================*/

function getStoredToken(){

return (

sessionStorage.getItem("token") ||

localStorage.getItem("token")

);

}

function getStoredUser(){

const rawUser =

sessionStorage.getItem("currentUser") ||

localStorage.getItem("currentUser");

if(!rawUser){

return null;

}

try{

return JSON.parse(rawUser);

}

catch(error){

console.error(

"Invalid stored user data:",

error

);

return null;

}

}

function clearAuthentication(){

[

"token",

"currentUser"

].forEach(key=>{

sessionStorage.removeItem(key);

localStorage.removeItem(key);

});

}

/*==================================
        AUTHENTICATION CHECK
==================================*/

const token = getStoredToken();

if(!token){

window.location.replace("login.html");

return;

}

/*==================================
        DOM ELEMENTS
==================================*/

const welcome =
document.getElementById("dashboardWelcome");

const username =
document.getElementById("dashboardUsername");

const roleElement =
document.getElementById("dashboardRole");

const avatar =
document.getElementById("dashboardAvatar");

const balanceElement =
document.getElementById("dashboardBalance");

const depositedElement =
document.getElementById("dashboardDeposited");

const withdrawnElement =
document.getElementById("dashboardWithdrawn");

const pendingElement =
document.getElementById("dashboardPending");

const statusElement =
document.getElementById("dashboardStatus");

const emailStatusElement =
document.getElementById("dashboardEmailStatus");

const joinedElement =
document.getElementById("dashboardJoined");

const transactionContainer =
document.getElementById("dashboardTransactions");

const dashboardMessage =
document.getElementById("dashboardMessage");

const addFundsButton =
document.getElementById("addFundsButton");

const logoutButton =
document.getElementById("logoutButton");

const notificationButton =
document.getElementById("notificationButton");

const notificationDot =
document.getElementById("notificationDot");

const searchInput =
document.getElementById("dashboardSearch");

const sidebar =
document.getElementById("dashboardSidebar");

const mobileMenuButton =
document.getElementById("mobileMenuButton");

/*==================================
        MESSAGE
==================================*/

function showDashboardMessage(

text,

type = "info"

){

if(!dashboardMessage){

return;

}

dashboardMessage.hidden = false;

dashboardMessage.className =

`dashboard-message show ${type}`;

dashboardMessage.textContent = text;

}

function hideDashboardMessage(){

if(!dashboardMessage){

return;

}

dashboardMessage.hidden = true;

dashboardMessage.className =
"dashboard-message";

dashboardMessage.textContent = "";

}

/*==================================
        MONEY FORMATTER
==================================*/

function formatMoney(value){

const amount = Number(value || 0);

return new Intl.NumberFormat(

"en-US",

{

style:"currency",

currency:"USD",

minimumFractionDigits:2,

maximumFractionDigits:2

}

).format(

Number.isFinite(amount)

? amount

: 0

);

}

/*==================================
        DATE FORMATTER
==================================*/

function formatDate(value){

if(!value){

return "--";

}

const date = new Date(value);

if(Number.isNaN(date.getTime())){

return "--";

}

return date.toLocaleDateString(

undefined,

{

year:"numeric",

month:"short",

day:"numeric"

}

);

}

/*==================================
        API REQUEST
==================================*/

async function apiRequest(

endpoint,

options = {}

){

const response = await fetch(

endpoint,

{

...options,

headers:{

"Accept":"application/json",

Authorization:`Bearer ${token}`,

...(options.headers || {})

}

}

);

let data = null;

const contentType =

response.headers.get("content-type") || "";

if(

contentType.includes(

"application/json"

)

){

data = await response.json();

}

else{

const text = await response.text();

data = {

message:

text ||

"Unexpected server response."

};

}

if(

response.status === 401 ||

response.status === 403

){

clearAuthentication();

window.location.replace("login.html");

throw new Error(

"Authentication expired."

);

}

if(!response.ok){

throw new Error(

data?.message ||

data?.error ||

"Request failed."

);

}

return data;

}
/*==================================
        LOAD DASHBOARD
==================================*/

async function loadDashboard(){

hideDashboardMessage();

try{

const wallet = await apiRequest(

WALLET_ENDPOINT

);

const storedUser = getStoredUser();

const user =

wallet.user ||

storedUser ||

wallet;

const usernameValue =

user.username ||

user.name ||

"User";

const emailValue =

user.email ||

wallet.email ||

"";

const roleValue =

user.role ||

"USER";

if(welcome){

welcome.textContent=

`Welcome back, ${usernameValue} 👋`;

}

if(username){

username.textContent=

usernameValue;

}

if(roleElement){

roleElement.textContent=

roleValue

.replaceAll("_"," ")

.toUpperCase();

}

if(avatar){

avatar.textContent=

usernameValue

.charAt(0)

.toUpperCase();

}

if(balanceElement){

balanceElement.textContent=

formatMoney(

wallet.balance

);

}

if(depositedElement){

depositedElement.textContent=

formatMoney(

wallet.deposited

);

}

if(withdrawnElement){

withdrawnElement.textContent=

formatMoney(

wallet.withdrawn

);

}

if(pendingElement){

pendingElement.textContent=

formatMoney(

wallet.pendingWithdraw ||

wallet.pending ||

0

);

}

if(statusElement){

statusElement.textContent=

user.status ||

"Active";

}

if(emailStatusElement){

const verified=

user.emailVerified ||

wallet.emailVerified ||

false;

emailStatusElement.textContent=

verified

? "Verified"

: "Pending";

emailStatusElement.className=

verified

? "status-positive"

: "status-warning";

}

if(joinedElement){

joinedElement.textContent=

formatDate(

user.createdAt ||

wallet.createdAt

);

}

document.title=

`${usernameValue} | Senku Pay`;

return{

wallet,

user,

emailValue

};

}

catch(error){

console.error(error);

showDashboardMessage(

error.message ||

"Unable to load dashboard.",

"error"

);

return null;

}

}

/*==================================
        LOAD TRANSACTIONS
==================================*/

async function loadTransactions(){

if(!transactionContainer){

return;

}

try{

const transactions=

await apiRequest(

TRANSACTIONS_ENDPOINT

);

if(

!Array.isArray(transactions) ||

transactions.length===0

){

return;

}

transactionContainer.innerHTML="";

transactions

.slice(0,5)

.forEach(tx=>{

const withdrawal=

String(tx.type)

.toLowerCase()

.includes("withdraw");

const amountClass=

withdrawal

? "negative"

: "positive";

const icon=

withdrawal

? "fa-arrow-up"

: "fa-arrow-down";

const sign=

withdrawal

? "-"

: "+";

transactionContainer

.insertAdjacentHTML(

"beforeend",

`

<div class="transaction-row">

<div class="transaction-info">

<div class="transaction-icon">

<i class="fa-solid ${icon}"></i>

</div>

<div>

<h4>${tx.type}</h4>

<p>

${new Date(

tx.createdAt

).toLocaleString()}

<br>

Status: ${tx.status}

</p>

</div>

</div>

<div class="transaction-amount ${amountClass}">

${sign}${formatMoney(tx.amount)}

</div>

</div>

`

);

});

}

catch(error){

console.error(error);

}

}
/*==================================
        MOBILE SIDEBAR
==================================*/

let sidebarOverlay = null;

function ensureSidebarOverlay(){

if(sidebarOverlay){

return sidebarOverlay;

}

sidebarOverlay =
document.createElement("div");

sidebarOverlay.className =
"sidebar-overlay";

document.body.appendChild(
sidebarOverlay
);

sidebarOverlay.addEventListener(
"click",
closeMobileSidebar
);

return sidebarOverlay;

}

function openMobileSidebar(){

if(!sidebar){

return;

}

const overlay =
ensureSidebarOverlay();

sidebar.classList.add(
"mobile-open"
);

overlay.classList.add(
"show"
);

document.body.classList.add(
"sidebar-open"
);

mobileMenuButton?.setAttribute(
"aria-expanded",
"true"
);

}

function closeMobileSidebar(){

sidebar?.classList.remove(
"mobile-open"
);

sidebarOverlay?.classList.remove(
"show"
);

document.body.classList.remove(
"sidebar-open"
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

closeMobileSidebar();

}
else{

openMobileSidebar();

}

}
);

document.addEventListener(
"keydown",
event=>{

if(
event.key==="Escape" &&
sidebar?.classList.contains(
"mobile-open"
)
){

closeMobileSidebar();

mobileMenuButton?.focus();

}

}
);

window.addEventListener(
"resize",
()=>{

if(window.innerWidth>768){

closeMobileSidebar();

}

}
);

/*==================================
        CLOSE MENU AFTER NAVIGATION
==================================*/

document
.querySelectorAll(".sidebar nav a")
.forEach(link=>{

link.addEventListener(
"click",
()=>{

if(window.innerWidth<=768){

closeMobileSidebar();

}

}
);

});

/*==================================
        ADD FUNDS
==================================*/

addFundsButton?.addEventListener(
"click",
()=>{

window.location.href =
"deposit.html";

}
);

/*==================================
        NOTIFICATIONS
==================================*/

notificationButton?.addEventListener(
"click",
()=>{

notificationDot?.setAttribute(
"hidden",
""
);

showDashboardMessage(

"You have no new notifications.",

"info"

);

window.setTimeout(
hideDashboardMessage,
2500
);

}
);

/*==================================
        SEARCH
==================================*/

searchInput?.addEventListener(
"input",
()=>{

const query =
searchInput.value

.trim()

.toLowerCase();

const searchableItems =
document.querySelectorAll(

".quick-card, .stat-card, .transaction-row, .balance-card"

);

searchableItems.forEach(item=>{

const matches =
!query ||

item.textContent

.toLowerCase()

.includes(query);

item.style.display =
matches

? ""

: "none";

});

}
);

/*==================================
        TRANSACTION ROW EFFECT
==================================*/

document.addEventListener(
"click",
event=>{

const row =
event.target.closest(
".transaction-row"
);

if(!row){

return;

}

row.style.background =
"rgba(123,44,255,.10)";

window.setTimeout(
()=>{

row.style.background = "";

},
450
);

}
);

/*==================================
        LOGOUT
==================================*/

logoutButton?.addEventListener(
"click",
()=>{

const performLogout = ()=>{

clearAuthentication();

window.location.replace(
"login.html"
);

};

if(
typeof showPopup ===
"function"
){

showPopup({

type:"warning",

title:"Logout",

message:
"Are you sure you want to log out of Senku Pay?",

confirm:true,

onConfirm:performLogout

});

return;

}

if(
window.confirm(
"Are you sure you want to log out?"
)
){

performLogout();

}

}
);

/*==================================
        INITIALIZE
==================================*/

const dashboardData =
await loadDashboard();

if(dashboardData){

await loadTransactions();

}

/*==================================
        END
==================================*/

});