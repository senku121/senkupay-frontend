/*==================================================
        SENKU STAKES
        GLOBAL HELPERS
==================================================*/

function formatMoney(amount){

    return "$" + Number(amount || 0).toFixed(2);

}

function logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("currentUser");

}