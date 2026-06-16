const supabase = require("../config/supabase");

/**
 * Récupère l'historique des scans (filtré par sealID ou global, avec pagination)
 * Supporte : GET /api/history / GET /api/history/:sealID / GET /api/history?sealID=ANOR-XXX
 */
exports.getSealHistory = async (req, res) => {
    try {
        // Flexibilité de lecture pour l'administration ou les scripts d'audit
        const sealID = req.params?.sealID || req.query?.sealID;
        
        // Gestion de la pagination pour éviter les explosions de mémoire (Out Of Memory)
        const page = parseInt(req.query?.page, 10) || 1;
        const limit = parseInt(req.query?.limit, 10) || 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Base de la requête de sélection sur scan_history
        let query = supabase
            .from("scan_history")
            .select("*", { count: "exact" });

        // Application conditionnelle du filtre si un identifiant de sceau spécifique est fourni
        if (sealID) {
            query = query.eq("seal_id", sealID.trim());
        }

        // Exécution de la requête avec tri antéchronologique et fenêtrage (pagination)
        const { data, error, count } = await query
            .order("scan_time", { ascending: false }) // Aligné sur ton champ temporel
            .range(from, to);

        if (error) {
            throw error;
        }

        // Envoi de la réponse paginée et structurée
        res.json({
            success: true,
            sealID: sealID || "GLOBAL",
            pagination: {
                totalItems: count,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                limit
            },
            history: data
        });

    } catch (err) {
        console.error("Erreur récupération historique :", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * Endpoint dédié à l'extraction exclusive des points géolocalisés
 * Indispensable pour alimenter rapidement la Heatmap (Carte des fraudes) du mapController
 * GET /api/history/geo-points
 */
exports.getGeoLocationPoints = async (req, res) => {
    try {
        const { sealID } = req.query;

        let query = supabase
            .from("scan_history")
            .select("id, seal_id, latitude, longitude, city, country, scan_time")
            .not("latitude", "is", null)
            .not("longitude", "is", null);

        if (sealID) {
            query = query.eq("seal_id", sealID.trim());
        }

        // Pour la cartographie, on prend généralement les derniers points notables sans lourde pagination
        const { data, error } = await query
            .order("scan_time", { ascending: false })
            .limit(500); 

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            count: data.length,
            points: data
        });

    } catch (err) {
        console.error("Erreur extraction points géographiques :", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};