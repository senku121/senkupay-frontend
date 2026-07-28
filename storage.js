/* ======================================================================
   SENKU PAY — STORAGE HELPERS
   Authentication storage is used only for real session tokens/user state.
   No balances, transactions, users or business data are simulated here.
   ====================================================================== */

function formatMoney(amount){
    return new Intl.NumberFormat("en-US", { style:"currency", currency:"USD" }).format(Number(amount || 0));
}

function logout(){
    ["token","currentUser"].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
}

/* The original package included admin-sub-agents.html but referenced three
   files that were not present. This page now uses the existing live admin
   agents endpoint and the same authenticated session as the other admin pages. */
document.addEventListener("DOMContentLoaded", () => {
    if((location.pathname.split("/").pop() || "") !== "admin-sub-agents.html") return;

    const API_BASE_URL = "https://senkupay-api.onrender.com";
    const token = sessionStorage.getItem("adminToken") || localStorage.getItem("adminToken");
    const table = document.getElementById("subAgentTable");
    const search = document.getElementById("subAgentSearch");
    const refresh = document.getElementById("refreshSubAgents");
    const message = document.getElementById("subAgentsMessage");
    const total = document.getElementById("subAgentTotal");
    const active = document.getElementById("subAgentActive");
    const blocked = document.getElementById("subAgentBlocked");
    let records = [];

    const showMessage = (text, type="info") => {
        if(!message) return;
        message.hidden = false;
        message.className = `admin-agents-message show ${type}`;
        message.textContent = text;
    };
    const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#9c5b0d;",'"':"&quot;"}[c]));
    const statusOf = item => String(item.status || "active").toLowerCase();
    const normalize = payload => {
        const agents = Array.isArray(payload) ? payload : payload.agents || payload.data?.agents || payload.data || [];
        const direct = payload.subAgents || payload.subagents || payload.data?.subAgents || payload.data?.subagents;
        if(Array.isArray(direct)) return direct;
        return (Array.isArray(agents) ? agents : []).flatMap(agent => Array.isArray(agent.subAgents) ? agent.subAgents.map(sub => ({
            ...sub,
            parentAgent: sub.parentAgent || agent.name || agent.username || agent.id,
            parentAgentId: sub.parentAgentId || agent.id
        })) : []);
    };
    const render = () => {
        if(!table) return;
        const query = String(search?.value || "").trim().toLowerCase();
        const filtered = records.filter(item => [item.id,item.subAgentId,item.name,item.fullName,item.username,item.parentAgent,item.agentName,item.status]
            .map(v => String(v || "").toLowerCase()).join(" ").includes(query));
        table.innerHTML = "";
        if(!filtered.length){
            table.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#9ba4b1;padding:28px">No sub-agent accounts found.</td></tr>';
        } else {
            filtered.forEach(item => {
                const id = item.id || item.subAgentId || "—";
                const name = item.name || item.fullName || item.username || "Sub Agent";
                const username = item.username || item.login || "—";
                const parent = item.parentAgent || item.agentName || item.parent || "Not assigned";
                const status = statusOf(item);
                const created = item.createdAt || item.registeredAt || item.date;
                const createdText = created ? new Date(created).toLocaleString() : "—";
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${escapeHTML(id)}</td>
                    <td><div class="agent-identity"><div class="agent-avatar-small">${escapeHTML(name.charAt(0).toUpperCase())}</div><div><strong>${escapeHTML(name)}</strong><span>${escapeHTML(username)}</span></div></div></td>
                    <td>${escapeHTML(parent)}</td>
                    <td>${escapeHTML(formatMoney(item.balance || item.walletBalance || 0))}</td>
                    <td><span class="agent-status ${escapeHTML(status)}">${escapeHTML(item.status || status)}</span></td>
                    <td>${escapeHTML(createdText)}</td>
                    <td><a class="manage-sub-agent" href="admin-agents.html">Manage</a></td>`;
                table.appendChild(row);
            });
        }
        if(total) total.textContent = String(records.length);
        if(active) active.textContent = String(records.filter(item => ["active","enabled","verified"].includes(statusOf(item))).length);
        if(blocked) blocked.textContent = String(records.filter(item => ["blocked","disabled","suspended","inactive"].includes(statusOf(item))).length);
    };
    const load = async () => {
        if(!token){ location.replace("admin-login.html"); return; }
        if(table) table.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px"><i class="fa-solid fa-spinner fa-spin"></i> Loading live sub-agent accounts…</td></tr>';
        if(refresh){ refresh.disabled = true; refresh.setAttribute("aria-busy","true"); }
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/agents`, { headers:{ Accept:"application/json", Authorization:`Bearer ${token}` } });
            if(response.status === 401 || response.status === 403){
                ["adminToken","currentAdmin","currentUser","adminRememberDevice"].forEach(key => { localStorage.removeItem(key); sessionStorage.removeItem(key); });
                location.replace("admin-login.html");
                return;
            }
            const data = await response.json().catch(() => ({}));
            if(!response.ok) throw new Error(data.message || "Unable to load sub-agent accounts.");
            records = normalize(data);
            if(message) message.hidden = true;
            render();
        } catch(error){
            records = [];
            render();
            showMessage(error.message || "Unable to connect to the live agent service.", "error");
        } finally {
            if(refresh){ refresh.disabled = false; refresh.removeAttribute("aria-busy"); }
        }
    };
    search?.addEventListener("input", render);
    refresh?.addEventListener("click", load);
    load();
});
