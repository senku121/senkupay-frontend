/* ======================================================================
   SENKU PAY — GLOBAL UI, NAVIGATION, MOTION & POPUP SYSTEM (V3)
   Presentation behaviour only. API and business logic stay in page files.
   ====================================================================== */
(function bootstrapSenkuUI(){
    "use strict";

    const currentFile=(location.pathname.split("/").pop()||"index.html").toLowerCase();
    const userPages=new Set(["dashboard.html","wallet.html","deposit.html","withdraw.html","transactions.html","profile.html","settings.html","kyc.html"]);
    const adminPage=currentFile.startsWith("admin-")&&currentFile!=="admin-login.html";
    const agentPage=currentFile==="sub-agent-dashboard.html";

    const titleMap={
        "dashboard.html":["Dashboard","Your wallet, activity and account overview"],
        "wallet.html":["Wallet","Balances, deposits, withdrawals and wallet activity"],
        "deposit.html":["Deposit Funds","Add funds through your connected payment gateway"],
        "withdraw.html":["Withdraw Funds","Submit and track secure withdrawal requests"],
        "transactions.html":["Transactions","Review deposits, withdrawals and account activity"],
        "profile.html":["Profile","Manage personal details and verification status"],
        "settings.html":["Settings","Security, notifications and account preferences"],
        "kyc.html":["Identity Verification","Protect your account and improve withdrawal priority"]
    };
    const userNav=[
        ["dashboard.html","fa-house","Dashboard"],["wallet.html","fa-wallet","Wallet"],
        ["deposit.html","fa-credit-card","Deposit"],["withdraw.html","fa-money-bill-transfer","Withdraw"],
        ["transactions.html","fa-clock-rotate-left","Transactions"],["kyc.html","fa-id-card","Identity Verification"],
        ["profile.html","fa-user","Profile"],["settings.html","fa-gear","Settings"]
    ];

    function navMarkup(items){
        return items.map(([href,icon,label])=>{
            const active=currentFile===href?" active":"";
            return `<a href="${href}" class="${active.trim()}"${active?' aria-current="page"':""}><i class="fa-solid ${icon}" aria-hidden="true"></i><span>${label}</span></a>`;
        }).join("");
    }
    function brandMarkup(subtitle){
        return `<div class="senku-shell-brand"><div class="logo-box" aria-hidden="true">S</div><div><strong>Senku Pay</strong><small>${subtitle}</small></div></div>`;
    }

    function injectLoader(){
        if(document.getElementById("senkuPageLoader"))return;
        document.body.insertAdjacentHTML("afterbegin",`<div class="senku-page-loader" id="senkuPageLoader" role="status" aria-live="polite" aria-label="Loading Senku Pay"><div class="senku-loader-content"><div class="senku-loader-logo" aria-hidden="true">S</div><strong>Senku Pay</strong><div class="senku-loader-ring" aria-hidden="true"></div><span>Loading your secure experience…</span></div></div>`);
        const started=performance.now();
        let hidden=false;
        const hide=()=>{
            if(hidden)return; hidden=true;
            const loader=document.getElementById("senkuPageLoader"); if(!loader)return;
            setTimeout(()=>{loader.classList.add("is-hidden");setTimeout(()=>loader.remove(),650)},Math.max(0,320-(performance.now()-started)));
        };
        if(document.readyState==="complete")hide(); else addEventListener("load",hide,{once:true});
        setTimeout(hide,4200);
    }

    function ensurePopup(){
        if(document.getElementById("popupOverlay"))return;
        document.body.insertAdjacentHTML("beforeend",`<div class="popup-overlay" id="popupOverlay" aria-hidden="true"><div class="popup-box" role="dialog" aria-modal="true" aria-labelledby="popupTitle" aria-describedby="popupMessage"><div class="popup-icon" id="popupIcon"><i class="fa-solid fa-circle-check"></i></div><h2 id="popupTitle"></h2><p id="popupMessage"></p><div class="popup-buttons"><button type="button" id="popupCancel" class="popup-btn senku-popup-cancel">Cancel</button><button type="button" id="popupConfirm" class="popup-btn senku-popup-confirm">OK</button></div></div></div>`);
    }

    window.showPopup=function showPopup(options={}){
        ensurePopup();
        const overlay=document.getElementById("popupOverlay"), title=document.getElementById("popupTitle"), message=document.getElementById("popupMessage"), icon=document.getElementById("popupIcon"), confirmBtn=document.getElementById("popupConfirm"), cancelBtn=document.getElementById("popupCancel");
        if(!overlay||!title||!message||!icon||!confirmBtn||!cancelBtn)return;
        const previousFocus=document.activeElement;
        title.textContent=options.title||"Senku Pay";
        message.textContent=options.message||"";
        const type=options.type||"success";
        icon.className=`popup-icon ${type}`;
        icon.innerHTML=`<i class="fa-solid ${type==="error"?"fa-circle-xmark":type==="warning"?"fa-triangle-exclamation":"fa-circle-check"}" aria-hidden="true"></i>`;
        confirmBtn.textContent=options.confirmText||"OK";
        cancelBtn.textContent=options.cancelText||"Cancel";
        cancelBtn.hidden=!options.confirm;
        overlay.classList.add("active"); overlay.setAttribute("aria-hidden","false"); document.body.classList.add("senku-modal-open");
        const close=()=>{
            overlay.classList.remove("active"); overlay.setAttribute("aria-hidden","true"); document.body.classList.remove("senku-modal-open");
            document.removeEventListener("keydown",keyHandler);
            if(previousFocus&&typeof previousFocus.focus==="function")setTimeout(()=>previousFocus.focus(),0);
        };
        const keyHandler=e=>{if(e.key==="Escape")close()};
        confirmBtn.onclick=()=>{close();if(typeof options.onConfirm==="function")options.onConfirm()};
        cancelBtn.onclick=()=>{close();if(typeof options.onCancel==="function")options.onCancel()};
        overlay.onclick=e=>{if(e.target===overlay&&options.closeOnBackdrop!==false)close()};
        document.addEventListener("keydown",keyHandler);
        setTimeout(()=>confirmBtn.focus(),30);
    };

    function createOverlay(){
        let overlay=document.getElementById("senkuSidebarOverlay");
        if(!overlay){overlay=document.createElement("div");overlay.id="senkuSidebarOverlay";overlay.className="senku-sidebar-overlay";document.body.appendChild(overlay)}
        return overlay;
    }
    function setupInjectedSidebar(sidebar,menuButton){
        if(!sidebar||sidebar.dataset.senkuBound==="true")return;
        sidebar.dataset.senkuBound="true";
        const overlay=createOverlay();
        const close=()=>{sidebar.classList.remove("is-open","mobile-open","sidebar-open");overlay.classList.remove("is-visible");document.body.classList.remove("senku-sidebar-open");menuButton?.setAttribute("aria-expanded","false")};
        const open=()=>{sidebar.classList.add("is-open");overlay.classList.add("is-visible");document.body.classList.add("senku-sidebar-open");menuButton?.setAttribute("aria-expanded","true")};
        menuButton?.addEventListener("click",()=>sidebar.classList.contains("is-open")?close():open());
        overlay.addEventListener("click",close);
        sidebar.querySelectorAll("nav a").forEach(link=>link.addEventListener("click",()=>{if(innerWidth<=860)close()}));
        addEventListener("resize",()=>{if(innerWidth>860)close()},{passive:true});
    }

    function clearKeys(keys){keys.forEach(key=>{try{localStorage.removeItem(key);sessionStorage.removeItem(key)}catch(_){}})}
    function logoutUser(){clearKeys(["token","currentUser"]);location.href="login.html"}
    function logoutAdmin(){clearKeys(["adminToken","currentAdmin","currentUser","adminRememberDevice"]);location.href="admin-login.html"}
    function logoutAgent(){clearKeys(["token","agentToken","currentUser","currentAgent"]);location.href="sub-agent-login.html"}

    function directBodyChild(node){
        let current=node;
        while(current&&current.parentElement&&current.parentElement!==document.body)current=current.parentElement;
        return current&&current.parentElement===document.body?current:null;
    }

    function injectUserShell(){
        document.body.classList.add("senku-user-shell");
        if(currentFile==="dashboard.html"){
            const existing=document.getElementById("dashboardSidebar");
            if(existing){existing.classList.add("senku-app-sidebar");const subtitle=existing.querySelector(".side-logo small");if(subtitle)subtitle.textContent="Personal Account"}
            return;
        }
        if(document.getElementById("senkuAppSidebar"))return;
        const main=document.querySelector("main");
        const shellRoot=directBodyChild(main)||[...document.body.children].find(el=>el.matches?.(".wallet-layout,.deposit-layout,.withdraw-layout,.transactions-layout,.profile-layout,.settings-layout,.kyc-layout"))||null;
        if(main)main.classList.add("senku-shell-main-content");
        if(shellRoot)shellRoot.classList.add("senku-shell-content");

        const aside=document.createElement("aside");
        aside.id="senkuAppSidebar"; aside.className="senku-app-sidebar"; aside.setAttribute("aria-label","Senku Pay account navigation");
        aside.innerHTML=`${brandMarkup("Personal Account")}<nav>${navMarkup(userNav)}</nav><button type="button" class="senku-shell-logout" id="senkuGlobalLogout"><i class="fa-solid fa-right-from-bracket"></i><span>Logout</span></button>`;
        const [title,subtitle]=titleMap[currentFile]||["Senku Pay","Secure digital payments"];
        const topbar=document.createElement("header");
        topbar.className="senku-shell-topbar";
        topbar.innerHTML=`<div class="senku-topbar-heading"><button type="button" class="senku-global-menu" id="senkuGlobalMenu" aria-label="Open account navigation" aria-expanded="false"><i class="fa-solid fa-bars"></i></button><div><h1>${title}</h1><p>${subtitle}</p></div></div><div class="senku-topbar-actions"><a class="senku-topbar-pill" href="wallet.html" aria-label="Wallet"><i class="fa-solid fa-wallet"></i><span>Wallet</span></a><a class="senku-topbar-pill" href="profile.html" aria-label="Account"><i class="fa-solid fa-user"></i><span>Account</span></a></div>`;
        /* Fixed-position shell elements are added without relying on another node. */
        document.body.prepend(topbar);
        document.body.prepend(aside);
        setupInjectedSidebar(aside,document.getElementById("senkuGlobalMenu"));
    }

    function normalizeAdminShell(){
        document.body.classList.add("senku-admin-shell");
        const sidebar=document.querySelector(".admin-sidebar"); if(!sidebar)return;
        if(!sidebar.id)sidebar.id="adminSidebar"; sidebar.classList.add("senku-admin-sidebar");
        const subtitle=sidebar.querySelector(".admin-brand span,.admin-brand small,.side-logo small"); if(subtitle)subtitle.textContent="Administration Portal";
        sidebar.querySelectorAll("nav a").forEach(link=>{const href=(link.getAttribute("href")||"").toLowerCase();if(href&&!href.startsWith("#"))link.classList.toggle("active",href===currentFile)});
        let overlay=document.getElementById("adminSidebarOverlay");
        if(!overlay){overlay=document.createElement("div");overlay.id="adminSidebarOverlay";overlay.className="admin-sidebar-overlay";sidebar.insertAdjacentElement("afterend",overlay)}
        let menu=document.getElementById("adminMobileMenuButton");
        if(!menu){menu=document.createElement("button");menu.type="button";menu.id="adminMobileMenuButton";menu.className="mobile-menu-button";menu.setAttribute("aria-label","Open navigation");menu.setAttribute("aria-expanded","false");menu.innerHTML='<i class="fa-solid fa-bars"></i>';const header=document.querySelector("main header,.page-header,.admin-topbar,.dashboard-header");header?.prepend(menu);setupInjectedSidebar(sidebar,menu)}
    }
    function normalizeAgentShell(){document.body.classList.add("senku-agent-shell");const sidebar=document.querySelector(".agent-sidebar");if(sidebar)sidebar.classList.add("senku-agent-sidebar");document.querySelectorAll(".agent-brand h2").forEach(el=>el.textContent="Senku Pay")}

    function setupGlobalLogoutInterception(){
        const selector="#senkuGlobalLogout,#logoutButton,.logout>button,.logout-btn,.senku-shell-logout,#adminLogoutButton,.admin-logout,.agent-logout";
        document.addEventListener("click",event=>{
            const trigger=event.target.closest?.(selector); if(!trigger)return;
            event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
            if(adminPage||trigger.matches("#adminLogoutButton,.admin-logout")){
                showPopup({type:"warning",title:"Administrator Logout",message:"Are you sure you want to log out of the Senku Pay administration portal?",confirm:true,cancelText:"Cancel",confirmText:"Logout",onConfirm:logoutAdmin});
            }else if(agentPage||trigger.matches(".agent-logout")){
                showPopup({type:"warning",title:"Sub Agent Logout",message:"Are you sure you want to log out of the Senku Pay sub-agent portal?",confirm:true,cancelText:"Cancel",confirmText:"Logout",onConfirm:logoutAgent});
            }else{
                showPopup({type:"warning",title:"Logout",message:"Are you sure you want to log out of your Senku Pay account?",confirm:true,cancelText:"Cancel",confirmText:"Logout",onConfirm:logoutUser});
            }
        },true);
    }

    function setupMotion(){
        const targets=document.querySelectorAll([".feature-card",".service-card",".testimonial-card",".stat-card",".summary-card",".info-card",".settings-card",".profile-card",".wallet-main-card",".form-card",".history-card",".quick-action",".system-status-item",".security-item",".agent-box",".transaction-box",".sub-agent-card"].join(","));
        if(!("IntersectionObserver" in window)||matchMedia("(max-width: 860px)").matches){targets.forEach(t=>t.classList.add("is-visible"));return}
        const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:"0px 0px -28px 0px"});
        targets.forEach((target,index)=>{target.classList.add("senku-reveal");target.style.transitionDelay=`${Math.min(index%6,5)*35}ms`;observer.observe(target)});
    }
    function setupBusyStates(){
        const pattern=/loading|processing|sending|verifying|saving|updating|submitting|creating|refreshing|connecting/i;
        const update=button=>{if(!(button instanceof HTMLElement))return;const text=(button.textContent||"").trim();button.classList.toggle("senku-loading-button",button.getAttribute("aria-busy")==="true"||(button.matches(":disabled")&&pattern.test(text)))};
        document.querySelectorAll("button,[role='button']").forEach(update);
        new MutationObserver(records=>records.forEach(record=>update(record.target.closest?.("button,[role='button']")||record.target))).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["disabled","aria-busy"]});
    }
    function initialize(){
        ensurePopup(); setupGlobalLogoutInterception();
        if(userPages.has(currentFile))injectUserShell();
        if(adminPage)normalizeAdminShell();
        if(agentPage)normalizeAgentShell();
        setupMotion();setupBusyStates();document.documentElement.classList.add("senku-ui-ready");
    }
    injectLoader();
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();
