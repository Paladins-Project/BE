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
    displayName: {
        notEmpty: {
            errorMessage: "Display name cannot be empty"
        }
    },
    password: {        
        notEmpty: {
            errorMessage: "Password cannot be empty"
        }
    }
}