const supabase = require("../config/supabase");

exports.createProduct = async (req, res) => {

    console.log("=== REQUETE RECUE ===");
    console.log(req.body);

    try {

        // Ajout de producer_email dans le destructuring
        const {
            product_name,
            producer_name,
            producer_email,
            technical_description,
            lot_number,
            standard_reference,
            origin_country,
            certificate_date,
            production_date,
            expiration_date,
            weight_volume,
            packaging_characteristics,
            quantity_declared
        } = req.body;

        console.log("Insertion dans Supabase...");

        // Insert de la table products
        const { data, error } = await supabase
        .from("products")
        .insert([
           {
                product_name,
                producer_name,
                producer_email,
                technical_description,
                lot_number,
                standard_reference,
                origin_country,
                certificate_date,
                production_date,
                expiration_date,
                weight_volume,
                packaging_characteristics,
                quantity_declared
            }
        ])
        .select();

        console.log("DATA :", data);
        console.log("ERROR :", error);

        if(error){
            return res.status(400).json(error);
        }

        // 3. Récupération du produit créé et génération du sealId racine
        const createdProduct = data[0];
        const sealId = `ANOR-${Math.random().toString(36).substring(2,10).toUpperCase()}`;

        // 4. Générer les identifiants unitaires dans packageRows
        const packageRows = [];

        for (
            let i = 1;
            i <= quantity_declared;
            i++
        ) {
            packageRows.push({
                product_id: createdProduct.id,
                seal_id: sealId,
                unit_serial: i,
                unit_code: `${sealId}-${String(i).padStart(6,"0")}`
            });
        }

        // 5. Insertion groupée dans package_units avec capture d'erreur
        const {
            error: packageError
        } = await supabase
            .from("package_units")
            .insert(packageRows);

        if(packageError){
            throw packageError;
        }

        // 6. Retour API enrichi avec le Sceau racine et le nombre d'unités générées
        res.status(201).json({
            success:true,
            product:data[0],
            seal_id: sealId,
            units_generated: quantity_declared
        });

    } catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

};

// 8. Ajout de la fonction exportUnits pour extraire les identifiants générés
exports.exportUnits = async (req, res) => {

    const { id } = req.params;

    const {
        data,
        error
    } = await supabase
        .from("package_units")
        .select("*")
        .eq("product_id", id)
        .order(
            "unit_serial",
            { ascending: true }
        );

    if(error){
        return res.status(500).json(error);
    }

    res.json(data);

};