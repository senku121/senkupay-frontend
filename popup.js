/* ======================================================================
   SENKU PAY — GLOBAL UI, NAVIGATION, MOTION & POPUP SYSTEM
   This file intentionally contains presentation behaviour only.
   API calls, authentication and page business logic remain in page scripts.
   ====================================================================== */

(function bootstrapSenkuUI(){
    "use strict";

    const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const pageName = currentFile.replace(/\.html$/i, "") || "index";

    const userPages = new Set([
        "dashboard.html", "wallet.html", "deposit.html", "withdraw.html",
        "transactions.html", "profile.html", "settings.html", "kyc.html"
    ]);
    const adminPage = currentFile.startsWith("admin-") && currentFile !== "admin-login.html";
    const agentPage = currentFile === "sub-agent-dashboard.html";

    const titleMap = {
        "dashboard.html": ["Dashboard", "Your wallet, activity and account overview"],
        "wallet.html": ["Wallet", "Balances, deposits, withdrawals and wallet activity"],
        "deposit.html": ["Deposit Funds", "Add funds through your connected payment gateway"],
        "withdraw.html": ["Withdraw Funds", "Submit and track secure withdrawal requests"],
        "transactions.html": ["Transactions", "Review deposits, withdrawals and account activity"],
        "profile.html": ["Profile", "Manage personal details and verification status"],
        "settings.html": ["Settings", "Security, notifications and account preferences"],
        "kyc.html": ["Identity Verification", "Protect your account and improve withdrawal priority"]
    };

    const userNav = [
        ["dashboard.html", "fa-house", "Dashboard"],
        ["wallet.html", "fa-wallet", "Wallet"],
        ["deposit.html", "fa-credit-card", "Deposit"],
        ["withdraw.html", "fa-money-bill-transfer", "Withdraw"],
        ["transactions.html", "fa-clock-rotate-left", "Transactions"],
        ["kyc.html", "fa-id-card", "Identity Verification"],
        ["profile.html", "fa-user", "Profile"],
        ["settings.html", "fa-gear", "Settings"]
    ];

    const adminNav = [
        ["admin-dashboard.html", "fa-chart-line", "Dashboard"],
        ["admin-users.html", "fa-users", "Users"],
        ["admin-transactions.html", "fa-money-bill-transfer", "Transactions"],
        ["admin-withdraw.html", "fa-wallet", "Withdraw Requests"],
        ["admin-platform-withdraw.html", "fa-building-columns", "Platform Withdraw"],
        ["admin-agents.html", "fa-user-shield", "Agents"],
        ["admin-sub-agents.html", "fa-user-gear", "Sub Agents"],
        ["admin-agent-requests.html", "fa-envelope-open-text", "Agent Requests"],
        ["admin-kyc.html", "fa-id-card-clip", "KYC Verification"],
        ["#security", "fa-shield-halved", "Security"]
    ];

    function navMarkup(items){
        return items.map(([href, icon, label]) => {
            const isHash = href.startsWith("#");
            const active = !isHash && currentFile === href ? " active" : "";
            return `<a href="${href}" class="${active.trim()}"${active ? ' aria-current="page"' : ""}><i class="fa-solid ${icon}" aria-hidden="true"></i><span>${label}</span></a>`;
        }).join("");
    }

    function brandMarkup(subtitle){
        return `<div class="senku-shell-brand"><div class="logo-box" aria-hidden="true">S</div><div><strong>Senku Pay</strong><small>${subtitle}</small></div></div>`;
    }

    function injectLoader(){
        if(document.getElementById("senkuPageLoader")) return;
        document.body.insertAdjacentHTML("afterbegin", `
            <div class="senku-page-loader" id="senkuPageLoader" role="status" aria-live="polite" aria-label="Loading Senku Pay">
                <div class="senku-loader-content">
                    <div class="senku-loader-logo" aria-hidden="true">S</div>
                    <strong>Senku Pay</strong>
                    <div class="senku-loader-ring" aria-hidden="true"></div>
                    <span>Loading your secure experience…</span>
                </div>
            </div>`);
        const started = performance.now();
        const hide = () => {
            const loader = document.getElementById("senkuPageLoader");
            if(!loader) return;
            const delay = Math.max(0, 360 - (performance.now() - started));
            window.setTimeout(() => {
                loader.classList.add("is-hidden");
                window.setTimeout(() => loader.remove(), 650);
            }, delay);
        };
        if(document.readyState === "complete") hide();
        else window.addEventListener("load", hide, { once:true });
        window.setTimeout(hide, 4500);
    }

    function ensurePopup(){
        if(document.getElementById("popupOverlay")) return;
        document.body.insertAdjacentHTML("beforeend", `
            <div class="popup-overlay" id="popupOverlay" aria-hidden="true">
                <div class="popup-box" role="dialog" aria-modal="true" aria-labelledby="popupTitle" aria-describedby="popupMessage">
                    <div class="popup-icon" id="popupIcon"><i class="fa-solid fa-circle-check"></i></div>
                    <h2 id="popupTitle"></h2>
                    <p id="popupMessage"></p>
                    <div class="popup-buttons">
                        <button type="button" id="popupCancel" class="popup-btn cancel">Cancel</button>
                        <button type="button" id="popupConfirm" class="popup-btn confirm">OK</button>
                    </div>
                </div>
            </div>`);
    }

    window.showPopup = function showPopup(options = {}){
        ensurePopup();
        const overlay = document.getElementById("popupOverlay");
        const title = document.getElementById("popupTitle");
        const message = document.getElementById("popupMessage");
        const icon = document.getElementById("popupIcon");
        const confirmBtn = document.getElementById("popupConfirm");
        const cancelBtn = document.getElementById("popupCancel");
        if(!overlay || !title || !message || !icon || !confirmBtn || !cancelBtn) return;

        title.textContent = options.title || "Senku Pay";
        message.textContent = options.message || "";
        icon.className = `popup-icon ${options.type || "success"}`;
        const iconClass = options.type === "error" ? "fa-circle-xmark" : options.type === "warning" ? "fa-triangle-exclamation" : "fa-circle-check";
        icon.innerHTML = `<i class="fa-solid ${iconClass}" aria-hidden="true"></i>`;
        confirmBtn.textContent = options.confirmText || "OK";
        cancelBtn.textContent = options.cancelText || "Cancel";
        cancelBtn.style.display = options.confirm ? "inline-flex" : "none";
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("senku-modal-open");
        window.setTimeout(() => confirmBtn.focus(), 30);

        const close = () => {
            overlay.classList.remove("active");
            overlay.setAttribute("aria-hidden", "true");
            document.body.classList.remove("senku-modal-open");
        };
        confirmBtn.onclick = () => { close(); if(typeof options.onConfirm === "function") options.onConfirm(); };
        cancelBtn.onclick = () => { close(); if(typeof options.onCancel === "function") options.onCancel(); };
        overlay.onclick = event => { if(event.target === overlay && options.closeOnBackdrop !== false) close(); };
        const keyHandler = event => {
            if(event.key === "Escape") { close(); document.removeEventListener("keydown", keyHandler); }
        };
        document.addEventListener("keydown", keyHandler);
    };

    function createOverlay(){
        let overlay = document.getElementById("senkuSidebarOverlay");
        if(!overlay){
            overlay = document.createElement("div");
            overlay.id = "senkuSidebarOverlay";
            overlay.className = "senku-sidebar-overlay";
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    function setupInjectedSidebar(sidebar, menuButton){
        const overlay = createOverlay();
        const close = () => {
            sidebar.classList.remove("is-open", "mobile-open", "sidebar-open");
            overlay.classList.remove("is-visible");
            document.body.classList.remove("senku-sidebar-open");
            if(menuButton) menuButton.setAttribute("aria-expanded", "false");
        };
        const open = () => {
            sidebar.classList.add("is-open");
            overlay.classList.add("is-visible");
            document.body.classList.add("senku-sidebar-open");
            if(menuButton) menuButton.setAttribute("aria-expanded", "true");
        };
        if(menuButton){
            menuButton.addEventListener("click", () => sidebar.classList.contains("is-open") ? close() : open());
        }
        overlay.addEventListener("click", close);
        sidebar.querySelectorAll("nav a").forEach(link => link.addEventListener("click", () => { if(window.innerWidth <= 860) close(); }));
        window.addEventListener("resize", () => { if(window.innerWidth > 860) close(); }, { passive:true });
    }

    function logoutUser(){
        ["token", "currentUser"].forEach(key => {
            try { localStorage.removeItem(key); sessionStorage.removeItem(key); } catch(_) {}
        });
        window.location.href = "login.html";
    }

    function injectUserShell(){
        document.body.classList.add("senku-user-shell");
        if(currentFile === "dashboard.html"){
            const existing = document.getElementById("dashboardSidebar");
            if(existing){ existing.classList.add("senku-app-sidebar"); }
            return;
        }
        if(document.getElementById("senkuAppSidebar")) return;
        const aside = document.createElement("aside");
        aside.id = "senkuAppSidebar";
        aside.className = "senku-app-sidebar";
        aside.setAttribute("aria-label", "Senku Pay account navigation");
        aside.innerHTML = `${brandMarkup("Personal Account")}<nav>${navMarkup(userNav)}</nav><button type="button" class="senku-shell-logout" id="senkuGlobalLogout"><i class="fa-solid fa-right-from-bracket"></i><span>Logout</span></button>`;
        document.body.insertBefore(aside, document.body.firstChild);

        const main = document.querySelector("main");
        if(main) main.classList.add("senku-shell-main");
        const [title, subtitle] = titleMap[currentFile] || ["Senku Pay", "Secure digital payments"];
        const topbar = document.createElement("header");
        topbar.className = "senku-shell-topbar";
        topbar.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;min-width:0">
                <button type="button" class="senku-global-menu" id="senkuGlobalMenu" aria-label="Open account navigation" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
                <div style="min-width:0"><h1>${title}</h1><p>${subtitle}</p></div>
            </div>
            <div class="senku-topbar-actions">
                <a class="senku-topbar-pill" href="wallet.html"><i class="fa-solid fa-wallet"></i><span>Wallet</span></a>
                <a class="senku-topbar-pill" href="profile.html"><i class="fa-solid fa-user"></i><span>Account</span></a>
            </div>`;
        document.body.insertBefore(topbar, main || aside.nextSibling);
        const menu = document.getElementById("senkuGlobalMenu");
        setupInjectedSidebar(aside, menu);
        document.getElementById("senkuGlobalLogout")?.addEventListener("click", () => {
            window.showPopup({ type:"warning", title:"Logout", message:"Are you sure you want to log out of your Senku Pay account?", confirm:true, confirmText:"Logout", onConfirm:logoutUser });
        });
    }

    function normalizeAdminShell(){
        document.body.classList.add("senku-admin-shell");
        const sidebar = document.querySelector(".admin-sidebar");
        if(!sidebar) return;
        sidebar.id = "adminSidebar";
        sidebar.classList.add("senku-admin-sidebar");
        sidebar.innerHTML = `${brandMarkup("Administration Portal")}<nav>${navMarkup(adminNav)}</nav><button type="button" class="admin-logout" id="adminLogoutButton"><i class="fa-solid fa-right-from-bracket"></i><span>Logout</span></button>`;

        let overlay = document.getElementById("adminSidebarOverlay");
        if(!overlay){
            overlay = document.createElement("div");
            overlay.id = "adminSidebarOverlay";
            overlay.className = "admin-sidebar-overlay";
            sidebar.insertAdjacentElement("afterend", overlay);
        }
        let menu = document.getElementById("adminMobileMenuButton");
        if(!menu){
            menu = document.createElement("button");
            menu.type = "button";
            menu.id = "adminMobileMenuButton";
            menu.className = "mobile-menu-button";
            menu.setAttribute("aria-label", "Open navigation");
            menu.setAttribute("aria-expanded", "false");
            menu.innerHTML = '<i class="fa-solid fa-bars"></i>';
            const header = document.querySelector("main header,.page-header,.admin-topbar");
            if(header) header.insertBefore(menu, header.firstChild);
        }
    }

    function normalizeAgentShell(){
        document.body.classList.add("senku-agent-shell");
        const sidebar = document.querySelector(".agent-sidebar");
        if(sidebar) sidebar.classList.add("senku-agent-sidebar");
        document.querySelectorAll(".agent-brand h2").forEach(el => el.textContent = "Senku Pay");
    }

    function setupMotion(){
        const targets = document.querySelectorAll([
            ".feature-card", ".service-card", ".testimonial-card", ".stat-card", ".summary-card", ".info-card",
            ".settings-card", ".profile-card", ".wallet-main-card", ".form-card", ".history-card", ".quick-action",
            ".system-status-item", ".security-item", ".agent-box", ".transaction-box", ".sub-agent-card"
        ].join(","));
        if(!("IntersectionObserver" in window)) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting){ entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
            });
        }, { threshold:.08, rootMargin:"0px 0px -28px 0px" });
        targets.forEach((target, index) => {
            target.classList.add("senku-reveal");
            target.style.transitionDelay = `${Math.min(index % 6, 5) * 35}ms`;
            observer.observe(target);
        });
    }

    function setupBusyStates(){
        const busyPattern = /loading|processing|sending|verifying|saving|updating|submitting|creating|refreshing|connecting/i;
        const update = button => {
            if(!(button instanceof HTMLElement)) return;
            const text = (button.textContent || "").trim();
            const busy = button.getAttribute("aria-busy") === "true" || (button.matches(":disabled") && busyPattern.test(text));
            button.classList.toggle("senku-loading-button", busy);
        };
        document.querySelectorAll("button,[role='button']").forEach(update);
        const observer = new MutationObserver(records => records.forEach(record => update(record.target.closest?.("button,[role='button']") || record.target)));
        observer.observe(document.body, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:["disabled","aria-busy"] });
    }

    function initialize(){
        ensurePopup();
        if(userPages.has(currentFile)) injectUserShell();
        if(adminPage) normalizeAdminShell();
        if(agentPage) normalizeAgentShell();
        setupMotion();
        setupBusyStates();
        document.documentElement.classList.add("senku-ui-ready");
    }

    injectLoader();
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once:true });
    else initialize();
})();
