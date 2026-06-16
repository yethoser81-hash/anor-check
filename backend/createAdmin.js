require("dotenv").config();

const bcrypt =
require("bcryptjs");

const supabase =
require("./src/config/supabase");

async function run(){

const hash =
await bcrypt.hash(
"admin123",
10
);

const result =
await supabase

.from("users")

.insert([{

fullname:"Administrateur",

email:"admin@anor.cm",

password_hash:hash,

role:"admin"

}]);

console.log(result);

}

run();