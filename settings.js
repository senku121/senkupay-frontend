/*==================================================
                SENKU PAY
                SETTINGS PAGE
==================================================*/

document.addEventListener("DOMContentLoaded",async()=>{

const API_BASE_URL=
"https://senkupay-api.onrender.com";

const SETTINGS_ENDPOINT=
`${API_BASE_URL}/api/settings`;

const UPDATE_SETTINGS_ENDPOINT=
`${API_BASE_URL}/api/settings/update`;

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

const username=
document.getElementById("settingsUsername");

const email=
document.getElementById("settingsEmail");

const phone=
document.getElementById("settingsPhone");

const country=
document.getElementById("settingsCountry");

const saveButton=
document.getElementById("saveSettingsBtn");

const messageBox=
document.getElementById("settingsMessage");

const accountStatusText=
document.getElementById("accountStatusText");

const accountStatusBadge=
document.getElementById("accountStatusBadge");

const emailVerificationText=
document.getElementById("settingsEmailVerificationText");

const verifyEmailButton=
document.getElementById("verifyEmailButton");

const changePasswordButton=
document.getElementById("changePasswordButton");

const emailNotifications=
document.getElementById("emailNotifications");

const transactionNotifications=
document.getElementById("transactionNotifications");

const productNotifications=
document.getElementById("productNotifications");

const animationsToggle=
document.getElementById("animationsToggle");

const logoutButton=
document.getElementById("logoutButton");

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type="info"){

messageBox.hidden=false;

messageBox.className=

`settings-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

messageBox.hidden=true;

messageBox.className=

"settings-message";

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

"Request failed."

);

}

return data;

}
/*==================================
        LOAD SETTINGS
==================================*/

function loadLocalPreferences(){

emailNotifications.checked=

localStorage.getItem(

"settings_email_notifications"

)!=="false";

transactionNotifications.checked=

localStorage.getItem(

"settings_transaction_notifications"

)!=="false";

productNotifications.checked=

localStorage.getItem(

"settings_product_notifications"

)==="true";

animationsToggle.checked=

localStorage.getItem(

"settings_animations"

)!=="false";

}

function saveLocalPreferences(){

localStorage.setItem(

"settings_email_notifications",

emailNotifications.checked

);

localStorage.setItem(

"settings_transaction_notifications",

transactionNotifications.checked

);

localStorage.setItem(

"settings_product_notifications",

productNotifications.checked

);

localStorage.setItem(

"settings_animations",

animationsToggle.checked

);

}

/*==================================
        POPULATE SETTINGS
==================================*/

function populateSettings(data){

const current=

getCurrentUser()||

{};

const user=

data.user||

data.settings||

data||

current;

username.value=

user.username||

"";

email.value=

user.email||

"";

phone.value=

user.phone||

"";

country.value=

user.country||

"";

const verified=

Boolean(

user.emailVerified||

user.verified||

user.isEmailVerified

);

emailVerificationText.textContent=

verified

?

"Your email address is verified."

:

"Your email address has not been verified.";

verifyEmailButton.disabled=

verified;

verifyEmailButton.textContent=

verified

?

"Verified"

:

"Verify";

const status=

String(

user.status||

"ACTIVE"

).toLowerCase();

accountStatusBadge.className=

"status-badge";

if(

status==="disabled"||

status==="suspended"||

status==="frozen"

){

accountStatusBadge.classList.add(

"disabled"

);

accountStatusBadge.textContent=

status.toUpperCase();

accountStatusText.textContent=

"Your account currently has restrictions.";

}

else if(!verified){

accountStatusBadge.classList.add(

"pending"

);

accountStatusBadge.textContent=

"PENDING";

accountStatusText.textContent=

"Please verify your email address.";

}

else{

accountStatusBadge.textContent=

"ACTIVE";

accountStatusText.textContent=

"Your account is active and secure.";

}

return user;

}

/*==================================
        LOAD
==================================*/

async function loadSettings(){

hideMessage();

loadLocalPreferences();

try{

const settings=

await api(

SETTINGS_ENDPOINT

);

return populateSettings(

settings

);

}

catch(error){

console.error(

"Settings load failed:",

error

);

const stored=

getCurrentUser();

if(stored){

populateSettings(

stored

);

showMessage(

"Loaded local account settings.",

"info"

);

return stored;

}

showMessage(

error.message||

"Unable to load settings.",

"error"

);

return null;

}

}

/*==================================
        VALIDATION
==================================*/

function validate(){

let valid=true;

[

username,

phone,

country

].forEach(input=>{

input.classList.remove(

"valid",

"invalid"

);

});

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
        SAVE SETTINGS
==================================*/

saveButton?.addEventListener(

"click",

async()=>{

hideMessage();

if(!validate()){

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

username:

username.value.trim(),

phone:

phone.value.trim(),

country:

country.value.trim(),

notifications:{

email:

emailNotifications.checked,

transactions:

transactionNotifications.checked,

products:

productNotifications.checked

},

preferences:{

animations:

animationsToggle.checked

}

};

try{

const response=

await api(

UPDATE_SETTINGS_ENDPOINT,

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

saveLocalPreferences();

const stored=

getCurrentUser()||

{};

const updated={

...stored,

...payload,

...(response.user||{})

};

sessionStorage.setItem(

"currentUser",

JSON.stringify(updated)

);

localStorage.setItem(

"currentUser",

JSON.stringify(updated)

);

populateSettings(updated);

showMessage(

response.message||

"Settings saved successfully.",

"success"

);

}

catch(error){

console.error(error);

showMessage(

error.message||

"Unable to save settings.",

"error"

);

}

finally{

saveButton.disabled=false;

saveButton.innerHTML=`

<i class="fa-solid fa-floppy-disk"></i>

<span>

Save Profile Settings

</span>

`;

}

});

/*==================================
        TOGGLES
==================================*/

[

emailNotifications,

transactionNotifications,

productNotifications,

animationsToggle

].forEach(toggle=>{

toggle?.addEventListener(

"change",

()=>{

saveLocalPreferences();

}

);

});

/*==================================
        CHANGE PASSWORD
==================================*/

changePasswordButton?.addEventListener(

"click",

()=>{

window.location.href=

"forgot-password.html";

}

);

/*==================================
        VERIFY EMAIL
==================================*/

verifyEmailButton?.addEventListener(

"click",

()=>{

if(!email.value.trim()){

showMessage(

"No email address available.",

"error"

);

return;

}

sessionStorage.setItem(

"verificationEmail",

email.value.trim()

);

localStorage.setItem(

"verificationEmail",

email.value.trim()

);

window.location.href=

"verify.html";

}

);

/*==================================
        LOGOUT
==================================*/

logoutButton?.addEventListener(

"click",

()=>{

if(

confirm(

"Are you sure you want to logout?"

)

){

logout();

}

});
/*==================================
        INPUT EFFECTS
==================================*/

document

.querySelectorAll(

".setting-input input:not([readonly])"

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

".settings-hero,.settings-card,.settings-info"

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

},100+(index*90));

});

/*==================================
        AUTO SAVE
==================================*/

window.addEventListener(

"beforeunload",

()=>{

saveLocalPreferences();

}

);

/*==================================
        INITIALIZE
==================================*/

await loadSettings();

/*==================================
        END
==================================*/

});