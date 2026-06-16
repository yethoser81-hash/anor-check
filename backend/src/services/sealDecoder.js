function bitsToText(bits) {

    let text = "";

    for (
        let i = 0;
        i < bits.length;
        i += 8
    ) {

        const byte =
            bits.substring(
                i,
                i + 8
            );

        text +=
            String.fromCharCode(
                parseInt(byte, 2)
            );

    }

    return text;

}

function extractSealID(bits) {

    const sealBits =
        bits.substring(
            16,
            208
        );

    return bitsToText(
        sealBits
    )
    .replace(/\0/g,"")
    .trim();

}

module.exports = {
    extractSealID
};