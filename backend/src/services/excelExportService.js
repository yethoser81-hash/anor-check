const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

// Modification de la signature pour inclure baseName
async function generateExcelCodes(
    sealID,
    packageCodes,
    baseName
){

    const workbook =
        new ExcelJS.Workbook();

    const sheet =
        workbook.addWorksheet(
            "SYA Codes"
        );

    sheet.columns = [

        {
            header:"Serial",
            key:"serial",
            width:15
        },

        {
            header:"Unit Code",
            key:"code",
            width:40
        }

    ];

    packageCodes.forEach(code => {

        sheet.addRow({

            serial:
            code.serial_number,

            code:
            code.package_code

        });

    });

    const outputDir =
        path.join(
            __dirname,
            "../generated/excel"
        );

    if(
        !fs.existsSync(outputDir)
    ){

        fs.mkdirSync(
            outputDir,
            {
                recursive:true
            }
        );

    }

    // Modification appliquée ici : préfixe avec le nom de base
    const fileName =
        `${baseName}_codes.xlsx`;

    const filePath =
        path.join(
            outputDir,
            fileName
        );

    await workbook.xlsx.writeFile(
        filePath
    );

    return {
        fileName,
        filePath
    };

}

module.exports = {
    generateExcelCodes
};