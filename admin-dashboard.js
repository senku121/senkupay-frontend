/*==================================================
                SENKU PAY
              ADMIN DASHBOARD
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkustakes-api.onrender.com";

const DASHBOARD_ENDPOINT=
`${API_BASE_URL}/api/admin/dashboard`;

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

function getStoredAdmin(){

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

function redirectToAdminLogin(){

clearAdminSession();

window.location.replace(

"admin-login.html"

);

}

const token=getAdminToken();

if(!token){

redirectToAdminLogin();

return;

}

/*==================================
        ELEMENTS
==================================*/

const sidebar=
document.getElementById("adminSidebar");

const sidebarOverlay=
document.getElementById("adminSidebarOverlay");

const mobileMenuButton=
document.getElementById("adminMobileMenuButton");

const logoutButton=
document.getElementById("adminLogoutButton");

const messageBox=
document.getElementById("adminDashboardMessage");

const totalUsers=
document.getElementById("totalUsers");

const totalBalance=
document.getElementById("totalBalance");

const adminBalance=
document.getElementById("adminBalance");

const todayDeposits=
document.getElementById("todayDeposits");

const totalAgents=
document.getElementById("totalAgents");

const pendingWithdraw=
document.getElementById("pendingWithdraw");

const usersTable=
document.getElementById("usersTable");

const userSearch=
document.getElementById("dashboardUserSearch");

const refreshButton=
document.getElementById("refreshDashboardButton");

const addUserButton=
document.getElementById("addUserButton");

const backendConnectionStatus=
document.getElementById("backendConnectionStatus");

const adminSessionStatus=
document.getElementById("adminSessionStatus");

const lastDashboardSync=
document.getElementById("lastDashboardSync");

const adminProfileIcon=
document.getElementById("adminProfileIcon");

const adminProfileName=
document.getElementById("adminProfileName");

const adminProfileRole=
document.getElementById("adminProfileRole");

/*==================================
        MODAL ELEMENTS
==================================*/

const userModal=
document.getElementById("userModal");

const closeUserModal=
document.getElementById("closeUserModal");

const modalUsername=
document.getElementById("modalUsername");

const modalEmail=
document.getElementById("modalEmail");

const modalBalance=
document.getElementById("modalBalance");

const modalStatus=
document.getElementById("modalStatus");

const modalUserId=
document.getElementById("modalUserId");

const modalJoined=
document.getElementById("modalJoined");

const modalUserIcon=
document.getElementById("modalUserIcon");

const modalMessage=
document.getElementById("modalMessage");

const openAddBalanceForm=
document.getElementById("openAddBalanceForm");

const openDeductBalanceForm=
document.getElementById("openDeductBalanceForm");

const freezeUserButton=
document.getElementById("freezeUserButton");

const blockUserButton=
document.getElementById("blockUserButton");

const openResetPasswordForm=
document.getElementById("openResetPasswordForm");

const balanceActionForm=
document.getElementById("balanceActionForm");

const balanceActionTitle=
document.getElementById("balanceActionTitle");

const balanceActionAmount=
document.getElementById("balanceActionAmount");

const closeBalanceActionForm=
document.getElementById("closeBalanceActionForm");

const cancelBalanceAction=
document.getElementById("cancelBalanceAction");

const submitBalanceAction=
document.getElementById("submitBalanceAction");

const passwordResetForm=
document.getElementById("passwordResetForm");

const newUserPassword=
document.getElementById("newUserPassword");

const closePasswordResetForm=
document.getElementById("closePasswordResetForm");

const cancelPasswordReset=
document.getElementById("cancelPasswordReset");

const submitPasswordReset=
document.getElementById("submitPasswordReset");

let dashboardUsers=[];

let selectedUser=null;

let balanceActionType="add";

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

`admin-dashboard-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

if(!messageBox){

return;

}

messageBox.hidden=true;

messageBox.className=

"admin-dashboard-message";

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

`modal-message show ${type}`;

modalMessage.textContent=text;

}

function hideModalMessage(){

if(!modalMessage){

return;

}

modalMessage.hidden=true;

modalMessage.className=

"modal-message";

modalMessage.textContent="";

}

/*==================================
        FORMATTERS
==================================*/

function formatMoney(value){

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

const date=new Date(value);

if(

Number.isNaN(

date.getTime()

)

){

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

redirectToAdminLogin();

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
        ADMIN PROFILE
==================================*/

function populateAdminProfile(){

const admin=

getStoredAdmin()||

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

if(adminProfileName){

adminProfileName.textContent=

name;

}

if(adminProfileRole){

adminProfileRole.textContent=

role;

}

if(adminProfileIcon){

adminProfileIcon.textContent=

String(name)

.trim()

.charAt(0)

.toUpperCase()||

"A";

}

if(adminSessionStatus){

adminSessionStatus.textContent=

`${role} session verified.`;

}

}

/*==================================
        NORMALIZE DASHBOARD DATA
==================================*/

function normalizeDashboardData(data){

const source=

data.dashboard||

data.stats||

data.data||

data||

{};

return{

totalUsers:

source.totalUsers??

source.usersCount??

source.userCount??

0,

totalBalance:

source.totalBalance??

source.usersBalance??

source.userBalance??

0,

adminBalance:

source.adminBalance??

source.platformBalance??

source.availableBalance??

0,

todayDeposits:

source.todayDeposits??

source.depositsToday??

source.dailyDeposits??

0,

totalAgents:

source.totalAgents??

source.agentsCount??

source.agentCount??

0,

pendingWithdraw:

source.pendingWithdraw??

source.pendingWithdrawals??

source.pendingWithdrawalAmount??

0

};

}

/*==================================
        LOAD DASHBOARD
==================================*/

async function loadDashboard(){

try{

const response=

await api(

DASHBOARD_ENDPOINT

);

const stats=

normalizeDashboardData(

response

);

if(totalUsers){

totalUsers.textContent=

String(

Number(stats.totalUsers||0)

);

}

if(totalBalance){

totalBalance.textContent=

formatMoney(

stats.totalBalance

);

}

if(adminBalance){

adminBalance.textContent=

formatMoney(

stats.adminBalance

);

}

if(todayDeposits){

todayDeposits.textContent=

formatMoney(

stats.todayDeposits

);

}

if(totalAgents){

totalAgents.textContent=

String(

Number(stats.totalAgents||0)

);

}

if(pendingWithdraw){

pendingWithdraw.textContent=

formatMoney(

stats.pendingWithdraw

);

}

if(backendConnectionStatus){

backendConnectionStatus.textContent=

"Connected to the Senku Pay backend.";

}

if(lastDashboardSync){

lastDashboardSync.textContent=

new Date()

.toLocaleString();

}

return response;

}

catch(error){

console.error(

"Dashboard load failed:",

error

);

if(backendConnectionStatus){

backendConnectionStatus.textContent=

"Backend connection failed.";

}

showMessage(

error.message||

"Unable to load dashboard statistics.",

"error"

);

return null;

}

}

/*==================================
        NORMALIZE USERS
==================================*/

function normalizeUsersResponse(response){

const users=

Array.isArray(response)

? response

: response.users||

response.data||

response.results||

[];

return Array.isArray(users)

? users

: [];

}

/*==================================
        USER STATUS CLASS
==================================*/

function getStatusClass(status){

const normalized=

String(

status||

"ACTIVE"

).toLowerCase();

if(

normalized==="active"||

normalized==="verified"

){

return "active-status";

}

if(

normalized==="frozen"

){

return "frozen-status";

}

if(

normalized==="blocked"

){

return "blocked-status";

}

if(

normalized==="disabled"

){

return "disabled-status";

}

if(

normalized==="suspended"

){

return "suspended-status";

}

return "pending-status";

}

/*==================================
        RENDER USERS
==================================*/

function renderUsers(users){

if(!usersTable){

return;

}

if(users.length===0){

usersTable.innerHTML=`

<tr class="loading-row">

<td colspan="6">

<i class="fa-solid fa-users-slash"></i>

No users found.

</td>

</tr>

`;

return;

}

usersTable.innerHTML="";

users

.slice(0,10)

.forEach(user=>{

const id=

user.id||

user.userId||

"";

const usernameValue=

user.username||

user.fullName||

user.name||

"User";

const emailValue=

user.email||

"No email";

const statusValue=

String(

user.status||

"ACTIVE"

);

usersTable.insertAdjacentHTML(

"beforeend",

`

<tr>

<td>

${escapeHtml(usernameValue)}

</td>

<td>

${escapeHtml(emailValue)}

</td>

<td>

${formatMoney(user.balance)}

</td>

<td>

<span class="status ${getStatusClass(statusValue)}">

${escapeHtml(statusValue)}

</span>

</td>

<td>

${formatDate(

user.createdAt||

user.registeredAt

)}

</td>

<td>

<button
type="button"
class="manage-btn"
data-id="${escapeHtml(id)}">

Manage

</button>

</td>

</tr>

`

);

});

}

/*==================================
        LOAD USERS
==================================*/

async function loadUsers(){

if(!usersTable){

return [];

}

try{

const response=

await api(

USERS_ENDPOINT

);

dashboardUsers=

normalizeUsersResponse(

response

);

renderUsers(

dashboardUsers

);

return dashboardUsers;

}

catch(error){

console.error(

"Users load failed:",

error

);

usersTable.innerHTML=`

<tr class="loading-row">

<td colspan="6">

Unable to load users.

</td>

</tr>

`;

showMessage(

error.message||

"Unable to load users.",

"error"

);

return [];

}

}
/*==================================
        USER SEARCH
==================================*/

function applyUserSearch(){

const keyword=

String(

userSearch?.value||

""

)

.trim()

.toLowerCase();

if(!keyword){

renderUsers(

dashboardUsers

);

return;

}

const filtered=

dashboardUsers.filter(user=>{

const searchable=[

user.username,

user.fullName,

user.name,

user.email,

user.status,

user.id,

user.userId

]

.map(value=>

String(value??"")

.toLowerCase()

)

.join(" ");

return searchable.includes(

keyword

);

});

renderUsers(

filtered

);

}

userSearch?.addEventListener(

"input",

applyUserSearch

);

/*==================================
        MODAL HELPERS
==================================*/

function closeAllModalForms(){

if(balanceActionForm){

balanceActionForm.hidden=true;

}

if(passwordResetForm){

passwordResetForm.hidden=true;

}

if(balanceActionAmount){

balanceActionAmount.value="";

}

if(newUserPassword){

newUserPassword.value="";

}

hideModalMessage();

}

function openUserModal(user){

if(

!userModal||

!user

){

return;

}

selectedUser=user;

const usernameValue=

user.username||

user.fullName||

user.name||

"User";

const statusValue=

String(

user.status||

"ACTIVE"

).toUpperCase();

if(modalUsername){

modalUsername.textContent=

usernameValue;

}

if(modalEmail){

modalEmail.textContent=

user.email||

"No email address";

}

if(modalBalance){

modalBalance.textContent=

formatMoney(

user.balance

);

}

if(modalStatus){

modalStatus.textContent=

statusValue;

}

if(modalUserId){

modalUserId.textContent=

user.id||

user.userId||

"--";

}

if(modalJoined){

modalJoined.textContent=

formatDate(

user.createdAt||

user.registeredAt

);

}

if(modalUserIcon){

modalUserIcon.textContent=

String(usernameValue)

.trim()

.charAt(0)

.toUpperCase()||

"U";

}

/*==================================
        STATUS BUTTON LABELS
==================================*/

if(freezeUserButton){

freezeUserButton.innerHTML=

statusValue==="FROZEN"

? `

<i class="fa-solid fa-fire"></i>

<span>Unfreeze User</span>

`

: `

<i class="fa-solid fa-snowflake"></i>

<span>Freeze User</span>

`;

}

if(blockUserButton){

blockUserButton.innerHTML=

statusValue==="BLOCKED"

? `

<i class="fa-solid fa-unlock"></i>

<span>Unblock User</span>

`

: `

<i class="fa-solid fa-ban"></i>

<span>Block User</span>

`;

}

closeAllModalForms();

userModal.classList.add(

"active"

);

userModal.setAttribute(

"aria-hidden",

"false"

);

document.body.style.overflow=

"hidden";

}

function closeUserManagementModal(){

if(!userModal){

return;

}

userModal.classList.remove(

"active"

);

userModal.setAttribute(

"aria-hidden",

"true"

);

document.body.style.overflow="";

selectedUser=null;

closeAllModalForms();

}

/*==================================
        OPEN USER MODAL
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

dashboardUsers.find(item=>

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

openUserModal(

user

);

}

);

closeUserModal?.addEventListener(

"click",

closeUserManagementModal

);

userModal?.addEventListener(

"click",

event=>{

if(

event.target===userModal

){

closeUserManagementModal();

}

}

);

/*==================================
        BALANCE FORM
==================================*/

function openBalanceForm(type){

if(!selectedUser){

return;

}

balanceActionType=type;

if(balanceActionTitle){

balanceActionTitle.textContent=

type==="add"

? "Add User Balance"

: "Deduct User Balance";

}

if(submitBalanceAction){

submitBalanceAction.textContent=

type==="add"

? "Add Balance"

: "Deduct Balance";

}

if(balanceActionForm){

balanceActionForm.hidden=false;

}

if(passwordResetForm){

passwordResetForm.hidden=true;

}

hideModalMessage();

setTimeout(()=>{

balanceActionAmount?.focus();

},50);

}

openAddBalanceForm?.addEventListener(

"click",

()=>{

openBalanceForm(

"add"

);

}

);

openDeductBalanceForm?.addEventListener(

"click",

()=>{

openBalanceForm(

"deduct"

);

}

);

function closeBalanceForm(){

if(balanceActionForm){

balanceActionForm.hidden=true;

}

if(balanceActionAmount){

balanceActionAmount.value="";

}

hideModalMessage();

}

closeBalanceActionForm?.addEventListener(

"click",

closeBalanceForm

);

cancelBalanceAction?.addEventListener(

"click",

closeBalanceForm

);

/*==================================
        PASSWORD FORM
==================================*/

function openPasswordForm(){

if(!selectedUser){

return;

}

if(passwordResetForm){

passwordResetForm.hidden=false;

}

if(balanceActionForm){

balanceActionForm.hidden=true;

}

hideModalMessage();

setTimeout(()=>{

newUserPassword?.focus();

},50);

}

openResetPasswordForm?.addEventListener(

"click",

openPasswordForm

);

function closePasswordForm(){

if(passwordResetForm){

passwordResetForm.hidden=true;

}

if(newUserPassword){

newUserPassword.value="";

}

hideModalMessage();

}

closePasswordResetForm?.addEventListener(

"click",

closePasswordForm

);

cancelPasswordReset?.addEventListener(

"click",

closePasswordForm

);

/*==================================
        MODAL BUTTON STATE
==================================*/

function setModalButtonLoading(

button,

loading,

loadingText="Processing..."

){

if(!button){

return;

}

button.disabled=loading;

if(loading){

button.dataset.originalHtml=

button.innerHTML;

button.innerHTML=`

<i class="fa-solid fa-spinner fa-spin"></i>

<span>${loadingText}</span>

`;

}

else if(

button.dataset.originalHtml

){

button.innerHTML=

button.dataset.originalHtml;

delete button.dataset.originalHtml;

}

}
/*==================================
        SUBMIT BALANCE ACTION
==================================*/

submitBalanceAction?.addEventListener(

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

balanceActionAmount?.value

);

if(

!Number.isFinite(amount)||

amount<=0

){

showModalMessage(

"Enter a valid balance amount.",

"error"

);

balanceActionAmount?.focus();

return;

}

const userId=

selectedUser.id||

selectedUser.userId;

const endpoint=

balanceActionType==="add"

? `${USERS_ENDPOINT}/${userId}/add-balance`

: `${USERS_ENDPOINT}/${userId}/deduct-balance`;

setModalButtonLoading(

submitBalanceAction,

true,

balanceActionType==="add"

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

balanceActionType==="add"

? "Balance added successfully."

: "Balance deducted successfully."

),

"success"

);

await Promise.all([

loadUsers(),

loadDashboard()

]);

const updatedUser=

dashboardUsers.find(user=>

String(

user.id||

user.userId

)===String(userId)

);

if(updatedUser){

selectedUser=updatedUser;

if(modalBalance){

modalBalance.textContent=

formatMoney(

updatedUser.balance

);

}

}

balanceActionAmount.value="";

setTimeout(()=>{

closeBalanceForm();

},900);

}

catch(error){

console.error(

"Balance update failed:",

error

);

showModalMessage(

error.message||

"Unable to update the user balance.",

"error"

);

}

finally{

setModalButtonLoading(

submitBalanceAction,

false

);

}

}

);

/*==================================
        UPDATE USER STATUS
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

const userId=

selectedUser.id||

selectedUser.userId;

setModalButtonLoading(

button,

true,

"Updating..."

);

hideModalMessage();

try{

const response=

await api(

`${USERS_ENDPOINT}/${userId}/status`,

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

await Promise.all([

loadUsers(),

loadDashboard()

]);

const updatedUser=

dashboardUsers.find(user=>

String(

user.id||

user.userId

)===String(userId)

);

if(updatedUser){

openUserModal(

updatedUser

);

showModalMessage(

response.message||

"User status updated successfully.",

"success"

);

}

}

catch(error){

console.error(

"Status update failed:",

error

);

showModalMessage(

error.message||

"Unable to update the user status.",

"error"

);

}

finally{

setModalButtonLoading(

button,

false

);

}

}

/*==================================
        FREEZE USER
==================================*/

freezeUserButton?.addEventListener(

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

freezeUserButton

);

}

);

/*==================================
        BLOCK USER
==================================*/

blockUserButton?.addEventListener(

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

blockUserButton

);

}

);

/*==================================
        RESET PASSWORD
==================================*/

submitPasswordReset?.addEventListener(

"click",

async()=>{

if(!selectedUser){

showModalMessage(

"No user is selected.",

"error"

);

return;

}

const password=

newUserPassword?.value||

"";

if(password.length<6){

showModalMessage(

"New password must contain at least 6 characters.",

"error"

);

newUserPassword?.focus();

return;

}

const userId=

selectedUser.id||

selectedUser.userId;

setModalButtonLoading(

submitPasswordReset,

true,

"Resetting..."

);

hideModalMessage();

try{

const response=

await api(

`${USERS_ENDPOINT}/${userId}/reset-password`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

password

})

}

);

showModalMessage(

response.message||

"User password reset successfully.",

"success"

);

newUserPassword.value="";

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

setModalButtonLoading(

submitPasswordReset,

false

);

}

}

);
/*==================================
        REFRESH DASHBOARD
==================================*/

async function refreshDashboard(){

if(refreshButton){

refreshButton.disabled=true;

refreshButton.classList.add(

"loading"

);

}

hideMessage();

try{

await Promise.all([

loadDashboard(),

loadUsers()

]);

showMessage(

"Dashboard synchronized successfully.",

"success"

);

setTimeout(()=>{

hideMessage();

},2200);

}

catch(error){

console.error(

"Dashboard refresh failed:",

error

);

showMessage(

error.message||

"Unable to refresh the dashboard.",

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

refreshDashboard

);

/*==================================
        MANAGE ALL USERS
==================================*/

addUserButton?.addEventListener(

"click",

()=>{

window.location.href=

"admin-users.html";

}

);

/*==================================
        MOBILE SIDEBAR
==================================*/

function openSidebar(){

if(

!sidebar||

!sidebarOverlay

){

return;

}

sidebar.classList.add(

"mobile-open"

);

sidebarOverlay.classList.add(

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

if(

!sidebar||

!sidebarOverlay

){

return;

}

sidebar.classList.remove(

"mobile-open"

);

sidebarOverlay.classList.remove(

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

if(

window.innerWidth<=760

){

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

clearAdminSession();

window.location.href=

"admin-login.html";

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

if(event.key==="Escape"){

if(

userModal?.classList.contains(

"active"

)

){

closeUserManagementModal();

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

}

);

/*==================================
        RESIZE HANDLING
==================================*/

window.addEventListener(

"resize",

()=>{

if(

window.innerWidth>760

){

closeSidebar();

}

}

);

/*==================================
        AUTO SYNC TIME
==================================*/

setInterval(()=>{

if(lastDashboardSync){

lastDashboardSync.textContent=

new Date().toLocaleString();

}

},60000);

/*==================================
        INITIALIZE
==================================*/

populateAdminProfile();

const [

dashboardResult

]=await Promise.all([

loadDashboard(),

loadUsers()

]);

if(dashboardResult){

hideMessage();

}

/*==================================
        END
==================================*/

});