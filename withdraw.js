/*==================================================
                SENKU PAY
       PUSH-TO-CARD WITHDRAW PAGE
==================================================*/

document.addEventListener(
"DOMContentLoaded",
async () => {


/*==================================
   SHARED SHELL GEOMETRY LAYOUT GUARD
   Detects the fixed top bar/sidebar by
   position and size instead of class name.
==================================*/

function installSharedShellLayoutGuard(mainSelector) {

const body = document.body;
const root = document.documentElement;
const main = document.querySelector(mainSelector);

if (!body || !main) {
return;
}

const TOPBAR_CLASS = "senku-page-fixed-topbar";
const SIDEBAR_CLASS = "senku-page-sidebar-offset";
const PROVISIONAL_CLASS = "senku-page-shell-provisional";
const provisionalDeadline = Date.now() + 1800;

let animationFrame = 0;

function isVisible(element, style, rect) {

return (
style.display !== "none" &&
style.visibility !== "hidden" &&
Number(style.opacity || 1) !== 0 &&
rect.width > 0 &&
rect.height > 0
);

}

function outsidePageContent(element) {

return (
element !== main &&
!main.contains(element)
);

}

function shellCandidates() {

return Array.from(
document.body.querySelectorAll("*")
).filter(outsidePageContent);

}

function findTopbar(candidates) {

const minimumWidth =
Math.max(240, window.innerWidth * 0.58);

const matches = [];

for (const element of candidates) {

const style =
window.getComputedStyle(element);

if (
style.position !== "fixed" &&
style.position !== "sticky"
) {
continue;
}

const rect =
element.getBoundingClientRect();

if (!isVisible(element, style, rect)) {
continue;
}

const touchesTop =
rect.top <= 3 &&
rect.bottom >= 40;

const topbarShape =
rect.height >= 44 &&
rect.height <= 140 &&
rect.width >= minimumWidth &&
rect.right >= window.innerWidth * 0.86;

if (touchesTop && topbarShape) {

matches.push({
element,
rect,
zIndex:
Number.parseInt(style.zIndex, 10) || 0
});

}

}

matches.sort(
(a, b) =>
(b.zIndex - a.zIndex) ||
(b.rect.width - a.rect.width) ||
(a.rect.height - b.rect.height)
);

return matches[0] || null;

}

function findSidebar(candidates) {

if (!window.matchMedia("(min-width: 901px)").matches) {
return null;
}

const matches = [];

for (const element of candidates) {

const style =
window.getComputedStyle(element);

if (
style.position !== "fixed" &&
style.position !== "sticky"
) {
continue;
}

const rect =
element.getBoundingClientRect();

if (!isVisible(element, style, rect)) {
continue;
}

const sidebarShape =
rect.left <= 3 &&
rect.width >= 170 &&
rect.width <= 380 &&
rect.height >= window.innerHeight * 0.62 &&
rect.bottom >= window.innerHeight * 0.72;

if (sidebarShape) {

matches.push({
element,
rect,
zIndex:
Number.parseInt(style.zIndex, 10) || 0
});

}

}

matches.sort(
(a, b) =>
(b.zIndex - a.zIndex) ||
(b.rect.height - a.rect.height) ||
(b.rect.width - a.rect.width)
);

return matches[0] || null;

}

function firstContentTop() {

const firstContent =
main.querySelector(
":scope > section, :scope > .kyc-message, :scope > .withdraw-message"
);

return (
firstContent || main
).getBoundingClientRect().top;

}

function scheduleSync() {

if (animationFrame) {
cancelAnimationFrame(animationFrame);
}

animationFrame =
requestAnimationFrame(syncLayout);

}

function syncLayout() {

animationFrame = 0;

/*
 * Remove only our temporary offsets before measuring.
 * This lets us detect whether responsive.css already
 * reserved space and prevents double offsets.
 */
body.classList.remove(
TOPBAR_CLASS,
SIDEBAR_CLASS,
PROVISIONAL_CLASS
);

void main.offsetWidth;

const candidates =
shellCandidates();

const topbar =
findTopbar(candidates);

const sidebar =
findSidebar(candidates);

if (sidebar) {

const sidebarRight =
Math.max(
0,
Math.min(
window.innerWidth,
sidebar.rect.right
)
);

root.style.setProperty(
"--senku-page-sidebar-width",
`${Math.ceil(sidebarRight)}px`
);

const mainLeft =
main.getBoundingClientRect().left;

if (mainLeft < sidebarRight + 12) {
body.classList.add(SIDEBAR_CLASS);
}

}

if (topbar) {

const topbarBottom =
Math.max(
0,
Math.min(
window.innerHeight,
topbar.rect.bottom
)
);

root.style.setProperty(
"--senku-page-topbar-height",
`${Math.ceil(topbarBottom)}px`
);

const overlaps =
firstContentTop() < topbarBottom + 14;

if (overlaps) {
body.classList.add(TOPBAR_CLASS);
}

} else if (Date.now() < provisionalDeadline) {

/*
 * Prevent the first card from flashing beneath a shell
 * that is injected shortly after DOMContentLoaded.
 */
body.classList.add(PROVISIONAL_CLASS);

}

}

const observer =
new MutationObserver(scheduleSync);

observer.observe(
document.body,
{
childList: true,
subtree: true
}
);

window.addEventListener(
"resize",
scheduleSync,
{ passive: true }
);

window.addEventListener(
"orientationchange",
scheduleSync,
{ passive: true }
);

window.addEventListener(
"load",
scheduleSync,
{ once: true }
);

if (window.visualViewport) {

window.visualViewport.addEventListener(
"resize",
scheduleSync,
{ passive: true }
);

}

scheduleSync();

[
60,
180,
450,
900,
1800,
2600
].forEach(
(delay) =>
window.setTimeout(
scheduleSync,
delay
)
);

}

installSharedShellLayoutGuard(".withdraw-container");

const API_BASE_URL =
"https://senkupay-api.onrender.com";

const WALLET_ENDPOINT =
`${API_BASE_URL}/api/wallet`;

const LINK_WIDGET_ENDPOINT =
`${API_BASE_URL}/api/centryos/linked-account-widget`;

const LINKED_CARDS_ENDPOINT =
`${API_BASE_URL}/api/centryos/linked-accounts/USD?accountType=card`;

const WITHDRAW_ENDPOINT =
`${API_BASE_URL}/api/withdraw`;

const CREATE_WITHDRAW_ENDPOINT =
`${API_BASE_URL}/api/withdraw/create`;

const CARD_RETURN_POLL_ATTEMPTS = 15;
const CARD_RETURN_POLL_DELAY_MS = 2000;


/*==================================
                SESSION
==================================*/

function getToken() {

return (
sessionStorage.getItem("token") ||
localStorage.getItem("token")
);

}


function logout() {

[
"token",
"currentUser"
].forEach((key) => {

sessionStorage.removeItem(key);
localStorage.removeItem(key);

});

window.location.href =
"login.html";

}


const token =
getToken();

if (!token) {

logout();
return;

}


/*==================================
                ELEMENTS
==================================*/

const balanceElement =
document.getElementById("withdrawBalance");

const statusText =
document.getElementById("withdrawStatusText");

const amountInput =
document.getElementById("withdrawAmount");

const noteInput =
document.getElementById("withdrawNote");

const confirmButton =
document.getElementById("confirmWithdraw");

const addCardButton =
document.getElementById("addCardButton");

const refreshCardsButton =
document.getElementById("refreshCardsButton");

const refreshHistoryButton =
document.getElementById("refreshHistoryButton");

const linkedCardsContainer =
document.getElementById("linkedCards");

const historyContainer =
document.getElementById("withdrawHistory");

const messageBox =
document.getElementById("withdrawMessage");

const errorBox =
document.getElementById("withdrawError");

const summaryAmount =
document.getElementById("summaryAmount");

const summaryCard =
document.getElementById("summaryCard");

let availableBalance = 0;
let linkedCards = [];
let selectedCardId = null;


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
.replaceAll("'", "&#39;");

}


function normalizeStatus(value) {

return String(value || "")
.trim()
.toUpperCase();

}


function createClientReference() {

const random =
globalThis.crypto?.randomUUID
? globalThis.crypto.randomUUID()
: Math.random()
.toString(36)
.slice(2);

return (
`withdraw-${Date.now()}-${random}`
).slice(0, 100);

}


function delay(milliseconds) {

return new Promise(
(resolve) =>
setTimeout(
resolve,
milliseconds
)
);

}


/*==================================
                MESSAGES
==================================*/

function showMessage(
text,
type = "info"
) {

messageBox.hidden = false;
messageBox.className =
`withdraw-message ${type}`;
messageBox.textContent =
String(text || "");

}


function hideMessage() {

messageBox.hidden = true;
messageBox.className =
"withdraw-message";
messageBox.textContent = "";

}


function showValidationError(text) {

errorBox.hidden = false;

const textElement =
errorBox.querySelector("span");

if (textElement) {
textElement.textContent = text;
}

}


function hideValidationError() {

errorBox.hidden = true;

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

logout();

throw new Error(
"Session expired."
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
"Server request failed."
);

}

return data;

}


/*==================================
                WALLET
==================================*/

async function loadWallet() {

try {

const wallet =
await api(
WALLET_ENDPOINT
);

/*
 * /api/wallet currently returns:
 * {
 *   success: true,
 *   wallet: {
 *     balance: ...
 *   }
 * }
 *
 * Keep the other fallbacks for compatibility with
 * older and future API response shapes.
 */
availableBalance =
Number(
wallet.wallet?.balance ??
wallet.balance ??
wallet.availableBalance ??
wallet.user?.balance ??
0
);

balanceElement.textContent =
money(
availableBalance
);

statusText.textContent =
"Wallet connected securely to the Senku Pay server.";

updateSummary();

return wallet;

} catch (error) {

console.error(
"Wallet error:",
error
);

statusText.textContent =
"Wallet connection failed.";

showMessage(
error.message ||
"Unable to load wallet.",
"error"
);

return null;

}

}


/*==================================
          LINKED CARD RENDERING
==================================*/

function cardLabel(card) {

if (card.last4) {
return `•••• ${card.last4}`;
}

return (
card.nickName ||
card.counterPartyName ||
"Linked card"
);

}


function renderLinkedCards() {

linkedCardsContainer.replaceChildren();

if (
!Array.isArray(linkedCards) ||
linkedCards.length === 0
) {

selectedCardId = null;

linkedCardsContainer.innerHTML = `
<div class="empty-card-state">
<i class="fa-solid fa-credit-card"></i>
<h3>No payout card linked</h3>
<p>Click Add Payout Card and enter your card securely on CentryOS.</p>
</div>
`;

updateSummary();

return;

}

if (
!linkedCards.some(
(card) =>
card.id === selectedCardId
)
) {

selectedCardId =
linkedCards[0].id;

}

linkedCards.forEach(
(card) => {

const button =
document.createElement("button");

button.type =
"button";

button.className =
"linked-card-option";

button.dataset.cardId =
card.id;

if (
card.id === selectedCardId
) {

button.classList.add(
"selected"
);

}

button.innerHTML = `
<div class="linked-card-top">
<div class="linked-card-brand">
<i class="fa-solid fa-credit-card"></i>
<span>Push-to-card destination</span>
</div>
<i class="fa-solid fa-circle-check linked-card-check"></i>
</div>
<div class="linked-card-number">${escapeHTML(cardLabel(card))}</div>
<div class="linked-card-meta">
<span>${escapeHTML(card.counterPartyName || card.nickName || "Cardholder")}</span>
<span>${escapeHTML(card.currency || "USD")}</span>
</div>
`;

button.addEventListener(
"click",
() => {

selectedCardId =
card.id;

renderLinkedCards();
updateSummary();

}
);

linkedCardsContainer.appendChild(
button
);

}
);

updateSummary();

}


/*==================================
            LOAD LINKED CARDS
==================================*/

async function loadLinkedCards({
silent = false
} = {}) {

if (!silent) {

linkedCardsContainer.innerHTML = `
<div class="empty-card-state">
<i class="fa-solid fa-spinner fa-spin"></i>
<h3>Checking CentryOS</h3>
<p>Loading your linked payout cards.</p>
</div>
`;

}

try {

const response =
await api(
LINKED_CARDS_ENDPOINT
);

linkedCards =
Array.isArray(
response.accounts
)
? response.accounts.filter(
(account) =>
String(
account.optionType || ""
)
.toLowerCase() ===
"card"
)
: [];

renderLinkedCards();

return linkedCards;

} catch (error) {

console.error(
"Linked cards error:",
error
);

linkedCards = [];
selectedCardId = null;

linkedCardsContainer.innerHTML = `
<div class="empty-card-state">
<i class="fa-solid fa-triangle-exclamation"></i>
<h3>Unable to load payout cards</h3>
<p>${escapeHTML(error.message || "Please try again.")}</p>
</div>
`;

updateSummary();

if (!silent) {

showMessage(
error.message ||
"Unable to load linked payout cards.",
"error"
);

}

return [];

}

}


/*==================================
             ADD PAYOUT CARD
==================================*/

addCardButton.addEventListener(
"click",
async () => {

hideMessage();

addCardButton.disabled =
true;

addCardButton.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
<span>Preparing...</span>
`;

try {

const response =
await api(
LINK_WIDGET_ENDPOINT,
{
method:
"POST",
headers: {
"Content-Type":
"application/json"
},
body:
JSON.stringify({
currency:
"USD"
})
}
);

const widgetUrl =
response.widget?.url;

if (!widgetUrl) {

throw new Error(
"CentryOS did not return a card-linking URL."
);

}

window.location.assign(
widgetUrl
);

} catch (error) {

console.error(
"Create card widget error:",
error
);

showMessage(
error.message ||
"Unable to open secure card linking.",
"error"
);

addCardButton.disabled =
false;

addCardButton.innerHTML = `
<i class="fa-solid fa-plus"></i>
<span>Add Payout Card</span>
`;

}

}
);


refreshCardsButton.addEventListener(
"click",
async () => {

refreshCardsButton.disabled =
true;

await loadLinkedCards();

refreshCardsButton.disabled =
false;

}
);


/*==================================
          RETURN FROM CENTRYOS
==================================*/

async function handleCardLinkReturn() {

const params =
new URLSearchParams(
window.location.search
);

if (
params.get(
"linkedAccount"
) !== "complete"
) {
return;
}

showMessage(
"Card-linking return received. Waiting for CentryOS to make the card available...",
"info"
);

for (
let attempt = 0;
attempt < CARD_RETURN_POLL_ATTEMPTS;
attempt += 1
) {

const cards =
await loadLinkedCards({
silent:
true
});

if (cards.length > 0) {

showMessage(
"Your payout card is linked and ready.",
"success"
);

history.replaceState(
{},
document.title,
window.location.pathname
);

return;
}

await delay(
CARD_RETURN_POLL_DELAY_MS
);

}

showMessage(
"Card linking is still being synchronized. Press Refresh in a moment.",
"info"
);

}


/*==================================
                SUMMARY
==================================*/

function selectedCard() {

return linkedCards.find(
(card) =>
card.id === selectedCardId
) || null;

}


function updateSummary() {

const amount =
Number(
amountInput.value || 0
);

summaryAmount.textContent =
money(
Number.isFinite(amount)
? amount
: 0
);

const card =
selectedCard();

summaryCard.textContent =
card
? cardLabel(card)
: "Not selected";

confirmButton.disabled =
!(
Number.isFinite(amount) &&
amount > 0 &&
amount <= availableBalance &&
card
);

}


amountInput.addEventListener(
"input",
() => {

hideValidationError();
updateSummary();

}
);


/*==================================
              CREATE REQUEST
==================================*/

confirmButton.addEventListener(
"click",
async () => {

hideMessage();
hideValidationError();

const amount =
Number(
amountInput.value
);

const card =
selectedCard();

if (
!Number.isFinite(amount) ||
amount <= 0
) {

showValidationError(
"Enter a valid withdrawal amount."
);

return;

}

if (amount > availableBalance) {

showValidationError(
"Withdrawal amount exceeds your available balance."
);

return;

}

if (!card) {

showValidationError(
"Select a linked payout card."
);

return;

}

confirmButton.disabled =
true;

confirmButton.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
<span>Submitting Request...</span>
`;

try {

const response =
await api(
CREATE_WITHDRAW_ENDPOINT,
{
method:
"POST",
headers: {
"Content-Type":
"application/json"
},
body:
JSON.stringify({

amount,

linkedAccountId:
card.id,

clientReference:
createClientReference(),

note:
String(
noteInput.value || ""
)
.trim()
.slice(0, 500)

})
}
);

showMessage(
response.message ||
"Withdrawal submitted for administrator review.",
"success"
);

amountInput.value = "";
noteInput.value = "";

await Promise.all([
loadWallet(),
loadWithdrawalHistory()
]);

} catch (error) {

console.error(
"Create withdrawal error:",
error
);

showMessage(
error.message ||
"Unable to submit the withdrawal.",
"error"
);

} finally {

confirmButton.innerHTML = `
<i class="fa-solid fa-shield-halved"></i>
<span>Submit Withdrawal Request</span>
`;

updateSummary();

}

}
);


/*==================================
          WITHDRAWAL HISTORY
==================================*/

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


function renderHistory(
withdrawals
) {

historyContainer.replaceChildren();

if (
!Array.isArray(withdrawals) ||
withdrawals.length === 0
) {

historyContainer.innerHTML = `
<div class="empty-withdraw">
<i class="fa-solid fa-clock-rotate-left"></i>
<h3>No Withdrawal History</h3>
<p>Your push-to-card requests will appear here.</p>
</div>
`;

return;

}

withdrawals.forEach(
(item) => {

const row =
document.createElement("div");

row.className =
"withdraw-item";

const date =
new Date(
item.createdAt
);

row.innerHTML = `
<div class="withdraw-item-left">
<div class="withdraw-item-icon">
<i class="fa-solid fa-credit-card"></i>
</div>
<div>
<h3>${money(item.amount)}</h3>
<p>${escapeHTML(item.account || "Linked payout card")}</p>
${item.payoutAmount !== null && item.payoutAmount !== undefined
? `<small>Senku Pay fee: ${money(item.siteFeeAmount || 0)} (${escapeHTML(item.siteFeePercent || 0)}%) • Card payout: ${money(item.payoutAmount)}</small>`
: ""}
<small>${Number.isNaN(date.getTime()) ? "Date unavailable" : escapeHTML(date.toLocaleString())}</small>
</div>
</div>
<span class="status-pill ${statusClass(item.status)}">${escapeHTML(normalizeStatus(item.status) || "PENDING")}</span>
`;

historyContainer.appendChild(
row
);

}
);

}


async function loadWithdrawalHistory() {

try {

const response =
await api(
WITHDRAW_ENDPOINT
);

renderHistory(
response.withdrawals || []
);

} catch (error) {

console.error(
"Withdrawal history error:",
error
);

historyContainer.innerHTML = `
<div class="empty-withdraw">
<i class="fa-solid fa-triangle-exclamation"></i>
<h3>History unavailable</h3>
<p>${escapeHTML(error.message || "Please try again.")}</p>
</div>
`;

}

}


refreshHistoryButton.addEventListener(
"click",
loadWithdrawalHistory
);


/*==================================
              INITIALIZE
==================================*/

await Promise.all([
loadWallet(),
loadLinkedCards(),
loadWithdrawalHistory()
]);

await handleCardLinkReturn();

}
);
