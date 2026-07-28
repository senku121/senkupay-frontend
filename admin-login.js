/*==================================================
                SENKU PAY
                ADMIN LOGIN
==================================================*/

document.addEventListener("DOMContentLoaded",()=>{

const API_BASE_URL=
"https://senkupay-api.onrender.com";

const ADMIN_LOGIN_ENDPOINT=
`${API_BASE_URL}/api/admin/auth/login`;

/*==================================
        ELEMENTS
==================================*/

const form=
document.getElementById("adminLoginForm");

const username=
document.getElementById("adminUsername");

const password=
document.getElementById("adminPassword");

const loginButton=
document.getElementById("adminLoginButton");

const messageBox=
document.getElementById("adminLoginMessage");

const usernameError=
document.getElementById("adminUsernameError");

const passwordError=
document.getElementById("adminPasswordError");

const rememberDevice=
document.getElementById("rememberDevice");

const togglePassword=
document.getElementById("toggleAdminPassword");

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type="info"){

messageBox.hidden=false;

messageBox.className=

`admin-login-message show ${type}`;

messageBox.textContent=text;

}

function hideMessage(){

messageBox.hidden=true;

messageBox.className=

"admin-login-message";

messageBox.textContent="";

}

/*==================================
        PASSWORD TOGGLE
==================================*/

togglePassword?.addEventListener(

"click",

()=>{

if(password.type==="password"){

password.type="text";

togglePassword.innerHTML=

'<i class="fa-solid fa-eye-slash"></i>';

}

else{

password.type="password";

togglePassword.innerHTML=

'<i class="fa-solid fa-eye"></i>';

}

}

);

/*==================================
        VALIDATION
==================================*/

function clearErrors(){

usernameError.textContent="";

passwordError.textContent="";

username.classList.remove(

"valid",

"invalid"

);

password.classList.remove(

"valid",

"invalid"

);

}

function validate(){

clearErrors();

let valid=true;

if(

!username.value.trim()

){

username.classList.add(

"invalid"

);

usernameError.textContent=

"Administrator username is required.";

valid=false;

}

else{

username.classList.add(

"valid"

);

}

if(

password.value.length<6

){

password.classList.add(

"invalid"

);

passwordError.textContent=

"Password must contain at least 6 characters.";

valid=false;

}

else{

password.classList.add(

"valid"

);

}

return valid;

}
/*==================================
        BUTTON STATE
==================================*/

function setLoading(loading){

loginButton.disabled=loading;

loginButton.classList.toggle(

"loading",

loading

);

loginButton.innerHTML=

loading

? `

<i class="fa-solid fa-spinner fa-spin"></i>

<span>

Signing In...

</span>

`

: `

<i class="fa-solid fa-right-to-bracket"></i>

<span>

Access Admin Dashboard

</span>

`;

}

/*==================================
        ADMIN LOGIN
==================================*/

form?.addEventListener(

"submit",

async event=>{

event.preventDefault();

hideMessage();

if(!validate()){

return;

}

setLoading(true);

showMessage(

"Verifying administrator credentials...",

"info"

);

try{

const response=

await fetch(

ADMIN_LOGIN_ENDPOINT,

{

method:"POST",

headers:{

"Content-Type":"application/json",

Accept:"application/json"

},

body:JSON.stringify({

username:

username.value.trim(),

password:

password.value

})

}

);

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

"Invalid administrator username or password."

);

}

const adminToken=

data.token||

data.adminToken||

data.accessToken;

const admin=

data.admin||

data.user||

{

username:

username.value.trim(),

role:"SUPER_ADMIN"

};

if(!adminToken){

throw new Error(

"Admin login succeeded but no authentication token was returned."

);

}

/*==================================
        SAVE ADMIN SESSION
==================================*/

const targetStorage=

rememberDevice?.checked

? localStorage

: sessionStorage;

const secondaryStorage=

rememberDevice?.checked

? sessionStorage

: localStorage;

secondaryStorage.removeItem(

"adminToken"

);

secondaryStorage.removeItem(

"currentAdmin"

);

secondaryStorage.removeItem(

"currentUser"

);

targetStorage.setItem(

"adminToken",

adminToken

);

targetStorage.setItem(

"currentAdmin",

JSON.stringify(admin)

);

targetStorage.setItem(

"currentUser",

JSON.stringify(admin)

);

targetStorage.setItem(

"adminRememberDevice",

String(

Boolean(

rememberDevice?.checked

)

)

);

showMessage(

data.message||

"Administrator login successful.",

"success"

);

loginButton.classList.remove(

"loading"

);

loginButton.classList.add(

"success"

);

loginButton.innerHTML=`

<i class="fa-solid fa-circle-check"></i>

<span>

Access Granted

</span>

`;

setTimeout(()=>{

window.location.href=

"admin-dashboard.html";

},700);

}

catch(error){

console.error(

"Admin login failed:",

error

);

setLoading(false);

showMessage(

error.message||

"Unable to connect to the Senku Pay server.",

"error"

);

password.classList.add(

"invalid"

);

password.focus();

}

}

);
/*==================================
        REMEMBERED USERNAME
==================================*/

const rememberedUsername=

localStorage.getItem(

"adminRememberUsername"

);

if(rememberedUsername){

username.value=

rememberedUsername;

rememberDevice.checked=true;

}

/*==================================
        SAVE REMEMBER PREFERENCE
==================================*/

rememberDevice?.addEventListener(

"change",

()=>{

if(

rememberDevice.checked &&

username.value.trim()

){

localStorage.setItem(

"adminRememberUsername",

username.value.trim()

);

}

else if(!rememberDevice.checked){

localStorage.removeItem(

"adminRememberUsername"

);

}

}

);

username?.addEventListener(

"input",

()=>{

username.classList.remove(

"valid",

"invalid"

);

usernameError.textContent="";

hideMessage();

if(

rememberDevice?.checked

){

localStorage.setItem(

"adminRememberUsername",

username.value.trim()

);

}

}

);

password?.addEventListener(

"input",

()=>{

password.classList.remove(

"valid",

"invalid"

);

passwordError.textContent="";

hideMessage();

}

);

/*==================================
        ADMIN HELP
==================================*/

document

.getElementById(

"adminForgotPassword"

)

?.addEventListener(

"click",

event=>{

event.preventDefault();

if(

typeof showPopup==="function"

){

showPopup({

type:"warning",

title:"Administrator Assistance",

message:

"Contact the Senku Pay system owner to recover or reset administrator access."

});

return;

}

showMessage(

"Contact the Senku Pay system owner to recover administrator access.",

"info"

);

}

);

/*==================================
        EXISTING SESSION
==================================*/

const existingAdminToken=

sessionStorage.getItem(

"adminToken"

)||

localStorage.getItem(

"adminToken"

);

const existingAdminRaw=

sessionStorage.getItem(

"currentAdmin"

)||

localStorage.getItem(

"currentAdmin"

);

if(

existingAdminToken &&

existingAdminRaw

){

try{

const existingAdmin=

JSON.parse(

existingAdminRaw

);

const role=

String(

existingAdmin.role||

""

).toUpperCase();

if(

role==="ADMIN"||

role==="SUPER_ADMIN"

){

window.location.replace(

"admin-dashboard.html"

);

return;

}

}

catch(error){

console.error(

"Invalid stored administrator session:",

error

);

}

}

/*==================================
        KEYBOARD SUPPORT
==================================*/

document.addEventListener(

"keydown",

event=>{

if(

event.key==="Enter" &&

document.activeElement!==loginButton

){

form?.requestSubmit();

}

}

);

/*==================================
        INITIAL FOCUS
==================================*/

if(

!username.value

){

username.focus();

}

else{

password.focus();

}

/*==================================
                END
==================================*/

});