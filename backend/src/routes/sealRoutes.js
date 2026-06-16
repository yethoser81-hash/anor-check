const express =
require("express");

const router =
express.Router();

const {
    verifySeal
}
=
require(
    "../controllers/verifyController"
);

router.get(
    "/verify/:sealID",
    verifySeal
);

router.post(
    "/verify",
    verifySeal
);

module.exports =
router;