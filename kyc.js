document.addEventListener("DOMContentLoaded", async () => {

const API_BASE_URL = "https://senkupay-api.onrender.com";
const STATUS_ENDPOINT = `${API_BASE_URL}/api/user/kyc/status`;
const SUBMIT_ENDPOINT = `${API_BASE_URL}/api/user/kyc/submit`;
const MAX_FILE_SIZE = 5 * 1024 * 1024;



/*==================================
      SHARED SHELL LAYOUT GUARD
==================================*/

function installSharedShellLayoutGuard(mainSelector) {

const body = document.body;
const root = document.documentElement;
const main = document.querySelector(mainSelector);

if (!body || !main) {
return;
}

const sidebarSelectors = [
".sidebar",
".app-sidebar",
".senku-sidebar",
".senku-app-sidebar",
"[data-app-sidebar]",
"[data-shell-sidebar]"
];

const topbarSelectors = [
".topbar",
".app-topbar",
".senku-topbar",
".senku-app-topbar",
"[data-app-topbar]",
"[data-shell-topbar]"
];

let sidebarDecision = null;
let topbarDecision = null;
let animationFrame = 0;

function firstElement(selectors) {
for (const selector of selectors) {
const element = document.querySelector(selector);
if (element) {
return element;
}
}
return null;
}

function scheduleSync() {
if (animationFrame) {
cancelAnimationFrame(animationFrame);
}
animationFrame = requestAnimationFrame(syncLayout);
}

function syncLayout() {
animationFrame = 0;

const desktop = window.matchMedia("(min-width: 901px)").matches;
const sidebar = firstElement(sidebarSelectors);

if (desktop && sidebar) {
const sidebarRect = sidebar.getBoundingClientRect();
const sidebarRight = Math.max(
0,
Math.min(window.innerWidth, sidebarRect.right)
);

if (sidebarRect.width >= 160 && sidebarRight > 0) {
root.style.setProperty(
"--senku-page-sidebar-width",
`${Math.ceil(sidebarRight)}px`
);

if (sidebarDecision === null) {
const mainRect = main.getBoundingClientRect();
sidebarDecision = mainRect.left < sidebarRight + 12;
}

body.classList.toggle(
"senku-page-sidebar-offset",
sidebarDecision === true
);
} else {
body.classList.remove("senku-page-sidebar-offset");
sidebarDecision = null;
}
} else {
body.classList.remove("senku-page-sidebar-offset");
sidebarDecision = null;
}

const topbar = firstElement(topbarSelectors);

if (topbar) {
const style = window.getComputedStyle(topbar);
const topbarRect = topbar.getBoundingClientRect();
const fixed = style.position === "fixed";

if (fixed && topbarRect.height > 40 && topbarRect.bottom > 0) {
root.style.setProperty(
"--senku-page-topbar-height",
`${Math.ceil(topbarRect.height)}px`
);

if (topbarDecision === null) {
const firstSection = main.querySelector("section");
const firstTop = firstSection
? firstSection.getBoundingClientRect().top
: main.getBoundingClientRect().top;

topbarDecision = firstTop < topbarRect.bottom + 14;
}

body.classList.toggle(
"senku-page-fixed-topbar",
topbarDecision === true
);
} else {
body.classList.remove("senku-page-fixed-topbar");
topbarDecision = null;
}
} else {
body.classList.remove("senku-page-fixed-topbar");
topbarDecision = null;
}
}

const observer = new MutationObserver(scheduleSync);
observer.observe(document.body, {
childList: true,
subtree: true
});

window.addEventListener(
"resize",
() => {
body.classList.remove("senku-page-sidebar-offset");
body.classList.remove("senku-page-fixed-topbar");
sidebarDecision = null;
topbarDecision = null;
scheduleSync();
},
{ passive: true }
);

scheduleSync();
window.setTimeout(scheduleSync, 120);
window.setTimeout(scheduleSync, 700);
}


installSharedShellLayoutGuard(".kyc-container");

const token =
sessionStorage.getItem("token") ||
localStorage.getItem("token");

if (!token) {
window.location.replace("login.html");
return;
}

const message = document.getElementById("kycMessage");
const badge = document.getElementById("kycStatusBadge");
const documentTypeText = document.getElementById("kycDocumentType");
const countryText = document.getElementById("kycCountry");
const submittedText = document.getElementById("kycSubmittedAt");
const verifiedText = document.getElementById("kycVerifiedAt");
const reasonBox = document.getElementById("kycReasonBox");
const reasonTitle = document.getElementById("kycReasonTitle");
const reasonText = document.getElementById("kycReasonText");
const uploadCard = document.getElementById("kycUploadCard");
const form = document.getElementById("kycForm");
const formTitle = document.getElementById("kycFormTitle");
const documentType = document.getElementById("documentType");
const documentCountry = document.getElementById("documentCountry");
const idFront = document.getElementById("idFront");
const idBack = document.getElementById("idBack");
const idBackBox = document.getElementById("idBackBox");
const selfie = document.getElementById("selfie");
const proof = document.getElementById("proofOfAddress");
const consent = document.getElementById("kycConsent");
const submit = document.getElementById("submitKycBtn");
const documentList = document.getElementById("documentList");

function showMessage(text, type = "info") {
message.hidden = false;
message.className = `kyc-message ${type}`;
message.textContent = String(text || "");
window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearAuth() {
["token", "currentUser"].forEach((key) => {
sessionStorage.removeItem(key);
localStorage.removeItem(key);
});
}

async function request(url, options = {}) {
const response = await fetch(url, {
...options,
headers: {
Accept: "application/json",
Authorization: `Bearer ${token}`,
...(options.headers || {})
}
});

let data = {};
const contentType = response.headers.get("content-type") || "";

if (contentType.includes("application/json")) {
try {
data = await response.json();
} catch {
data = {};
}
} else {
const text = await response.text();
data = { message: text || "Unexpected server response." };
}

if (response.status === 401 || response.status === 403) {
clearAuth();
window.location.replace("login.html");
throw new Error("Session expired.");
}

if (!response.ok) {
throw new Error(data.message || "Request failed.");
}

return data;
}

function escapeHTML(value) {
return String(value ?? "")
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;")
.replaceAll('"', "&quot;")
.replaceAll("'", "&#39;");
}

function formatDate(value) {
if (!value) {
return "--";
}

const date = new Date(value);
return Number.isNaN(date.getTime())
? "--"
: date.toLocaleString();
}

function pretty(value) {
return String(value || "--")
.replaceAll("_", " ")
.toLowerCase()
.replace(/\b\w/g, (character) => character.toUpperCase());
}

function updateFileName(input, id, emptyText) {
const element = document.getElementById(id);
const file = input.files?.[0];
element.textContent = file?.name || emptyText;
}

function syncDocumentType() {
const passport = documentType.value === "PASSPORT";
idBackBox.classList.toggle("hidden", passport);
idBack.required = !passport;
document.getElementById("idFrontLabel").textContent = passport
? "Passport Photo Page"
: "Document Front";

if (passport) {
idBack.value = "";
updateFileName(idBack, "idBackName", "Choose file");
}
}

[
[idFront, "idFrontName", "Choose file"],
[idBack, "idBackName", "Choose file"],
[selfie, "selfieName", "Choose file"],
[proof, "proofOfAddressName", "Optional"]
].forEach(([input, id, emptyText]) => {
input.addEventListener("change", () => {
updateFileName(input, id, emptyText);
});
});

documentType.addEventListener("change", syncDocumentType);

function renderDocuments(documents = []) {
if (!Array.isArray(documents) || documents.length === 0) {
documentList.innerHTML =
'<p class="empty-text">No documents submitted yet.</p>';
return;
}

documentList.innerHTML = documents
.map((document) => {
const type = escapeHTML(pretty(document.type));
const fileName = escapeHTML(document.fileName || "Uploaded file");
const uploadedAt = escapeHTML(formatDate(document.uploadedAt));

return `
<div class="document-item">
<i class="fa-solid fa-file-shield"></i>
<div>
<strong>${type}</strong>
<span>${fileName} · ${uploadedAt}</span>
</div>
</div>
`;
})
.join("");
}

function renderStatus(kyc = {}) {
const status = String(kyc.status || "NOT_SUBMITTED").toUpperCase();
const labels = {
NOT_SUBMITTED: "Not Submitted",
PENDING: "Pending Review",
VERIFIED: "Verified",
APPROVED: "Verified",
REJECTED: "Rejected",
REVERIFY_REQUIRED: "Reverification Required",
REVERIFICATION_REQUIRED: "Reverification Required",
REVOKED: "Revoked"
};

badge.textContent = labels[status] || pretty(status);
badge.className = `status-badge ${status.toLowerCase()}`;
documentTypeText.textContent = pretty(kyc.documentType);
countryText.textContent = kyc.documentCountry || "--";
submittedText.textContent = formatDate(kyc.submittedAt);
verifiedText.textContent = formatDate(kyc.verifiedAt);
renderDocuments(kyc.documents || []);

const reason = kyc.rejectionReason || kyc.reverificationReason;

if (reason) {
reasonBox.hidden = false;
reasonTitle.textContent = kyc.rejectionReason
? "Rejection Reason"
: "Reverification Reason";
reasonText.textContent = String(reason);
} else {
reasonBox.hidden = true;
reasonText.textContent = "";
}

if (["PENDING", "VERIFIED", "APPROVED"].includes(status)) {
uploadCard.hidden = true;
} else {
uploadCard.hidden = false;
formTitle.textContent = status === "REJECTED"
? "Resubmit Verification Documents"
: ["REVERIFY_REQUIRED", "REVERIFICATION_REQUIRED", "REVOKED"].includes(status)
? "Submit New Verification Documents"
: "Submit Verification Documents";
}
}

async function loadStatus() {
try {
const data = await request(STATUS_ENDPOINT);
renderStatus(data.kyc || data.verification || data.data || {});
} catch (error) {
console.error("KYC status error:", error);
showMessage(error.message || "Unable to load KYC status.", "error");
}
}

function validateFile(file, label, allowedTypes) {
if (!file) {
return `${label} is required.`;
}

if (file.size > MAX_FILE_SIZE) {
return `${label} must be 5 MB or smaller.`;
}

if (!allowedTypes.includes(file.type)) {
return `${label} must be a JPG, PNG${allowedTypes.includes("application/pdf") ? " or PDF" : ""}.`;
}

return null;
}

form.addEventListener("submit", async (event) => {
event.preventDefault();

if (!documentType.value) {
showMessage("Select a document type.", "error");
return;
}

if (!documentCountry.value.trim()) {
showMessage("Enter the issuing country.", "error");
return;
}

const documentTypes = ["image/jpeg", "image/png", "application/pdf"];
const imageTypes = ["image/jpeg", "image/png"];

let validationError = validateFile(
idFront.files[0],
"The front side of your identity document",
documentTypes
);

if (!validationError && documentType.value !== "PASSPORT") {
validationError = validateFile(
idBack.files[0],
"The back side of your identity document",
documentTypes
);
}

if (!validationError) {
validationError = validateFile(
selfie.files[0],
"The selfie",
imageTypes
);
}

if (!validationError && proof.files[0]) {
validationError = validateFile(
proof.files[0],
"The proof of address",
documentTypes
);
}

if (validationError) {
showMessage(validationError, "error");
return;
}

if (!consent.checked) {
showMessage(
"Confirm that the documents and information are accurate.",
"error"
);
return;
}

const formData = new FormData();
formData.append("documentType", documentType.value);
formData.append("documentCountry", documentCountry.value.trim());
formData.append("idFront", idFront.files[0]);

if (idBack.files[0]) {
formData.append("idBack", idBack.files[0]);
}

formData.append("selfie", selfie.files[0]);

if (proof.files[0]) {
formData.append("proofOfAddress", proof.files[0]);
}

submit.disabled = true;
submit.innerHTML =
'<i class="fa-solid fa-spinner fa-spin"></i><span>Uploading...</span>';

try {
const response = await request(SUBMIT_ENDPOINT, {
method: "POST",
body: formData
});

showMessage(
response.message || "KYC documents submitted successfully.",
"success"
);

form.reset();
syncDocumentType();
[
[idFront, "idFrontName", "Choose file"],
[idBack, "idBackName", "Choose file"],
[selfie, "selfieName", "Choose file"],
[proof, "proofOfAddressName", "Optional"]
].forEach(([input, id, emptyText]) => {
updateFileName(input, id, emptyText);
});

await loadStatus();
} catch (error) {
console.error("KYC submission error:", error);
showMessage(error.message || "Unable to submit KYC documents.", "error");
} finally {
submit.disabled = false;
submit.innerHTML =
'<i class="fa-solid fa-cloud-arrow-up"></i><span>Submit KYC Documents</span>';
}
});

syncDocumentType();
await loadStatus();
});
