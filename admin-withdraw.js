/*==================================================
                SENKU PAY
       ADMIN USER WITHDRAWAL REQUESTS
==================================================*/

document.addEventListener(
"DOMContentLoaded",
async () => {

const API_BASE_URL =
"https://senkupay-api.onrender.com";

const ADMIN_WITHDRAWS_ENDPOINT =
`${API_BASE_URL}/api/admin/withdraws`;

const PAGE_SIZE = 20;

let currentPage = 1;
let totalPages = 1;
let selectedStatus = "";
let rejectWithdrawalId = null;


/*==================================
            ADMIN SESSION
==================================*/

function getAdminToken() {

return (
sessionStorage.getItem("adminToken") ||
localStorage.getItem("adminToken")
);

}


function getAdmin() {

const raw =
sessionStorage.getItem("currentAdmin") ||
localStorage.getItem("currentAdmin") ||
sessionStorage.getItem("currentUser") ||
localStorage.getItem("currentUser");

if (!raw) {
return {};
}

try {
return JSON.parse(raw);
} catch {
return {};
}

}


function logoutAdmin() {

[
"adminToken",
"currentAdmin",
"currentUser",
"adminRememberDevice"
].forEach((key) => {

sessionStorage.removeItem(key);
localStorage.removeItem(key);

});

window.location.href =
"admin-login.html";

}


const token =
getAdminToken();

if (!token) {

logoutAdmin();
return;

}


/*==================================
                ELEMENTS
==================================*/

const messageBox =
document.getElementById("adminMessage");

const listElement =
document.getElementById("withdrawalList");

const statusFilter =
document.getElementById("statusFilter");

const refreshButton =
document.getElementById("refreshButton");

const previousPage =
document.getElementById("previousPage");

const nextPage =
document.getElementById("nextPage");

const pageText =
document.getElementById("pageText");

const totalRequests =
document.getElementById("totalRequests");

const currentPageSummary =
document.getElementById("currentPageSummary");

const selectedStatusSummary =
document.getElementById("selectedStatusSummary");

const lastUpdated =
document.getElementById("lastUpdated");

const logoutButton =
document.getElementById("adminLogoutButton");

const adminName =
document.getElementById("adminName");

const adminRole =
document.getElementById("adminRole");

const adminIcon =
document.getElementById("adminIcon");

const mobileMenuButton =
document.getElementById("adminMobileMenuButton");

const sidebarOverlay =
document.getElementById("adminSidebarOverlay");

const rejectModal =
document.getElementById("rejectModal");

const rejectReason =
document.getElementById("rejectReason");

const confirmRejectButton =
document.getElementById("confirmRejectButton");


/*==================================
                HELPERS
==================================*/

function money(value) {

return new Intl.NumberFormat(
"en-US",
{
style:
"currency",
currency:
"USD"
}
).format(
Number(value || 0)
);

}


function escapeHTML(value) {

return String(value ?? "")
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;")
.replaceAll('"', "&quot;")
.replaceAll("'", "&#039;");

}


function normalizeStatus(value) {

return String(value || "")
.trim()
.toUpperCase();

}


function statusClass(value) {

const status =
normalizeStatus(value)
.toLowerCase();

return [
"pending",
"processing",
"review_required",
"completed",
"failed",
"rejected"
].includes(status)
? status
: "pending";

}


function formatDate(value) {

const date =
new Date(value);

return Number.isNaN(date.getTime())
? "--"
: date.toLocaleString();

}


function showMessage(
text,
type = "info"
) {

messageBox.hidden = false;
messageBox.className =
`admin-message ${type}`;
messageBox.textContent =
String(text || "");

}


function hideMessage() {

messageBox.hidden = true;
messageBox.className =
"admin-message";
messageBox.textContent = "";

}


/*==================================
                API
==================================*/

async function api(
url,
options = {}
) {

const response =
await fetch(
url,
{
...options,
headers: {
Accept:
"application/json",
Authorization:
`Bearer ${token}`,
...(options.headers || {})
}
}
);

if (
response.status === 401 ||
response.status === 403
) {

logoutAdmin();

throw new Error(
"Administrator session expired."
);

}

const contentType =
response.headers.get(
"content-type"
) || "";

let data = {};

if (
contentType.includes(
"application/json"
)
) {

data =
await response.json();

} else {

const text =
await response.text();

data = {
message:
text ||
"Unexpected server response."
};

}

if (!response.ok) {

throw new Error(
data.message ||
"Administrator request failed."
);

}

return data;

}


/*==================================
            ADMIN PROFILE
==================================*/

function populateAdminProfile() {

const admin =
getAdmin();

const name =
admin.fullName ||
admin.name ||
admin.username ||
"Administrator";

const role =
String(
admin.role ||
"SUPER_ADMIN"
)
.replaceAll("_", " ");

adminName.textContent =
name;

adminRole.textContent =
`${role} • Payout Access`;

adminIcon.textContent =
String(name)
.trim()
.charAt(0)
.toUpperCase() || "A";

}


/*==================================
            REQUEST RENDERING
==================================*/

function renderRequests(
withdrawals
) {

listElement.replaceChildren();

if (
!Array.isArray(withdrawals) ||
withdrawals.length === 0
) {

listElement.innerHTML = `
<div class="empty-admin-state">
<i class="fa-solid fa-inbox"></i>
<h3>No matching withdrawals</h3>
<p>There are no requests in this status.</p>
</div>
`;

return;

}

withdrawals.forEach(
(item) => {

const status =
normalizeStatus(
item.status
);

const userName =
item.user?.username ||
"Unknown user";

const userEmail =
item.user?.email ||
"Email unavailable";

const cardLabel =
item.linkedAccountLast4
? `•••• ${item.linkedAccountLast4}`
: (
item.account ||
"Linked card"
);

const providerReference =
item.providerTransactionId ||
"Not submitted";

const request =
document.createElement("article");

request.className =
"request-item";

request.innerHTML = `
<div class="request-top">
<div class="request-user">
<div class="user-avatar">${escapeHTML(String(userName).charAt(0).toUpperCase() || "U")}</div>
<div>
<h3>${escapeHTML(userName)}</h3>
<p>${escapeHTML(userEmail)}</p>
</div>
</div>
<span class="status-pill ${statusClass(status)}">${escapeHTML(status || "PENDING")}</span>
</div>

<div class="request-details">
<div class="detail-box">
<span>Amount</span>
<strong>${money(item.amount)}</strong>
</div>
<div class="detail-box">
<span>Destination</span>
<strong>${escapeHTML(cardLabel)}</strong>
</div>
<div class="detail-box">
<span>Requested</span>
<strong>${escapeHTML(formatDate(item.createdAt))}</strong>
</div>
<div class="detail-box">
<span>Provider Status</span>
<strong>${escapeHTML(item.providerStatus || "Not submitted")}</strong>
</div>
<div class="detail-box">
<span>Provider Transaction</span>
<strong title="${escapeHTML(providerReference)}">${escapeHTML(providerReference)}</strong>
</div>
</div>

${item.lastProviderError ? `<div class="request-error">${escapeHTML(item.lastProviderError)}</div>` : ""}

<div class="request-actions"></div>
`;

const actions =
request.querySelector(
".request-actions"
);

if (status === "PENDING") {

const rejectButton =
document.createElement("button");

rejectButton.type =
"button";

rejectButton.className =
"danger-button";

rejectButton.innerHTML = `
<i class="fa-solid fa-ban"></i>
<span>Reject</span>
`;

rejectButton.addEventListener(
"click",
() => openRejectModal(
item.id
)
);

const approveButton =
document.createElement("button");

approveButton.type =
"button";

approveButton.className =
"primary-button";

approveButton.innerHTML = `
<i class="fa-solid fa-check"></i>
<span>Approve Push to Card</span>
`;

approveButton.addEventListener(
"click",
() => approveWithdrawal(
item.id,
approveButton
)
);

actions.append(
rejectButton,
approveButton
);

}

if (
[
"PROCESSING",
"REVIEW_REQUIRED"
].includes(status) &&
item.providerTransactionId
) {

const reconcileButton =
document.createElement("button");

reconcileButton.type =
"button";

reconcileButton.className =
"secondary-button";

reconcileButton.innerHTML = `
<i class="fa-solid fa-rotate"></i>
<span>Reconcile CentryOS</span>
`;

reconcileButton.addEventListener(
"click",
() => reconcileWithdrawal(
item.id,
reconcileButton
)
);

actions.appendChild(
reconcileButton
);

}

if (!actions.children.length) {

const text =
document.createElement("span");

text.style.color =
"#9ca3af";

text.style.fontSize =
"13px";

text.textContent =
"Final status—no manual action available.";

actions.appendChild(
text
);

}

listElement.appendChild(
request
);

}
);

}


/*==================================
            LOAD REQUESTS
==================================*/

async function loadRequests() {

hideMessage();

listElement.innerHTML = `
<div class="empty-admin-state">
<i class="fa-solid fa-spinner fa-spin"></i>
<h3>Loading requests</h3>
<p>Checking the Senku Pay payout queue.</p>
</div>
`;

try {

const params =
new URLSearchParams({

page:
String(currentPage),

limit:
String(PAGE_SIZE)

});

if (selectedStatus) {

params.set(
"status",
selectedStatus
);

}

const response =
await api(
`${ADMIN_WITHDRAWS_ENDPOINT}?${params.toString()}`
);

/*
 * Compatibility:
 *
 * Older adminWithdrawController versions returned
 * a bare array:
 *   [ withdrawal, ... ]
 *
 * The current CentryOS controller returns:
 *   {
 *     success,
 *     total,
 *     page,
 *     pages,
 *     withdrawals
 *   }
 *
 * Supporting both shapes prevents a valid array
 * response from being displayed as zero requests.
 */
const withdrawals =
Array.isArray(response)
? response
: (
Array.isArray(response.withdrawals)
? response.withdrawals
: Array.isArray(response.requests)
? response.requests
: Array.isArray(response.data)
? response.data
: []
);

const responseTotal =
Array.isArray(response)
? withdrawals.length
: Number(
response.total ??
withdrawals.length
);

totalPages =
Array.isArray(response)
? 1
: Math.max(
Number(response.pages || 1),
1
);

currentPage =
Array.isArray(response)
? 1
: Math.min(
Number(response.page || currentPage),
totalPages
);

renderRequests(
withdrawals
);

totalRequests.textContent =
String(
responseTotal
);

console.info(
"Admin withdrawals API:",
{
apiVersion:
response.apiVersion ||
"LEGACY_ARRAY_OR_UNKNOWN",
total:
responseTotal,
returned:
withdrawals.length
}
);

currentPageSummary.textContent =
String(currentPage);

selectedStatusSummary.textContent =
selectedStatus
? selectedStatus.replaceAll("_", " ")
: "All";

lastUpdated.textContent =
new Date().toLocaleTimeString();

pageText.textContent =
`Page ${currentPage} of ${totalPages}`;

previousPage.disabled =
currentPage <= 1;

nextPage.disabled =
currentPage >= totalPages;

} catch (error) {

console.error(
"Load admin withdrawals error:",
error
);

showMessage(
error.message ||
"Unable to load withdrawals.",
"error"
);

listElement.innerHTML = `
<div class="empty-admin-state">
<i class="fa-solid fa-triangle-exclamation"></i>
<h3>Unable to load requests</h3>
<p>${escapeHTML(error.message || "Please try again.")}</p>
</div>
`;

}

}


/*==================================
            APPROVE
==================================*/

async function approveWithdrawal(
id,
button
) {

const confirmed =
window.confirm(
"Approve this withdrawal and submit the push-to-card payout to CentryOS?"
);

if (!confirmed) {
return;
}

button.disabled = true;
button.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
<span>Submitting...</span>
`;

try {

const response =
await api(
`${ADMIN_WITHDRAWS_ENDPOINT}/${encodeURIComponent(id)}/approve`,
{
method:
"POST",
headers: {
"Content-Type":
"application/json"
}
}
);

showMessage(
response.message ||
"Payout submitted to CentryOS.",
"success"
);

await loadRequests();

} catch (error) {

console.error(
"Approve withdrawal error:",
error
);

showMessage(
error.message ||
"Unable to approve the withdrawal.",
"error"
);

button.disabled = false;
button.innerHTML = `
<i class="fa-solid fa-check"></i>
<span>Approve Push to Card</span>
`;

}

}


/*==================================
            REJECT
==================================*/

function openRejectModal(id) {

rejectWithdrawalId = id;
rejectReason.value = "";
rejectModal.hidden = false;
rejectReason.focus();

}


function closeRejectModal() {

rejectWithdrawalId = null;
rejectModal.hidden = true;
rejectReason.value = "";

}


document
.querySelectorAll(
"[data-close-modal]"
)
.forEach(
(element) => {

element.addEventListener(
"click",
closeRejectModal
);

}
);


confirmRejectButton.addEventListener(
"click",
async () => {

const reason =
String(
rejectReason.value || ""
)
.trim();

if (!reason) {

showMessage(
"Enter a rejection reason.",
"error"
);

return;

}

if (!rejectWithdrawalId) {
return;
}

confirmRejectButton.disabled =
true;

confirmRejectButton.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
<span>Rejecting...</span>
`;

try {

const response =
await api(
`${ADMIN_WITHDRAWS_ENDPOINT}/${encodeURIComponent(rejectWithdrawalId)}/reject`,
{
method:
"POST",
headers: {
"Content-Type":
"application/json"
},
body:
JSON.stringify({
reason
})
}
);

closeRejectModal();

showMessage(
response.message ||
"Withdrawal rejected and funds returned.",
"success"
);

await loadRequests();

} catch (error) {

console.error(
"Reject withdrawal error:",
error
);

showMessage(
error.message ||
"Unable to reject the withdrawal.",
"error"
);

} finally {

confirmRejectButton.disabled =
false;

confirmRejectButton.innerHTML = `
<i class="fa-solid fa-ban"></i>
<span>Reject and Return Funds</span>
`;

}

}
);


/*==================================
            RECONCILE
==================================*/

async function reconcileWithdrawal(
id,
button
) {

button.disabled = true;
button.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
<span>Checking...</span>
`;

try {

const response =
await api(
`${ADMIN_WITHDRAWS_ENDPOINT}/${encodeURIComponent(id)}/reconcile`,
{
method:
"POST",
headers: {
"Content-Type":
"application/json"
}
}
);

showMessage(
`${response.message || "Reconciled."} Outcome: ${response.outcome || "unknown"}`,
"success"
);

await loadRequests();

} catch (error) {

console.error(
"Reconcile withdrawal error:",
error
);

showMessage(
error.message ||
"Unable to reconcile the payout.",
"error"
);

button.disabled = false;
button.innerHTML = `
<i class="fa-solid fa-rotate"></i>
<span>Reconcile CentryOS</span>
`;

}

}


/*==================================
          FILTER / PAGINATION
==================================*/

statusFilter.addEventListener(
"change",
() => {

selectedStatus =
statusFilter.value;

currentPage = 1;

loadRequests();

}
);


refreshButton.addEventListener(
"click",
loadRequests
);


previousPage.addEventListener(
"click",
() => {

if (currentPage > 1) {

currentPage -= 1;
loadRequests();

}

}
);


nextPage.addEventListener(
"click",
() => {

if (currentPage < totalPages) {

currentPage += 1;
loadRequests();

}

}
);


/*==================================
              SIDEBAR
==================================*/

mobileMenuButton.addEventListener(
"click",
() => {

document.body.classList.toggle(
"sidebar-open"
);

}
);


sidebarOverlay.addEventListener(
"click",
() => {

document.body.classList.remove(
"sidebar-open"
);

}
);


/*==================================
              LOGOUT
==================================*/

logoutButton.addEventListener(
"click",
logoutAdmin
);


/*==================================
              INITIALIZE
==================================*/

populateAdminProfile();
await loadRequests();

}
);
