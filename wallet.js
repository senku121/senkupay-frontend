/*==================================================
                SENKU PAY
                WALLET PAGE
==================================================*/

document.addEventListener("DOMContentLoaded", async () => {

const API_BASE_URL =
"https://senkupay-api.onrender.com";

const WALLET_ENDPOINT =
`${API_BASE_URL}/api/wallet`;

const TRANSACTIONS_ENDPOINT =
`${API_BASE_URL}/api/transactions`;

/*==================================
        STORAGE
==================================*/

function getToken() {

return (
sessionStorage.getItem("token") ||
localStorage.getItem("token")
);

}

function getCurrentUser() {

const raw =
sessionStorage.getItem("currentUser") ||
localStorage.getItem("currentUser");

if (!raw) {

return null;

}

try {

return JSON.parse(raw);

}
catch {

return null;

}

}

function logout() {

[
"token",
"currentUser"
].forEach(key => {

sessionStorage.removeItem(key);
localStorage.removeItem(key);

});

window.location.href = "login.html";

}

const token = getToken();

if (!token) {

logout();
return;

}

/*==================================
        ELEMENTS
==================================*/

const walletBalance =
document.getElementById("walletBalance");

const totalDeposited =
document.getElementById("totalDeposited");

const totalWithdrawn =
document.getElementById("totalWithdrawn");

const pendingDeposits =
document.getElementById("pendingDeposits");

const pendingWithdrawals =
document.getElementById("pendingWithdrawals");

const walletStatus =
document.getElementById("walletStatus");

const walletVerification =
document.getElementById("walletVerification");

const walletSync =
document.getElementById("walletSync");

const walletHistory =
document.getElementById("walletHistory");

const walletMessage =
document.getElementById("walletMessage");

const depositButton =
document.getElementById("depositButton");

const withdrawButton =
document.getElementById("withdrawButton");

/*==================================
        MESSAGE
==================================*/

function showMessage(text, type = "info") {

if (!walletMessage) {

return;

}

walletMessage.hidden = false;
walletMessage.className =
`wallet-message show ${type}`;
walletMessage.textContent = text;

}

function hideMessage() {

if (!walletMessage) {

return;

}

walletMessage.hidden = true;
walletMessage.className =
"wallet-message";
walletMessage.textContent = "";

}

/*==================================
        FORMAT
==================================*/

function money(value) {

const amount = Number(value);

return new Intl.NumberFormat(
"en-US",
{
style: "currency",
currency: "USD"
}
).format(
Number.isFinite(amount)
? amount
: 0
);

}

function formatDate(date) {

if (!date) {

return "--";

}

return new Date(date).toLocaleString();

}

/*==================================
        API
==================================*/

async function api(url) {

const response =
await fetch(
url,
{
method: "GET",
cache: "no-store",
headers: {
Authorization:
`Bearer ${token}`,
Accept:
"application/json"
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
response.headers.get("content-type") || "";

let data = {};

if (
contentType.includes("application/json")
) {

data = await response.json();

}
else {

const text = await response.text();

data = {
message:
text ||
"Unexpected server response."
};

}

if (!response.ok) {

throw new Error(
data.message ||
data.error ||
"Unable to load wallet."
);

}

return data;

}

/*==================================
      RESPONSE NORMALIZATION
==================================*/

/*
 * The backend currently returns wallet data as:
 *
 * {
 *   success: true,
 *   wallet: {
 *     balance,
 *     deposited,
 *     withdrawn,
 *     lockedBalance,
 *     status
 *   },
 *   user: { ... }
 * }
 *
 * Older frontend code read data.balance directly, which
 * converted the missing root value to $0.00. This helper
 * supports both nested and older root-level responses.
 */
function normalizeWalletResponse(data) {

const wallet =
data?.wallet &&
typeof data.wallet === "object"
? data.wallet
: data;

const currentUser =
getCurrentUser();

const user =
data?.user ||
wallet?.user ||
currentUser ||
{};

return {
raw: data || {},
wallet: wallet || {},
user
};

}

/*==================================
        LOAD WALLET
==================================*/

async function loadWallet() {

hideMessage();

try {

const data =
await api(WALLET_ENDPOINT);

const normalized =
normalizeWalletResponse(data);

const wallet =
normalized.wallet;

const user =
normalized.user;

const availableBalance =
wallet.balance ??
wallet.availableBalance ??
data.balance ??
data.availableBalance ??
0;

const depositedAmount =
wallet.deposited ??
wallet.totalDeposited ??
data.deposited ??
data.totalDeposited ??
0;

const withdrawnAmount =
wallet.withdrawn ??
wallet.totalWithdrawn ??
data.withdrawn ??
data.totalWithdrawn ??
0;

const pendingDepositAmount =
wallet.pendingDeposits ??
wallet.pendingDeposit ??
data.pendingDeposits ??
data.pendingDeposit ??
0;

const pendingWithdrawalAmount =
wallet.pendingWithdrawals ??
wallet.pendingWithdraw ??
wallet.lockedBalance ??
data.pendingWithdrawals ??
data.pendingWithdraw ??
data.lockedBalance ??
0;

if (walletBalance) {

walletBalance.textContent =
money(availableBalance);

}

if (totalDeposited) {

totalDeposited.textContent =
money(depositedAmount);

}

if (totalWithdrawn) {

totalWithdrawn.textContent =
money(withdrawnAmount);

}

if (pendingDeposits) {

pendingDeposits.textContent =
money(pendingDepositAmount);

}

if (pendingWithdrawals) {

pendingWithdrawals.textContent =
money(pendingWithdrawalAmount);

}

if (walletStatus) {

const status =
String(
wallet.status ||
"ACTIVE"
).trim().toUpperCase();

walletStatus.textContent =
status === "ACTIVE"
? "Wallet synchronized with the secure Senku Pay server."
: `Wallet status: ${status.replaceAll("_", " ")}.`;

walletStatus.classList.remove(
"status-negative"
);

}

if (walletVerification) {

const rawVerified =
user.emailVerified ??
wallet.emailVerified ??
data.emailVerified ??
false;

const verified =
rawVerified === true ||
rawVerified === "true" ||
rawVerified === 1 ||
rawVerified === "1";

walletVerification.textContent =
verified
? "Verified"
: "Pending";

walletVerification.className =
verified
? "status-positive"
: "status-negative";

}

if (walletSync) {

walletSync.textContent =
new Date().toLocaleTimeString(
[],
{
hour: "2-digit",
minute: "2-digit"
}
);

}

console.info(
"Wallet synchronized:",
{
balance: availableBalance,
deposited: depositedAmount,
withdrawn: withdrawnAmount,
pendingDeposits: pendingDepositAmount,
pendingWithdrawals: pendingWithdrawalAmount
}
);

return normalized;

}
catch (error) {

console.error(
"Wallet load failed:",
error
);

showMessage(
error.message ||
"Unable to load wallet information.",
"error"
);

if (walletStatus) {

walletStatus.textContent =
"Wallet synchronization failed.";

walletStatus.classList.add(
"status-negative"
);

}

return null;

}

}

/*==================================
        TRANSACTION TYPE
==================================*/

function getTransactionDetails(tx) {

const type =
String(tx.type || "Transaction");

const normalized =
type.toLowerCase();

const withdrawal =
normalized.includes("withdraw");

const deposit =
normalized.includes("deposit");

if (withdrawal) {

return {
icon: "fa-arrow-up",
amountClass: "wallet-negative",
sign: "-"
};

}

if (deposit) {

return {
icon: "fa-arrow-down",
amountClass: "wallet-positive",
sign: "+"
};

}

return {
icon: "fa-money-bill-transfer",
amountClass: "",
sign: ""
};

}

/*==================================
        ESCAPE HTML
==================================*/

function escapeHtml(value) {

return String(value ?? "")
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;")
.replaceAll('"', "&quot;")
.replaceAll("'", "&#39;");

}

/*==================================
        LOAD WALLET HISTORY
==================================*/

async function loadWalletHistory() {

if (!walletHistory) {

return;

}

try {

const response =
await api(TRANSACTIONS_ENDPOINT);

const transactions =
Array.isArray(response)
? response
: (
response.transactions ||
response.data ||
[]
);

if (transactions.length === 0) {

return;

}

walletHistory.innerHTML = "";

transactions
.slice(0, 8)
.forEach(tx => {

const ui =
getTransactionDetails(tx);

const amount =
Number(tx.amount || 0);

walletHistory.insertAdjacentHTML(
"beforeend",
`
<div class="wallet-row">
    <div class="wallet-info">
        <div class="wallet-icon">
            <i class="fa-solid ${ui.icon}"></i>
        </div>
        <div>
            <h4>${escapeHtml(tx.type || "Transaction")}</h4>
            <p>
                ${formatDate(tx.createdAt)}
                <br>
                Status: ${escapeHtml(tx.status || "Completed")}
            </p>
        </div>
    </div>
    <div class="wallet-amount ${ui.amountClass}">
        ${ui.sign}${money(amount)}
    </div>
</div>
`
);

});

}
catch (error) {

console.error(
"History load failed:",
error
);

}

}

/*==================================
        BUTTONS
==================================*/

depositButton?.addEventListener(
"click",
() => {

depositButton.disabled = true;

depositButton.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
<span>Opening...</span>
`;

setTimeout(() => {

window.location.href =
"deposit.html";

}, 600);

}
);

withdrawButton?.addEventListener(
"click",
() => {

withdrawButton.disabled = true;

withdrawButton.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
<span>Opening...</span>
`;

setTimeout(() => {

window.location.href =
"withdraw.html";

}, 600);

}
);

document
.querySelector(".view-transactions")
?.addEventListener(
"click",
event => {

event.preventDefault();

window.location.href =
"transactions.html";

}
);

/*==================================
        CARD ENTRANCE
==================================*/

document
.querySelectorAll(
".wallet-main-card,.wallet-stat,.wallet-actions,.summary-card,.history-card,.wallet-footer"
)
.forEach((element, index) => {

element.style.opacity = "0";
element.style.transform =
"translateY(20px)";

setTimeout(() => {

element.style.transition =
".55s ease";

element.style.opacity = "1";
element.style.transform =
"translateY(0)";

}, 100 + (index * 90));

});

/*==================================
        AUTO REFRESH
==================================*/

setInterval(async () => {

if (document.visibilityState === "visible") {

await loadWallet();

}

}, 60000);

/*==================================
        INITIALIZE
==================================*/

const walletData =
await loadWallet();

if (walletData) {

await loadWalletHistory();

showMessage(
"Wallet synchronized successfully.",
"success"
);

setTimeout(
hideMessage,
2500
);

}

/*==================================
        KEYBOARD SHORTCUTS
==================================*/

document.addEventListener(
"keydown",
event => {

if (
event.altKey &&
event.key.toLowerCase() === "d"
) {

window.location.href =
"deposit.html";

}

if (
event.altKey &&
event.key.toLowerCase() === "w"
) {

window.location.href =
"withdraw.html";

}

}
);

/*==================================
                END
==================================*/

});
