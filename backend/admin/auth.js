const token =
localStorage.getItem(
"anor_token"
);

if(!token){

window.location.href =
"login.html";

}