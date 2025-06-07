import Joi from 'joi';

// User Validator
export const validateUser = (data) => {
    const schema = Joi.object({
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
                'any.only': 'Role must be one of: parent, kid, teacher, admin',
                'any.required': 'Role is required'
            }),
        isActive: Joi.boolean()
            .default(true)
            .messages({
                'boolean.base': 'isActive must be a boolean value'
            }),
        isVerified: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'isVerified must be a boolean value'
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
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Full name cannot be empty',
                'string.min': 'Full name must be at least 2 characters long',
                'string.max': 'Full name cannot exceed 100 characters',
                'any.required': 'Full name is required'
            }),
        dateOfBirth: Joi.date()
            .max('now')
            .optional()
            .messages({
                'date.base': 'Invalid date format',
                'date.max': 'Date of birth cannot be in the future'
            }),
        gender: Joi.string()
            .valid('male', 'female')
            .required()
            .messages({
                'any.only': 'Gender must be either male or female',
                'any.required': 'Gender is required'
            }),
        image: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Image must be a valid URL'
            }),
        address: Joi.string()
            .max(200)
            .optional()
            .messages({
                'string.max': 'Address cannot exceed 200 characters'
            }),
        phoneNumber: Joi.string()
            .pattern(/^[0-9]{10,15}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Phone number must be 10-15 digits'
            }),
        subscriptionType: Joi.string()
            .valid('free', 'premium')
            .default('free')
            .messages({
                'any.only': 'Subscription type must be either free or premium'
            }),
        subscriptionExpiry: Joi.date()
            .min('now')
            .optional()
            .allow(null)
            .messages({
                'date.base': 'Invalid subscription expiry date format',
                'date.min': 'Subscription expiry date cannot be in the past'
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
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Full name cannot be empty',
                'string.min': 'Full name must be at least 2 characters long',
                'string.max': 'Full name cannot exceed 100 characters',
                'any.required': 'Full name is required'
            }),
        dateOfBirth: Joi.date()
            .max('now')
            .required()
            .messages({
                'date.base': 'Invalid date format',
                'date.max': 'Date of birth cannot be in the future',
                'any.required': 'Date of birth is required'
            }),
        gender: Joi.string()
            .valid('male', 'female')
            .required()
            .messages({
                'any.only': 'Gender must be either male or female',
                'any.required': 'Gender is required'
            }),
        points: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Points must be a number',
                'number.min': 'Points cannot be negative'
            }),
        level: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Level must be a number',
                'number.min': 'Level cannot be negative'
            }),
        avatar: Joi.string()
            .optional()
            .messages({
                'string.base': 'Avatar must be a string'
            }),
        unlockedAvatars: Joi.array()
            .items(Joi.string())
            .default([])
            .messages({
                'array.base': 'Unlocked avatars must be an array'
            }),
        achievements: Joi.array()
            .items(Joi.string())
            .default([])
            .messages({
                'array.base': 'Achievements must be an array'
            }),
        streak: Joi.object({
            current: Joi.number()
                .min(0)
                .default(0)
                .messages({
                    'number.base': 'Current streak must be a number',
                    'number.min': 'Current streak cannot be negative'
                }),
            longest: Joi.number()
                .min(0)
                .default(0)
                .messages({
                    'number.base': 'Longest streak must be a number',
                    'number.min': 'Longest streak cannot be negative'
                })
        }).default({ current: 0, longest: 0 })
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
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Full name cannot be empty',
                'string.min': 'Full name must be at least 2 characters long',
                'string.max': 'Full name cannot exceed 100 characters',
                'any.required': 'Full name is required'
            }),
        phoneNumber: Joi.string()
            .pattern(/^[0-9]{10,15}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Phone number must be 10-15 digits'
            }),
        specializations: Joi.array()
            .items(Joi.string().min(2).max(50))
            .default([])
            .messages({
                'array.base': 'Specializations must be an array',
                'string.min': 'Each specialization must be at least 2 characters long',
                'string.max': 'Each specialization cannot exceed 50 characters'
            }),
        bio: Joi.string()
            .max(500)
            .optional()
            .messages({
                'string.max': 'Bio cannot exceed 500 characters'
            }),
        coursesCreated: Joi.array()
            .items(Joi.string())
            .default([])
            .messages({
                'array.base': 'Courses created must be an array'
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
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Full name cannot be empty',
                'string.min': 'Full name must be at least 2 characters long',
                'string.max': 'Full name cannot exceed 100 characters',
                'any.required': 'Full name is required'
            }),
        phoneNumber: Joi.string()
            .pattern(/^[0-9]{10,15}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Phone number must be 10-15 digits'
            })
    });

    return schema.validate(data);
};

// Login Validator (since we now use email instead of username)
export const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Invalid email format',
                'string.empty': 'Email cannot be empty',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .required()
            .messages({
                'string.empty': 'Password cannot be empty',
                'any.required': 'Password is required'
            })
    });

    return schema.validate(data);
};

// Email Validator (for email verification, password reset, etc.)
export const validateEmail = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Invalid email format',
                'string.empty': 'Email cannot be empty',
                'any.required': 'Email is required'
            })
    });

    return schema.validate(data);
};

// Password Update Validator
export const validatePasswordUpdate = (data) => {
    const schema = Joi.object({
        currentPassword: Joi.string()
            .required()
            .messages({
                'string.empty': 'Current password cannot be empty',
                'any.required': 'Current password is required'
            }),
        newPassword: Joi.string()
            .min(6)
            .required()
            .messages({
                'string.empty': 'New password cannot be empty',
                'string.min': 'New password must be at least 6 characters long',
                'any.required': 'New password is required'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('newPassword'))
            .required()
            .messages({
                'any.only': 'Passwords do not match',
                'any.required': 'Password confirmation is required'
            })
    });

    return schema.validate(data);
};
