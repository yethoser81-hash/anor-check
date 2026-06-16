const crypto =
require("crypto");

function generatePackageCodes(
    sealID,
    quantity
){

    const codes = [];

    for(
        let i = 1;
        i <= quantity;
        i++
    ){

        const hash =
        crypto
        .createHash("sha256")
        .update(
            `${sealID}-${i}`
        )
        .digest("hex")
        .substring(0,12)
        .toUpperCase();

        codes.push({

            serial_number:
            i,

            package_code:
            `${sealID}-${hash}`

        });

    }

    return codes;
}

module.exports = {
    generatePackageCodes
};