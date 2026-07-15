/*==================================================
            SENKU STAKES
             GLOBAL POPUP SYSTEM
==================================================*/

(function(){

if(document.getElementById("popupOverlay")){
    return;
}

document.body.insertAdjacentHTML("beforeend",`

<div class="popup-overlay" id="popupOverlay">

    <div class="popup-box">

        <div class="popup-icon" id="popupIcon">
            <i class="fa-solid fa-circle-check"></i>
        </div>

        <h2 id="popupTitle"></h2>

        <p id="popupMessage"></p>

        <div class="popup-buttons">

            <button
            id="popupCancel"
            class="popup-btn cancel">

                Cancel

            </button>

            <button
            id="popupConfirm"
            class="popup-btn confirm">

                OK

            </button>

        </div>

    </div>

</div>

`);

})();

function showPopup(options={}){

const overlay=document.getElementById("popupOverlay");
const title=document.getElementById("popupTitle");
const message=document.getElementById("popupMessage");
const icon=document.getElementById("popupIcon");
const confirmBtn=document.getElementById("popupConfirm");
const cancelBtn=document.getElementById("popupCancel");

title.innerText=options.title || "";
message.innerText=options.message || "";

icon.className="popup-icon";

if(options.type==="success"){

icon.classList.add("success");
icon.innerHTML='<i class="fa-solid fa-circle-check"></i>';

}

else if(options.type==="error"){

icon.classList.add("error");
icon.innerHTML='<i class="fa-solid fa-circle-xmark"></i>';

}

else if(options.type==="warning"){

icon.classList.add("warning");
icon.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>';

}

else{

icon.classList.add("success");
icon.innerHTML='<i class="fa-solid fa-circle-check"></i>';

}

cancelBtn.style.display=
options.confirm ? "inline-flex" : "none";

overlay.classList.add("active");

confirmBtn.onclick=()=>{

overlay.classList.remove("active");

if(options.onConfirm){

options.onConfirm();

}

};

cancelBtn.onclick=()=>{

overlay.classList.remove("active");

if(options.onCancel){

options.onCancel();

}

};

overlay.onclick=(e)=>{

if(e.target===overlay){

overlay.classList.remove("active");

}

};

}