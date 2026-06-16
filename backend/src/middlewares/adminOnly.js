module.exports = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({
            success: false,
            message: "Non authentifié"
        });

    }

    if (
        req.user.role !== "admin"
    ) {

        return res.status(403).json({
            success: false,
            message: "Accès refusé"
        });

    }

    next();

};