const Joi = require('joi'); // Fixed capitalization of Joi

const registerValidation = (data) => {
    const schemaValidation = Joi.object({
        username: Joi.string().required().min(3).max(256),
        email: Joi.string().required().min(6).max(256).email(),
        password: Joi.string().required().min(6).max(1024)
    });
    return schemaValidation.validate(data);
};

const loginValidation = (data) => {
    const schemaValidation = Joi.object({
        email: Joi.string().required().min(6).max(256).email(),
        password: Joi.string().required().min(6).max(1024)
    });
    return schemaValidation.validate(data);
};

const postValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        text: Joi.string().min(5).required(),
        topic: Joi.string().valid('Politics', 'Health', 'Sport', 'Tech').required(),
        duration: Joi.number().integer().min(1).max(999).required(), // Duration in minutes
    });
    return schema.validate(data);
};

module.exports = {
    registerValidation,
    loginValidation,
    postValidation
};