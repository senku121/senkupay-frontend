/*==================================================
        SENKU STAKES
        SUB AGENT DASHBOARD JS
==================================================*/


document.addEventListener("DOMContentLoaded",()=>{

console.log("Current User:", getCurrentUser());
console.log("Database:", getDB());

/*================================
        LOGIN PROTECTION
================================*/

let currentUser = getCurrentUser();


if(currentUser){

    const db = getDB();


    const latestAgent = db.agents.find(
        a=>a.id===currentUser.id
    );


    if(latestAgent){

        currentUser = latestAgent;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(latestAgent)
        );

    }

}


if(
    !currentUser
){

    window.location.href="sub-agent-login.html";

    return;

}


if(

    currentUser.role !== "AGENT" &&
    currentUser.role !== "SUPPORT_AGENT" &&
    currentUser.role !== "FINANCE_AGENT"

){

    window.location.href = "sub-agent-login.html";

    return;

}


/*================================
        LOGOUT
================================*/


const logoutBtn=document.querySelector(
".agent-logout"
);



if(logoutBtn){


logoutBtn.addEventListener("click",()=>{


    if(confirm("Logout from Sub Agent Panel?")){


        logout();


        window.location.href=
        "sub-agent-login.html";


    }


});


}







/*================================
        ADD BALANCE REQUEST
================================*/


const addBalance=document.querySelector(
".add-money"
);



if(addBalance){


addBalance.addEventListener("click",()=>{


let amount=prompt(
"Enter amount to request from admin:"
);



if(amount){


alert(
`Balance request sent to admin.

Amount:
$${amount}

Waiting for approval.`
);


}



});


}







/*================================
        SEND BALANCE TO ADMIN
================================*/


/*================================
        SEND TO ADMIN
================================*/

const sendAdmin=document.querySelector(".send-admin");

if(sendAdmin){

sendAdmin.addEventListener("click",()=>{

let amount = prompt(
"Enter amount to send to Admin:"
);

amount = Number(amount);

if(!amount || amount <= 0){

showPopup({

type:"error",

title:"Invalid Amount",

message:"Enter a valid amount."

});

return;

}

if(currentUser.balance < amount){

showPopup({

type:"error",

title:"Insufficient Balance",

message:"Your wallet balance is too low."

});

return;

}

let password = prompt(
"Enter your Sub Agent password:"
);

if(password !== currentUser.password){

showPopup({

type:"error",

title:"Wrong Password",

message:"Incorrect password."

});

return;

}

const db = getDB();

const agent = db.agents.find(
a => a.id === currentUser.id
);

if(!agent){

return;

}

/*=====================
REMOVE FROM AGENT
=====================*/

agent.balance -= amount;

currentUser.balance = agent.balance;

/*=====================
ADD TO ADMIN
=====================*/

db.admin.balance =
(db.admin.balance || 0) + amount;

/*=====================
AGENT TRANSACTION
=====================*/

db.transactions.unshift({

id:"TXN"+Date.now(),

userId:agent.id,

type:"Sent To Admin",

amount:-amount,

status:"Completed",

date:new Date().toLocaleString()

});

/*=====================
ADMIN TRANSACTION
=====================*/

db.transactions.unshift({

id:"TXN"+Date.now(),

userId:db.admin.id,

type:"Received From Agent",

amount:amount,

status:"Completed",

date:new Date().toLocaleString()

});

/*=====================
SAVE
=====================*/

saveDB(db);

setCurrentUser(agent);

/*=====================
UPDATE UI
=====================*/

document.getElementById("agentBalance").innerText =
formatMoney(agent.balance);

document.getElementById("availableBalance").innerText =
formatMoney(agent.balance);

showPopup({

type:"success",

title:"Transfer Successful",

message:
`${formatMoney(amount)} has been transferred to Admin.`

});

});

}




/*================================
        LOAD AGENT PROFILE
================================*/


const idBox=document.querySelector("#loggedAgentId");

if(idBox){

    idBox.innerText=currentUser.id;

}

/*================================
        LOAD AGENT NAME
================================*/


const nameBox=document.querySelector(
"#loggedAgentName"
);



if(nameBox){

    nameBox.innerText=currentUser.name;

}
/*================================
        LOAD DASHBOARD DATA
================================*/

const db = getDB();

document.getElementById("agentBalance").innerText =
formatMoney(currentUser.balance || 0);

document.getElementById("availableBalance").innerText =
formatMoney(currentUser.balance || 0);

const assignedUsers = db.users;

document.getElementById("assignedUsers").innerText =
assignedUsers.length;

const pending =
db.agentRequests.filter(

request=>

request.agentId===currentUser.id &&

request.status==="Pending"

);

document.getElementById("pendingRequests").innerText =
pending.length;

const recentTable =
document.getElementById("recentUsersTable");

recentTable.innerHTML="";

assignedUsers.slice(0,5).forEach(user=>{

recentTable.innerHTML += `

<tr>

<td>${user.username}</td>

<td>${formatMoney(user.balance)}</td>

<td>

<span class="active">

${user.status}

</span>

</td>

</tr>

`;

});

if(assignedUsers.length===0){

recentTable.innerHTML=`

<tr>

<td colspan="3">

No Assigned Users

</td>

</tr>

`;

}

/*================================
        USER MANAGEMENT TABLE
================================*/

const userTable =
document.getElementById("userTable");

function loadUserTable(){

userTable.innerHTML="";

assignedUsers.forEach(user=>{

userTable.innerHTML += `

<tr>

<td>${user.username}</td>

<td>${formatMoney(user.balance)}</td>

<td>

<span class="active">

${user.status}

</span>

</td>

<td>

<button 
class="manage-user"
data-id="${user.id}">
Manage
</button>

</td>

</tr>

`;

});

attachManageButtons();

}

loadUserTable();

/*================================
        SEARCH USERS
================================*/

const userSearch =
document.getElementById("userSearch");

if(userSearch){

userSearch.addEventListener("input",()=>{

const value =
userSearch.value.toLowerCase();

document.querySelectorAll("#userTable tr")

.forEach(row=>{

row.style.display =

row.innerText.toLowerCase().includes(value)

? ""

: "none";

});

});

}

/*================================
        GRAPHICAL USER MODAL
================================*/


function attachManageButtons(){

document.querySelectorAll(".manage-user")

.forEach(button=>{


button.onclick=()=>{


const id = button.dataset.id;


const user = db.users.find(

u=>u.id===id

);



if(!user){

return;

}




const modal =
document.getElementById(
"manageUserModal"
);


document.getElementById(
"manageUsername"
).innerText =
user.username;


document.getElementById(
"manageBalance"
).innerText =
formatMoney(user.balance);


document.getElementById(
"manageStatus"
).innerText =
user.status;
const freezeBtn =
document.getElementById(
"btnFreeze"
);


const blockBtn =
document.getElementById(
"btnBlock"
);



if(user.status==="FROZEN"){

freezeBtn.innerHTML=
`
<i class="fa-solid fa-fire"></i>

Unfreeze Account
`;

}


else{

freezeBtn.innerHTML=
`
<i class="fa-solid fa-snowflake"></i>

Freeze Account
`;

}





if(user.status==="BLOCKED"){

blockBtn.innerHTML=
`
<i class="fa-solid fa-user-check"></i>

Unblock Account
`;

}


else{

blockBtn.innerHTML=
`
<i class="fa-solid fa-ban"></i>

Block Account
`;

}


modal.classList.add("active");



/*========================
 CLOSE BUTTON
========================*/


document.querySelector(
".close-manage-modal"
).onclick=()=>{


modal.classList.remove(
"active"
);


};



/*========================
 ACTION BUTTONS
========================*/


document.getElementById(
"btnViewProfile"
).onclick=()=>{


showPopup({

type:"info",

title:"User Profile",

message:

`
Username:
${user.username}

Email:
${user.email || "-"}

Balance:
${formatMoney(user.balance)}

Status:
${user.status}

Country:
${user.country || "-"}
`

});


};



/*========================
        ADD BALANCE
========================*/


document.getElementById(
"btnAddBalance"
).onclick=()=>{


let amount = prompt(
"Enter amount to add:"
);


amount = Number(amount);



if(!amount || amount<=0){

showPopup({

type:"error",

title:"Invalid Amount",

message:"Enter a valid amount."

});

return;

}



// Agent must have enough balance
if(currentUser.balance < amount){

showPopup({

type:"error",

title:"Insufficient Agent Balance",

message:"You don't have enough balance in your agent wallet."

});

return;

}

// Remove from agent wallet
currentUser.balance -= amount;

// Add to user
user.balance += amount;

// Save updated agent
const agent = db.agents.find(
a => a.id === currentUser.id
);

if(agent){

agent.balance = currentUser.balance;

}

// Update session
setCurrentUser(agent);


db.transactions.unshift({

id:"TXN"+Date.now(),

userId:user.id,

type:"Agent Balance Added",

amount:amount,

status:"Completed",

date:new Date().toLocaleString()

});


saveDB(db);

document.getElementById("agentBalance").innerText =
formatMoney(currentUser.balance);

document.getElementById("availableBalance").innerText =
formatMoney(currentUser.balance);

document.getElementById(
"manageBalance"
).innerText =
formatMoney(user.balance);



showPopup({

type:"success",

title:"Balance Added",

message:

`${formatMoney(amount)} added to ${user.username}`

});


};





/*========================
        REMOVE BALANCE
========================*/


document.getElementById(
"btnRemoveBalance"
).onclick=()=>{


let amount = prompt(
"Enter amount to remove:"
);


amount = Number(amount);



if(!amount || amount<=0){

showPopup({

type:"error",

title:"Invalid Amount",

message:"Enter a valid amount."

});

return;

}



if(amount > user.balance){

showPopup({

type:"error",

title:"Insufficient Balance",

message:"User does not have enough balance."

});

return;

}



/*========================
        REMOVE FROM USER
========================*/


user.balance -= amount;




/*========================
        ADD TO AGENT WALLET
========================*/


currentUser.balance =
(currentUser.balance || 0) + amount;


/*========================
 SAVE AGENT BALANCE
========================*/


const agent =
db.agents.find(
a=>a.id===currentUser.id
);



if(agent){


agent.balance =
currentUser.balance;


}



saveDB(db);



localStorage.setItem(
"currentUser",
JSON.stringify(agent)
);




/*========================
        USER TRANSACTION
========================*/


db.transactions.unshift({

id:"TXN"+Date.now(),

userId:user.id,

type:"Agent Removed Balance",

amount:-amount,

status:"Completed",

date:new Date().toLocaleString()

});

db.transactions.unshift({

id:"TXN"+Date.now(),

userId:currentUser.id,

type:"Sent Balance To User",

amount:-amount,

status:"Completed",

date:new Date().toLocaleString()

});


/*========================
        AGENT TRANSACTION
========================*/


db.transactions.unshift({

id:"TXN"+Date.now(),

userId:currentUser.id,

type:"Received From User",

amount:amount,

status:"Completed",

date:new Date().toLocaleString()

});





saveDB(db);





/*========================
        UPDATE UI
========================*/


document.getElementById(
"manageBalance"
).innerText =
formatMoney(user.balance);



document.getElementById(
"agentBalance"
).innerText =
formatMoney(currentUser.balance);



document.getElementById(
"availableBalance"
).innerText =
formatMoney(currentUser.balance);




showPopup({

type:"success",

title:"Balance Removed",

message:

`${formatMoney(amount)} removed from ${user.username}

Added to Agent Wallet`

});


};




/*========================
        FREEZE ACCOUNT
========================*/


document.getElementById(
"btnFreeze"
).onclick=()=>{


if(user.status==="FROZEN"){


user.status="ACTIVE";


saveDB(db);


document.getElementById(
"manageStatus"
).innerText="ACTIVE";


freezeBtn.innerHTML=
`
<i class="fa-solid fa-snowflake"></i>

Freeze Account
`;



showPopup({

type:"success",

title:"Account Unfrozen",

message:

`${user.username} account has been unfrozen.`

});


return;

}




user.status="FROZEN";


saveDB(db);



document.getElementById(
"manageStatus"
).innerText="FROZEN";



freezeBtn.innerHTML=
`
<i class="fa-solid fa-fire"></i>

Unfreeze Account
`;



showPopup({

type:"warning",

title:"Account Frozen",

message:

`${user.username} account is now frozen.`

});


};



/*========================
        TRANSACTION HISTORY
========================*/


document.getElementById(
"btnTransactions"
).onclick=()=>{


const transactions =
db.transactions.filter(

txn=>

txn.userId===user.id

);



if(transactions.length===0){


showPopup({

type:"info",

title:"Transaction History",

message:

"No transactions found."

});


return;


}



let history="";


transactions.slice(0,10)
.forEach(txn=>{


history += `

Type:
${txn.type}

Amount:
${formatMoney(txn.amount)}

Status:
${txn.status}

Date:
${txn.date}


----------------

`;



});



showPopup({

type:"info",

title:

`${user.username} Transactions`,

message:

history


});


};

/*========================
        BLOCK ACCOUNT
========================*/


document.getElementById(
"btnBlock"
).onclick=()=>{


if(user.status==="BLOCKED"){


user.status="ACTIVE";


saveDB(db);



document.getElementById(
"manageStatus"
).innerText="ACTIVE";



blockBtn.innerHTML=
`
<i class="fa-solid fa-ban"></i>

Block Account
`;



showPopup({

type:"success",

title:"Account Unblocked",

message:

`${user.username} account has been unblocked.`

});


return;

}




user.status="BLOCKED";


saveDB(db);



document.getElementById(
"manageStatus"
).innerText="BLOCKED";



blockBtn.innerHTML=
`
<i class="fa-solid fa-user-check"></i>

Unblock Account
`;



showPopup({

type:"error",

title:"Account Blocked",

message:

`${user.username} account is now blocked.`

});


};




};



});


}

/*================================
        MOBILE SIDEBAR
================================*/

const menuToggle = document.getElementById("menuToggle");

const sidebar = document.querySelector(".agent-sidebar");

if(menuToggle){

menuToggle.onclick = ()=>{

sidebar.classList.toggle("show");

};

}

document.addEventListener("click",(e)=>{

if(

window.innerWidth <= 992 &&

!sidebar.contains(e.target) &&

!menuToggle.contains(e.target)

){

sidebar.classList.remove("show");

}

});


});