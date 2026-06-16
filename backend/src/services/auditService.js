const supabase =
require("../config/supabase");

async function logAudit({

user_id,

action,

entity,

entity_id,

old_value,

new_value

}){

await supabase

.from("audit_logs")

.insert([{

user_id,

action,

entity,

entity_id,

old_value,

new_value

}]);

}

module.exports = {
logAudit
};