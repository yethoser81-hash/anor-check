const express =
require("express");

const router =
express.Router();

const {
    getSealMap
}
=
require(
    "../controllers/mapController"
);

// Cette route reste accessible publiquement pour permettre la vérification des sceaux lors des scans terrain
router.get(
    "/:sealID",
    getSealMap
);

module.exports =
router;