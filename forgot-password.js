/*==================================================
                SENKU PAY
            FORGOT PASSWORD
==================================================*/

document.addEventListener("DOMContentLoaded",()=>{

const API_BASE="https://senkupay-api.onrender.com";

const ENDPOINT=`${API_BASE}/api/auth/forgot-password`;

const form=document.getElementById("forgotPasswordForm");

const email=document.getElementById("email");

const button=document.getElementById("resetButton");

const message=document.getElementById("formMessage");

const emailError=document.getElementById("emailError");

const originalButton=button.innerHTML;

/*==================================
        MESSAGE
==================================*/

function showMessage(text,type){

message.hidden=false;

message.className="form-message show "+type;

message.innerHTML=text;

}

function hideMessage(){

message.hidden=true;

message.className="form-message";

message.innerHTML="";

}

/*==================================
        VALIDATION
==================================*/

function validEmail(value){

return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

}

function clearError(){

email.classList.remove("invalid");

email.classList.remove("valid");

emailError.textContent="";

hideMessage();

}

function showError(text){

email.classList.remove("valid");

email.classList.add("invalid");

emailError.textContent=text;

showMessage(text,"error");

email.focus();

}

email.addEventListener("input",clearError);

email.addEventListener("focus",()=>{

email.style.transform="translateY(-2px)";

});

email.addEventListener("blur",()=>{

email.style.transform="translateY(0)";

});
/*==================================
        FORM SUBMIT
==================================*/

form.addEventListener("submit",async(e)=>{

e.preventDefault();

clearError();

const emailValue=email.value.trim().toLowerCase();

if(emailValue===""){

showError("Please enter your email address.");

return;

}

if(!validEmail(emailValue)){

showError("Please enter a valid email address.");

return;

}

email.classList.remove("invalid");

email.classList.add("valid");

button.disabled=true;

button.classList.add("loading");

button.innerHTML=`

<i class="fa-solid fa-spinner fa-spin"></i>

<span>Sending Verification Code...</span>

`;

showMessage(

"Connecting to Senku Pay server...",

"info"

);

try{

const response=await fetch(

ENDPOINT,

{

method:"POST",

headers:{

"Content-Type":"application/json",

"Accept":"application/json"

},

body:JSON.stringify({

email:emailValue

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

button.disabled=false;

button.classList.remove("loading");

button.innerHTML=originalButton;

showMessage(

data.message||

"Unable to send verification code.",

"error"

);

email.classList.remove("valid");

email.classList.add("invalid");

return;

}
/*==================================
        SUCCESS
==================================*/

const serverMessage=

data.message||

"Verification code sent successfully.";

showMessage(

serverMessage,

"success"

);

localStorage.setItem(

"resetEmail",

emailValue

);

sessionStorage.setItem(

"resetEmail",

emailValue

);

button.innerHTML=`

<i class="fa-solid fa-circle-check"></i>

<span>Verification Sent</span>

`;

button.style.background=

"linear-gradient(135deg,#16a34a,#22c55e)";

email.disabled=true;

/*==================================
    SUCCESS CARD
==================================*/

showSuccessCard();

/*==================================
    REDIRECT
==================================*/

setTimeout(()=>{

window.location.href="verify.html";

},1500);

}

catch(error){

console.error(

"Forgot password:",

error

);

button.disabled=false;

button.classList.remove("loading");

button.innerHTML=originalButton;

showMessage(

"Unable to connect to the Senku Pay server. Please check your connection and try again.",

"error"

);

}

});
/*==================================
        SUCCESS CARD
==================================*/

function showSuccessCard(){

const existing=document.querySelector(".success-message");

if(existing){

existing.remove();

}

const card=document.createElement("div");

card.className="success-message fade-in";

card.innerHTML=`

<i class="fa-solid fa-envelope-circle-check"></i>

<div>

<h3>Email Sent Successfully</h3>

<p>

We've sent a secure verification code to your email address.

Please check your inbox (and spam folder if necessary) and enter the code on the next page to continue resetting your password.

</p>

</div>

`;

document

.querySelector(".forgot-card")

.appendChild(card);

}

/*==================================
        ENTER KEY SUPPORT
==================================*/

document.addEventListener("keydown",(event)=>{

if(event.key==="Enter"){

if(document.activeElement!==button){

form.requestSubmit();

}

}

});

/*==================================
        CARD LOAD ANIMATION
==================================*/

const card=document.querySelector(".forgot-card");

if(card){

card.animate(

[

{

opacity:0,

transform:"translateY(40px) scale(.96)"

},

{

opacity:1,

transform:"translateY(0) scale(1)"

}

],

{

duration:800,

easing:"ease-out",

fill:"forwards"

}

);

}

/*==================================
        AUTO HIDE MESSAGE
==================================*/

const observer=new MutationObserver(()=>{

if(

!message.hidden &&

message.classList.contains("success")

){

setTimeout(()=>{

hideMessage();

},5000);

}

});

observer.observe(message,{

attributes:true,

attributeFilter:["class","hidden"]

});

/*==================================
        END
==================================*/

});