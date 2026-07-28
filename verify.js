/*==================================================
                SENKU PAY
            VERIFY EMAIL OTP
==================================================*/

document.addEventListener("DOMContentLoaded",()=>{

const API_BASE="https://senkupay-api.onrender.com";

const VERIFY_ENDPOINT=`${API_BASE}/api/auth/verify-reset-otp`;

const RESEND_ENDPOINT=`${API_BASE}/api/auth/resend-reset-otp`;

const inputs=[...document.querySelectorAll(".otp-input")];

const form=document.getElementById("verifyForm");

const verifyBtn=document.getElementById("verifyButton");

const resendBtn=document.getElementById("resend-btn");

const timer=document.getElementById("timer");

const formMessage=document.getElementById("formMessage");

const otpError=document.getElementById("otpError");

const originalButton=verifyBtn.innerHTML;

let seconds=120;

let interval;

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
        OTP ERROR
==================================*/

function clearOtpError(){

otpError.textContent="";

inputs.forEach(input=>{

input.classList.remove("invalid");

});

hideMessage();

}

function showOtpError(text){

otpError.textContent=text;

inputs.forEach(input=>{

input.classList.add("invalid");

});

showMessage(text,"error");

inputs[0].focus();

}
/*==================================
        OTP INPUT HANDLING
==================================*/

inputs.forEach((input,index)=>{

input.addEventListener("input",()=>{

const value=input.value.replace(/\D/g,"");

input.value=value.slice(0,1);

input.classList.toggle(
"filled",
Boolean(input.value)
);

clearOtpError();

if(
input.value &&
index<inputs.length-1
){

inputs[index+1].focus();

inputs[index+1].select();

}

});

input.addEventListener("keydown",(event)=>{

if(
event.key==="Backspace" &&
!input.value &&
index>0
){

inputs[index-1].focus();

inputs[index-1].value="";

inputs[index-1].classList.remove("filled");

}

if(
event.key==="ArrowLeft" &&
index>0
){

event.preventDefault();

inputs[index-1].focus();

}

if(
event.key==="ArrowRight" &&
index<inputs.length-1
){

event.preventDefault();

inputs[index+1].focus();

}

if(
event.key.length===1 &&
!/\d/.test(event.key)
){

event.preventDefault();

}

});

input.addEventListener("focus",()=>{

input.select();

});

});

/*==================================
        PASTE OTP
==================================*/

document
.getElementById("otpContainer")
.addEventListener("paste",(event)=>{

event.preventDefault();

const pasted=(

event.clipboardData ||

window.clipboardData

).getData("text");

const digits=pasted

.replace(/\D/g,"")

.slice(0,6);

inputs.forEach((input,index)=>{

input.value=digits[index]||"";

input.classList.toggle(

"filled",

Boolean(input.value)

);

});

const nextEmpty=inputs.find(

input=>!input.value

);

if(nextEmpty){

nextEmpty.focus();

}else{

inputs[inputs.length-1].focus();

}

clearOtpError();

});

/*==================================
        TIMER
==================================*/

function formatTime(value){

const minutes=Math.floor(value/60);

const remaining=value%60;

return `${String(minutes).padStart(2,"0")}:${String(remaining).padStart(2,"0")}`;

}

function stopTimer(){

if(interval){

clearInterval(interval);

interval=null;

}

}

function updateTimer(){

if(seconds<=0){

stopTimer();

timer.textContent="Expired";

timer.classList.add("expired");

resendBtn.disabled=false;

return;

}

timer.textContent=formatTime(seconds);

timer.classList.remove("expired");

resendBtn.disabled=true;

seconds--;

}

function startTimer(duration=120){

stopTimer();

seconds=duration;

updateTimer();

interval=setInterval(updateTimer,1000);

}
/*==================================
        VERIFY OTP
==================================*/

form.addEventListener("submit",async(event)=>{

event.preventDefault();

if(verifyBtn.disabled){

return;

}

clearOtpError();

const otp=inputs

.map(input=>input.value)

.join("");

if(!/^\d{6}$/.test(otp)){

showOtpError(

"Please enter the complete 6-digit verification code."

);

return;

}

const resetEmail=

sessionStorage.getItem("resetEmail") ||

localStorage.getItem("resetEmail");

if(!resetEmail){

showMessage(

"Your password reset session has expired. Please request a new verification code.",

"error"

);

setTimeout(()=>{

window.location.href="forgot-password.html";

},1800);

return;

}

verifyBtn.disabled=true;

verifyBtn.classList.add("loading");

verifyBtn.innerHTML=`

<i class="fa-solid fa-spinner fa-spin"></i>

<span>Verifying Code...</span>

`;

showMessage(

"Checking your verification code...",

"info"

);

try{

const response=await fetch(

VERIFY_ENDPOINT,

{

method:"POST",

headers:{

"Content-Type":"application/json",

"Accept":"application/json"

},

body:JSON.stringify({

email:resetEmail,

otp

})

}

);

let data={};

try{

data=await response.json();

}catch{

data={};

}

if(!response.ok){

verifyBtn.disabled=false;

verifyBtn.classList.remove("loading");

verifyBtn.innerHTML=originalButton;

showOtpError(

data.message ||

data.error ||

"The verification code is invalid or expired."

);

inputs.forEach(input=>{

input.value="";

input.classList.remove("filled","valid");

});

inputs[0].focus();

return;

}

stopTimer();

inputs.forEach(input=>{

input.disabled=true;

input.classList.remove("invalid");

input.classList.add("valid");

});

showMessage(

data.message ||

"Verification code accepted successfully.",

"success"

);

verifyBtn.classList.remove("loading");

verifyBtn.classList.add("success");

verifyBtn.innerHTML=`

<i class="fa-solid fa-circle-check"></i>

<span>Code Verified</span>

`;
/*==================================
        STORE RESET SESSION
==================================*/

const resetToken=

data.resetToken ||

data.token ||

data.passwordResetToken ||

null;

if(resetToken){

sessionStorage.setItem(

"resetToken",

resetToken

);

localStorage.setItem(

"resetToken",

resetToken

);

}

sessionStorage.setItem(

"resetOtpVerified",

"true"

);

localStorage.setItem(

"resetOtpVerified",

"true"

);

/*==================================
        REDIRECT
==================================*/

setTimeout(()=>{

window.location.href="reset-password.html";

},1200);

}

catch(error){

console.error(

"OTP verification failed:",

error

);

verifyBtn.disabled=false;

verifyBtn.classList.remove("loading");

verifyBtn.innerHTML=originalButton;

showMessage(

"Unable to connect to the Senku Pay server. Please check your connection and try again.",

"error"

);

}

});

/*==================================
        RESEND OTP
==================================*/

resendBtn.addEventListener("click",async()=>{

if(resendBtn.disabled){

return;

}

const resetEmail=

sessionStorage.getItem("resetEmail") ||

localStorage.getItem("resetEmail");

if(!resetEmail){

showMessage(

"Your password reset session has expired. Please request a new code.",

"error"

);

setTimeout(()=>{

window.location.href="forgot-password.html";

},1800);

return;

}

resendBtn.disabled=true;

resendBtn.innerHTML=`

<i class="fa-solid fa-spinner fa-spin"></i>

Sending...

`;

showMessage(

"Requesting a new verification code...",

"info"

);

try{

const response=await fetch(

RESEND_ENDPOINT,

{

method:"POST",

headers:{

"Content-Type":"application/json",

"Accept":"application/json"

},

body:JSON.stringify({

email:resetEmail

})

}

);

let data={};

try{

data=await response.json();

}catch{

data={};

}

if(!response.ok){

resendBtn.disabled=false;

resendBtn.innerHTML="Resend OTP";

showMessage(

data.message ||

data.error ||

"Unable to resend the verification code.",

"error"

);

return;

}

inputs.forEach(input=>{

input.value="";

input.disabled=false;

input.classList.remove(

"filled",

"valid",

"invalid"

);

});

inputs[0].focus();

showMessage(

data.message ||

"A new verification code was sent to your email.",

"success"

);

resendBtn.innerHTML="Resend OTP";

startTimer(120);

}

catch(error){

console.error(

"Resend OTP failed:",

error

);

resendBtn.disabled=false;

resendBtn.innerHTML="Resend OTP";

showMessage(

"Unable to connect to the Senku Pay server. Please try again.",

"error"

);

}

});

/*==================================
        SESSION CHECK
==================================*/

const resetEmail=

sessionStorage.getItem("resetEmail") ||

localStorage.getItem("resetEmail");

if(!resetEmail){

showMessage(

"Your password reset session is missing. Please request a new verification code.",

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
        INITIALIZE
==================================*/

startTimer(120);

inputs[0]?.focus();

/*==================================
        END
==================================*/

});