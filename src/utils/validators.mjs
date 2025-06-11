import Joi from 'joi';
import mongoose from 'mongoose';

// Custom Joi extension for ObjectId validation
const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('string.objectId');
    }
    return value;
};

// Custom Joi schema for ObjectId
const objectIdSchema = () => Joi.string().custom(objectIdValidator).messages({
    'string.objectId': 'Invalid ID format'
});

// Validate single ObjectId parameter (e.g., from URL params)
export const validateObjectIdParam = (id, paramName = 'ID') => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
            success: false,
            status: 400,
            message: `Invalid ${paramName} format`
        };
    }
    return { success: true };
};

// Verify Validator  
export const validateVerify = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Invalid email format',
                'string.empty': 'Email cannot be empty',
                'any.required': 'Email is required'
            }),
        code: Joi.string()
            .length(6)
            .pattern(/^[0-9]+$/)
            .required()
            .messages({
                'string.empty': 'Verification code cannot be empty',
                'string.length': 'Verification code must be exactly 6 digits',
                'string.pattern.base': 'Verification code must contain only numbers',
                'any.required': 'Verification code is required'
            })
    });

    return schema.validate(data);
};

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
        userId: objectIdSchema()
            .required()
            .messages({
                'string.empty': 'UserId cannot be empty',
                'string.objectId': 'Invalid user ID format',
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
        userId: objectIdSchema()
            .required()
            .messages({
                'string.empty': 'UserId cannot be empty',
                'string.objectId': 'Invalid user ID format',
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
        userId: objectIdSchema()
            .required()
            .messages({
                'string.empty': 'UserId cannot be empty',
                'string.objectId': 'Invalid user ID format',
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
            .items(objectIdSchema().messages({
                'string.objectId': 'Invalid course ID format'
            }))
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
        userId: objectIdSchema()
            .required()
            .messages({
                'string.empty': 'UserId cannot be empty',
                'string.objectId': 'Invalid user ID format',
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

// Course Validator
export const validateCourse = (data) => {
    const schema = Joi.object({
        title: Joi.string()
            .min(5)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Title cannot be empty',
                'string.min': 'Title must be at least 5 characters long',
                'string.max': 'Title cannot exceed 200 characters',
                'any.required': 'Title is required'
            }),
        description: Joi.string()
            .min(10)
            .max(1000)
            .required()
            .messages({
                'string.empty': 'Description cannot be empty',
                'string.min': 'Description must be at least 10 characters long',
                'string.max': 'Description cannot exceed 1000 characters',
                'any.required': 'Description is required'
            }),
        category: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Category cannot be empty',
                'string.min': 'Category must be at least 2 characters long',
                'string.max': 'Category cannot exceed 50 characters',
                'any.required': 'Category is required'
            }),
        ageGroup: Joi.string()
            .valid('5-10', '10-15')
            .required()
            .messages({
                'any.only': 'Age group must be either 5-10 or 10-15',
                'any.required': 'Age group is required'
            }),
        thumbnailUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Thumbnail URL must be a valid URL'
            }),
        pointsEarned: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Points earned must be a number',
                'number.min': 'Points earned cannot be negative'
            }),
        isPremium: Joi.boolean()
            .default(false)
            .required()
            .messages({
                'boolean.base': 'isPremium must be a boolean value',
                'any.required': 'isPremium is required'
            }),
        instructor: objectIdSchema()
            .optional()
            .messages({
                'string.base': 'Instructor must be a valid ID',
                'string.objectId': 'Invalid instructor ID format'
            }),
        isPublished: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'isPublished must be a boolean value'
            })
    });

    return schema.validate(data);
};

// Lesson Validator
export const validateLesson = (data) => {
    const schema = Joi.object({
        courseId: objectIdSchema()
            .required()
            .messages({
                'string.empty': 'Course ID cannot be empty',
                'string.objectId': 'Invalid course ID format',
                'any.required': 'Course ID is required'
            }),
        title: Joi.string()
            .min(5)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Title cannot be empty',
                'string.min': 'Title must be at least 5 characters long',
                'string.max': 'Title cannot exceed 200 characters',
                'any.required': 'Title is required'
            }),
        description: Joi.string()
            .min(10)
            .max(1000)
            .required()
            .messages({
                'string.empty': 'Description cannot be empty',
                'string.min': 'Description must be at least 10 characters long',
                'string.max': 'Description cannot exceed 1000 characters',
                'any.required': 'Description is required'
            }),
        content: Joi.object()
            .default({})
            .messages({
                'object.base': 'Content must be an object'
            }),
        videoUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Video URL must be a valid URL'
            }),
        audioUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Audio URL must be a valid URL'
            }),
        imageUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Image URL must be a valid URL'
            }),
        duration: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Duration must be a number',
                'number.min': 'Duration cannot be negative'
            }),
        order: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Order must be a number',
                'number.min': 'Order cannot be negative'
            }),
        isPublished: Joi.boolean()
            .default(true)
            .messages({
                'boolean.base': 'isPublished must be a boolean value'
            }),
        createdBy: objectIdSchema()
            .optional()
            .messages({
                'string.base': 'Created by must be a valid ID',
                'string.objectId': 'Invalid createdBy ID format'
            })
    });

    return schema.validate(data);
};

// Question Validator (for Test)
export const validateQuestion = (data) => {
    const schema = Joi.object({
        questionText: Joi.string()
            .min(5)
            .max(500)
            .required()
            .messages({
                'string.empty': 'Question text cannot be empty',
                'string.min': 'Question text must be at least 5 characters long',
                'string.max': 'Question text cannot exceed 500 characters',
                'any.required': 'Question text is required'
            }),
        questionType: Joi.string()
            .valid('multiple-choice', 'true-false', 'fill-blank', 'matching', 'ordering')
            .required()
            .messages({
                'any.only': 'Question type must be one of: multiple-choice, true-false, fill-blank, matching, ordering',
                'any.required': 'Question type is required'
            }),
        options: Joi.array()
            .items(Joi.string().min(1).max(100))
            .optional()
            .messages({
                'array.base': 'Options must be an array'
            }),
        correctAnswer: Joi.alternatives()
            .try(
                Joi.string(),
                Joi.number(),
                Joi.boolean(),
                Joi.array(),
                Joi.object()
            )
            .required()
            .messages({
                'any.required': 'Correct answer is required'
            }),
        explanation: Joi.string()
            .max(500)
            .optional()
            .messages({
                'string.max': 'Explanation cannot exceed 500 characters'
            }),
        points: Joi.number()
            .min(1)
            .default(10)
            .messages({
                'number.base': 'Points must be a number',
                'number.min': 'Points must be at least 1'
            }),
        imageUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Image URL must be a valid URL'
            }),
        audioUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Audio URL must be a valid URL'
            }),
        videoUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Video URL must be a valid URL'
            })
    });

    return schema.validate(data);
};

// Test Validator
export const validateTest = (data) => {
    const schema = Joi.object({
        lessonId: objectIdSchema()
            .required()
            .messages({
                'string.empty': 'Lesson ID cannot be empty',
                'string.objectId': 'Invalid lesson ID format',
                'any.required': 'Lesson ID is required'
            }),
        title: Joi.string()
            .min(5)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Title cannot be empty',
                'string.min': 'Title must be at least 5 characters long',
                'string.max': 'Title cannot exceed 200 characters',
                'any.required': 'Title is required'
            }),
        description: Joi.string()
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Description cannot exceed 1000 characters'
            }),
        timeLimit: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Time limit must be a number',
                'number.min': 'Time limit cannot be negative'
            }),
        passingScore: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Passing score must be a number',
                'number.min': 'Passing score cannot be negative'
            }),
        attempts: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Attempts must be a number',
                'number.min': 'Attempts cannot be negative'
            }),
        questions: Joi.array()
            .items(Joi.object())
            .min(1)
            .required()
            .messages({
                'array.base': 'Questions must be an array',
                'array.min': 'Test must have at least 1 question',
                'array.empty': 'Questions cannot be empty',
                'any.required': 'Questions are required'
            }),
        totalPoints: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Total points must be a number',
                'number.min': 'Total points cannot be negative'
            }),
        createdBy: objectIdSchema()
            .optional()
            .messages({
                'string.base': 'Created by must be a valid teacher ID',
                'string.objectId': 'Invalid teacher ID format'
            })
    });

    return schema.validate(data);
};

// Course Progress Validator
export const validateCourseProgress = (data) => {
    const schema = Joi.object({
        courseId: objectIdSchema()
            .required()
            .messages({
                'string.empty': 'Course ID cannot be empty',
                'string.objectId': 'Invalid course ID format',
                'any.required': 'Course ID is required'
            }),
        kidId: objectIdSchema()
            .required()
            .messages({
                'string.empty': 'Kid ID cannot be empty',
                'string.objectId': 'Invalid kid ID format',
                'any.required': 'Kid ID is required'
            }),
        status: Joi.boolean()
            .default(false)
            .required()
            .messages({
                'boolean.base': 'Status must be a boolean value',
                'any.required': 'Status is required'
            }),
        testResults: Joi.array()
            .items(Joi.object({
                testId: objectIdSchema().optional().messages({
                    'string.objectId': 'Invalid test ID format'
                }),
                score: Joi.number().min(0).default(0),
                passed: Joi.boolean().default(false)
            }))
            .default([])
            .messages({
                'array.base': 'Test results must be an array'
            }),
        lessonCompleted: Joi.array()
            .items(Joi.object({
                lessonId: objectIdSchema().optional().messages({
                    'string.objectId': 'Invalid lesson ID format'
                })
            }))
            .default([])
            .messages({
                'array.base': 'Lesson completed must be an array'
            })
    });

    return schema.validate(data);
};

// Update Service Validator - For validating partial updates without requiring all fields
export const updateServiceValidator = (data, entityType = 'lesson') => {
    // Helper function to validate URL
    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    };

    // Check if any data is provided
    if (Object.keys(data).length === 0) {
        return {
            error: {
                details: [{ message: 'No data provided for update' }]
            }
        };
    }

    // Validate specific fields based on entity type
    if (entityType === 'lesson') {
        // Title validation
        if (data.hasOwnProperty('title')) {
            if (typeof data.title !== 'string' || data.title.length < 5 || data.title.length > 200) {
                return {
                    error: {
                        details: [{ message: 'Title must be between 5 and 200 characters' }]
                    }
                };
            }
        }

        // Description validation
        if (data.hasOwnProperty('description')) {
            if (typeof data.description !== 'string' || data.description.length < 10 || data.description.length > 1000) {
                return {
                    error: {
                        details: [{ message: 'Description must be between 10 and 1000 characters' }]
                    }
                };
            }
        }

        // Video URL validation
        if (data.hasOwnProperty('videoUrl')) {
            if (data.videoUrl && (typeof data.videoUrl !== 'string' || !isValidUrl(data.videoUrl))) {
                return {
                    error: {
                        details: [{ message: 'Video URL must be a valid URL' }]
                    }
                };
            }
        }

        // Audio URL validation
        if (data.hasOwnProperty('audioUrl')) {
            if (data.audioUrl && (typeof data.audioUrl !== 'string' || !isValidUrl(data.audioUrl))) {
                return {
                    error: {
                        details: [{ message: 'Audio URL must be a valid URL' }]
                    }
                };
            }
        }

        // Image URL validation
        if (data.hasOwnProperty('imageUrl')) {
            if (data.imageUrl && (typeof data.imageUrl !== 'string' || !isValidUrl(data.imageUrl))) {
                return {
                    error: {
                        details: [{ message: 'Image URL must be a valid URL' }]
                    }
                };
            }
        }

        // Duration validation
        if (data.hasOwnProperty('duration')) {
            if (typeof data.duration !== 'number' || data.duration < 0) {
                return {
                    error: {
                        details: [{ message: 'Duration must be a non-negative number' }]
                    }
                };
            }
        }

        // Order validation
        if (data.hasOwnProperty('order')) {
            if (typeof data.order !== 'number' || data.order < 0) {
                return {
                    error: {
                        details: [{ message: 'Order must be a non-negative number' }]
                    }
                };
            }
        }

        // isPublished validation
        if (data.hasOwnProperty('isPublished')) {
            if (typeof data.isPublished !== 'boolean') {
                return {
                    error: {
                        details: [{ message: 'isPublished must be a boolean value' }]
                    }
                };
            }
        }

        // Content validation (if provided, should be an object)
        if (data.hasOwnProperty('content')) {
            if (data.content !== null && typeof data.content !== 'object') {
                return {
                    error: {
                        details: [{ message: 'Content must be an object' }]
                    }
                };
            }
        }

        // Course ID validation
        if (data.hasOwnProperty('courseId')) {
            if (!mongoose.Types.ObjectId.isValid(data.courseId)) {
                return {
                    error: {
                        details: [{ message: 'Invalid course ID format' }]
                    }
                };
            }
        }

        // Created by validation
        if (data.hasOwnProperty('createdBy')) {
            if (data.createdBy && !mongoose.Types.ObjectId.isValid(data.createdBy)) {
                return {
                    error: {
                        details: [{ message: 'Invalid creator ID format' }]
                    }
                };
            }
        }
    }

    // Add more entity types here in the future (course, user, etc.)
    // Example:
    // if (entityType === 'course') {
    //     // Course-specific validation rules
    // }

    // If all validations pass
    return {
        error: null,
        value: data
    };
};
