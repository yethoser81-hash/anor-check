const Joi = require("joi");

module.exports = Joi.object({

    product_name:
    Joi.string().required(),

    producer_name:
    Joi.string().required(),

    producer_email:
    Joi.string()
    .email()
    .required(),

    lot_number:
    Joi.string().required(),

    quantity_declared:
    Joi.number()
    .integer()
    .min(1)
    .required()

});