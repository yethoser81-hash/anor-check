const express =
require("express");

const router =
express.Router();

const {
    overview,
    alerts
}
=
require(
    "../controllers/dashboardController"
);

router.get(
    "/overview",
    overview
);

router.get(
    "/alerts",
    alerts
);

module.exports =
router;