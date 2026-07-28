/*==================================================
                SENKU PAY
              WALLET PAGE
==================================================*/

document.addEventListener(
"DOMContentLoaded",
async () => {

const API_BASE_URL =
"https://senkupay-api.onrender.com";

const WALLET_ENDPOINT =
`${API_BASE_URL}/api/wallet`;

const DEPOSIT_ENDPOINT =
`${API_BASE_URL}/api/deposit`;

const WITHDRAW_ENDPOINT =
`${API_BASE_URL}/api/withdraw`;


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

const walletBalance =
document.getElementById(
"walletBalance"
);

const totalDeposited =
document.getElementById(
"totalDeposited"
);

const totalWithdrawn =
document.getElementById(
"totalWithdrawn"
);

const pendingDeposits =
document.getElementById(
"pendingDeposits"
);

const pendingWithdrawals =
document.getElementById(
"pendingWithdrawals"
);

const walletStatus =
document.getElementById(
"walletStatus"
);

const lastSync =
document.getElementById(
"walletLastSync"
) ||
document.getElementById(
"lastSync"
);

const walletStatusText =
document.querySelector(
".wallet-status"
);

const depositButton =
document.querySelector(
".deposit-btn"
);

const withdrawButton =
document.querySelector(
".withdraw-btn"
);

const transactionButton =
document.querySelector(
".view-transactions"
);


/*==================================
                FORMAT
==================================*/

function money(value) {

const amount =
Number(value);

return new Intl.NumberFormat(
"en-US",
{
style:
"currency",
currency:
"USD"
}
).format(
Number.isFinite(amount)
? amount
: 0
);

}


function normalizeStatus(value) {

return String(value || "")
.trim()
.toUpperCase();

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
"Unable to load wallet information."
);

}

return data;

}


/*==================================
          RESPONSE NORMALIZERS
==================================*/

function walletData(response) {

/*
 * The current backend returns:
 *
 * {
 *   success: true,
 *   wallet: {
 *     balance,
 *     deposited,
 *     withdrawn,
 *     lockedBalance,
 *     status
 *   }
 * }
 *
 * Keep the root-response fallback for compatibility
 * with older backend versions.
 */
return (
response?.wallet &&
typeof response.wallet ===
"object"
)
? response.wallet
: response;
}


function arrayFromResponse(
response,
preferredKey
) {

if (Array.isArray(response)) {
return response;
}

if (
Array.isArray(
response?.[preferredKey]
)
) {
return response[preferredKey];
}

if (Array.isArray(response?.data)) {
return response.data;
}

return [];

}


function pendingDepositTotal(
deposits
) {

return deposits.reduce(
(total, deposit) => {

const status =
normalizeStatus(
deposit.status
);

if (
[
"PENDING",
"CREATING_LINK",
"LINK_CREATED",
"PROCESSING"
].includes(status) ||
[
"PENDING",
"CREATING_LINK",
"LINK_CREATED",
"PROCESSING"
].includes(
normalizeStatus(
deposit.providerStatus
)
)
) {

return (
total +
Number(
deposit.amount || 0
)
);

}

return total;

},
0
);

}


function pendingWithdrawalTotal(
wallet,
withdrawals
) {

/*
 * lockedBalance is authoritative because the backend
 * moves requested withdrawal funds there atomically.
 */
const lockedBalance =
Number(
wallet.lockedBalance
);

if (
Number.isFinite(
lockedBalance
)
) {
return lockedBalance;
}

/*
 * Compatibility fallback if an older backend does
 * not return lockedBalance.
 */
return withdrawals.reduce(
(total, withdrawal) => {

const status =
normalizeStatus(
withdrawal.status
);

if (
[
"PENDING",
"PROCESSING",
"REVIEW_REQUIRED"
].includes(status)
) {

return (
total +
Number(
withdrawal.amount || 0
)
);

}

return total;

},
0
);

}


/*==================================
              RENDER
==================================*/

function renderWallet({
wallet,
deposits,
withdrawals
}) {

if (walletBalance) {

walletBalance.textContent =
money(
wallet.balance
);

}

if (totalDeposited) {

totalDeposited.textContent =
money(
wallet.deposited
);

}

if (totalWithdrawn) {

totalWithdrawn.textContent =
money(
wallet.withdrawn
);

}

if (pendingDeposits) {

pendingDeposits.textContent =
money(
pendingDepositTotal(
deposits
)
);

}

if (pendingWithdrawals) {

pendingWithdrawals.textContent =
money(
pendingWithdrawalTotal(
wallet,
withdrawals
)
);

}

if (walletStatus) {

const status =
normalizeStatus(
wallet.status
);

walletStatus.textContent =
status === "ACTIVE"
? "Active"
: (
status ||
"Pending"
);

walletStatus.classList.toggle(
"active",
status === "ACTIVE"
);

}

if (walletStatusText) {

walletStatusText.textContent =
"Wallet synchronized with the secure Senku Pay server.";

}

if (lastSync) {

lastSync.textContent =
new Date()
.toLocaleTimeString(
[],
{
hour:
"2-digit",
minute:
"2-digit"
}
);

}

}


/*==================================
            LOAD WALLET PAGE
==================================*/

async function loadWalletPage() {

try {

const [
walletResponse,
depositResponse,
withdrawResponse
] = await Promise.all([

api(
WALLET_ENDPOINT
),

api(
DEPOSIT_ENDPOINT
).catch((error) => {

console.warn(
"Deposit summary unavailable:",
error
);

return {
deposits:
[]
};

}),

api(
WITHDRAW_ENDPOINT
).catch((error) => {

console.warn(
"Withdrawal summary unavailable:",
error
);

return {
withdrawals:
[]
};

})

]);

const wallet =
walletData(
walletResponse
);

const deposits =
arrayFromResponse(
depositResponse,
"deposits"
);

const withdrawals =
arrayFromResponse(
withdrawResponse,
"withdrawals"
);

renderWallet({
wallet,
deposits,
withdrawals
});

console.info(
"Wallet synchronized:",
{
balance:
wallet.balance,
deposited:
wallet.deposited,
withdrawn:
wallet.withdrawn,
lockedBalance:
wallet.lockedBalance
}
);

} catch (error) {

console.error(
"Wallet page error:",
error
);

if (walletStatusText) {

walletStatusText.textContent =
error.message ||
"Unable to synchronize wallet.";

}

if (
typeof showPopup ===
"function"
) {

showPopup({
type:
"error",
title:
"Wallet Error",
message:
error.message ||
"Unable to load wallet."
});

}

}

}


/*==================================
              NAVIGATION
==================================*/

depositButton?.addEventListener(
"click",
() => {

window.location.href =
"deposit.html";

}
);


withdrawButton?.addEventListener(
"click",
() => {

window.location.href =
"withdraw.html";

}
);


transactionButton?.addEventListener(
"click",
(event) => {

event.preventDefault();

window.location.href =
"transactions.html";

}
);


/*==================================
              INITIALIZE
==================================*/

await loadWalletPage();

}
);
