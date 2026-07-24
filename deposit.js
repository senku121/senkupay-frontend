/*==================================================
                SENKU PAY
        CENTRYOS DEPOSIT PAGE
==================================================*/

document.addEventListener(
"DOMContentLoaded",
async () => {

const API_BASE_URL =
"https://senkupay-api.onrender.com";

const WALLET_ENDPOINT =
`${API_BASE_URL}/api/wallet`;

const DEPOSIT_HISTORY_ENDPOINT =
`${API_BASE_URL}/api/deposit`;

const CREATE_PAYMENT_LINK_ENDPOINT =
`${API_BASE_URL}/api/centryos/payment-link`;

const DEPOSIT_STATUS_ENDPOINT =
`${API_BASE_URL}/api/centryos/deposits`;

const RETURN_POLL_INTERVAL_MS = 3000;
const RETURN_POLL_MAX_ATTEMPTS = 20;


/*==================================
                STORAGE
==================================*/

function getToken() {

return (
sessionStorage.getItem("token") ||
localStorage.getItem("token")
);

}


function logout() {

localStorage.removeItem("token");
localStorage.removeItem("currentUser");

sessionStorage.removeItem("token");
sessionStorage.removeItem("currentUser");

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

const balanceElement =
document.getElementById("depositBalance");

const amountInput =
document.getElementById("depositAmount");

const addressInput =
document.getElementById("itemDeliveryAddress");

const confirmButton =
document.getElementById("confirmDeposit");

const errorBox =
document.getElementById("depositError");

const errorText =
errorBox?.querySelector("span");

const messageBox =
document.getElementById("depositMessage");

const statusText =
document.getElementById("depositStatusText");

const gatewayLoader =
document.getElementById("gatewayLoader");

const gatewayPreview =
document.getElementById("gatewayPreview");

const gatewayIcon =
document.getElementById("gatewayIcon");

const gatewayTitle =
document.getElementById("gatewayTitle");

const gatewaySubtitle =
document.getElementById("gatewaySubtitle");

const gatewayDescription =
document.getElementById("gatewayDescription");

const historyContainer =
document.getElementById("depositHistory");

const settlementPanel =
document.getElementById("depositSettlement");

const settlementStatus =
document.getElementById("settlementStatus");

const settlementGross =
document.getElementById("settlementGross");

const settlementFee =
document.getElementById("settlementFee");

const settlementNet =
document.getElementById("settlementNet");

let selectedMethod = "card";


/*==================================
                MESSAGE
==================================*/

function showMessage(
text,
type = "info"
) {

if (!messageBox) {
return;
}

messageBox.hidden = false;
messageBox.className =
`deposit-message show ${type}`;

messageBox.textContent =
String(text || "");

}


function hideMessage() {

if (!messageBox) {
return;
}

messageBox.hidden = true;
messageBox.className =
"deposit-message";

messageBox.textContent = "";

}


function showValidationError(text) {

if (!errorBox) {
return;
}

if (errorText) {
errorText.textContent = text;
}

errorBox.style.display = "flex";

}


function hideValidationError() {

if (errorBox) {
errorBox.style.display = "none";
}

}


/*==================================
                FORMAT
==================================*/

function money(value) {

return new Intl.NumberFormat(
"en-US",
{
style: "currency",
currency: "USD"
}
).format(Number(value || 0));

}


function normalizedStatus(value) {

return String(value || "")
.trim()
.toUpperCase();

}


function methodLabel(value) {

const method =
String(value || "")
.toLowerCase();

if (method.includes("apple")) {
return "Apple Pay";
}

if (method.includes("google")) {
return "Google Pay";
}

if (method.includes("cash")) {
return "Cash App";
}

if (method.includes("card")) {
return "Card";
}

return "CentryOS Checkout";

}


function createClientReference() {

const randomPart =
globalThis.crypto?.randomUUID
? globalThis.crypto.randomUUID()
: Math.random()
.toString(36)
.slice(2);

return (
`deposit-${Date.now()}-${randomPart}`
).slice(0, 100);

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
Accept: "application/json",
Authorization: `Bearer ${token}`,
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
response.headers.get("content-type") || "";

let data = null;

if (
contentType.includes(
"application/json"
)
) {

data = await response.json();

} else {

const text = await response.text();

data = {
message:
text ||
"Server returned an invalid response."
};

}

if (!response.ok) {

throw new Error(
data?.message ||
"Server request failed."
);

}

return data;

}


/*==================================
            LOAD WALLET
==================================*/

async function loadWallet() {

try {

const wallet =
await api(WALLET_ENDPOINT);

const balance =
wallet.balance ??
wallet.availableBalance ??
wallet.user?.balance ??
0;

if (balanceElement) {

balanceElement.textContent =
money(balance);

}

if (statusText) {

statusText.textContent =
"Wallet connected securely to the Senku Pay server.";

}

return wallet;

} catch (error) {

console.error(error);

showMessage(
error.message ||
"Unable to load wallet.",
"error"
);

if (statusText) {

statusText.textContent =
"Wallet connection failed.";

}

return null;

}

}


/*==================================
        PAYMENT METHODS
==================================*/

const paymentButtons =
document.querySelectorAll(
".payment-option"
);

const gatewayData = {

card: {
iconClass:
"fa-solid fa-credit-card",
title:
"Card Payment",
subtitle:
"Visa • Mastercard • American Express",
description:
"You'll continue to the secure CentryOS checkout and pay the exact amount entered."
},

cashapp: {
iconClass:
"fa-solid fa-dollar-sign",
title:
"Cash App",
subtitle:
"Cash App through CentryOS",
description:
"You'll continue to the CentryOS checkout and choose Cash App when available."
},

applepay: {
iconClass:
"fa-brands fa-apple",
title:
"Apple Pay",
subtitle:
"Apple Pay through CentryOS",
description:
"You'll continue to the secure CentryOS checkout and choose Apple Pay."
},

googlepay: {
iconClass:
"fa-brands fa-google",
title:
"Google Pay",
subtitle:
"Google Pay through CentryOS",
description:
"You'll continue to the secure CentryOS checkout and choose Google Pay."
}

};


function selectPaymentMethod(button) {

paymentButtons.forEach(
(item) => {

item.classList.remove(
"active"
);

item.setAttribute(
"aria-checked",
"false"
);

}
);

button.classList.add(
"active"
);

button.setAttribute(
"aria-checked",
"true"
);

selectedMethod =
button.dataset.method;

const gateway =
gatewayData[selectedMethod];

if (!gateway) {
return;
}

gatewayIcon.className =
gateway.iconClass;

gatewayTitle.textContent =
gateway.title;

gatewaySubtitle.textContent =
gateway.subtitle;

gatewayDescription.textContent =
gateway.description;

}


paymentButtons.forEach(
(button) => {

button.addEventListener(
"click",
() => selectPaymentMethod(button)
);

}
);


/*==================================
        DEPOSIT HISTORY
==================================*/

function historyStatusClass(statusValue) {

const status =
normalizedStatus(statusValue);

if (
[
"APPROVED",
"COMPLETED",
"SUCCESS"
].includes(status)
) {
return "success";
}

if (
[
"FAILED",
"REJECTED",
"BLOCKED"
].includes(status)
) {
return "failed";
}

return "pending";

}


function createHistoryItem(item) {

const wrapper =
document.createElement("div");

wrapper.className =
"deposit-item";

const left =
document.createElement("div");

left.className =
"deposit-left";

const icon =
document.createElement("div");

icon.className =
"deposit-icon";

const iconElement =
document.createElement("i");

iconElement.className =
"fa-solid fa-dollar-sign";

icon.appendChild(iconElement);

const details =
document.createElement("div");

const amount =
document.createElement("h3");

const displayedAmount =
item.netAmount ??
item.amount ??
0;

amount.textContent =
money(displayedAmount);

const method =
document.createElement("p");

method.textContent =
methodLabel(item.method);

const created =
document.createElement("small");

const date =
new Date(item.createdAt);

created.textContent =
Number.isNaN(date.getTime())
? "Date unavailable"
: date.toLocaleString();

details.append(
amount,
method,
created
);

left.append(
icon,
details
);

const status =
document.createElement("div");

status.className =
`deposit-status ${historyStatusClass(item.status)}`;

status.textContent =
item.status || "PENDING";

wrapper.append(
left,
status
);

return wrapper;

}


async function loadDepositHistory() {

if (!historyContainer) {
return;
}

try {

const response =
await api(
DEPOSIT_HISTORY_ENDPOINT
);

const deposits =
Array.isArray(response)
? response
: (
response.deposits ||
response.data ||
[]
);

if (!Array.isArray(deposits)) {
return;
}

historyContainer.replaceChildren();

if (deposits.length === 0) {

const empty =
document.createElement("div");

empty.className =
"empty-deposit";

empty.innerHTML = `
<i class="fa-solid fa-clock-rotate-left"></i>
<h3>No Deposit History</h3>
<p>Your successful, pending and failed deposits will appear here after your first payment.</p>
`;

historyContainer.appendChild(
empty
);

return;

}

deposits
.slice(0, 8)
.forEach(
(item) => {

historyContainer.appendChild(
createHistoryItem(item)
);

}
);

} catch (error) {

console.error(
"Deposit history error:",
error
);

}

}


/*==================================
            VALIDATION
==================================*/

function validateDeposit() {

const amount =
Number(amountInput?.value);

const address =
String(
addressInput?.value || ""
).trim();

if (
!Number.isFinite(amount) ||
amount < 0.5
) {

showValidationError(
"Enter a deposit amount of at least $0.50."
);

return false;

}

if (address.length < 8) {

showValidationError(
"Enter your real billing or delivery address."
);

return false;

}

hideValidationError();

return true;

}


amountInput?.addEventListener(
"input",
hideValidationError
);

addressInput?.addEventListener(
"input",
hideValidationError
);


/*==================================
        SETTLEMENT DISPLAY
==================================*/

function showSettlement(deposit) {

if (!settlementPanel) {
return;
}

const status =
normalizedStatus(
deposit.status
);

settlementPanel.hidden = false;

settlementStatus.className = "";

if (status === "COMPLETED") {

settlementStatus.textContent =
"Completed";

settlementStatus.classList.add(
"success"
);

} else if (
[
"FAILED",
"REJECTED",
"BLOCKED"
].includes(status)
) {

settlementStatus.textContent =
deposit.providerStatus ||
deposit.status ||
"Failed";

settlementStatus.classList.add(
"failed"
);

} else {

settlementStatus.textContent =
"Pending confirmation";

}

settlementGross.textContent =
money(
deposit.customerPaidAmount ??
deposit.amount ??
0
);

settlementFee.textContent =
money(
deposit.providerFee ??
0
);

settlementNet.textContent =
money(
deposit.netAmount ??
0
);

}


/*==================================
        RETURN STATUS POLLING
==================================*/

function wait(milliseconds) {

return new Promise(
(resolve) => setTimeout(
resolve,
milliseconds
)
);

}


async function loadReturnedDeposit(
depositId
) {

const response =
await api(
`${DEPOSIT_STATUS_ENDPOINT}/${encodeURIComponent(depositId)}`
);

return response.deposit;

}


async function handlePaymentReturn() {

const params =
new URLSearchParams(
window.location.search
);

if (
params.get("payment") !== "return"
) {
return;
}

const depositId =
String(
params.get("depositId") || ""
).trim();

if (!depositId) {

showMessage(
"Payment return received, but no deposit reference was provided.",
"error"
);

return;

}

showMessage(
"Payment received. Waiting for secure CentryOS confirmation...",
"info"
);

for (
let attempt = 0;
attempt < RETURN_POLL_MAX_ATTEMPTS;
attempt += 1
) {

try {

const deposit =
await loadReturnedDeposit(
depositId
);

showSettlement(deposit);

const status =
normalizedStatus(
deposit.status
);

if (status === "COMPLETED") {

showMessage(
`Payment confirmed. ${money(deposit.netAmount ?? 0)} was added to your balance after fees.`,
"success"
);

await Promise.all([
loadWallet(),
loadDepositHistory()
]);

history.replaceState(
{},
document.title,
window.location.pathname
);

return;

}

if (
[
"FAILED",
"REJECTED",
"BLOCKED"
].includes(status)
) {

showMessage(
deposit.providerStatus
? `Payment was not completed: ${deposit.providerStatus}.`
: "Payment was not completed.",
"error"
);

await loadDepositHistory();

return;

}

} catch (error) {

console.error(
"Deposit status poll error:",
error
);

}

await wait(
RETURN_POLL_INTERVAL_MS
);

}

showMessage(
"Your payment is still being verified. The balance will update automatically after the signed CentryOS webhook confirms it.",
"info"
);

}


/*==================================
        CREATE PAYMENT LINK
==================================*/

function setSubmitting(isSubmitting) {

if (!confirmButton) {
return;
}

confirmButton.disabled =
isSubmitting;

confirmButton.innerHTML =
isSubmitting
? `
<i class="fa-solid fa-spinner fa-spin"></i>
<span>Preparing Payment...</span>
`
: `
<i class="fa-solid fa-lock"></i>
<span>Continue to Payment</span>
`;

if (gatewayLoader) {
gatewayLoader.hidden =
!isSubmitting;
}

if (gatewayPreview) {
gatewayPreview.hidden =
isSubmitting;
}

}


confirmButton?.addEventListener(
"click",
async () => {

hideMessage();

if (!validateDeposit()) {
return;
}

const amount =
Number(amountInput.value);

const itemDeliveryAddress =
String(
addressInput.value
).trim();

setSubmitting(true);

try {

const response =
await api(
CREATE_PAYMENT_LINK_ENDPOINT,
{
method: "POST",

headers: {
"Content-Type":
"application/json"
},

body: JSON.stringify({

amount,

currency:
"USD",

paymentMethod:
selectedMethod,

itemDeliveryAddress,

clientReference:
createClientReference()

})
}
);

const deposit =
response.deposit || {};

const paymentUrl =
deposit.paymentUrl ||
response.paymentUrl ||
response.checkoutUrl ||
response.redirectUrl;

if (!paymentUrl) {

throw new Error(
"CentryOS did not return a checkout URL."
);

}

sessionStorage.setItem(
"senkupayPendingDepositId",
deposit.id || ""
);

window.location.assign(
paymentUrl
);

} catch (error) {

console.error(error);

showMessage(
error.message ||
"Unable to create the CentryOS checkout.",
"error"
);

setSubmitting(false);

}

}
);


/*==================================
            PAGE ANIMATION
==================================*/

document
.querySelectorAll(
".deposit-card,.form-card,.payment-card,.payment-details,.confirm-deposit,.deposit-settlement,.deposit-history,.deposit-info"
)
.forEach(
(element, index) => {

element.style.opacity = "0";
element.style.transform =
"translateY(20px)";

setTimeout(
() => {

element.style.transition =
".55s ease";

element.style.opacity = "1";
element.style.transform =
"translateY(0)";

},
100 + (index * 80)
);

}
);


/*==================================
            INITIALIZE
==================================*/

await Promise.all([
loadWallet(),
loadDepositHistory()
]);

await handlePaymentReturn();


/*==================================
                END
==================================*/

}
);
