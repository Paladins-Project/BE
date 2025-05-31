export const createUserValidationSchema = {
    username: {
        isLength: {
            errorMessage: "Username cannot be empty",
            options: { min: 1, max: 99 }
        },
        notEmpty: {
            errorMessage: "Username cannot be empty"
        },
        isString: {
            errorMessage: "Username must be a string"
        }
    },
    fullName: {
        notEmpty: {
            errorMessage: "Full name cannot be empty"
        },
        isString: {
            errorMessage: "Full name must be a string"
        },
        isLength: {
            errorMessage: "Full name must be between 2 and 100 characters",
            options: { min: 2, max: 100 }
        }
    },
    email: {
        notEmpty: {
            errorMessage: "Email cannot be empty"
        },
        isEmail: {
            errorMessage: "Please provide a valid email address"
        },
        normalizeEmail: true
    },
    phoneNumber: {
        notEmpty: {
            errorMessage: "Phone number cannot be empty"
        },
        isMobilePhone: {
            errorMessage: "Please provide a valid phone number",
            options: 'vi-VN'
        }
    },
    address: {
        notEmpty: {
            errorMessage: "Address cannot be empty"
        },
        isString: {
            errorMessage: "Address must be a string"
        },
        isLength: {
            errorMessage: "Address must be between 10 and 200 characters",
            options: { min: 10, max: 200 }
        }
    },
    password: {        
        notEmpty: {
            errorMessage: "Password cannot be empty"
        },
        isLength: {
            errorMessage: "Password must be at least 6 characters long",
            options: { min: 6 }
        }
    }
}