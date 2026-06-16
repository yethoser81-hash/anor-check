const express =
require("express");

const router =
express.Router();

const authenticate =
require("../middlewares/authenticate");

const adminOnly =
require("../middlewares/adminOnly");

const {
    forgeSeal
} =
require("../controllers/forgeController");

const upload =
require(
    "../middlewares/forgeUpload"
);

// Sécurisation stricte de l'accès à la forge de certification numérique
router.post(
    "/",
    authenticate,
    adminOnly,
    upload.single(
        "certificate"
    ),
    forgeSeal
);

module.exports =
router;