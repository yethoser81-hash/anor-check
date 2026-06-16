const supabase = require("../config/supabase");

const {
logAudit
} =
require(
"../services/auditService"
);

// ===============================
// DASHBOARD GLOBAL
// ===============================

exports.getStats = async (req, res) => {
    try {
        const { count: totalProducts } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true });

        const { count: totalSeals } = await supabase
            .from("seals")
            .select("*", { count: "exact", head: true });

        const { count: totalScans } = await supabase
            .from("scan_history")
            .select("*", { count: "exact", head: true });

        const { count: suspiciousSeals } = await supabase
            .from("seals")
            .select("*", { count: "exact", head: true })
            .eq("suspicious", true);

        res.json({
            success: true,
            totalProducts,
            totalSeals,
            totalScans,
            suspiciousSeals
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ===============================
// REGISTRY
// ===============================

exports.getProducts = async (req, res) => {
    try {
        const { data: seals, error } = await supabase
            .from("seals")
            .select(`
                *,
                products(*)
            `)
            .order("generated_at", { ascending: false });

        if (error) throw error;

        const enriched = await Promise.all(
            seals.map(async (seal) => {
                const { count } = await supabase
                    .from("scan_history")
                    .select("*", { count: "exact", head: true })
                    .eq("seal_id", seal.seal_id);

                const { data: lastScan } = await supabase
                    .from("scan_history")
                    .select("*")
                    .eq("seal_id", seal.seal_id)
                    .order("scan_time", { ascending: false })
                    .limit(1);

                return {
                    seal_id: seal.seal_id,
                    suspicious: seal.suspicious,
                    generated_at: seal.generated_at,
                    product_name: seal.products?.product_name || null,
                    producer_name: seal.products?.producer_name || null,
                    lot_number: seal.products?.lot_number || null,
                    quantity_declared: seal.products?.quantity_declared || 1,
                    scan_count: count || 0,
                    last_scan_at: lastScan?.[0]?.scan_time || null,
                    city: lastScan?.[0]?.city || null,
                    country: lastScan?.[0]?.country || null
                };
            })
        );

        res.json(enriched);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ===============================
// MAP DATA
// ===============================

exports.getMapScans = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("scan_history")
            .select(`
                *,
                seals(
                    seal_id,
                    suspicious,
                    products(
                        product_name,
                        producer_name
                    )
                )
            `)
            .not("latitude", "is", null)
            .not("longitude", "is", null)
            .order("scan_time", { ascending: false });

        if (error) throw error;

        res.json(data);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ===============================
// ALERTS (MOTEUR PROPORTIONNEL PAR LOT)
// ===============================

exports.getAlerts = async (req, res) => {
    try {
        const alerts = [];

        const { data: scans, error: scanError } = await supabase
            .from("scan_history")
            .select("*");

        if (scanError) throw scanError;

        const sealIds = [
            ...new Set(
                scans.map(s => s.seal_id).filter(Boolean)
            )
        ];

        const { data: seals } = await supabase
            .from("seals")
            .select(`
                *,
                products(
                    product_name,
                    producer_name,
                    quantity_declared
                )
            `)
            .in("seal_id", sealIds);

        const sealMap = {};

        (seals || []).forEach(seal => {
            sealMap[seal.seal_id] = seal;
        });

        scans.forEach(scan => {
            scan.seals = sealMap[scan.seal_id] || null;
        });

        const sealCounter = {};

        scans.forEach(scan => {
            if (!scan.seal_id) return;
            
            if (!sealCounter[scan.seal_id]) {
                sealCounter[scan.seal_id] = {
                    count: 0,
                    product_name: scan.seals?.products?.product_name || "Produit inconnu",
                    producer_name: scan.seals?.products?.producer_name || "Producteur inconnu",
                    quantity_declared: scan.seals?.products?.quantity_declared || 1
                };
            }
            sealCounter[scan.seal_id].count++;
        });

        const TOLERANCE_FACTOR = 1.4;

        Object.entries(sealCounter).forEach(([sealId, data]) => {
            const allowedLimit = data.quantity_declared * TOLERANCE_FACTOR;

            if (data.count > allowedLimit) {
                alerts.push({
                    level: "HIGH",
                    type: "VOLUME_OVERFLOW",
                    seal_id: sealId,
                    count: data.count,
                    quantity_declared: data.quantity_declared,
                    message: `Volume suspect : ${data.count} scans enregistrés pour un lot déclaré de ${data.quantity_declared} unités (${data.product_name} - ${data.producer_name}).`
                });
            }
        });

        scans.forEach(scan => {
            if (scan.seals?.suspicious) {
                const alreadyAlerted = alerts.some(a => a.seal_id === scan.seal_id && a.level === "CRITICAL");
                
                if (!alreadyAlerted) {
                    alerts.push({
                        level: "CRITICAL",
                        type: "SUSPICIOUS",
                        seal_id: scan.seal_id,
                        message: `Le sceau ${scan.seal_id} est explicitement marqué suspect dans le système.`
                    });
                }
            }
        });

        res.json(alerts);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ===============================
// INTELLIGENCE ANOR
// ===============================

exports.getIntelligence = async (req, res) => {
    try {
        const { data: scans } = await supabase
            .from("scan_history")
            .select("*");

        const { data: suspicious } = await supabase
            .from("seals")
            .select("*")
            .eq("suspicious", true);

        const cityCounter = {};

        scans.forEach(scan => {
            const city = scan.city || "Inconnue";
            cityCounter[city] = (cityCounter[city] || 0) + 1;
        });

        let priorityCity = null;
        let max = 0;

        Object.entries(cityCounter).forEach(([city, count]) => {
            if (count > max) {
                max = count;
                priorityCity = city;
            }
        });

        const fraudRate = scans.length === 0 
            ? 0 
            : (suspicious.length / scans.length) * 100;

        // Top produits / Sceaux les plus scannés
        const productCounter = {};

        for (const scan of scans) {
            const sealId = scan.seal_id;
            if (!productCounter[sealId]) {
                productCounter[sealId] = 0;
            }
            productCounter[sealId]++;
        }

        const topSeals = Object.entries(productCounter)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([seal_id, total]) => ({
                seal_id,
                total
            }));

        res.json({
            success: true,
            priorityCity,
            totalScans: scans.length,
            suspiciousSeals: suspicious.length,
            fraudRate: fraudRate.toFixed(2),
            topSeals
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ===============================
// ACTIONS DE MODÉRATION TERRAIN
// ===============================

exports.toggleSuspicious = async (req, res) => {
    try {
        const { sealId } = req.params;
        const { suspicious } = req.body;

        const {
        data:oldSeal
        } =
        await supabase
        .from("seals")
        .select("*")
        .eq(
        "seal_id",
        sealId
        )
        .single();

        const { error } = await supabase
            .from("seals")
            .update({ suspicious })
            .eq("seal_id", sealId);

        if (error) throw error;

        await logAudit({
        user_id:
        req.user.id,
        action:
        "TOGGLE_SUSPICIOUS",
        entity:
        "seal",
        entity_id:
        sealId,
        old_value:
        oldSeal,
        new_value:
        {
        suspicious
        }
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ===============================
// CONSULTATION AVANCÉE (FICHE PRODUT)
// ===============================

exports.getProductDetail = async (req, res) => {
    try {
        const { sealId } = req.params;

        const { data, error } = await supabase
            .from("seals")
            .select(`
                *,
                products(*)
            `)
            .eq("seal_id", sealId)
            .single();

        if (error) throw error;

        const { data: scans } = await supabase
            .from("scan_history")
            .select("*")
            .eq("seal_id", sealId)
            .order("scan_time", { ascending: false });

        res.json({
            product: data,
            scans: scans || []
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getFieldReports = async (req, res) => {
    try {
        const { sealId } = req.params;

        const { data, error } = await supabase
            .from("field_reports")
            .select("*")
            .eq("seal_id", sealId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.json(data);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};