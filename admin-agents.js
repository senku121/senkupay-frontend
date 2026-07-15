/*==================================================
                SENKU PAY
               ADMIN AGENTS
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkupay-api.onrender.com";

const AGENTS_ENDPOINT=
`${API_BASE_URL}/api/admin/agents`;

const CREATE_AGENT_ENDPOINT=
`${AGENTS_ENDPOINT}/create`;

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

const agentTable=
document.getElementById("agentTable");

const subAgentTable=
document.getElementById("subAgentTable");

const totalAgents=
document.getElementById("totalAgents");

const activeAgents=
document.getElementById("activeAgents");

const disabledAgents=
document.getElementById("disabledAgents");

const agentRoleCount=
document.getElementById("agentRoleCount");

const agentSearch=
document.getElementById("agentSearch");

const agentRoleFilter=
document.getElementById("agentRoleFilter");

const agentStatusFilter=
document.getElementById("agentStatusFilter");

const refreshAgentsButton=
document.getElementById("refreshAgentsButton");

const agentEmptyState=
document.getElementById("agentEmptyState");

const agentResultsText=
document.getElementById("agentResultsText");

const previousAgentPage=
document.getElementById("previousAgentPage");

const nextAgentPage=
document.getElementById("nextAgentPage");

const agentPageText=
document.getElementById("agentPageText");

const agentsLastSync=
document.getElementById("agentsLastSync");

const agentsBackendStatus=
document.getElementById("agentsBackendStatus");

const subAgentSearch=
document.getElementById("subAgentSearch");

const subAgentStatusFilter=
document.getElementById("subAgentStatusFilter");

const subAgentEmptyState=
document.getElementById("subAgentEmptyState");

const subAgentsLastSync=
document.getElementById("subAgentsLastSync");

const messageBox=
document.getElementById("adminAgentsMessage");

const createAgentButton=
document.getElementById("createAgentButton");

const logoutButton=
document.getElementById("adminLogoutButton");

const sidebar=
document.getElementById("adminSidebar");

const sidebarOverlay=
document.getElementById("adminSidebarOverlay");

const mobileMenuButton=
document.getElementById("adminMobileMenuButton");

/*==================================
        CREATE AGENT MODAL
==================================*/

const createAgentModal=
document.getElementById("createAgentModal");

const closeAgentModal=
document.getElementById("closeAgentModal");

const cancelAgent=
document.getElementById("cancelAgent");

const createAgentForm=
document.getElementById("createAgentForm");

const submitCreateAgent=
document.getElementById("submitCreateAgent");

const agentName=
document.getElementById("agentName");

const agentUsername=
document.getElementById("agentUsername");

const agentPassword=
document.getElementById("agentPassword");

const agentRole=
document.getElementById("agentRole");

const agentEmail=
document.getElementById("agentEmail");

const agentNote=
document.getElementById("agentNote");

const agentNameError=
document.getElementById("agentNameError");

const agentUsernameError=
document.getElementById("agentUsernameError");

const agentPasswordError=
document.getElementById("agentPasswordError");

const agentEmailError=
document.getElementById("agentEmailError");

const createAgentMessage=
document.getElementById("createAgentMessage");

const toggleAgentPassword=
document.getElementById("toggleAgentPassword");

/*==================================
        MANAGE AGENT MODAL
==================================*/

const manageAgentModal=
document.getElementById("manageAgentModal");

const closeManageModal=
document.getElementById("closeManageModal");

const closeManageButton=
document.getElementById("closeManageButton");

const manageAgentAvatar=
document.getElementById("manageAgentAvatar");

const manageAgentTitle=
document.getElementById("manageAgentTitle");

const manageAgentSubtitle=
document.getElementById("manageAgentSubtitle");

const manageAgentName=
document.getElementById("manageAgentName");

const manageAgentUsername=
document.getElementById("manageAgentUsername");

const manageAgentEmail=
document.getElementById("manageAgentEmail");

const manageAgentRole=
document.getElementById("manageAgentRole");

const manageAgentStatus=
document.getElementById("manageAgentStatus");

const manageAgentCreated=
document.getElementById("manageAgentCreated");

const manageAgentMessage=
document.getElementById("manageAgentMessage");

const toggleAgentStatus=
document.getElementById("toggleAgentStatus");

const openResetAgentPassword=
document.getElementById("openResetAgentPassword");

const openChangeAgentRole=
document.getElementById("openChangeAgentRole");

const viewAgentSubAgents=
document.getElementById("viewAgentSubAgents");

/*==================================
        INLINE PANELS
==================================*/

const resetAgentPasswordPanel=
document.getElementById("resetAgentPasswordPanel");

const closeResetAgentPasswordPanel=
document.getElementById("closeResetAgentPasswordPanel");

const cancelResetAgentPassword=
document.getElementById("cancelResetAgentPassword");

const newAgentPassword=
document.getElementById("newAgentPassword");

const newAgentPasswordError=
document.getElementById("newAgentPasswordError");

const submitResetAgentPassword=
document.getElementById("submitResetAgentPassword");

const toggleNewAgentPassword=
document.getElementById("toggleNewAgentPassword");

const changeAgentRolePanel=
document.getElementById("changeAgentRolePanel");

const closeChangeAgentRolePanel=
document.getElementById("closeChangeAgentRolePanel");

const cancelChangeAgentRole=
document.getElementById("cancelChangeAgentRole");

const newAgentRole=
document.getElementById("newAgentRole");

const submitChangeAgentRole=
document.getElementById("submitChangeAgentRole");

/*==================================
        SUB-AGENT MODAL
==================================*/

const subAgentModal=
document.getElementById("subAgentModal");

const closeSubAgentModal=
document.getElementById("closeSubAgentModal");

const closeSubAgentDetails=
document.getElementById("closeSubAgentDetails");

const subAgentModalTitle=
document.getElementById("subAgentModalTitle");

const subAgentModalSubtitle=
document.getElementById("subAgentModalSubtitle");

const subAgentDetailName=
document.getElementById("subAgentDetailName");

const subAgentDetailUsername=
document.getElementById("subAgentDetailUsername");

const subAgentDetailParent=
document.getElementById("subAgentDetailParent");

const subAgentDetailBalance=
document.getElementById("subAgentDetailBalance");

const subAgentDetailStatus=
document.getElementById("subAgentDetailStatus");

const subAgentDetailCreated=
document.getElementById("subAgentDetailCreated");

const subAgentModalMessage=
document.getElementById("subAgentModalMessage");

const toggleSubAgentStatus=
document.getElementById("toggleSubAgentStatus");

const resetSubAgentPassword=
document.getElementById("resetSubAgentPassword");

/*==================================
        STATE
==================================*/

let agents=[];

let filteredAgents=[];

let subAgents=[];

let filteredSubAgents=[];

let selectedAgent=null;

let selectedSubAgent=null;

let currentPage=1;

const pageSize=10;

/*==================================
        PAGE MESSAGES
==================================*/

function showMessage(text,type="info"){

if(!messageBox){

return;

}

messageBox.hidden=false;

messageBox.className=

`admin-agents-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

if(!messageBox){

return;

}

messageBox.hidden=true;

messageBox.className=

"admin-agents-message";

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

`agent-modal-message show ${type}`;

element.textContent=text;

}

function hideModalMessage(element){

if(!element){

return;

}

element.hidden=true;

element.className=

"agent-modal-message";

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

"Agent-management request failed."

);

}

return data;

}

/*==================================
        NORMALIZE AGENTS
==================================*/

function normalizeAgents(response){

const source=

response.data||

response;

const list=

Array.isArray(source)

? source

: source.agents||

source.results||

[];

return Array.isArray(list)

? list

: [];

}

function normalizeSubAgents(response){

const source=

response.data||

response;

const list=

Array.isArray(source)

? source

: source.subAgents||

source.subagents||

source.results||

[];

return Array.isArray(list)

? list

: [];

}

/*==================================
        AGENT VALUES
==================================*/

function agentId(agent){

return(

agent.id||

agent.agentId||

""

);

}

function agentNameValue(agent){

return(

agent.name||

agent.fullName||

agent.username||

"Agent"

);

}

function agentUsernameValue(agent){

return(

agent.username||

agent.login||

"Not specified"

);

}

function agentEmailValue(agent){

return(

agent.email||

"No email"

);

}

function agentRoleValue(agent){

return String(

agent.role||

"AGENT"

).toUpperCase();

}

function agentStatusValue(agent){

return normalizeText(

agent.status||

"active"

);

}

function roleLabel(value){

return String(

value||

"AGENT"

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
        UPDATE STATISTICS
==================================*/

function updateAgentStats(){

const active=

agents.filter(agent=>

agentStatusValue(agent)==="active"

).length;

const disabled=

agents.filter(agent=>{

const status=

agentStatusValue(agent);

return[

"disabled",

"blocked",

"suspended",

"inactive"

].includes(status);

}).length;

const roles=

new Set(

agents.map(agent=>

agentRoleValue(agent)

)

);

if(totalAgents){

totalAgents.textContent=

String(agents.length);

}

if(activeAgents){

activeAgents.textContent=

String(active);

}

if(disabledAgents){

disabledAgents.textContent=

String(disabled);

}

if(agentRoleCount){

agentRoleCount.textContent=

String(roles.size);

}

}

/*==================================
        AGENT FILTERS
==================================*/

function applyAgentFilters(){

const keyword=

normalizeText(

agentSearch?.value

);

const selectedRole=

normalizeText(

agentRoleFilter?.value||

"all"

);

const selectedStatus=

normalizeText(

agentStatusFilter?.value||

"all"

);

filteredAgents=

agents.filter(agent=>{

const role=

normalizeText(

agentRoleValue(agent)

);

const status=

agentStatusValue(agent);

const searchable=[

agentId(agent),

agentNameValue(agent),

agentUsernameValue(agent),

agentEmailValue(agent),

role,

status

]

.map(normalizeText)

.join(" ");

const keywordMatch=

!keyword||

searchable.includes(keyword);

const roleMatch=

selectedRole==="all"||

role===selectedRole;

const statusMatch=

selectedStatus==="all"||

status===selectedStatus;

return(

keywordMatch&&

roleMatch&&

statusMatch

);

});

currentPage=1;

renderAgents();

}

/*==================================
        PAGINATION
==================================*/

function agentTotalPages(){

return Math.max(

1,

Math.ceil(

filteredAgents.length/

pageSize

)

);

}

previousAgentPage?.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderAgents();

}

}

);

nextAgentPage?.addEventListener(

"click",

()=>{

if(

currentPage<

agentTotalPages()

){

currentPage++;

renderAgents();

}

}

);

/*==================================
        RENDER AGENTS
==================================*/

function renderAgents(){

if(!agentTable){

return;

}

const pages=

agentTotalPages();

if(currentPage>pages){

currentPage=pages;

}

const start=

(currentPage-1)*

pageSize;

const pageAgents=

filteredAgents.slice(

start,

start+pageSize

);

if(pageAgents.length===0){

agentTable.innerHTML="";

if(agentEmptyState){

agentEmptyState.hidden=false;

}

}

else{

if(agentEmptyState){

agentEmptyState.hidden=true;

}

agentTable.innerHTML="";

pageAgents.forEach(agent=>{

const id=

agentId(agent);

const name=

agentNameValue(agent);

const username=

agentUsernameValue(agent);

const email=

agentEmailValue(agent);

const role=

agentRoleValue(agent);

const status=

agentStatusValue(agent);

const createdAt=

agent.createdAt||

agent.registeredAt||

agent.date;

agentTable.insertAdjacentHTML(

"beforeend",

`

<tr>

<td>

${escapeHTML(id||"--")}

</td>

<td>

<div class="agent-identity">

<div class="agent-avatar-small">

${escapeHTML(

String(name)

.charAt(0)

.toUpperCase()||

"A"

)}

</div>

<div>

<strong>

${escapeHTML(name)}

</strong>

<span>

${escapeHTML(email)}

</span>

</div>

</div>

</td>

<td>

${escapeHTML(username)}

</td>

<td>

<span class="agent-role-badge">

${escapeHTML(

roleLabel(role)

)}

</span>

</td>

<td>

<span class="agent-status ${escapeHTML(status)}">

${escapeHTML(

agent.status||

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
class="manage-agent"
data-id="${escapeHTML(id)}">

Manage

</button>

</td>

</tr>

`

);

});

}

if(agentResultsText){

const end=

Math.min(

start+

pageAgents.length,

filteredAgents.length

);

agentResultsText.textContent=

filteredAgents.length===0

? "Showing 0 agents"

: `Showing ${start+1}-${end} of ${filteredAgents.length} agents`;

}

if(agentPageText){

agentPageText.textContent=

`Page ${currentPage} of ${pages}`;

}

if(previousAgentPage){

previousAgentPage.disabled=

currentPage<=1;

}

if(nextAgentPage){

nextAgentPage.disabled=

currentPage>=pages;

}

}

/*==================================
        LOAD AGENTS
==================================*/

async function loadAgents(){

hideMessage();

if(agentTable){

agentTable.innerHTML=`

<tr class="loading-row">

<td colspan="7">

<i class="fa-solid fa-spinner fa-spin"></i>

Loading agents...

</td>

</tr>

`;

}

if(agentEmptyState){

agentEmptyState.hidden=true;

}

try{

const response=

await api(

AGENTS_ENDPOINT

);

agents=

normalizeAgents(

response

);

const nestedSubAgents=

response.subAgents||

response.subagents||

response.data?.subAgents||

response.data?.subagents;

subAgents=

Array.isArray(nestedSubAgents)

? nestedSubAgents

: agents.flatMap(agent=>

Array.isArray(agent.subAgents)

? agent.subAgents.map(subAgent=>({

...subAgent,

parentAgent:

subAgent.parentAgent||

agent.name||

agent.username,

parentAgentId:

subAgent.parentAgentId||

agent.id

}))

: []

);

filteredAgents=[

...agents

];

filteredSubAgents=[

...subAgents

];

updateAgentStats();

renderAgents();

renderSubAgents();

if(agentsLastSync){

agentsLastSync.textContent=

`Last synchronized ${new Date().toLocaleString()}`;

}

if(subAgentsLastSync){

subAgentsLastSync.textContent=

`${subAgents.length} linked sub-agent account${subAgents.length===1?"":"s"}`;

}

if(agentsBackendStatus){

agentsBackendStatus.textContent=

"Connected to the Senku Pay agent server.";

}

return agents;

}

catch(error){

console.error(

"Agent load failed:",

error

);

if(agentTable){

agentTable.innerHTML=`

<tr class="loading-row">

<td colspan="7">

Unable to load agents.

</td>

</tr>

`;

}

if(subAgentTable){

subAgentTable.innerHTML=`

<tr class="loading-row">

<td colspan="7">

Unable to load sub-agents.

</td>

</tr>

`;

}

if(agentsBackendStatus){

agentsBackendStatus.textContent=

"Unable to connect to the agent server.";

}

showMessage(

error.message||

"Unable to load agent accounts.",

"error"

);

return[];

}

}

/*==================================
        FILTER EVENTS
==================================*/

agentSearch?.addEventListener(

"input",

applyAgentFilters

);

agentRoleFilter?.addEventListener(

"change",

applyAgentFilters

);

agentStatusFilter?.addEventListener(

"change",

applyAgentFilters

);
/*==================================
        SUB-AGENT VALUES
==================================*/

function subAgentId(subAgent){

return(

subAgent.id||

subAgent.subAgentId||

""

);

}

function subAgentNameValue(subAgent){

return(

subAgent.name||

subAgent.fullName||

subAgent.username||

"Sub Agent"

);

}

function subAgentUsernameValue(subAgent){

return(

subAgent.username||

subAgent.login||

"Not specified"

);

}

function subAgentStatusValue(subAgent){

return normalizeText(

subAgent.status||

"active"

);

}

function subAgentParentValue(subAgent){

return(

subAgent.parentAgent||

subAgent.agentName||

subAgent.parent||

"Not Assigned"

);

}

/*==================================
        SUB-AGENT FILTERS
==================================*/

function applySubAgentFilters(){

const keyword=

normalizeText(

subAgentSearch?.value

);

const status=

normalizeText(

subAgentStatusFilter?.value||

"all"

);

filteredSubAgents=

subAgents.filter(subAgent=>{

const searchable=[

subAgentId(subAgent),

subAgentNameValue(subAgent),

subAgentUsernameValue(subAgent),

subAgentParentValue(subAgent),

subAgentStatusValue(subAgent)

]

.map(normalizeText)

.join(" ");

const keywordMatch=

!keyword||

searchable.includes(keyword);

const statusMatch=

status==="all"||

subAgentStatusValue(subAgent)===status;

return(

keywordMatch&&

statusMatch

);

});

renderSubAgents();

}

subAgentSearch?.addEventListener(

"input",

applySubAgentFilters

);

subAgentStatusFilter?.addEventListener(

"change",

applySubAgentFilters

);

/*==================================
        RENDER SUB-AGENTS
==================================*/

function renderSubAgents(){

if(!subAgentTable){

return;

}

if(filteredSubAgents.length===0){

subAgentTable.innerHTML="";

if(subAgentEmptyState){

subAgentEmptyState.hidden=false;

}

return;

}

if(subAgentEmptyState){

subAgentEmptyState.hidden=true;

}

subAgentTable.innerHTML="";

filteredSubAgents.forEach(subAgent=>{

const id=

subAgentId(subAgent);

const name=

subAgentNameValue(subAgent);

const username=

subAgentUsernameValue(subAgent);

const parent=

subAgentParentValue(subAgent);

const balance=

Number(

subAgent.balance||

subAgent.walletBalance||

0

);

const status=

subAgentStatusValue(subAgent);

const createdAt=

subAgent.createdAt||

subAgent.date;

subAgentTable.insertAdjacentHTML(

"beforeend",

`

<tr>

<td>

${escapeHTML(id)}

</td>

<td>

<div class="agent-identity">

<div class="agent-avatar-small">

${escapeHTML(

String(name)

.charAt(0)

.toUpperCase()

)}

</div>

<div>

<strong>

${escapeHTML(name)}

</strong>

<span>

${escapeHTML(username)}

</span>

</div>

</div>

</td>

<td>

${escapeHTML(parent)}

</td>

<td>

${money(balance)}

</td>

<td>

<span class="agent-status ${escapeHTML(status)}">

${escapeHTML(

subAgent.status||

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
class="manage-sub-agent"
data-id="${escapeHTML(id)}">

Manage

</button>

</td>

</tr>

`

);

});

}

/*==================================
        REFRESH
==================================*/

refreshAgentsButton?.addEventListener(

"click",

async()=>{

refreshAgentsButton.disabled=true;

refreshAgentsButton.classList.add(

"loading"

);

try{

await loadAgents();

showMessage(

"Agent information synchronized successfully.",

"success"

);

setTimeout(

hideMessage,

2200

);

}

catch(error){

console.error(error);

}

finally{

refreshAgentsButton.disabled=false;

refreshAgentsButton.classList.remove(

"loading"

);

}

});

/*==================================
        MODAL HELPERS
==================================*/

function openModal(modal){

if(!modal){

return;

}

modal.classList.add("active");

modal.setAttribute(

"aria-hidden",

"false"

);

document.body.style.overflow="hidden";

}

function closeModal(modal){

if(!modal){

return;

}

modal.classList.remove("active");

modal.setAttribute(

"aria-hidden",

"true"

);

document.body.style.overflow="";

}

/*==================================
        PASSWORD TOGGLES
==================================*/

function togglePassword(

input,

button

){

if(!input){

return;

}

const visible=

input.type==="text";

input.type=

visible

? "password"

: "text";

button?.querySelector("i")?.classList.toggle(

"fa-eye"

);

button?.querySelector("i")?.classList.toggle(

"fa-eye-slash"

);

}

toggleAgentPassword?.addEventListener(

"click",

()=>{

togglePassword(

agentPassword,

toggleAgentPassword

);

}

);

toggleNewAgentPassword?.addEventListener(

"click",

()=>{

togglePassword(

newAgentPassword,

toggleNewAgentPassword

);

}

);

/*==================================
        CREATE MODAL
==================================*/

createAgentButton?.addEventListener(

"click",

()=>{

hideModalMessage(

createAgentMessage

);

createAgentForm?.reset();

openModal(

createAgentModal

);

});

function closeCreateModal(){

closeModal(

createAgentModal

);

}

closeAgentModal?.addEventListener(

"click",

closeCreateModal

);

cancelAgent?.addEventListener(

"click",

closeCreateModal

);

createAgentModal?.addEventListener(

"click",

event=>{

if(event.target===createAgentModal){

closeCreateModal();

}

});
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
        CREATE AGENT VALIDATION
==================================*/

function validateCreateAgent(){

let valid=true;

const name=

agentName?.value.trim()||

"";

const username=

agentUsername?.value.trim()||

"";

const password=

agentPassword?.value||

"";

const email=

agentEmail?.value.trim()||

"";

if(agentNameError){

agentNameError.textContent="";

}

if(agentUsernameError){

agentUsernameError.textContent="";

}

if(agentPasswordError){

agentPasswordError.textContent="";

}

if(agentEmailError){

agentEmailError.textContent="";

}

if(name.length<2){

if(agentNameError){

agentNameError.textContent=

"Enter the agent's full name.";

}

valid=false;

}

if(

username.length<3||

!/^[a-zA-Z0-9._-]+$/.test(username)

){

if(agentUsernameError){

agentUsernameError.textContent=

"Use at least 3 letters, numbers, dots, underscores or hyphens.";

}

valid=false;

}

if(password.length<6){

if(agentPasswordError){

agentPasswordError.textContent=

"Password must contain at least 6 characters.";

}

valid=false;

}

if(

email&&

!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

){

if(agentEmailError){

agentEmailError.textContent=

"Enter a valid email address.";

}

valid=false;

}

return valid;

}

/*==================================
        CREATE AGENT
==================================*/

createAgentForm?.addEventListener(

"submit",

async event=>{

event.preventDefault();

hideModalMessage(

createAgentMessage

);

if(!validateCreateAgent()){

showModalMessage(

createAgentMessage,

"Please correct the highlighted agent details.",

"error"

);

return;

}

const payload={

name:

agentName.value.trim(),

username:

agentUsername.value.trim(),

password:

agentPassword.value,

role:

agentRole?.value||

"AGENT",

email:

agentEmail?.value.trim()||

"",

note:

agentNote?.value.trim()||

""

};

setButtonLoading(

submitCreateAgent,

true,

"Creating..."

);

try{

const response=

await api(

CREATE_AGENT_ENDPOINT,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(payload)

}

);

showModalMessage(

createAgentMessage,

response.message||

"Agent account created successfully.",

"success"

);

await loadAgents();

createAgentForm.reset();

setTimeout(()=>{

closeCreateModal();

showMessage(

response.message||

"Agent account created successfully.",

"success"

);

},900);

}

catch(error){

console.error(

"Create agent failed:",

error

);

showModalMessage(

createAgentMessage,

error.message||

"Unable to create the agent account.",

"error"

);

}

finally{

setButtonLoading(

submitCreateAgent,

false

);

}

}

);

/*==================================
        MANAGE AGENT DETAILS
==================================*/

function populateManageAgent(agent){

if(!agent){

return;

}

const name=

agentNameValue(agent);

const username=

agentUsernameValue(agent);

const email=

agentEmailValue(agent);

const role=

agentRoleValue(agent);

const status=

agentStatusValue(agent);

const createdAt=

agent.createdAt||

agent.registeredAt||

agent.date;

if(manageAgentAvatar){

manageAgentAvatar.textContent=

String(name)

.charAt(0)

.toUpperCase()||

"A";

}

if(manageAgentTitle){

manageAgentTitle.textContent=

name;

}

if(manageAgentSubtitle){

manageAgentSubtitle.textContent=

`Manage access and permissions for ${username}.`;

}

if(manageAgentName){

manageAgentName.textContent=

name;

}

if(manageAgentUsername){

manageAgentUsername.textContent=

username;

}

if(manageAgentEmail){

manageAgentEmail.textContent=

email;

}

if(manageAgentRole){

manageAgentRole.textContent=

roleLabel(role);

}

if(manageAgentStatus){

manageAgentStatus.textContent=

agent.status||

status;

}

if(manageAgentCreated){

manageAgentCreated.textContent=

formatDate(createdAt);

}

if(toggleAgentStatus){

const active=

status==="active";

toggleAgentStatus.innerHTML=

active

? `

<i class="fa-solid fa-user-lock"></i>

<span>Disable Agent</span>

`

: `

<i class="fa-solid fa-user-check"></i>

<span>Enable Agent</span>

`;

}

if(newAgentRole){

newAgentRole.value=role;

}

}

/*==================================
        OPEN MANAGE MODAL
==================================*/

document.addEventListener(

"click",

event=>{

const button=

event.target.closest(

".manage-agent"

);

if(!button){

return;

}

const id=

button.dataset.id;

const agent=

agents.find(item=>

String(

agentId(item)

)===String(id)

);

if(!agent){

showMessage(

"Selected agent could not be found.",

"error"

);

return;

}

selectedAgent=agent;

populateManageAgent(

agent

);

closeManagePanels();

hideModalMessage(

manageAgentMessage

);

openModal(

manageAgentModal

);

}

);

/*==================================
        CLOSE MANAGE PANELS
==================================*/

function closeManagePanels(){

if(resetAgentPasswordPanel){

resetAgentPasswordPanel.hidden=true;

}

if(changeAgentRolePanel){

changeAgentRolePanel.hidden=true;

}

if(newAgentPassword){

newAgentPassword.value="";

}

if(newAgentPasswordError){

newAgentPasswordError.textContent="";

}

}

/*==================================
        CLOSE MANAGE MODAL
==================================*/

function closeManageAgentModal(){

closeManagePanels();

hideModalMessage(

manageAgentMessage

);

closeModal(

manageAgentModal

);

selectedAgent=null;

}

closeManageModal?.addEventListener(

"click",

closeManageAgentModal

);

closeManageButton?.addEventListener(

"click",

closeManageAgentModal

);

manageAgentModal?.addEventListener(

"click",

event=>{

if(event.target===manageAgentModal){

closeManageAgentModal();

}

}

);

/*==================================
        REFRESH SELECTED AGENT
==================================*/

async function refreshSelectedAgent(id){

await loadAgents();

const refreshed=

agents.find(item=>

String(

agentId(item)

)===String(id)

);

if(refreshed){

selectedAgent=refreshed;

populateManageAgent(

refreshed

);

}

return refreshed;

}

/*==================================
        TOGGLE AGENT STATUS
==================================*/

toggleAgentStatus?.addEventListener(

"click",

async()=>{

if(!selectedAgent){

showModalMessage(

manageAgentMessage,

"No agent is selected.",

"error"

);

return;

}

const id=

agentId(

selectedAgent

);

setButtonLoading(

toggleAgentStatus,

true,

"Updating..."

);

hideModalMessage(

manageAgentMessage

);

try{

const response=

await api(

`${AGENTS_ENDPOINT}/${id}/toggle`,

{

method:"POST"

}

);

await refreshSelectedAgent(

id

);

showModalMessage(

manageAgentMessage,

response.message||

"Agent status updated successfully.",

"success"

);

}

catch(error){

console.error(

"Agent status update failed:",

error

);

showModalMessage(

manageAgentMessage,

error.message||

"Unable to update agent status.",

"error"

);

}

finally{

setButtonLoading(

toggleAgentStatus,

false

);

if(selectedAgent){

populateManageAgent(

selectedAgent

);

}

}

}

);

/*==================================
        RESET PASSWORD PANEL
==================================*/

openResetAgentPassword?.addEventListener(

"click",

()=>{

if(!selectedAgent){

return;

}

if(resetAgentPasswordPanel){

resetAgentPasswordPanel.hidden=false;

}

if(changeAgentRolePanel){

changeAgentRolePanel.hidden=true;

}

hideModalMessage(

manageAgentMessage

);

setTimeout(()=>{

newAgentPassword?.focus();

},50);

}

);

function closeResetPasswordPanel(){

if(resetAgentPasswordPanel){

resetAgentPasswordPanel.hidden=true;

}

if(newAgentPassword){

newAgentPassword.value="";

}

if(newAgentPasswordError){

newAgentPasswordError.textContent="";

}

}

closeResetAgentPasswordPanel?.addEventListener(

"click",

closeResetPasswordPanel

);

cancelResetAgentPassword?.addEventListener(

"click",

closeResetPasswordPanel

);

/*==================================
        SUBMIT PASSWORD RESET
==================================*/

submitResetAgentPassword?.addEventListener(

"click",

async()=>{

if(!selectedAgent){

showModalMessage(

manageAgentMessage,

"No agent is selected.",

"error"

);

return;

}

const password=

newAgentPassword?.value||

"";

if(password.length<6){

if(newAgentPasswordError){

newAgentPasswordError.textContent=

"Password must contain at least 6 characters.";

}

newAgentPassword?.focus();

return;

}

const id=

agentId(

selectedAgent

);

setButtonLoading(

submitResetAgentPassword,

true,

"Resetting..."

);

hideModalMessage(

manageAgentMessage

);

try{

const response=

await api(

`${AGENTS_ENDPOINT}/${id}/reset-password`,

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

manageAgentMessage,

response.message||

"Agent password reset successfully.",

"success"

);

closeResetPasswordPanel();

}

catch(error){

console.error(

"Agent password reset failed:",

error

);

showModalMessage(

manageAgentMessage,

error.message||

"Unable to reset the agent password.",

"error"

);

}

finally{

setButtonLoading(

submitResetAgentPassword,

false

);

}

}

);

/*==================================
        CHANGE ROLE PANEL
==================================*/

openChangeAgentRole?.addEventListener(

"click",

()=>{

if(!selectedAgent){

return;

}

if(changeAgentRolePanel){

changeAgentRolePanel.hidden=false;

}

if(resetAgentPasswordPanel){

resetAgentPasswordPanel.hidden=true;

}

if(newAgentRole){

newAgentRole.value=

agentRoleValue(

selectedAgent

);

}

hideModalMessage(

manageAgentMessage

);

}

);

function closeRolePanel(){

if(changeAgentRolePanel){

changeAgentRolePanel.hidden=true;

}

}

closeChangeAgentRolePanel?.addEventListener(

"click",

closeRolePanel

);

cancelChangeAgentRole?.addEventListener(

"click",

closeRolePanel

);

/*==================================
        SUBMIT ROLE CHANGE
==================================*/

submitChangeAgentRole?.addEventListener(

"click",

async()=>{

if(!selectedAgent){

showModalMessage(

manageAgentMessage,

"No agent is selected.",

"error"

);

return;

}

const id=

agentId(

selectedAgent

);

const role=

newAgentRole?.value||

"AGENT";

setButtonLoading(

submitChangeAgentRole,

true,

"Updating..."

);

hideModalMessage(

manageAgentMessage

);

try{

const response=

await api(

`${AGENTS_ENDPOINT}/${id}/role`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

role

})

}

);

await refreshSelectedAgent(

id

);

closeRolePanel();

showModalMessage(

manageAgentMessage,

response.message||

"Agent role updated successfully.",

"success"

);

}

catch(error){

console.error(

"Agent role update failed:",

error

);

showModalMessage(

manageAgentMessage,

error.message||

"Unable to update the agent role.",

"error"

);

}

finally{

setButtonLoading(

submitChangeAgentRole,

false

);

}

}

);
/*==================================
        VIEW AGENT SUB-AGENTS
==================================*/

viewAgentSubAgents?.addEventListener(

"click",

()=>{

if(!selectedAgent){

showModalMessage(

manageAgentMessage,

"No agent is selected.",

"error"

);

return;

}

const id=

agentId(

selectedAgent

);

subAgentSearch.value=

"";

subAgentStatusFilter.value=

"all";

filteredSubAgents=

subAgents.filter(subAgent=>

String(

subAgent.parentAgentId||

subAgent.agentId||

""

)===String(id)

);

renderSubAgents();

closeManageAgentModal();

document

.querySelector(

".sub-agent-card"

)

?.scrollIntoView({

behavior:"smooth",

block:"start"

});

showMessage(

`Showing sub-agents linked to ${agentNameValue(selectedAgent)}.`,

"info"

);

}

);

/*==================================
        OPEN SUB-AGENT MODAL
==================================*/

document.addEventListener(

"click",

event=>{

const button=

event.target.closest(

".manage-sub-agent"

);

if(!button){

return;

}

const id=

button.dataset.id;

const subAgent=

subAgents.find(item=>

String(

subAgentId(item)

)===String(id)

);

if(!subAgent){

showMessage(

"Selected sub-agent could not be found.",

"error"

);

return;

}

selectedSubAgent=

subAgent;

const name=

subAgentNameValue(

subAgent

);

const username=

subAgentUsernameValue(

subAgent

);

const parent=

subAgentParentValue(

subAgent

);

const status=

subAgentStatusValue(

subAgent

);

const createdAt=

subAgent.createdAt||

subAgent.date;

if(subAgentModalTitle){

subAgentModalTitle.textContent=

name;

}

if(subAgentModalSubtitle){

subAgentModalSubtitle.textContent=

`Review the account linked to ${parent}.`;

}

if(subAgentDetailName){

subAgentDetailName.textContent=

name;

}

if(subAgentDetailUsername){

subAgentDetailUsername.textContent=

username;

}

if(subAgentDetailParent){

subAgentDetailParent.textContent=

parent;

}

if(subAgentDetailBalance){

subAgentDetailBalance.textContent=

money(

subAgent.balance||

subAgent.walletBalance

);

}

if(subAgentDetailStatus){

subAgentDetailStatus.textContent=

subAgent.status||

status;

}

if(subAgentDetailCreated){

subAgentDetailCreated.textContent=

formatDate(

createdAt

);

}

if(toggleSubAgentStatus){

toggleSubAgentStatus.innerHTML=

status==="active"

? `

<i class="fa-solid fa-user-lock"></i>

<span>Disable Sub-Agent</span>

`

: `

<i class="fa-solid fa-user-check"></i>

<span>Enable Sub-Agent</span>

`;

}

hideModalMessage(

subAgentModalMessage

);

openModal(

subAgentModal

);

}

);

/*==================================
        CLOSE SUB-AGENT MODAL
==================================*/

function closeSubAgentDetailsModal(){

closeModal(

subAgentModal

);

hideModalMessage(

subAgentModalMessage

);

selectedSubAgent=null;

}

closeSubAgentModal?.addEventListener(

"click",

closeSubAgentDetailsModal

);

closeSubAgentDetails?.addEventListener(

"click",

closeSubAgentDetailsModal

);

subAgentModal?.addEventListener(

"click",

event=>{

if(event.target===subAgentModal){

closeSubAgentDetailsModal();

}

}

);

/*==================================
        TOGGLE SUB-AGENT STATUS
==================================*/

toggleSubAgentStatus?.addEventListener(

"click",

async()=>{

if(!selectedSubAgent){

showModalMessage(

subAgentModalMessage,

"No sub-agent is selected.",

"error"

);

return;

}

const id=

subAgentId(

selectedSubAgent

);

setButtonLoading(

toggleSubAgentStatus,

true,

"Updating..."

);

hideModalMessage(

subAgentModalMessage

);

try{

const response=

await api(

`${AGENTS_ENDPOINT}/sub-agents/${id}/toggle`,

{

method:"POST"

}

);

await loadAgents();

const refreshed=

subAgents.find(item=>

String(

subAgentId(item)

)===String(id)

);

if(refreshed){

selectedSubAgent=

refreshed;

subAgentDetailStatus.textContent=

refreshed.status||

subAgentStatusValue(

refreshed

);

}

showModalMessage(

subAgentModalMessage,

response.message||

"Sub-agent status updated successfully.",

"success"

);

}

catch(error){

console.error(

"Sub-agent status update failed:",

error

);

showModalMessage(

subAgentModalMessage,

error.message||

"Unable to update the sub-agent status.",

"error"

);

}

finally{

setButtonLoading(

toggleSubAgentStatus,

false

);

}

}

);

/*==================================
        RESET SUB-AGENT PASSWORD
==================================*/

resetSubAgentPassword?.addEventListener(

"click",

async()=>{

if(!selectedSubAgent){

showModalMessage(

subAgentModalMessage,

"No sub-agent is selected.",

"error"

);

return;

}

const password=

window.prompt(

"Enter a new password for this sub-agent:"

);

if(password===null){

return;

}

if(password.length<6){

showModalMessage(

subAgentModalMessage,

"Password must contain at least 6 characters.",

"error"

);

return;

}

const id=

subAgentId(

selectedSubAgent

);

setButtonLoading(

resetSubAgentPassword,

true,

"Resetting..."

);

hideModalMessage(

subAgentModalMessage

);

try{

const response=

await api(

`${AGENTS_ENDPOINT}/sub-agents/${id}/reset-password`,

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

subAgentModalMessage,

response.message||

"Sub-agent password reset successfully.",

"success"

);

}

catch(error){

console.error(

"Sub-agent password reset failed:",

error

);

showModalMessage(

subAgentModalMessage,

error.message||

"Unable to reset the sub-agent password.",

"error"

);

}

finally{

setButtonLoading(

resetSubAgentPassword,

false

);

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

createAgentModal?.classList.contains(

"active"

)

){

closeCreateModal();

return;

}

if(

manageAgentModal?.classList.contains(

"active"

)

){

closeManageAgentModal();

return;

}

if(

subAgentModal?.classList.contains(

"active"

)

){

closeSubAgentDetailsModal();

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

role&&

role!=="ADMIN"&&

role!=="SUPER_ADMIN"

){

logoutAdmin();

return;

}

}

/*==================================
        INITIALIZE
==================================*/

await loadAgents();

/*==================================
        END
==================================*/

});