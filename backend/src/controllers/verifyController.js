const supabase = require("../config/supabase");

exports.verifySeal = async (req, res) => {
    try {
        // Triple compatibilité (Body, Route Params ou Query String)
        const sealID = 
            req.body?.sealID || 
            req.params?.sealID ||
            req.query?.sealID;

        const {
            latitude,
            longitude,
            city,
            country
        } = req.body || {};

        if (!sealID) {
            return res.status(400).json({
                success: false,
                message: "L'identifiant du sceau (sealID) est manquant."
            });
        }

        // Collecte des métadonnées réseau et client
        const ip =
            req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            null;

        const userAgent =
            req.headers["user-agent"] ||
            null;

        // Récupération du statut du sceau et des informations du produit associé
        const { data: seal, error: sealError } = await supabase
            .from("seals")
            .select(`
                *,
                products(*)
            `)
            .eq("seal_id", sealID)
            .single();

        if (sealError || !seal) {
            return res.status(404).json({
                success: false,
                authentic: false,
                message: "Sceau introuvable"
            });
        }

        // Vérification du statut d'activation du sceau
        if (seal.status && seal.status.toLowerCase() !== "active") {
            return res.json({
                success: true,
                authentic: false,
                message: "Sceau désactivé",
                sealID: seal.seal_id
            });
        }

        // AJUSTEMENT CRITIQUE : Insertion forcée du scan_time pour synchroniser l'écosystème
        const { error: scanError } = await supabase
            .from("scan_history")
            .insert([{
                seal_id: sealID,
                scan_time: new Date().toISOString(),
                ip_address: ip,
                user_agent: userAgent,
                latitude: latitude || null,
                longitude: longitude || null,
                city: city || null,
                country: country || null
            }]);

        if (scanError) {
            throw scanError;
        }

        // Récupération du nombre réel de scans mis à jour
        const { count: scanCount } = await supabase
            .from("scan_history")
            .select("*", { count: "exact", head: true })
            .eq("seal_id", sealID);

        const product = seal.products;
        
        // Sécurisation du typage numérique de la quantité déclarée
        const quantityDeclared = Number(product?.quantity_declared) || 1;

        // Algorithme de calcul du risque basé sur le volume strict
        let riskLevel = "LOW";

        if (scanCount > quantityDeclared) {
            riskLevel = "MEDIUM";
        }

        if (scanCount > (quantityDeclared * 2)) {
            riskLevel = "HIGH";
        }

        // Effet cliquet – Un sceau historiquement suspect reste suspect
        let suspicious = seal.suspicious || false;

        // Verrouillage persistant du sceau en base si le niveau de risque devient critique
        if (riskLevel === "HIGH") {
            suspicious = true;

            await supabase
                .from("seals")
                .update({ suspicious: true })
                .eq("seal_id", sealID);
        }

        // Formatage de la charge utile de réponse pour le client
        const productData = {
            product_name: product?.product_name || null,
            producer_name: product?.producer_name || null,
            technical_description: product?.technical_description || null,
            lot_number: product?.lot_number || null,
            standard_reference: product?.standard_reference || null,
            origin_country: product?.origin_country || null,
            weight_volume: product?.weight_volume || null,
            packaging_characteristics: product?.packaging_characteristics || null,
            certificate_url: product?.certificate_url || null,
            packaging_photo_url: product?.packaging_photo_url || null,
            packaging_image_name: product?.packaging_image_name || null
        };

        if (product?.origin_country && product.origin_country.toLowerCase() === "cameroun") {
            productData.certificate_date = product.certificate_date;
        } else {
            productData.production_date = product?.production_date || null;
            productData.expiration_date = product?.expiration_date || null;
        }

        let message = "Sceau authentique";
        if (suspicious) {
            message = "Authentique mais utilisation suspecte";
        }

        // Calcul informatif du ratio pour le tableau de bord
        const scanRatio = Number(((scanCount || 1) / quantityDeclared).toFixed(4));

        res.json({
            success: true,
            authentic: true,
            suspicious,
            riskLevel,
            quantityDeclared,
            scanRatio,
            scanCount: scanCount || 1,
            message,
            sealID: seal.seal_id,
            generatedAt: seal.generated_at,
            product: productData
        });

    } catch (err) {
        console.error("Erreur critique lors de la vérification :", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};