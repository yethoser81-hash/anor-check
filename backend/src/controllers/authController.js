const supabase =
require("../config/supabase");

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");

exports.login =
async(req,res)=>{

try{

const {

email,
password

} = req.body;

const {
data:user,
error

}
=
await supabase

.from("users")

.select("*")

.eq("email",email)

.single();

if(error || !user){

return res.status(401).json({

success:false,
message:"Utilisateur introuvable"

});

}

const valid =
await bcrypt.compare(
password,
user.password_hash
);

if(!valid){

return res.status(401).json({

success:false,
message:"Mot de passe invalide"

});

}

const token =
jwt.sign(

{
id:user.id,
role:user.role
},

process.env.JWT_SECRET,

{
expiresIn:"24h"
}

);

res.json({

success:true,

token,

user:{
id:user.id,
fullname:user.fullname,
email:user.email,
role:user.role
}

});

}
catch(err){

res.status(500).json({

success:false,
message:err.message

});

}

};