const express = require("express");
const router = express.Router();

const authenticate =
require("../middlewares/authenticate");

const adminOnly =
require("../middlewares/adminOnly");

const {
    createProduct,
    exportUnits
} = require("../controllers/productController");

// Sécurisation de la création de produit et génération de kit
router.post(
    "/", 
    authenticate, 
    adminOnly, 
    createProduct
);

// Sécurisation de l'exportation des identifiants d'unités sérialisées du lot
router.get(
    "/:id/export-units",
    authenticate,
    adminOnly,
    exportUnits
);

module.exports = router;