/*==================================================
                SENKU PAY
             ADMIN USERS PANEL
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkupay-api.onrender.com";

const USERS_ENDPOINT=
`${API_BASE_URL}/api/admin/users`;

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

try{

return JSON.parse(

sessionStorage.getItem("currentAdmin")||

localStorage.getItem("currentAdmin")||

sessionStorage.getItem("currentUser")||

localStorage.getItem("currentUser")||

"null"

);

}

catch{

return null;

}

}

function logoutAdmin(){

[
"adminToken",
"currentAdmin",
"currentUser",
"adminRememberDevice"

].forEach(key=>{

sessionStorage.removeItem(key);

localStorage.removeItem(key);

});

window.location.href="admin-login.html";

}

const token=getAdminToken();

if(!token){

logoutAdmin();

return;

}

/*==================================
        ELEMENTS
==================================*/

const userTable=
document.getElementById("userTable");

const userSearch=
document.getElementById("userSearch");

const statusFilter=
document.getElementById("userStatusFilter");

const refreshButton=
document.getElementById("refreshUsersButton");

const logoutButton=
document.getElementById("adminLogoutButton");

const mobileMenuButton=
document.getElementById("adminMobileMenuButton");

const sidebar=
document.getElementById("adminSidebar");

const sidebarOverlay=
document.getElementById("adminSidebarOverlay");

const messageBox=
document.getElementById("adminUsersMessage");

const totalUsersElement=
document.getElementById("summaryTotalUsers");

const activeUsersElement=
document.getElementById("summaryActiveUsers");

const restrictedUsersElement=
document.getElementById("summaryRestrictedUsers");

const totalBalanceElement=
document.getElementById("summaryTotalBalance");

const lastSyncElement=
document.getElementById("usersLastSync");

const previousButton=
document.getElementById("previousPageButton");

const nextButton=
document.getElementById("nextPageButton");

const currentPageText=
document.getElementById("currentPageText");

const resultText=
document.getElementById("userResultsText");

/*==================================
        MODAL
==================================*/

const modal=
document.getElementById("userManageModal");

const closeModalButton=
document.getElementById("closeUserModal");

const avatar=
document.getElementById("manageUserAvatar");

const username=
document.getElementById("manageUsername");

const email=
document.getElementById("manageEmail");

const userId=
document.getElementById("manageUserId");

const balance=
document.getElementById("manageBalance");

const status=
document.getElementById("manageStatus");

const joined=
document.getElementById("manageJoined");

const modalMessage=
document.getElementById("userModalMessage");

const addBalanceButton=
document.getElementById("addBalanceBtn");

const deductBalanceButton=
document.getElementById("deductBalanceBtn");

const freezeButton=
document.getElementById("freezeUserBtn");

const blockButton=
document.getElementById("blockUserBtn");

const resetPasswordButton=
document.getElementById("resetPasswordBtn");

const historyButton=
document.getElementById("transactionHistoryBtn");

const balanceForm=
document.getElementById("userBalanceForm");

const balanceTitle=
document.getElementById("userBalanceFormTitle");

const balanceAmount=
document.getElementById("userBalanceAmount");

const submitBalance=
document.getElementById("submitUserBalanceAction");

const passwordForm=
document.getElementById("userPasswordForm");

const passwordInput=
document.getElementById("newManagedUserPassword");

const submitPassword=
document.getElementById("submitUserPasswordAction");

const historyPanel=
document.getElementById("transactionHistoryPanel");

const historyList=
document.getElementById("transactionHistoryList");

const historySubtitle=
document.getElementById("transactionHistorySubtitle");

/*==================================
        VARIABLES
==================================*/

let users=[];

let filteredUsers=[];

let selectedUser=null;

let balanceMode="add";

let currentPage=1;

const pageSize=10;

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type="info"){

messageBox.hidden=false;

messageBox.className=

`admin-users-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

messageBox.hidden=true;

messageBox.className=

"admin-users-message";

messageBox.textContent="";

}

function showModalMessage(text,type="error"){

modalMessage.hidden=false;

modalMessage.className=

`user-modal-message show ${type}`;

modalMessage.textContent=text;

}

function hideModalMessage(){

modalMessage.hidden=true;

modalMessage.className=

"user-modal-message";

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

function date(value){

if(!value){

return "--";

}

return new Date(value)

.toLocaleDateString();

}

function escapeHTML(text){

return String(text??"")

.replaceAll("&","&amp;")

.replaceAll("<","&lt;")

.replaceAll(">","&gt;")

.replaceAll('"',"&quot;");

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

"Admin request failed."

);

}

return data;

}

/*==================================
        NORMALIZE USERS
==================================*/

function normalizeUsers(response){

const list=

Array.isArray(response)

? response

: response.users||

response.data||

response.results||

[];

return Array.isArray(list)

? list

: [];

}

/*==================================
        STATUS
==================================*/

function normalizeStatus(value){

return String(

value||

"ACTIVE"

).toLowerCase();

}

function statusLabel(value){

return String(

value||

"ACTIVE"

)

.replaceAll("_"," ")

.toLowerCase()

.replace(

/\b\w/g,

letter=>

letter.toUpperCase()

);

}

/*==================================
        SUMMARY
==================================*/

function updateSummary(){

const activeCount=

users.filter(user=>

normalizeStatus(

user.status

)==="active"

).length;

const restrictedCount=

users.filter(user=>{

const current=

normalizeStatus(

user.status

);

return[

"frozen",

"blocked",

"disabled",

"suspended"

].includes(current);

}).length;

const balanceTotal=

users.reduce(

(total,user)=>

total+

Number(

user.balance||

0

),

0

);

if(totalUsersElement){

totalUsersElement.textContent=

String(users.length);

}

if(activeUsersElement){

activeUsersElement.textContent=

String(activeCount);

}

if(restrictedUsersElement){

restrictedUsersElement.textContent=

String(restrictedCount);

}

if(totalBalanceElement){

totalBalanceElement.textContent=

money(balanceTotal);

}

}

/*==================================
        FILTER USERS
==================================*/

function applyFilters(){

const keyword=

String(

userSearch?.value||

""

)

.trim()

.toLowerCase();

const selectedStatus=

String(

statusFilter?.value||

"all"

).toLowerCase();

filteredUsers=

users.filter(user=>{

const searchable=[

user.id,

user.userId,

user.username,

user.fullName,

user.name,

user.email,

user.status

]

.map(value=>

String(value??"")

.toLowerCase()

)

.join(" ");

const searchMatch=

!keyword||

searchable.includes(keyword);

const statusMatch=

selectedStatus==="all"||

normalizeStatus(

user.status

)===selectedStatus;

return(

searchMatch&&

statusMatch

);

});

currentPage=1;

renderUsers();

}

/*==================================
        RENDER USERS
==================================*/

function renderUsers(){

if(!userTable){

return;

}

const totalPages=

Math.max(

1,

Math.ceil(

filteredUsers.length/

pageSize

)

);

if(currentPage>totalPages){

currentPage=totalPages;

}

const start=

(currentPage-1)*

pageSize;

const pageUsers=

filteredUsers.slice(

start,

start+pageSize

);

if(pageUsers.length===0){

userTable.innerHTML=`

<tr class="loading-row">

<td colspan="7">

<i class="fa-solid fa-users-slash"></i>

No users match the current filters.

</td>

</tr>

`;

}

else{

userTable.innerHTML="";

pageUsers.forEach(user=>{

const id=

user.id||

user.userId||

"";

const displayName=

user.username||

user.fullName||

user.name||

"User";

const emailValue=

user.email||

"No email";

const userStatus=

normalizeStatus(

user.status

);

userTable.insertAdjacentHTML(

"beforeend",

`

<tr>

<td>

${escapeHTML(id||"--")}

</td>

<td>

${escapeHTML(displayName)}

</td>

<td>

${escapeHTML(emailValue)}

</td>

<td>

${money(user.balance)}

</td>

<td>

<span class="user-status ${escapeHTML(userStatus)}">

${escapeHTML(

statusLabel(

user.status

)

)}

</span>

</td>

<td>

${escapeHTML(

date(

user.createdAt||

user.registeredAt

)

)}

</td>

<td>

<button
type="button"
class="manage-btn"
data-id="${escapeHTML(id)}">

Manage

</button>

</td>

</tr>

`

);

});

}

if(resultText){

const end=

Math.min(

start+

pageUsers.length,

filteredUsers.length

);

resultText.textContent=

filteredUsers.length===0

? "Showing 0 users"

: `Showing ${start+1}-${end} of ${filteredUsers.length} users`;

}

if(currentPageText){

currentPageText.textContent=

`Page ${currentPage} of ${totalPages}`;

}

if(previousButton){

previousButton.disabled=

currentPage<=1;

}

if(nextButton){

nextButton.disabled=

currentPage>=totalPages;

}

}

/*==================================
        LOAD USERS
==================================*/

async function loadUsers(){

hideMessage();

if(userTable){

userTable.innerHTML=`

<tr class="loading-row">

<td colspan="7">

<i class="fa-solid fa-spinner fa-spin"></i>

Loading users...

</td>

</tr>

`;

}

try{

const response=

await api(

USERS_ENDPOINT

);

users=

normalizeUsers(

response

);

filteredUsers=[

...users

];

updateSummary();

renderUsers();

if(lastSyncElement){

lastSyncElement.textContent=

`Last synchronized ${new Date().toLocaleString()}.`;

}

return users;

}

catch(error){

console.error(

"Users load failed:",

error

);

if(userTable){

userTable.innerHTML=`

<tr class="loading-row">

<td colspan="7">

Unable to load users.

</td>

</tr>

`;

}

showMessage(

error.message||

"Unable to load user accounts.",

"error"

);

return[];

}

}

/*==================================
        SEARCH AND FILTER EVENTS
==================================*/

userSearch?.addEventListener(

"input",

applyFilters

);

statusFilter?.addEventListener(

"change",

applyFilters

);

/*==================================
        PAGINATION
==================================*/

previousButton?.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderUsers();

}

}

);

nextButton?.addEventListener(

"click",

()=>{

const totalPages=

Math.max(

1,

Math.ceil(

filteredUsers.length/

pageSize

)

);

if(currentPage<totalPages){

currentPage++;

renderUsers();

}

}

);
/*==================================
        REFRESH USERS
==================================*/

async function refreshUsers(){

if(refreshButton){

refreshButton.disabled=true;

refreshButton.classList.add(

"loading"

);

}

try{

await loadUsers();

showMessage(

"User accounts synchronized successfully.",

"success"

);

setTimeout(()=>{

hideMessage();

},2200);

}

catch(error){

console.error(

"User refresh failed:",

error

);

showMessage(

error.message||

"Unable to refresh user accounts.",

"error"

);

}

finally{

if(refreshButton){

refreshButton.disabled=false;

refreshButton.classList.remove(

"loading"

);

}

}

}

refreshButton?.addEventListener(

"click",

refreshUsers

);

/*==================================
        MODAL HELPERS
==================================*/

function closeAllPanels(){

if(balanceForm){

balanceForm.hidden=true;

}

if(passwordForm){

passwordForm.hidden=true;

}

if(historyPanel){

historyPanel.hidden=true;

}

if(balanceAmount){

balanceAmount.value="";

}

if(passwordInput){

passwordInput.value="";

}

hideModalMessage();

}

function updateModalButtons(){

if(!selectedUser){

return;

}

const currentStatus=

String(

selectedUser.status||

"ACTIVE"

).toUpperCase();

if(freezeButton){

freezeButton.innerHTML=

currentStatus==="FROZEN"

? `

<i class="fa-solid fa-fire"></i>

<span>Unfreeze Account</span>

`

: `

<i class="fa-solid fa-snowflake"></i>

<span>Freeze Account</span>

`;

}

if(blockButton){

blockButton.innerHTML=

currentStatus==="BLOCKED"

? `

<i class="fa-solid fa-unlock"></i>

<span>Unblock Account</span>

`

: `

<i class="fa-solid fa-ban"></i>

<span>Block Account</span>

`;

}

}

function populateModal(user){

const displayName=

user.username||

user.fullName||

user.name||

"User";

if(avatar){

avatar.textContent=

String(displayName)

.trim()

.charAt(0)

.toUpperCase()||

"U";

}

if(username){

username.textContent=

displayName;

}

if(email){

email.textContent=

user.email||

"No email available";

}

if(userId){

userId.textContent=

user.id||

user.userId||

"--";

}

if(balance){

balance.textContent=

money(

user.balance

);

}

if(status){

status.textContent=

statusLabel(

user.status

);

}

if(joined){

joined.textContent=

date(

user.createdAt||

user.registeredAt

);

}

updateModalButtons();

}

function openModal(user){

if(

!modal||

!user

){

return;

}

selectedUser=user;

populateModal(

user

);

closeAllPanels();

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

function closeModal(){

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

selectedUser=null;

closeAllPanels();

}

/*==================================
        OPEN MANAGE MODAL
==================================*/

document.addEventListener(

"click",

event=>{

const button=

event.target.closest(

".manage-btn"

);

if(!button){

return;

}

const id=

button.dataset.id;

const user=

users.find(item=>

String(

item.id||

item.userId||

""

)===String(id)

);

if(!user){

showMessage(

"Selected user could not be found.",

"error"

);

return;

}

openModal(

user

);

}

);

closeModalButton?.addEventListener(

"click",

closeModal

);

modal?.addEventListener(

"click",

event=>{

if(event.target===modal){

closeModal();

}

}

);

/*==================================
        OPEN BALANCE FORM
==================================*/

function openBalanceForm(mode){

if(!selectedUser){

return;

}

balanceMode=mode;

if(balanceTitle){

balanceTitle.textContent=

mode==="add"

? "Add User Balance"

: "Deduct User Balance";

}

if(submitBalance){

submitBalance.textContent=

mode==="add"

? "Add Balance"

: "Deduct Balance";

}

if(balanceForm){

balanceForm.hidden=false;

}

if(passwordForm){

passwordForm.hidden=true;

}

if(historyPanel){

historyPanel.hidden=true;

}

hideModalMessage();

setTimeout(()=>{

balanceAmount?.focus();

},50);

}

addBalanceButton?.addEventListener(

"click",

()=>{

openBalanceForm(

"add"

);

}

);

deductBalanceButton?.addEventListener(

"click",

()=>{

openBalanceForm(

"deduct"

);

}

);

/*==================================
        CLOSE BALANCE FORM
==================================*/

function closeBalanceForm(){

if(balanceForm){

balanceForm.hidden=true;

}

if(balanceAmount){

balanceAmount.value="";

}

hideModalMessage();

}

document

.getElementById(

"closeUserBalanceForm"

)

?.addEventListener(

"click",

closeBalanceForm

);

document

.getElementById(

"cancelUserBalanceAction"

)

?.addEventListener(

"click",

closeBalanceForm

);

/*==================================
        OPEN PASSWORD FORM
==================================*/

resetPasswordButton?.addEventListener(

"click",

()=>{

if(!selectedUser){

return;

}

if(passwordForm){

passwordForm.hidden=false;

}

if(balanceForm){

balanceForm.hidden=true;

}

if(historyPanel){

historyPanel.hidden=true;

}

hideModalMessage();

setTimeout(()=>{

passwordInput?.focus();

},50);

}

);

/*==================================
        CLOSE PASSWORD FORM
==================================*/

function closePasswordForm(){

if(passwordForm){

passwordForm.hidden=true;

}

if(passwordInput){

passwordInput.value="";

}

hideModalMessage();

}

document

.getElementById(

"closeUserPasswordForm"

)

?.addEventListener(

"click",

closePasswordForm

);

document

.getElementById(

"cancelUserPasswordAction"

)

?.addEventListener(

"click",

closePasswordForm

);

/*==================================
        CLOSE HISTORY PANEL
==================================*/

document

.getElementById(

"closeTransactionHistoryPanel"

)

?.addEventListener(

"click",

()=>{

if(historyPanel){

historyPanel.hidden=true;

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
        REFRESH SELECTED USER
==================================*/

function findSelectedUser(userId){

return users.find(user=>

String(

user.id||

user.userId||

""

)===String(userId)

);

}

async function refreshAfterAction(userId){

await loadUsers();

const updatedUser=

findSelectedUser(

userId

);

if(updatedUser){

selectedUser=updatedUser;

populateModal(

updatedUser

);

}

}

/*==================================
        SUBMIT BALANCE ACTION
==================================*/

submitBalance?.addEventListener(

"click",

async()=>{

if(!selectedUser){

showModalMessage(

"No user is selected.",

"error"

);

return;

}

const amount=

Number(

balanceAmount?.value

);

if(

!Number.isFinite(amount)||

amount<=0

){

showModalMessage(

"Enter a valid balance amount.",

"error"

);

balanceAmount?.focus();

return;

}

const id=

selectedUser.id||

selectedUser.userId;

const endpoint=

balanceMode==="add"

? `${USERS_ENDPOINT}/${id}/add-balance`

: `${USERS_ENDPOINT}/${id}/deduct-balance`;

setButtonLoading(

submitBalance,

true,

balanceMode==="add"

? "Adding..."

: "Deducting..."

);

hideModalMessage();

try{

const response=

await api(

endpoint,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

amount

})

}

);

showModalMessage(

response.message||

(

balanceMode==="add"

? "Balance added successfully."

: "Balance deducted successfully."

),

"success"

);

await refreshAfterAction(

id

);

if(balanceAmount){

balanceAmount.value="";

}

setTimeout(()=>{

closeBalanceForm();

},900);

}

catch(error){

console.error(

"Balance action failed:",

error

);

showModalMessage(

error.message||

"Unable to update the user balance.",

"error"

);

}

finally{

setButtonLoading(

submitBalance,

false

);

}

}

);

/*==================================
        UPDATE STATUS
==================================*/

async function updateUserStatus(

newStatus,

button

){

if(!selectedUser){

showModalMessage(

"No user is selected.",

"error"

);

return;

}

const id=

selectedUser.id||

selectedUser.userId;

setButtonLoading(

button,

true,

"Updating..."

);

hideModalMessage();

try{

const response=

await api(

`${USERS_ENDPOINT}/${id}/status`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

status:newStatus

})

}

);

showModalMessage(

response.message||

`User status changed to ${newStatus}.`,

"success"

);

await refreshAfterAction(

id

);

}

catch(error){

console.error(

"User status update failed:",

error

);

showModalMessage(

error.message||

"Unable to update the user status.",

"error"

);

}

finally{

setButtonLoading(

button,

false

);

}

}

/*==================================
        FREEZE USER
==================================*/

freezeButton?.addEventListener(

"click",

async()=>{

if(!selectedUser){

return;

}

const currentStatus=

String(

selectedUser.status||

"ACTIVE"

).toUpperCase();

const newStatus=

currentStatus==="FROZEN"

? "ACTIVE"

: "FROZEN";

await updateUserStatus(

newStatus,

freezeButton

);

}

);

/*==================================
        BLOCK USER
==================================*/

blockButton?.addEventListener(

"click",

async()=>{

if(!selectedUser){

return;

}

const currentStatus=

String(

selectedUser.status||

"ACTIVE"

).toUpperCase();

const newStatus=

currentStatus==="BLOCKED"

? "ACTIVE"

: "BLOCKED";

await updateUserStatus(

newStatus,

blockButton

);

}

);

/*==================================
        RESET PASSWORD
==================================*/

submitPassword?.addEventListener(

"click",

async()=>{

if(!selectedUser){

showModalMessage(

"No user is selected.",

"error"

);

return;

}

const newPassword=

String(

passwordInput?.value||

""

);

if(newPassword.length<6){

showModalMessage(

"New password must contain at least 6 characters.",

"error"

);

passwordInput?.focus();

return;

}

const id=

selectedUser.id||

selectedUser.userId;

setButtonLoading(

submitPassword,

true,

"Resetting..."

);

hideModalMessage();

try{

const response=

await api(

`${USERS_ENDPOINT}/${id}/reset-password`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

password:newPassword

})

}

);

showModalMessage(

response.message||

"User password reset successfully.",

"success"

);

passwordInput.value="";

setTimeout(()=>{

closePasswordForm();

},900);

}

catch(error){

console.error(

"Password reset failed:",

error

);

showModalMessage(

error.message||

"Unable to reset the user password.",

"error"

);

}

finally{

setButtonLoading(

submitPassword,

false

);

}

}

);
/*==================================
        TRANSACTION HISTORY
==================================*/

historyButton?.addEventListener(

"click",

async()=>{

if(!selectedUser){

showModalMessage(

"No user is selected.",

"error"

);

return;

}

const id=

selectedUser.id||

selectedUser.userId;

if(historyPanel){

historyPanel.hidden=false;

}

if(balanceForm){

balanceForm.hidden=true;

}

if(passwordForm){

passwordForm.hidden=true;

}

if(historySubtitle){

historySubtitle.textContent=

`Transaction activity for ${

selectedUser.username||

selectedUser.fullName||

selectedUser.name||

"this user"

}.`;

}

if(historyList){

historyList.innerHTML=`

<div class="history-loading">

<i class="fa-solid fa-spinner fa-spin"></i>

Loading transactions...

</div>

`;

}

hideModalMessage();

setButtonLoading(

historyButton,

true,

"Loading..."

);

try{

const response=

await api(

`${USERS_ENDPOINT}/${id}/transactions`

);

const transactions=

Array.isArray(response)

? response

: response.transactions||

response.data||

response.results||

[];

if(!historyList){

return;

}

if(

!Array.isArray(transactions)||

transactions.length===0

){

historyList.innerHTML=`

<div class="history-loading">

<i class="fa-solid fa-clock-rotate-left"></i>

No transaction history found.

</div>

`;

return;

}

historyList.innerHTML="";

transactions

.slice()

.reverse()

.slice(0,20)

.forEach(transaction=>{

const type=

String(

transaction.type||

"Transaction"

);

const statusValue=

String(

transaction.status||

"Completed"

);

const amount=

Number(

transaction.amount||

0

);

historyList.insertAdjacentHTML(

"beforeend",

`

<div class="history-item">

<div>

<h4>

${escapeHTML(type)}

</h4>

<p>

${escapeHTML(

date(

transaction.createdAt||

transaction.date

)

)}

• ${escapeHTML(statusValue)}

</p>

</div>

<div class="history-amount">

${money(amount)}

</div>

</div>

`

);

});

}

catch(error){

console.error(

"Transaction history failed:",

error

);

if(historyList){

historyList.innerHTML=`

<div class="history-loading">

Unable to load transaction history.

</div>

`;

}

showModalMessage(

error.message||

"Unable to load transaction history.",

"error"

);

}

finally{

setButtonLoading(

historyButton,

false

);

}

}

);

/*==================================
        CREATE USER
==================================*/

document

.getElementById(

"createUserBtn"

)

?.addEventListener(

"click",

()=>{

window.location.href=

"admin-create-user.html";

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

modal?.classList.contains(

"active"

)

){

closeModal();

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
        ADMIN VALIDATION
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

await loadUsers();

/*==================================
        END
==================================*/

});