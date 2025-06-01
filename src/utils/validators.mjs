import Joi from 'joi';

// User Validator
export const validateUser = (data) => {
    const schema = Joi.object({
        username: Joi.string()
            .min(3)
            .max(30)
            .required()
            .messages({
                'string.empty': 'Username cannot be empty',
                'string.min': 'Username must be at least 3 characters long',
                'string.max': 'Username cannot exceed 30 characters',
                'any.required': 'Username is required'
            }),
        password: Joi.string()
            .min(6)
            .required()
            .messages({
                'string.empty': 'Password cannot be empty',
                'string.min': 'Password must be at least 6 characters long',
                'any.required': 'Password is required'
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Invalid email format',
                'string.empty': 'Email cannot be empty',
                'any.required': 'Email is required'
            }),
        role: Joi.string()
            .valid('parent', 'kid', 'teacher', 'admin')
            .required()
            .messages({
                'any.only': 'Invalid role',
                'any.required': 'Role is required'
            }),
        address: Joi.string()
            .optional()
            .allow('')
            .messages({
                'string.base': 'Address must be a string'
            }),
        phoneNumber: Joi.string()
            .pattern(/^[0-9]{10,11}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid phone number format'
            })
    });

    return schema.validate(data);
};

// Admin Validator
export const validateAdmin = (data) => {
    const schema = Joi.object({
        userId: Joi.string()
            .required()
            .messages({
                'string.empty': 'UserId cannot be empty',
                'any.required': 'UserId is required'
            }),
        fullName: Joi.string()
            .required()
            .messages({
                'string.empty': 'Full name cannot be empty',
                'any.required': 'Full name is required'
            })
    });

    return schema.validate(data);
};

// Kid Validator
export const validateKid = (data) => {
    const schema = Joi.object({
        userId: Joi.string()
            .required()
            .messages({
                'string.empty': 'UserId cannot be empty',
                'any.required': 'UserId is required'
            }),
        fullName: Joi.string()
            .required()
            .messages({
                'string.empty': 'Full name cannot be empty',
                'any.required': 'Full name is required'
            }),
        dateOfBirth: Joi.date()
            .required()
            .messages({
                'date.base': 'Invalid date format',
                'any.required': 'Date of birth is required'
            }),
        gender: Joi.string()
            .required()
            .messages({
                'string.empty': 'Gender cannot be empty',
                'any.required': 'Gender is required'
            }),
        points: Joi.number()
            .min(0)
            .default(0),
        avatar: Joi.string()
            .default(''),
        unlockedAvatars: Joi.array()
            .items(Joi.string())
            .default([])
    });

    return schema.validate(data);
};

// Teacher Validator
export const validateTeacher = (data) => {
    const schema = Joi.object({
        userId: Joi.string()
            .required()
            .messages({
                'string.empty': 'UserId cannot be empty',
                'any.required': 'UserId is required'
            }),
        fullName: Joi.string()
            .required()
            .messages({
                'string.empty': 'Full name cannot be empty',
                'any.required': 'Full name is required'
            })
    });

    return schema.validate(data);
};

// Parent Validator
export const validateParent = (data) => {
    const schema = Joi.object({
        userId: Joi.string()
            .required()
            .messages({
                'string.empty': 'UserId cannot be empty',
                'any.required': 'UserId is required'
            }),
        fullName: Joi.string()
            .required()
            .messages({
                'string.empty': 'Full name cannot be empty',
                'any.required': 'Full name is required'
            }),
        dateOfBirth: Joi.date()
            .required()
            .messages({
                'date.base': 'Invalid date format',
                'any.required': 'Date of birth is required'
            }),
        gender: Joi.string()
            .required()
            .messages({
                'string.empty': 'Gender cannot be empty',
                'any.required': 'Gender is required'
            })
    });

    return schema.validate(data);
};
