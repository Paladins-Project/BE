import { Course } from '../models/course.mjs';
import { Teacher } from '../models/teacher.mjs';
import { CourseProgress } from '../models/courseProgress.mjs';
import { validateCourse, validateObjectIdParam } from '../utils/validators.mjs';
import { validateCreatedBy } from '../utils/helpers.mjs';
import mongoose from 'mongoose';

// Create a new course
export const createCourseAsync = async (courseData) => {
    try {
        // Validate course data
        const validation = validateCourse(courseData);
        if (validation.error) {
            return {
                success: false,
                status: 400,
                message: validation.error.details[0].message
            };
        }
        // Validate instructor if provided
        if (courseData.instructor) {
            const instructorValidation = await validateCreatedBy(courseData.instructor);
            if (!instructorValidation.isValid) {
                return {
                    success: false,
                    status: 400,
                    message: instructorValidation.message
                };
            }
        }
        // Create new course
        const course = new Course(validation.value);
        const savedCourse = await course.save();        
        // If instructor is provided, add course to teacher's coursesCreated
        if (courseData.instructor) {
            await Teacher.findByIdAndUpdate(
                courseData.instructor,
                { $push: { coursesCreated: savedCourse._id } },
                { new: true }
            );
        }        
        // Populate instructor details if available
        await savedCourse.populate('instructor', 'fullName specializations');
        return {
            success: true,
            status: 201,
            message: 'Course created successfully',
            data: savedCourse
        };
    } catch (error) {
        console.error('Create course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Course creation failed',
            error: error.message
        };
    }
};

// Get all courses with optional filters and pagination
export const getAllCoursesAsync = async (filters = {}, pagination = {}) => {
    try {
        const {
            category,
            ageGroup,
            isPremium,
            isPublished,
            instructor
        } = filters;
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = pagination;

        // Build query object - if no filters provided, query will be empty {} and return all courses
        const query = {};                
        // Age group filter (validate allowed values) - only add if ageGroup has meaningful value
        if (ageGroup && ageGroup.trim()) {
            const validAgeGroups = ['5-10', '10-15'];
            if (validAgeGroups.includes(ageGroup.trim())) {
                query.ageGroup = ageGroup.trim();
            }
        }                
        // Premium status filter - only add if explicitly set to true or false
        if (isPremium !== null && isPremium !== undefined) {
            query.isPremium = Boolean(isPremium);
        }                
        // Published status filter - only add if explicitly set to true or false
        if (isPublished !== null && isPublished !== undefined) {
            query.isPublished = Boolean(isPublished);
        }                
        // Instructor filter (validate ObjectId) - only add if instructor has meaningful value
        if (instructor && instructor.trim()) {
            const instructorId = instructor.trim();
            if (mongoose.Types.ObjectId.isValid(instructorId)) {
                query.instructor = instructorId;
            }
        }
        // Sanitize query to prevent NoSQL injection
        const sanitizedQuery = mongoose.sanitizeFilter(query);

        // Category filter (case-insensitive) - add after sanitization to preserve RegExp
        if (category && category.trim()) {
            sanitizedQuery.category = new RegExp(category.trim(), 'i');
        }
        // Calculate pagination
        const skip = (page - 1) * limit;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        // Execute query
        const courses = await Course.find(sanitizedQuery)
            .populate('instructor', 'fullName specializations')
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(parseInt(limit));
        // Get total count for pagination
        const totalCount = await Course.countDocuments(sanitizedQuery);
        const totalPages = Math.ceil(totalCount / limit);
        return {
            success: true,
            status: 200,
            message: 'Courses retrieved successfully',
            data: {
                courses,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        };
    } catch (error) {
        console.error('Get all courses service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve courses',
            error: error.message
        };
    }
};

// Get course by ID
export const getCourseByIdAsync = async (courseId) => {
    try {
        // Validate courseId format
        const idValidation = validateObjectIdParam(courseId, 'course ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Find course by ID
        const course = await Course.findById(courseId)
            .populate('instructor', 'fullName specializations bio');

        if (!course) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }
        return {
            success: true,
            status: 200,
            message: 'Course retrieved successfully',
            data: course
        };
    } catch (error) {
        console.error('Get course by ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve course',
            error: error.message
        };
    }
};

// Update course
export const updateCourseAsync = async (courseId, courseData) => {
    try {
        // Validate courseId format
        const idValidation = validateObjectIdParam(courseId, 'course ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if course exists
        const existingCourse = await Course.findById(courseId);
        if (!existingCourse) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }
        // Validate instructor if provided in update data
        if (courseData.instructor) {
            const instructorValidation = await validateCreatedBy(courseData.instructor);
            if (!instructorValidation.isValid) {
                return {
                    success: false,
                    status: 400,
                    message: instructorValidation.message
                };
            }
        }
        // Validate updated course data (exclude system fields from validation)
        const { _id, __v, createdAt, updatedAt, ...existingData } = existingCourse.toObject();
        const validation = validateCourse({ ...existingData, ...courseData });
        if (validation.error) {
            return {
                success: false,
                status: 400,
                message: validation.error.details[0].message
            };
        }
        // Update course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $set: courseData },
            { new: true, runValidators: true }
        ).populate('instructor', 'fullName specializations');
        return {
            success: true,
            status: 200,
            message: 'Course updated successfully',
            data: updatedCourse
        };
    } catch (error) {
        console.error('Update course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Course update failed',
            error: error.message
        };
    }
};

// Delete course
export const deleteCourseAsync = async (courseId) => {
    try {
        // Validate courseId format
        const idValidation = validateObjectIdParam(courseId, 'course ID');
        if (!idValidation.success) {
            return idValidation;
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }

        // Delete course
        await Course.findByIdAndDelete(courseId);

        return {
            success: true,
            status: 200,
            message: 'Course deleted successfully',
            data: { deletedCourseId: courseId }
        };

    } catch (error) {
        console.error('Delete course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Course deletion failed',
            error: error.message
        };
    }
};

// Get all kids progress enrolled in a course with pagination
export const getAllKidsProgressEnrolledInCourseAsync = async (courseId, page = 1, limit = 10) => {
    try {
        // Validate courseId format
        const idValidation = validateObjectIdParam(courseId, 'course ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }

        // Convert page and limit to numbers and set defaults
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        // Get total count for pagination info
        const totalEnrollments = await CourseProgress.countDocuments({ courseId: courseId });
        
        // Calculate total pages
        const totalPages = Math.ceil(totalEnrollments / limitNumber);

        // Find all course progress records for this course with pagination and populate kid info
        const courseProgressRecords = await CourseProgress.find({ courseId: courseId })
            .populate({
                path: 'kidId',
                select: 'fullName dateOfBirth gender points level avatar userId',
                populate: {
                    path: 'userId',
                    select: 'email isActive isVerified'
                }
            })
            .populate('courseId', 'title category')
            .select('-__v') // Exclude version field
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 }); // Sort by newest first

        // Transform the data to include kid fullName and other details
        const transformedProgress = courseProgressRecords.map(progress => {
            const progressObj = progress.toObject();
            const kidObj = progressObj.kidId;
            
            return {
                progressId: progressObj._id,
                courseId: progressObj.courseId._id,
                courseName: progressObj.courseId.title,
                courseCategory: progressObj.courseId.category,
                kidId: kidObj ? kidObj._id : null,
                kidFullName: kidObj ? kidObj.fullName : null,
                kidDateOfBirth: kidObj ? kidObj.dateOfBirth : null,
                kidGender: kidObj ? kidObj.gender : null,
                kidPoints: kidObj ? kidObj.points : null,
                kidLevel: kidObj ? kidObj.level : null,
                kidAvatar: kidObj ? kidObj.avatar : null,
                kidEmail: kidObj && kidObj.userId ? kidObj.userId.email : null,
                status: progressObj.status,
                testResults: progressObj.testResults,
                lessonCompleted: progressObj.lessonCompleted,
                enrolledAt: progressObj.createdAt,
                lastUpdated: progressObj.updatedAt
            };
        });

        return {
            success: true,
            status: 200,
            message: 'Kids progress enrolled in course retrieved successfully',
            data: {
                courseId: courseId,
                courseName: course.title,
                courseCategory: course.category,
                enrollmentCount: totalEnrollments,
                progressRecords: transformedProgress,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: totalPages,
                    totalItems: totalEnrollments,
                    itemsPerPage: limitNumber,
                    itemsReturned: transformedProgress.length,
                    hasNextPage: pageNumber < totalPages,
                    hasPreviousPage: pageNumber > 1,
                    nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
                    previousPage: pageNumber > 1 ? pageNumber - 1 : null
                }
            }
        };
    } catch (error) {
        console.error('Get all kids progress enrolled in course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve kids progress enrolled in course',
            error: error.message
        };
    }
};



