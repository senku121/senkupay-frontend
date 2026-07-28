/*==================================================
                SENKU PAY
            RESET PASSWORD
==================================================*/

document.addEventListener("DOMContentLoaded",()=>{

const API_BASE="https://senkupay-api.onrender.com";

const RESET_ENDPOINT=`${API_BASE}/api/auth/reset-password`;

const form=document.getElementById("resetPasswordForm");

const password=document.getElementById("newPassword");

const confirmPassword=document.getElementById("confirmPassword");

const button=document.getElementById("resetButton");

const formMessage=document.getElementById("formMessage");

const strengthBar=document.getElementById("strengthBar");

const strengthText=document.getElementById("strengthText");

const passwordError=document.getElementById("newPasswordError");

const confirmError=document.getElementById("confirmPasswordError");

const originalButton=button.innerHTML;

const lengthRequirement=document.getElementById("lengthRequirement");

const letterRequirement=document.getElementById("letterRequirement");

const numberRequirement=document.getElementById("numberRequirement");

const specialRequirement=document.getElementById("specialRequirement");

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type){

formMessage.hidden=false;

formMessage.className="form-message show "+type;

formMessage.innerHTML=text;

}

function hideMessage(){

formMessage.hidden=true;

formMessage.className="form-message";

formMessage.innerHTML="";

}

/*==================================
        CLEAR ERRORS
==================================*/

function clearErrors(){

password.classList.remove("invalid","valid");

confirmPassword.classList.remove("invalid","valid");

passwordError.textContent="";

confirmError.textContent="";

hideMessage();

}
/*==================================
        SHOW / HIDE PASSWORD
==================================*/

document
.querySelectorAll(".toggle-password")
.forEach(toggle=>{

toggle.addEventListener("click",()=>{

const targetId=toggle.dataset.target;

const target=document.getElementById(targetId);

const icon=toggle.querySelector("i");

if(!target || !icon){

return;

}

const showPassword=

target.type==="password";

target.type=

showPassword

? "text"

: "password";

icon.classList.toggle(

"fa-eye",

!showPassword

);

icon.classList.toggle(

"fa-eye-slash",

showPassword

);

toggle.setAttribute(

"aria-label",

showPassword

? "Hide password"

: "Show password"

);

});

});

/*==================================
        PASSWORD RULES
==================================*/

function getRules(value){

return{

length:value.length>=8,

letters:

/[a-z]/.test(value) &&

/[A-Z]/.test(value),

number:/\d/.test(value),

special:/[^A-Za-z0-9]/.test(value)

};

}

function updateRequirement(

element,

valid

){

element.classList.toggle(

"valid",

valid

);

const icon=

element.querySelector("i");

if(icon){

icon.className=

valid

? "fa-solid fa-circle-check"

: "fa-solid fa-circle";

}

}

/*==================================
        PASSWORD STRENGTH
==================================*/

function updateStrength(){

const value=password.value;

const rules=getRules(value);

const score=[

rules.length,

rules.letters,

rules.number,

rules.special

].filter(Boolean).length;

updateRequirement(

lengthRequirement,

rules.length

);

updateRequirement(

letterRequirement,

rules.letters

);

updateRequirement(

numberRequirement,

rules.number

);

updateRequirement(

specialRequirement,

rules.special

);

let width="0%";

let color="#ff647c";

let text="Weak";

if(value.length===0){

width="0%";

text="Weak";

}

else if(score===1){

width="25%";

text="Weak";

color="#ff647c";

}

else if(score===2){

width="50%";

text="Medium";

color="#f59e0b";

}

else if(score===3){

width="75%";

text="Good";

color="#3b82f6";

}

else if(score===4){

width="100%";

text="Strong";

color="#22c55e";

}

strengthBar.style.width=width;

strengthBar.style.background=color;

strengthText.textContent=text;

strengthText.style.color=color;

return rules;

}

/*==================================
        LIVE VALIDATION
==================================*/

password.addEventListener("input",()=>{

passwordError.textContent="";

password.classList.remove(

"invalid",

"valid"

);

const rules=updateStrength();

const allValid=

Object.values(rules)

.every(Boolean);

if(allValid){

password.classList.add("valid");

}

if(confirmPassword.value){

if(

password.value===

confirmPassword.value

){

confirmPassword.classList.remove(

"invalid"

);

confirmPassword.classList.add(

"valid"

);

confirmError.textContent="";

}

else{

confirmPassword.classList.remove(

"valid"

);

confirmPassword.classList.add(

"invalid"

);

confirmError.textContent=

"Passwords do not match.";

}

}

hideMessage();

});

confirmPassword.addEventListener("input",()=>{

confirmError.textContent="";

confirmPassword.classList.remove(

"invalid",

"valid"

);

if(!confirmPassword.value){

return;

}

if(

password.value===

confirmPassword.value

){

confirmPassword.classList.add(

"valid"

);

}

else{

confirmPassword.classList.add(

"invalid"

);

confirmError.textContent=

"Passwords do not match.";

}

hideMessage();

});
/*==================================
        RESET SESSION CHECK
==================================*/

const resetEmail=
sessionStorage.getItem("resetEmail") ||
localStorage.getItem("resetEmail");

const resetToken=
sessionStorage.getItem("resetToken") ||
localStorage.getItem("resetToken");

const otpVerified=
sessionStorage.getItem("resetOtpVerified")==="true" ||
localStorage.getItem("resetOtpVerified")==="true";

if(!resetEmail || !otpVerified){

showMessage(

"Your password reset session is missing or expired. Please request a new verification code.",

"error"

);

form.querySelectorAll(

"input, button"

).forEach(element=>{

element.disabled=true;

});

setTimeout(()=>{

window.location.href="forgot-password.html";

},1800);

return;

}

/*==================================
        BUTTON LOADING
==================================*/

function setLoading(loading){

button.disabled=loading;

button.classList.toggle(

"loading",

loading

);

button.innerHTML=

loading

? `

<i class="fa-solid fa-spinner fa-spin"></i>

<span>Updating Password...</span>

`

: originalButton;

}

/*==================================
        FORM SUBMIT
==================================*/

form.addEventListener("submit",async(event)=>{

event.preventDefault();

if(button.disabled){

return;

}

clearErrors();

const passwordValue=password.value;

const confirmValue=confirmPassword.value;

const rules=updateStrength();

const allRulesValid=

Object.values(rules)

.every(Boolean);

if(!passwordValue){

password.classList.add("invalid");

passwordError.textContent=

"Please enter your new password.";

showMessage(

"Please enter a new password.",

"error"

);

password.focus();

return;

}

if(!allRulesValid){

password.classList.add("invalid");

passwordError.textContent=

"Your password does not meet all security requirements.";

showMessage(

"Please create a stronger password.",

"error"

);

password.focus();

return;

}

if(!confirmValue){

confirmPassword.classList.add("invalid");

confirmError.textContent=

"Please confirm your new password.";

showMessage(

"Please confirm your new password.",

"error"

);

confirmPassword.focus();

return;

}

if(passwordValue!==confirmValue){

confirmPassword.classList.add("invalid");

confirmError.textContent=

"Passwords do not match.";

showMessage(

"Passwords do not match.",

"error"

);

confirmPassword.focus();

return;

}

password.classList.add("valid");

confirmPassword.classList.add("valid");

setLoading(true);

showMessage(

"Updating your Senku Pay password...",

"info"

);

try{

const payload={

email:resetEmail,

password:passwordValue

};

if(resetToken){

payload.resetToken=resetToken;

}

const response=await fetch(

RESET_ENDPOINT,

{

method:"POST",

headers:{

"Content-Type":"application/json",

"Accept":"application/json"

},

body:JSON.stringify(payload)

}

);

let data={};

try{

data=await response.json();

}catch{

data={};

}

if(!response.ok){

setLoading(false);

showMessage(

data.message ||

data.error ||

"Unable to update your password.",

"error"

);

return;

}
/*==================================
        SUCCESS
==================================*/

showMessage(

data.message ||

"Your password has been updated successfully.",

"success"

);

button.classList.remove("loading");

button.classList.add("success");

button.innerHTML=`

<i class="fa-solid fa-circle-check"></i>

<span>Password Updated</span>

`;

/*==================================
        SUCCESS BOX
==================================*/

showSuccessBox();

/*==================================
        CLEAR RESET SESSION
==================================*/

[
"resetEmail",
"resetToken",
"resetOtpVerified"
].forEach(key=>{

localStorage.removeItem(key);

sessionStorage.removeItem(key);

});

/*==================================
        REDIRECT
==================================*/

setTimeout(()=>{

window.location.href="login.html";

},1800);

}

catch(error){

console.error(

"Password reset failed:",

error

);

setLoading(false);

showMessage(

"Unable to connect to the Senku Pay server. Please try again.",

"error"

);

}

});

/*==================================
        SUCCESS CARD
==================================*/

function showSuccessBox(){

const existing=

document.querySelector(

".success-message"

);

if(existing){

existing.remove();

}

const box=document.createElement("div");

box.className=

"success-message fade-in";

box.innerHTML=`

<i class="fa-solid fa-circle-check"></i>

<div>

<strong>

Password Updated

</strong>

<p>

Your Senku Pay password has been updated successfully.

You will now be redirected to the login page.

</p>

</div>

`;

document

.querySelector(".reset-card")

.appendChild(box);

}

/*==================================
        ENTER KEY
==================================*/

document.addEventListener(

"keydown",

event=>{

if(

event.key==="Enter" &&

document.activeElement!==button

){

form.requestSubmit();

}

}

);

/*==================================
        INITIALIZE
==================================*/

updateStrength();

password.focus();

/*==================================
        END
==================================*/

});