console.log("SEAL RENDERER LOADED");

const fs = require("fs");
const path = require("path");

const {
    buildSYAcodeBits
} = require("./sealEncoder");

// Modification de la signature pour inclure baseName
async function renderSeal(
    sealID,
    sealHash,
    baseName
) {

    const bits =
        buildSYAcodeBits(
            sealID,
            sealHash
        );

    const outputDir =
        path.join(
            __dirname,
            "../generated/seals"
        );

    if (!fs.existsSync(outputDir)) {

        fs.mkdirSync(
            outputDir,
            {
                recursive: true
            }
        );
    }

    const logoPath =
        path.join(
            __dirname,
            "../assets/logo_anor.png"
        );

    const logoBase64 =
        fs.readFileSync(
            logoPath
        ).toString("base64");

    const centerX = 500;
    const centerY = 500;

    console.log("ANOR GEN4.1 RENDERER");

    let cellsSvg = "";
    let guideSvg = "";

    const rings = [
        { radius: 245, cells: 72 },
        { radius: 290, cells: 96 },
        { radius: 335, cells: 120 },
        { radius: 380, cells: 144 }
    ];

    for (const ring of rings) {

        guideSvg += `
<circle
cx="${centerX}"
cy="${centerY}"
r="${ring.radius}"
fill="none"
stroke="#dce6f0"
stroke-width="1"
/>
`;
    }

    for (
        let i = 0;
        i < 24;
        i++
    ) {

        const angle =
            (
                i *
                2 *
                Math.PI
            ) /
            24;

        const x1 =
            centerX +
            Math.cos(angle) *
            180;

        const y1 =
            centerY +
            Math.sin(angle) *
            180;

        const x2 =
            centerX +
            Math.cos(angle) *
            430;

        const y2 =
            centerY +
            Math.sin(angle) *
            430;

        guideSvg += `
<line
x1="${x1}"
y1="${y1}"
x2="${x2}"
y2="${y2}"
stroke="#edf3f8"
stroke-width="1"
/>
`;
    }

    let bitIndex = 0;

    for (const ring of rings) {

        for (
            let i = 0;
            i < ring.cells;
            i++
        ) {

            if (
                bitIndex >= bits.length
            ) {
                break;
            }

            const angle =
                (
                    i *
                    2 *
                    Math.PI
                ) /
                ring.cells;

            const x =
                centerX +
                Math.cos(angle) *
                ring.radius;

            const y =
                centerY +
                Math.sin(angle) *
                ring.radius;

            const active =
                bits[bitIndex] === "1";

            cellsSvg += `
<circle
cx="${x}"
cy="${y}"
r="5"
fill="${
    active
        ? "#0072ce"
        : "white"
}"
stroke="#b7c8da"
stroke-width="1"
/>
`;

            bitIndex++;
        }
    }

    const svg = `
<svg
xmlns="http://www.w3.org/2000/svg"
width="1000"
height="1000"
viewBox="0 0 1000 1000"
>

<rect
width="100%"
height="100%"
fill="white"
/>

<circle
cx="500"
cy="500"
r="470"
fill="none"
stroke="#0072ce"
stroke-width="8"
/>

${guideSvg}
${cellsSvg}

<circle
cx="500"
cy="500"
r="165"
fill="white"
/>

<circle
cx="500"
cy="500"
r="145"
fill="none"
stroke="#d8e4f0"
stroke-width="2"
/>

<image
href="data:image/png;base64,${logoBase64}"
x="355"
y="355"
width="290"
height="290"
/>

<circle
cx="500"
cy="210"
r="26"
fill="white"
/>

<circle
cx="500"
cy="210"
r="18"
fill="#008450"
/>

<circle
cx="751"
cy="645"
r="26"
fill="white"
/>

<circle
cx="751"
cy="645"
r="18"
fill="#008450"
/>

<circle
cx="249"
cy="645"
r="26"
fill="white"
/>

<circle
cx="249"
cy="645"
r="18"
fill="#008450"
/>

</svg>
`;

    // Modification appliquée ici : préfixe avec le nom de base
    const fileName =
        `${baseName}_${sealID}.svg`;

    const filePath =
        path.join(
            outputDir,
            fileName
        );

    fs.writeFileSync(
        filePath,
        svg,
        "utf8"
    );

    return {
        fileName,
        filePath
    };
}

module.exports = {
    renderSeal
};