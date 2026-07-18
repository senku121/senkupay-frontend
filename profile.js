/*==================================================
                SENKU PAY
                PROFILE PAGE
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkupay-api.onrender.com";

const PROFILE_ENDPOINT=
`${API_BASE_URL}/api/profile`;

const UPDATE_PROFILE_ENDPOINT=
`${API_BASE_URL}/api/profile/update`;

const KYC_STATUS_ENDPOINT=
`${API_BASE_URL}/api/user/kyc/status`;

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

function getCurrentUser(){

const raw=

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

const token=getToken();

if(!token){

logout();

return;

}

/*==================================
        ELEMENTS
==================================*/

const avatar=
document.getElementById("profileAvatar");

const usernameTitle=
document.getElementById("profileUsername");

const roleText=
document.getElementById("profileRole");

const statusBox=
document.getElementById("profileStatus");

const emailStatus=
document.getElementById("profileEmailStatus");

const memberSince=
document.getElementById("profileMemberSince");

const accountType=
document.getElementById("profileAccountType");

const fullName=
document.getElementById("fullName");

const username=
document.getElementById("username");

const email=
document.getElementById("email");

const phone=
document.getElementById("phone");

const country=
document.getElementById("country");

const dob=
document.getElementById("dob");

const saveButton=
document.getElementById("saveProfileBtn");

const messageBox=
document.getElementById("profileMessage");

const joinedDate=
document.getElementById("joinedDate");

const lastLogin=
document.getElementById("lastLogin");

const walletStatus=
document.getElementById("walletStatus");

const accountId=
document.getElementById("accountId");

const emailVerificationText=
document.getElementById("emailVerificationText");

const verifyEmailBtn=
document.getElementById("verifyEmailBtn");

const changePasswordBtn=
document.getElementById("changePasswordBtn");

const profileKycItem=document.getElementById("profileKycItem");
const profileKycText=document.getElementById("profileKycText");
const profileKycBtn=document.getElementById("profileKycBtn");
const profileKycStatus=document.getElementById("profileKycStatus");

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type="info"){

messageBox.hidden=false;

messageBox.className=

`profile-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

messageBox.hidden=true;

messageBox.className="profile-message";

messageBox.textContent="";

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
        FORMAT HELPERS
==================================*/

function formatDate(value){

if(!value){

return "--";

}

const date=new Date(value);

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

function formatDateTime(value){

if(!value){

return "--";

}

const date=new Date(value);

if(Number.isNaN(date.getTime())){

return "--";

}

return date.toLocaleString();

}

function formatRole(value){

return String(value||"USER")

.replaceAll("_"," ")

.toLowerCase()

.replace(/\b\w/g,letter=>

letter.toUpperCase()

);

}

/*==================================
        PROFILE STATUS
==================================*/

function updateStatus(user){

const rawStatus=

String(

user.status||

"ACTIVE"

).toLowerCase();

const verified=

Boolean(

user.emailVerified||

user.isEmailVerified||

user.verified

);

statusBox.className="status";

if(

rawStatus==="frozen"||

rawStatus==="disabled"||

rawStatus==="suspended"

){

statusBox.classList.add("frozen");

statusBox.innerHTML=`

<i class="fa-solid fa-circle"></i>

<span>

${formatRole(rawStatus)}

</span>

`;

return;

}

if(verified){

statusBox.classList.add("verified");

statusBox.innerHTML=`

<i class="fa-solid fa-circle"></i>

<span>

Verified Account

</span>

`;

return;

}

statusBox.classList.add("pending");

statusBox.innerHTML=`

<i class="fa-solid fa-circle"></i>

<span>

Verification Pending

</span>

`;

}

/*==================================
        POPULATE PROFILE
==================================*/

function populateProfile(data){

const storedUser=

getCurrentUser()||

{};

const user=

data.user||

data.profile||

data||

storedUser;

const usernameValue=

user.username||

storedUser.username||

"User";

const fullNameValue=

user.fullName||

user.name||

user.displayName||

usernameValue;

const emailValue=

user.email||

storedUser.email||

"";

const roleValue=

user.role||

storedUser.role||

"USER";

const emailVerified=

Boolean(

user.emailVerified||

user.isEmailVerified||

user.verified

);

if(avatar){

avatar.textContent=

String(

fullNameValue||

usernameValue

)

.trim()

.charAt(0)

.toUpperCase()||

"U";

}

if(usernameTitle){

usernameTitle.textContent=

fullNameValue||

usernameValue;

}

if(roleText){

roleText.textContent=

`${formatRole(roleValue)} Account`;

}

if(fullName){

fullName.value=

fullNameValue;

}

if(username){

username.value=

usernameValue;

}

if(email){

email.value=

emailValue;

}

if(phone){

phone.value=

user.phone||

user.phoneNumber||

"";

}

if(country){

country.value=

user.country||

"";

}

if(dob){

const dateOfBirth=

user.dob||

user.dateOfBirth||

"";

if(dateOfBirth){

const parsedDate=

new Date(dateOfBirth);

if(!Number.isNaN(parsedDate.getTime())){

dob.value=

parsedDate

.toISOString()

.slice(0,10);

}

}

}

if(emailStatus){

emailStatus.textContent=

emailVerified

? "Verified"

: "Pending";

emailStatus.className=

emailVerified

? "status-positive"

: "status-warning";

}

if(memberSince){

memberSince.textContent=

formatDate(

user.createdAt||

user.registeredAt

);

}

if(accountType){

accountType.textContent=

formatRole(roleValue);

}

if(joinedDate){

joinedDate.textContent=

formatDate(

user.createdAt||

user.registeredAt

);

}

if(lastLogin){

lastLogin.textContent=

formatDateTime(

user.lastLogin||

user.lastLoginAt

);

}

if(walletStatus){

walletStatus.textContent=

user.walletStatus||

"Connected";

}

if(accountId){

accountId.textContent=

user.id||

user.userId||

"--";

}

if(emailVerificationText){

emailVerificationText.textContent=

emailVerified

? "Your email address is verified."

: "Your email address is not verified.";

}

if(verifyEmailBtn){

verifyEmailBtn.textContent=

emailVerified

? "Verified"

: "Verify";

verifyEmailBtn.disabled=

emailVerified;

}

updateStatus(user);

return user;

}

/*==================================
        LOAD PROFILE
==================================*/

async function loadProfile(){

hideMessage();

try{

const profile=

await api(

PROFILE_ENDPOINT

);

return populateProfile(

profile

);

}

catch(error){

console.error(

"Profile load failed:",

error

);

const storedUser=

getCurrentUser();

if(storedUser){

populateProfile(

storedUser

);

showMessage(

"Profile loaded from your saved session because the server profile endpoint is unavailable.",

"info"

);

return storedUser;

}

showMessage(

error.message||

"Unable to load your profile.",

"error"

);

return null;

}

}
/*==================================
        KYC STATUS
==================================*/
function renderProfileKyc(kyc={}){
const status=String(kyc.status||"NOT_SUBMITTED").toUpperCase();
const states={
NOT_SUBMITTED:{label:"Not Submitted",text:"Verify your identity to improve account protection and recovery.",button:"Verify",className:""},
PENDING:{label:"Pending Review",text:"Your identity documents are awaiting administrator review.",button:"View",className:"pending"},
VERIFIED:{label:"Verified",text:"Your identity has been verified successfully.",button:"View",className:"verified"},
REJECTED:{label:"Rejected",text:kyc.rejectionReason||"Your verification was rejected. Submit clearer or updated documents.",button:"Resubmit",className:"rejected"},
REVERIFY_REQUIRED:{label:"Reverification Required",text:kyc.reverificationReason||"Updated identity documents are required.",button:"Reverify",className:"rejected"},
REVOKED:{label:"Revoked",text:kyc.revocationReason||"Your verification was revoked. Submit new documents.",button:"Submit Again",className:"rejected"}
};
const state=states[status]||{label:status.replaceAll("_"," "),text:"Open identity verification for details.",button:"View",className:""};
if(profileKycItem)profileKycItem.className=`security-item kyc-security-item ${state.className}`;
if(profileKycText)profileKycText.textContent=state.text;
if(profileKycBtn)profileKycBtn.textContent=state.button;
if(profileKycStatus){profileKycStatus.textContent=state.label;profileKycStatus.className=status==="VERIFIED"?"status-positive":status==="PENDING"?"status-warning":status==="NOT_SUBMITTED"?"":"status-danger";}
}

async function loadProfileKyc(){
try{
const data=await api(KYC_STATUS_ENDPOINT);
renderProfileKyc(data.kyc||{});
}catch(error){
console.error("KYC status load failed:",error);
renderProfileKyc({status:"NOT_SUBMITTED"});
}
}

profileKycBtn?.addEventListener("click",()=>{window.location.href="kyc.html";});

/*==================================
        VALIDATION
==================================*/

function validateProfile(){

let valid=true;

[
fullName,
username,
phone,
country
]

.forEach(input=>{

if(!input){

return;

}

input.classList.remove(

"valid",
"invalid"

);

});

if(

!fullName.value.trim()

){

fullName.classList.add(

"invalid"

);

valid=false;

}

else{

fullName.classList.add(

"valid"

);

}

if(

!username.value.trim()

){

username.classList.add(

"invalid"

);

valid=false;

}

else{

username.classList.add(

"valid"

);

}

if(

phone.value.trim() &&

phone.value.trim().length<6

){

phone.classList.add(

"invalid"

);

valid=false;

}

else if(

phone.value.trim()

){

phone.classList.add(

"valid"

);

}

if(

country.value.trim()

){

country.classList.add(

"valid"

);

}

return valid;

}

/*==================================
        SAVE PROFILE
==================================*/

saveButton?.addEventListener(

"click",

async()=>{

hideMessage();

if(

!validateProfile()

){

showMessage(

"Please correct the highlighted fields.",

"error"

);

return;

}

saveButton.disabled=true;

saveButton.innerHTML=`

<i class="fa-solid fa-spinner fa-spin"></i>

<span>

Saving...

</span>

`;

const payload={

fullName:

fullName.value.trim(),

username:

username.value.trim(),

phone:

phone.value.trim(),

country:

country.value.trim(),

dateOfBirth:

dob.value||

null

};

try{

const response=

await api(

UPDATE_PROFILE_ENDPOINT,

{

method:"PUT",

headers:{

"Content-Type":

"application/json"

},

body:JSON.stringify(

payload

)

}

);

const updated=

response.user||

response.profile||

{

...payload

};

const stored=

getCurrentUser()||

{};

const merged={

...stored,

...updated

};

sessionStorage.setItem(

"currentUser",

JSON.stringify(

merged

)

);

localStorage.setItem(

"currentUser",

JSON.stringify(

merged

)

);

populateProfile(

merged

);

showMessage(

response.message||

"Profile updated successfully.",

"success"

);

}

catch(error){

console.error(error);

showMessage(

error.message||

"Unable to update profile.",

"error"

);

}

finally{

saveButton.disabled=false;

saveButton.innerHTML=`

<i class="fa-solid fa-floppy-disk"></i>

<span>

Save Changes

</span>

`;

}

});
/*==================================
        CHANGE PASSWORD
==================================*/

changePasswordBtn?.addEventListener(

"click",

()=>{

window.location.href=

"forgot-password.html";

}

);

/*==================================
        VERIFY EMAIL
==================================*/

verifyEmailBtn?.addEventListener(

"click",

()=>{

const currentEmail=

email?.value.trim()||

"";

if(!currentEmail){

showMessage(

"No email address is available for verification.",

"error"

);

return;

}

sessionStorage.setItem(

"verificationEmail",

currentEmail

);

localStorage.setItem(

"verificationEmail",

currentEmail

);

window.location.href=

"verify.html";

}

);

/*==================================
        INPUT CHANGE EFFECT
==================================*/

document

.querySelectorAll(

".input-box input:not([readonly])"

)

.forEach(input=>{

input.addEventListener(

"input",

()=>{

input.classList.remove(

"valid",

"invalid"

);

hideMessage();

}

);

});

/*==================================
        PAGE ANIMATION
==================================*/

document

.querySelectorAll(

".profile-card,.info-card,.security-card,.save-btn,.activity-card,.profile-footer"

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

await Promise.all([
loadProfile(),
loadProfileKyc()
]);

/*==================================
                END
==================================*/

});