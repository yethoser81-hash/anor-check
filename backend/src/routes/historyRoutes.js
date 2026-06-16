const express =
require("express");

const router =
express.Router();

const {
    getSealHistory
}
=
require(
    "../controllers/historyController"
);

router.get(
    "/:sealID",
    getSealHistory
);

module.exports =
router;