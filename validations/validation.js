//require package for checking email addresses are valid
const Joi = require('joi'); 

// checks that user registrations are a legitimate and manageable length
const registerValidation = (data) => {
    const schemaValidation = Joi.object({
        username: Joi.string().required().min(3).max(256),
        email: Joi.string().required().min(6).max(150).email(),
        password: Joi.string().required().min(6).max(50)
    });
    return schemaValidation.validate(data);
};

// checks that login credentials are a legitimate and manageable length
const loginValidation = (data) => {
    const schemaValidation = Joi.object({
        email: Joi.string().required().min(6).max(150).email(),
        password: Joi.string().required().min(6).max(50)
    });
    return schemaValidation.validate(data);
};

// check that post includes one of four topics, has a minimum length and matches schema
const postValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        text: Joi.string().min(5).required(),
        topic: Joi.string().valid('Politics', 'Health', 'Sport', 'Tech').required(),
        duration: Joi.number().integer().min(1).max(999).required(), // Duration of post in minutes
    });
    return schema.validate(data);
};

// ensures comments are a ceertain length and match schema
const commentValidation = (data) => {
    const schema = Joi.object({
        text: Joi.string().min(1).max(300).required()
    });
    return schema.validate(data);
};

module.exports = {
    registerValidation,
    loginValidation,
    postValidation,
    commentValidation
};