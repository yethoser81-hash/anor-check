function buildBaseName(

    producer,

    product,

    lot

){

    return `${producer}_${product}_${lot}`

    .normalize("NFD")

    .replace(
        /[\u0300-\u036f]/g,
        ""
    )

    .replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
    )

    .replace(
        /_+/g,
        "_"
    );

}

module.exports = {
    buildBaseName
};