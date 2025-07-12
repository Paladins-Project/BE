import mongoose from 'mongoose';
import { User } from '../models/user.mjs';
import { Admin } from '../models/admin.mjs';
import { Transaction } from '../models/transaction.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import fs from 'fs';
import dotenv from 'dotenv';

// Import services
import { createTeacherAsync } from '../services/teacherService.mjs';
import { createParentAsync } from '../services/parentService.mjs';
import { createKidLinkedToParentAsync } from '../services/kidService.mjs';
import { createCourseAsync } from '../services/courseService.mjs';
import { createLessonAsync } from '../services/lessonService.mjs';
import { createTestAsync } from '../services/testService.mjs';
import { enrollCourseAsync } from '../services/progressService.mjs';
import { createReviewAsync } from '../services/reviewService.mjs';

dotenv.config();

// Dữ liệu mẫu tiếng Việt
const vietnameseNames = {
  male: [
    'Nguyễn Văn An', 'Trần Minh Đức', 'Lê Hoàng Long', 'Phạm Quang Huy', 'Hoàng Văn Nam',
    'Vũ Đình Khoa', 'Đặng Tuấn Anh', 'Bùi Văn Hùng', 'Phan Minh Tuấn', 'Dương Thành Đạt',
    'Lý Quang Minh', 'Cao Văn Thành', 'Ngô Đình Duy', 'Trương Văn Khang', 'Đinh Quang Tú',
    'Võ Minh Hải', 'Lâm Văn Thịnh', 'Tô Đình Phong', 'Đỗ Văn Tài', 'Hà Minh Quân'
  ],
  female: [
    'Nguyễn Thị Lan', 'Trần Thị Hoa', 'Lê Thị Mai', 'Phạm Thị Linh', 'Hoàng Thị Nga',
    'Vũ Thị Thúy', 'Đặng Thị Hương', 'Bùi Thị Dung', 'Phan Thị Yến', 'Dương Thị Hà',
    'Lý Thị Xuân', 'Cao Thị Bích', 'Ngô Thị Thanh', 'Trương Thị Hiền', 'Đinh Thị Thảo',
    'Võ Thị Nhung', 'Lâm Thị Phương', 'Tô Thị Trang', 'Đỗ Thị Loan', 'Hà Thị Vân'
  ]
};

const kidNames = {
  male: [
    'Nguyễn Minh Khang', 'Trần Hoàng Anh', 'Lê Bảo Long', 'Phạm Minh Đức', 'Hoàng Gia Bảo',
    'Vũ Quang Minh', 'Đặng Tuấn Kiệt', 'Bùi Minh Tâm', 'Phan Đức Thịnh', 'Dương Quang Huy',
    'Lý Gia Huy', 'Cao Minh Khôi', 'Ngô Hoàng Nam', 'Trương Bảo Khang', 'Đinh Quang Tú',
    'Võ Minh Trí', 'Lâm Đức Anh', 'Tô Quang Vinh', 'Đỗ Minh Phát', 'Hà Tuấn Kiệt'
  ],
  female: [
    'Nguyễn Thùy Linh', 'Trần Khánh Linh', 'Lê Bảo Trâm', 'Phạm Thúy Hằng', 'Hoàng Minh Châu',
    'Vũ Khánh Huyền', 'Đặng Thùy Dung', 'Bùi Minh Thư', 'Phan Khánh Linh', 'Dương Thùy Trang',
    'Lý Minh Thư', 'Cao Thùy Linh', 'Ngô Khánh Vy', 'Trương Thùy Dương', 'Đinh Minh Ngọc',
    'Võ Thùy Huyền', 'Lâm Khánh Huyền', 'Tô Thùy Trúc', 'Đỗ Minh Thư', 'Hà Thùy Linh'
  ]
};

const teacherSpecializations = [
  ['Toán học', 'Khoa học', 'Công nghệ'],
  ['Ngữ văn', 'Lịch sử', 'Địa lý'],
  ['Tiếng Anh', 'Giao tiếp', 'Văn hóa'],
  ['Khoa học tự nhiên', 'Thí nghiệm', 'Khám phá'],
  ['Nghệ thuật', 'Sáng tạo', 'Âm nhạc'],
  ['Thể dục', 'Sức khỏe', 'Vận động'],
  ['Tin học', 'Lập trình', 'Công nghệ thông tin']
];

const vietnameseAddresses = [
  'Số 12 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
  'Số 456 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  'Số 789 Lê Lợi, Hải Châu, Đà Nẵng',
  'Số 234 Đinh Tiên Hoàng, Tp. Huế',
  'Số 567 Trần Phú, Tp. Nha Trang',
  'Số 890 Nguyễn Thị Minh Khai, Quận 3, TP. HCM',
  'Số 123 Hoàng Văn Thụ, Ba Đình, Hà Nội',
  'Số 345 Lý Thường Kiệt, Tân Bình, TP. HCM',
  'Số 678 Phan Bội Châu, Tp. Hội An',
  'Số 901 Trần Quốc Toản, Tp. Hà Nội'
];

const reviewContents = [
  'Khóa học rất bổ ích cho con em. Nội dung được trình bày sinh động và dễ hiểu. Con em rất thích học.',
  'Giáo viên giảng dạy rất tận tâm. Các bài học được thiết kế phù hợp với lứa tuổi trẻ em.',
  'Chương trình học thú vị, giúp con phát triển kỹ năng tư duy và sáng tạo. Rất hài lòng!',
  'Nội dung khóa học phong phú, đa dạng. Con em học được nhiều kiến thức bổ ích.',
  'Cách trình bày sinh động, hấp dẫn. Con em luôn háo hức chờ đợi buổi học tiếp theo.',
  'Khóa học giúp con em hiểu biết thêm về thế giới xung quanh. Rất đáng để đầu tư.',
  'Giáo trình được xây dựng khoa học, logic. Con em tiếp thu kiến thức một cách tự nhiên.',
  'Các hoạt động trong khóa học rất thú vị. Con em vừa học vừa chơi, không thấy nhàm chán.',
  'Khóa học giúp con em phát triển toàn diện cả về tri thức và kỹ năng sống.',
  'Video bài giảng chất lượng cao, âm thanh rõ ràng. Con em dễ dàng theo dõi và học tập.',
  'Bài tập và trò chơi trong khóa học rất phù hợp. Con em học một cách tích cực.',
  'Khóa học mang tính giáo dục cao, giúp con em hình thành tư duy tích cực.',
  'Nội dung bài học gần gũi với cuộc sống, giúp con em áp dụng kiến thức vào thực tế.',
  'Giáo viên nhiệt tình, chu đáo. Luôn sẵn sàng giải đáp thắc mắc của học sinh.',
  'Khóa học có độ khó vừa phải, phù hợp với khả năng tiếp thu của trẻ em.',
  'Các bài học được thiết kế đẹp mắt, thu hút sự chú ý của trẻ em.',
  'Con em học được nhiều kỹ năng mềm thông qua khóa học này.',
  'Chương trình học linh hoạt, cho phép con em học theo tốc độ của mình.',
  'Khóa học giúp con em tăng cường khả năng tư duy logic và sáng tạo.',
  'Rất hài lòng với chất lượng giảng dạy. Sẽ giới thiệu cho bạn bè.',
  'Khóa học có nội dung chất lượng, giúp con em phát triển tư duy độc lập.',
  'Các bài học được trình bày một cách khoa học và dễ hiểu.',
  'Con em rất thích các hoạt động tương tác trong khóa học.',
  'Khóa học giúp con em hình thành thói quen học tập tích cực.',
  'Nội dung bài học phong phú, đa dạng, không gây nhàm chán.',
  'Giáo viên có phương pháp giảng dạy hiệu quả, dễ hiểu.',
  'Khóa học mang lại nhiều giá trị giáo dục cho con em.',
  'Con em học được cách tư duy phản biện thông qua khóa học.',
  'Các bài kiểm tra được thiết kế hợp lý, giúp đánh giá năng lực học sinh.',
  'Khóa học giúp con em tự tin hơn trong giao tiếp và học tập.',
  'Nội dung khóa học cập nhật, phù hợp với xu hướng giáo dục hiện đại.',
  'Rất ấn tượng với chất lượng và tính chuyên nghiệp của khóa học.',
  'Con em có thể học mọi lúc mọi nơi, rất tiện lợi.',
  'Khóa học giúp con em phát triển khả năng quan sát và phân tích.'
];

// Hàm tạo ngày ngẫu nhiên trong tháng 6-7 2025
function getRandomDateInRange() {
  const start = new Date('2025-06-01');
  const end = new Date('2025-07-31');
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Hàm tạo số điện thoại ngẫu nhiên
function generatePhoneNumber() {
  const prefixes = ['084', '085', '086', '087', '088', '089', '090', '091', '092', '093', '094', '095', '096', '097', '098', '099'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return prefix + number.toString();
}

// Hàm tạo email ngẫu nhiên
function generateEmail(name, index) {
  const cleanName = name.toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[đ]/g, 'd')
    .replace(/\s+/g, '');
  
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomSuffix = Math.floor(Math.random() * 10000) + 1000;
  return `${cleanName}${index}${randomSuffix}@${domain}`;
}

// Hàm tạo ngày sinh ngẫu nhiên
function getRandomBirthDate(minAge, maxAge) {
  const today = new Date();
  const startYear = today.getFullYear() - maxAge;
  const endYear = today.getFullYear() - minAge;
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
}

async function createInitialData() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.DBCONNECTIONSTRING);
    console.log('Connected to MongoDB');

    // Xóa dữ liệu cũ
    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Admin.deleteMany({}),
      Transaction.deleteMany({}),
      // Các collection khác sẽ được xóa bởi services khi cần
    ]);

    console.log('Creating initial data...');

    // 1. Tạo 1 Admin (vẫn tạo trực tiếp vì không có adminService)
    console.log('Creating admin...');
    const adminUser = new User({
      password: hashPassword('admin123'),
      email: 'admin@dailymate.com',
      role: 'admin',
      isActive: true,
      isVerified: true,
      createdAt: getRandomDateInRange(),
      updatedAt: getRandomDateInRange()
    });
    await adminUser.save();

    const adminProfile = new Admin({
      userId: adminUser._id,
      fullName: 'Quản trị viên hệ thống',
      phoneNumber: generatePhoneNumber(),
      createdAt: getRandomDateInRange(),
      updatedAt: getRandomDateInRange()
    });
    await adminProfile.save();

    // 2. Tạo 5 Teachers sử dụng teacherService
    console.log('Creating teachers...');
    const teachers = [];
    for (let i = 0; i < 5; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const name = vietnameseNames[gender][i % vietnameseNames[gender].length];
      
      const teacherData = {
        email: generateEmail(name, i + 1),
        password: 'teacher123',
        fullName: name,
        phoneNumber: generatePhoneNumber(),
        specializations: teacherSpecializations[i % teacherSpecializations.length],
        bio: `Giáo viên giàu kinh nghiệm trong lĩnh vực ${teacherSpecializations[i % teacherSpecializations.length].join(', ')}. Yêu thích việc dạy học và luôn nỗ lực mang lại trải nghiệm học tập tốt nhất cho học sinh.`
      };

      const result = await createTeacherAsync(teacherData);
      if (result.success) {
        teachers.push(result.data);
        console.log(`✓ Created teacher: ${result.data.fullName}`, result.data);
      } else {
        console.error(`✗ Failed to create teacher: ${result.message}`);
      }
    }

    // 3. Tạo 30 Parents sử dụng parentService
    console.log('Creating parents...');
    const parents = [];
    for (let i = 0; i < 30; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const name = vietnameseNames[gender][i % vietnameseNames[gender].length];
      
      const parentData = {
        email: generateEmail(name, i + 1),
        password: 'parent123',
        fullName: name,
        dateOfBirth: getRandomBirthDate(25, 45),
        gender: gender,
        address: vietnameseAddresses[i % vietnameseAddresses.length],
        phoneNumber: generatePhoneNumber()
      };

      const result = await createParentAsync(parentData);
      if (result.success) {
        parents.push(result.data);
        console.log(`✓ Created parent: ${result.data.fullName}`);
      } else {
        console.error(`✗ Failed to create parent: ${result.message}`);
      }
    }

    // 4. Tạo 40 Kids liên kết với Parents sử dụng kidService
    console.log('Creating kids...');
    const kids = [];
    let parentIndex = 0;
    let kidsPerParent = 0;
    
    for (let i = 0; i < 40; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const name = kidNames[gender][i % kidNames[gender].length];
      
      // Chọn parent - tối đa 3 kids/parent
      if (kidsPerParent >= 3) {
        parentIndex++;
        kidsPerParent = 0;
      }
      
      const selectedParent = parents[parentIndex % parents.length];
      
      const kidData = {
        fullName: name,
        dateOfBirth: getRandomBirthDate(5, 15),
        gender: gender,
        parentId: selectedParent.parentId
      };

      const result = await createKidLinkedToParentAsync(kidData);
      if (result.success) {
        kids.push(result.data);
        console.log(`✓ Created kid: ${result.data.fullName} (linked to parent)`);
        kidsPerParent++;
      } else {
        console.error(`✗ Failed to create kid: ${result.message}`);
      }
    }

    // 5. Tạo Courses sử dụng courseService
    console.log('Creating courses...');
    const coursesData = JSON.parse(fs.readFileSync('json/EXE2.courses.json', 'utf8'));
    const courses = [];
    
    for (let i = 0; i < coursesData.length; i++) {
      const courseData = coursesData[i];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      const instructorId = (randomTeacher.teacherId || randomTeacher._id).toString();
      console.log('Teacher data:', randomTeacher);
      console.log('Using instructor ID:', instructorId);
      
      const courseCreateData = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        ageGroup: courseData.ageGroup,
        thumbnailUrl: courseData.thumbnailUrl,
        pointsEarned: courseData.pointsEarned,
        isPremium: courseData.isPremium,
        instructor: instructorId,
        isPublished: courseData.isPublished
      };

      const result = await createCourseAsync(courseCreateData);
      if (result.success) {
        courses.push(result.data);
        console.log(`✓ Created course: ${result.data.title}`);
      } else {
        console.error(`✗ Failed to create course: ${result.message}`);
      }
    }

    // 6. Tạo Lessons sử dụng lessonService
    console.log('Creating lessons...');
    const lessonsData = JSON.parse(fs.readFileSync('json/EXE2.lessons.json', 'utf8'));
    const lessons = [];
    
    for (let i = 0; i < lessonsData.length; i++) {
      const lessonData = lessonsData[i];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      
      const lessonCreateData = {
        courseId: randomCourse._id.toString(),
        title: lessonData.title,
        description: lessonData.description,
        content: lessonData.content,
        videoUrl: lessonData.videoUrl,
        audioUrl: lessonData.audioUrl,
        imageUrl: lessonData.imageUrl,
        duration: lessonData.duration,
        order: lessonData.order,
        isPublished: lessonData.isPublished,
        createdBy: (randomTeacher.teacherId || randomTeacher._id).toString()
      };

      const result = await createLessonAsync(lessonCreateData);
      if (result.success) {
        lessons.push(result.data);
        console.log(`✓ Created lesson: ${result.data.title}`);
      } else {
        console.error(`✗ Failed to create lesson: ${result.message}`);
      }
    }

    // 7. Tạo Tests sử dụng testService
    console.log('Creating tests...');
    const testsData = JSON.parse(fs.readFileSync('json/EXE2.tests.json', 'utf8'));
    const tests = [];
    
    for (let i = 0; i < testsData.length; i++) {
      const testData = testsData[i];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
      
      // Làm sạch questions để loại bỏ _id
      const cleanQuestions = testData.questions.map(question => {
        const { _id, ...cleanQuestion } = question;
        return cleanQuestion;
      });
      
      const testCreateData = {
        lessonId: randomLesson._id.toString(),
        title: testData.title,
        description: testData.description,
        timeLimit: testData.timeLimit,
        passingScore: testData.passingScore,
        attempts: testData.attempts,
        questions: cleanQuestions,
        createdBy: (randomTeacher.teacherId || randomTeacher._id).toString()
      };

      const result = await createTestAsync(testCreateData);
      if (result.success) {
        tests.push(result.data);
        console.log(`✓ Created test: ${result.data.title}`);
      } else {
        console.error(`✗ Failed to create test: ${result.message}`);
      }
    }

    // 8. Tạo 24 Transactions (vẫn tạo trực tiếp vì transactionService chỉ có get functions)
    console.log('Creating transactions...');
    for (let i = 0; i < 24; i++) {
      const randomParent = parents[Math.floor(Math.random() * parents.length)];
      const orderCode = Math.floor(Math.random() * 900000) + 100000;
      const statuses = ['PENDING', 'SUCCESS', 'FAILED'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const transaction = new Transaction({
        userId: (randomParent.userId || randomParent._id).toString(),
        orderCode: orderCode,
        amount: Math.floor(Math.random() * 500000) + 100000,
        description: 'Nâng cấp tài khoản Premium',
        paymentMethod: 'PayOS',
        status: status,
        createdAt: getRandomDateInRange(),
        updatedAt: getRandomDateInRange()
      });
      await transaction.save();
    }

    // 9. Tạo CourseProgress sử dụng progressService
    console.log('Creating course progress...');
    const enrollments = [];
    
    // Đảm bảo ít nhất 20 kids enrolled và có tiến trình trong ít nhất 2 courses
    for (let i = 0; i < Math.min(20, kids.length); i++) {
      const kid = kids[i];
      const numCourses = Math.floor(Math.random() * 3) + 2; // 2-4 courses per kid
      
      for (let j = 0; j < numCourses; j++) {
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        
        // Kiểm tra xem đã enroll course này chưa
        const existingEnrollment = enrollments.find(
          e => e.kidId === (kid.kidId || kid._id).toString() && e.courseId === randomCourse._id.toString()
        );
        
        if (!existingEnrollment) {
          const result = await enrollCourseAsync((kid.kidId || kid._id).toString(), randomCourse._id.toString());
          if (result.success) {
            enrollments.push({ 
              kidId: (kid.kidId || kid._id).toString(), 
              courseId: randomCourse._id.toString(),
              progressId: result.data._id
            });
            console.log(`✓ Enrolled kid in course: ${kid.fullName} -> ${randomCourse.title}`);
          } else {
            console.error(`✗ Failed to enroll: ${result.message}`);
          }
        }
      }
    }

    // Tạo thêm progress cho các kids khác
    for (let i = 20; i < kids.length; i++) {
      const kid = kids[i];
      const numCourses = Math.floor(Math.random() * 2) + 1; // 1-2 courses per kid
      
      for (let j = 0; j < numCourses; j++) {
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        
        const result = await enrollCourseAsync((kid.kidId || kid._id).toString(), randomCourse._id.toString());
        if (result.success) {
          enrollments.push({ 
            kidId: (kid.kidId || kid._id).toString(), 
            courseId: randomCourse._id.toString(),
            progressId: result.data._id
          });
          console.log(`✓ Enrolled kid in course: ${kid.fullName} -> ${randomCourse.title}`);
        } else {
          console.error(`✗ Failed to enroll: ${result.message}`);
        }
      }
    }

    // 10. Tạo 34 Reviews sử dụng reviewService
    console.log('Creating reviews...');
    for (let i = 0; i < 34; i++) {
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      const isKidReview = Math.random() > 0.5;
      
      let reviewData = {
        courseId: randomCourse._id.toString(),
        content: reviewContents[Math.floor(Math.random() * reviewContents.length)]
      };
      
      // Tạo rating (chủ yếu tích cực: 3-5 sao, 80% là 4-5 sao)
      const rand = Math.random();
      if (rand < 0.6) {
        reviewData.star = 5; // 60% - 5 sao
      } else if (rand < 0.8) {
        reviewData.star = 4; // 20% - 4 sao
      } else {
        reviewData.star = 3; // 20% - 3 sao
      }
      
      if (isKidReview) {
        const randomKid = kids[Math.floor(Math.random() * kids.length)];
        reviewData.kidId = (randomKid.kidId || randomKid._id).toString();
      } else {
        const randomParent = parents[Math.floor(Math.random() * parents.length)];
        reviewData.parentId = (randomParent.parentId || randomParent._id).toString();
      }
      
      const result = await createReviewAsync(reviewData);
      if (result.success) {
        console.log(`✓ Created review: ${reviewData.star} stars for ${randomCourse.title}`);
      } else {
        console.error(`✗ Failed to create review: ${result.message}`);
      }
    }

    console.log('✅ Initial data created successfully using services!');
    console.log('📊 Summary:');
    console.log(`- 1 Admin account created`);
    console.log(`- ${teachers.length} Teacher accounts created`);
    console.log(`- ${parents.length} Parent accounts created`);
    console.log(`- ${kids.length} Kid accounts created`);
    console.log(`- ${courses.length} Courses created`);
    console.log(`- ${lessons.length} Lessons created`);
    console.log(`- ${tests.length} Tests created`);
    console.log(`- 24 Transactions created`);
    console.log(`- ${enrollments.length} Course enrollments created`);
    console.log(`- 34 Reviews created`);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('Admin: admin@dailymate.com / admin123');
    console.log('Teachers: Use generated emails / teacher123');
    console.log('Parents: Use generated emails / parent123');
    console.log('Kids: Linked to parents via parentId');

  } catch (error) {
    console.error('❌ Error creating initial data:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Chạy script
createInitialData(); 