const supabase =
require("../config/supabase");

async function uploadCertificate(
buffer,
fileName
){

    const path =
    `${fileName}.pdf`;

    const result =
    await supabase.storage
    .from("certificates")
    .upload(
        path,
        buffer,
        {
            contentType:
            "application/pdf",

            upsert:true
        }
    );

    if(result.error){

        throw result.error;

    }

    const {
        data
    } =
    supabase.storage
    .from("certificates")
    .getPublicUrl(path);

    return data.publicUrl;

}

module.exports = {
    uploadCertificate
};