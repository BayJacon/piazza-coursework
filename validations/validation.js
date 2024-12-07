const joi = require('joi')

const registerValidation = (data) => {
    const schemaValidation = joi.object({
        username:joi.string().required().min(3).max(256),
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)        
    })
    return schemaValidation.validate(data)
}

const loginValidation = (data) => {
    const schemaValidation = joi.object({
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)        
    })
    return schemaValidation.validate(data)
}


const postValidation = (data) => {
    const schema = joi.object({
        title: joi.string().required().min(3).max(256),
        text: joi.string().required().min(3).max(1024),
        topic: joi.string().required().min(3).max(256),
        expirationTime: joi.date().required(),
    });
    return schema.validate(data);
};

module.exports.postValidation = postValidation;
module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation