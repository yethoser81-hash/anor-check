const crypto = require("crypto");

// Convertit une chaîne de caractères en chaîne binaire (8 bits par caractère)
function textToBits(text) {
    let bits = "";
    for (let i = 0; i < text.length; i++) {
        bits += text
            .charCodeAt(i)
            .toString(2)
            .padStart(8, "0");
    }
    return bits;
}

// Convertit une chaîne binaire en chaîne de caractères (Opération inverse)
function bitsToText(bits) {
    let text = "";
    for (let i = 0; i < bits.length; i += 8) {
        const byte = bits.substring(i, i + 8);
        text += String.fromCharCode(
            parseInt(byte, 2)
        );
    }
    return text;
}

// Conservé à l'identique pour la signature cryptographique sécurisée
function hashToBits(
    value,
    length
) {

    const hash =
        crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");

    let bits = "";

    for (const c of hash) {

        bits +=
            parseInt(c, 16)
            .toString(2)
            .padStart(4, "0");
    }

    while (
        bits.length < length
    ) {

        bits += hashToBits(
            hash + bits.length,
            256
        );
    }

    return bits.substring(
        0,
        length
    );
}

function buildSYAcodeBits(
    sealID,
    sealHash
) {

    const versionBits =
        "00000001";

    const typeBits =
        "00000001";

    const header =
        versionBits +
        typeBits;

    // Nouvelle structure SYA : Encodage réel sur 192 bits
    const sealBits =
        textToBits(sealID)
        .padEnd(
            192,
            "0"
        )
        .substring(
            0,
            192
        );

    // Nouvelle structure SYA : Signature ajustée à 224 bits
    const signatureBits =
        hashToBits(
            sealID +
            sealHash +
            process.env.JWT_SECRET,
            224
        );

    let payload =
        header +
        sealBits +
        signatureBits;

    while (
        payload.length < 432
    ) {

        payload += hashToBits(
            payload,
            256
        );
    }

    return payload.substring(
        0,
        432
    );
}

module.exports = {
    textToBits,
    bitsToText,
    buildSYAcodeBits
};