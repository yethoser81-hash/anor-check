const crypto = require("crypto");

/*
|--------------------------------------------------------------------------
| Génération d'un SealID unique
|--------------------------------------------------------------------------
| Exemple :
| ANOR-X8K7P4QM
| ANOR-B2L9TR8Z
|--------------------------------------------------------------------------
*/

function generateSealID() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "ANOR-";

    for (let i = 0; i < 8; i++) {

        code += chars[
            Math.floor(
                Math.random() * chars.length
            )
        ];
    }

    return code;
}

/*
|--------------------------------------------------------------------------
| Hash principal du sceau
|--------------------------------------------------------------------------
*/

function generateSealHash(sealID) {

    return crypto
        .createHash("sha256")
        .update(sealID)
        .digest("hex");
}

/*
|--------------------------------------------------------------------------
| Empreinte visuelle
|--------------------------------------------------------------------------
| Servira plus tard à générer
| des variantes graphiques du sceau.
|--------------------------------------------------------------------------
*/

function generateVisualSeed(sealID) {

    const hash = crypto
        .createHash("md5")
        .update(sealID)
        .digest("hex");

    return hash.substring(0, 16);
}

/*
|--------------------------------------------------------------------------
| Signature complète
|--------------------------------------------------------------------------
*/

function generateSealSignature(sealID) {

    return crypto
        .createHash("sha512")
        .update(
            sealID +
            process.env.JWT_SECRET
        )
        .digest("hex");
}

/*
|--------------------------------------------------------------------------
| Vérification d'intégrité
|--------------------------------------------------------------------------
*/

function verifySealIntegrity(
    sealID,
    storedHash
) {

    const currentHash =
        generateSealHash(sealID);

    return currentHash === storedHash;
}

module.exports = {

    generateSealID,
    generateSealHash,
    generateVisualSeed,
    generateSealSignature,
    verifySealIntegrity

};