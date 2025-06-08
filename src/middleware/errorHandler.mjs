// JSON parsing error handler middleware
export const jsonParsingErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON parsing error:', err);
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format in request body'
        });
    }
    next(err);
};

// Middleware to handle JSON sent with text/plain content-type
export const textPlainJsonHandler = (req, res, next) => {
    if (req.headers['content-type'] === 'text/plain' && req.method === 'POST') {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                req.body = JSON.parse(data);
                next();
            } catch (error) {
                console.error('Error parsing JSON from text/plain:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON format in request body'
                });
            }
        });
    } else {
        next();
    }
};

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error caught by error handler:', err);
    
    // Default error
    let error = {
        message: err.message || 'Internal Server Error',
        status: err.status || err.statusCode || 500
    };

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = {
            message: messages.join(', '),
            status: 400
        };
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = {
            message: `${field} already exists`,
            status: 400
        };
    }

    // MongoDB CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        error = {
            message: 'Invalid ID format',
            status: 400
        };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = {
            message: 'Invalid token',
            status: 401
        };
    }

    if (err.name === 'TokenExpiredError') {
        error = {
            message: 'Token expired',
            status: 401
        };
    }

    // Return JSON error response
    res.status(error.status).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 handler middleware
export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
}; 