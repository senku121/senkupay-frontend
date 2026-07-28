/*==================================================
        SENKU STAKES
        SUB AGENT LOGIN
==================================================*/

document.addEventListener("DOMContentLoaded",()=>{

const loginForm=document.querySelector("#agentLoginForm");
const loginBtn=document.querySelector(".agent-login-btn");

const passwordInput=document.querySelector("#agentPassword");
const eye=document.querySelector(".password-eye");

const popup=document.querySelector("#loginPopup");
const popupIcon=document.querySelector("#popupIcon");
const popupIconElement=document.querySelector("#popupIconElement");
const popupTitle=document.querySelector("#popupTitle");
const popupMessage=document.querySelector("#popupMessage");
const popupBtn=document.querySelector("#popupBtn");


/*================================
        PASSWORD SHOW / HIDE
================================*/

if(eye){

eye.addEventListener("click",()=>{

if(passwordInput.type==="password"){

passwordInput.type="text";

eye.classList.remove("fa-eye");

eye.classList.add("fa-eye-slash");

}else{

passwordInput.type="password";

eye.classList.remove("fa-eye-slash");

eye.classList.add("fa-eye");

}

});

}


/*================================
        POPUP
================================*/

function showPopup(type,title,message,callback){

popup.classList.add("show");

popupTitle.innerText=title;

popupMessage.innerText=message;

popupIcon.className="popup-icon "+type;

if(type==="success"){

popupIconElement.className="fa-solid fa-circle-check";

}else if(type==="error"){

popupIconElement.className="fa-solid fa-circle-xmark";

}else{

popupIconElement.className="fa-solid fa-triangle-exclamation";

}

popupBtn.onclick=()=>{

popup.classList.remove("show");

if(callback){

callback();

}

};

}


/*================================
        LOGIN
================================*/

if(loginForm){

loginForm.addEventListener("submit",(e)=>{

e.preventDefault();

const username=document.querySelector("#agentUsername").value.trim();
const password=document.querySelector("#agentPassword").value;

if(!username || !password){

    showPopup(
        "warning",
        "Missing Information",
        "Please enter your Username and Password."
    );

    return;
}

loginBtn.classList.add("loading");
loginBtn.innerHTML="Authenticating...";

setTimeout(()=>{

    const agents=getAgents();

    const agent=agents.find(a=>

        a.username===username &&
        a.password===password

    );

    if(agent){

        if(agent.status==="DISABLED"){

            loginBtn.classList.remove("loading");

            loginBtn.innerHTML='<i class="fa-solid fa-right-to-bracket"></i> Login';

            showPopup(
                "error",
                "Account Disabled",
                "Please contact the administrator."
            );

            return;
        }

        setCurrentUser(agent);

console.log("Logged in agent:", agent);
console.log("Saved session:", getCurrentUser());

showPopup(

    "success",

    "Login Successful",

    "Redirecting to dashboard...",

    ()=>{

        window.location.href="sub-agent-dashboard.html";

    }

);

    }

    else{

        loginBtn.classList.remove("loading");

        loginBtn.innerHTML='<i class="fa-solid fa-right-to-bracket"></i> Login';

        showPopup(

            "error",

            "Access Denied",

            "Invalid Username or Password."

        );

    }

},1200);

});

}

});