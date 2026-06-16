const supabase =
require("../config/supabase");

async function uploadCertificate(
fileBuffer,
fileName
){

const {
data,
error
}
=
await supabase.storage

.from("certificates")

.upload(
fileName,
fileBuffer,
{
contentType:
"application/pdf",
upsert:true
}
);

if(error)
throw error;

return data.path;

}

module.exports = {
uploadCertificate
};