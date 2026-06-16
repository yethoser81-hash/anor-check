const express = require("express");

const router = express.Router();

const authenticate =
require("../middlewares/authenticate");

const adminOnly =
require("../middlewares/adminOnly");

const {
    getStats,
    getProducts,
    getMapScans,
    getAlerts,
    getIntelligence,
    toggleSuspicious,
    getProductDetail,
    getFieldReports
} = require("../controllers/adminController");

// Application des middlewares de sécurité sur toutes les routes du pôle administratif
router.get(
    "/stats", 
    authenticate, 
    adminOnly, 
    getStats
);

router.get(
    "/products", 
    authenticate, 
    adminOnly, 
    getProducts
);

router.get(
    "/map", 
    authenticate, 
    adminOnly, 
    getMapScans
);

router.get(
    "/alerts", 
    authenticate, 
    adminOnly, 
    getAlerts
);

router.get(
    "/intelligence", 
    authenticate, 
    adminOnly, 
    getIntelligence
);

// Route d'extraction du dossier complet d'un certificat pour le Modal d'audit
router.get(
    "/product/:sealId", 
    authenticate, 
    adminOnly, 
    getProductDetail
);

// Route pour récupérer les signalements terrain liés à un produit spécifique
router.get(
    "/reports/:sealId", 
    authenticate, 
    adminOnly, 
    getFieldReports
);

router.patch(
    "/seal/:sealId/suspicious", 
    authenticate, 
    adminOnly, 
    toggleSuspicious
);

module.exports = router;