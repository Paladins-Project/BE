import mongoose from 'mongoose';
import { User } from '../models/user.mjs';
import { Admin } from '../models/admin.mjs';
import { Transaction } from '../models/transaction.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import fs from 'fs';
import dotenv from 'dotenv';

// Import services
import { createTeacherAsync } from '../services/teacherService.mjs';
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
    'Võ Minh Hải', 'Lâm Văn Thịnh', 'Tô Đình Phong', 'Đỗ Văn Tài', 'Hà Minh Quân',
    'Nguyễn Tuấn Anh', 'Trần Văn Bình', 'Lê Minh Cường', 'Phạm Văn Dũng', 'Hoàng Quốc Việt',
    'Vũ Thanh Tùng', 'Đặng Văn Sơn', 'Bùi Tiến Dũng', 'Phan Văn Đức', 'Dương Văn Lâm',
    'Nguyễn Hoàng Nam', 'Trần Đức Thắng', 'Lê Văn Thành', 'Phạm Hoàng Gia', 'Hoàng Minh Tuấn',
    'Vũ Văn Kiên', 'Đặng Minh Hiếu', 'Bùi Văn Khánh', 'Phan Thanh Long', 'Dương Văn Phúc',
    'Nguyễn Văn Tú', 'Trần Văn Trường', 'Lê Văn Vinh', 'Phạm Văn Vũ', 'Hoàng Văn Xuân',
    'Vũ Văn Yên', 'Đặng Văn Bảo', 'Bùi Văn Chiến', 'Phan Văn Đạt', 'Dương Văn Hiếu',
    'Nguyễn Thanh Tùng', 'Trần Minh Hoàng', 'Lê Văn Đức', 'Phạm Thanh Sơn', 'Hoàng Văn Tuấn',
    'Vũ Minh Quân', 'Đặng Văn Hưng', 'Bùi Thanh Nam', 'Phan Văn Thành', 'Dương Minh Tâm',
    'Nguyễn Đình Hòa', 'Trần Văn Kiên', 'Lê Minh Phúc', 'Phạm Văn Linh', 'Hoàng Thanh Bình',
    'Vũ Văn Mạnh', 'Đặng Minh Tài', 'Bùi Văn Hạnh', 'Phan Minh Khoa', 'Dương Văn Thắng',
    'Nguyễn Văn Hải', 'Trần Minh Dũng', 'Lê Văn Quang', 'Phạm Thanh Hải', 'Hoàng Văn Đạt',
    'Vũ Minh Nhật', 'Đặng Văn Lộc', 'Bùi Thanh Quang', 'Phan Văn Minh', 'Dương Thanh Tú'
  ],
  female: [
    'Nguyễn Thị Lan', 'Trần Thị Hoa', 'Lê Thị Mai', 'Phạm Thị Linh', 'Hoàng Thị Nga',
    'Vũ Thị Thúy', 'Đặng Thị Hương', 'Bùi Thị Dung', 'Phan Thị Yến', 'Dương Thị Hà',
    'Lý Thị Xuân', 'Cao Thị Bích', 'Ngô Thị Thanh', 'Trương Thị Hiền', 'Đinh Thị Thảo',
    'Võ Thị Nhung', 'Lâm Thị Phương', 'Tô Thị Trang', 'Đỗ Thị Loan', 'Hà Thị Vân',
    'Nguyễn Thị Ánh', 'Trần Thị Bình', 'Lê Thị Cúc', 'Phạm Thị Duyên', 'Hoàng Thị Em',
    'Vũ Thị Phượng', 'Đặng Thị Giang', 'Bùi Thị Hạnh', 'Phan Thị Kiều', 'Dương Thị Lệ',
    'Nguyễn Thị Mỹ', 'Trần Thị Ngọc', 'Lê Thị Oanh', 'Phạm Thị Phúc', 'Hoàng Thị Quỳnh',
    'Vũ Thị Hồng', 'Đặng Thị Sen', 'Bùi Thị Tâm', 'Phan Thị Uyên', 'Dương Thị Vi',
    'Nguyễn Thị Ngân', 'Trần Thị Thu', 'Lê Thị Trúc', 'Phạm Thị Tuyết', 'Hoàng Thị Vy',
    'Vũ Thị Xuân', 'Đặng Thị Yến', 'Bùi Thị An', 'Phan Thị Băng', 'Dương Thị Chi',
    'Nguyễn Thị Diệu', 'Trần Thị Hằng', 'Lê Thị Kim', 'Phạm Thị Lý', 'Hoàng Thị Minh',
    'Vũ Thị Ngọc', 'Đặng Thị Oanh', 'Bùi Thị Phương', 'Phan Thị Quân', 'Dương Thị Rút',
    'Nguyễn Thị Sương', 'Trần Thị Tâm', 'Lê Thị Uyên', 'Phạm Thị Vân', 'Hoàng Thị Xuân',
    'Vũ Thị Yến', 'Đặng Thị Anh', 'Bùi Thị Bảo', 'Phan Thị Chi', 'Dương Thị Đào',
    'Nguyễn Thị Eêm', 'Trần Thị Phượng', 'Lê Thị Giang', 'Phạm Thị Hiền', 'Hoàng Thị Kiều'
  ]
};

const kidNames = {
  male: [
    'Nguyễn Minh Khang', 'Trần Hoàng Anh', 'Lê Bảo Long', 'Phạm Minh Đức', 'Hoàng Gia Bảo',
    'Vũ Quang Minh', 'Đặng Tuấn Kiệt', 'Bùi Minh Tâm', 'Phan Đức Thịnh', 'Dương Quang Huy',
    'Lý Gia Huy', 'Cao Minh Khôi', 'Ngô Hoàng Nam', 'Trương Bảo Khang', 'Đinh Quang Tú',
    'Võ Minh Trí', 'Lâm Đức Anh', 'Tô Quang Vinh', 'Đỗ Minh Phát', 'Hà Tuấn Kiệt',
    'Nguyễn Bảo Nam', 'Trần Minh Hiếu', 'Lê Quang Duy', 'Phạm Gia Khang', 'Hoàng Minh Đức',
    'Vũ Bảo An', 'Đặng Minh Quân', 'Bùi Gia Huy', 'Phan Minh Nhật', 'Dương Bảo Lộc',
    'Nguyễn Nhật Minh', 'Trần Gia Bảo', 'Lê Minh Khôi', 'Phạm Quang Anh', 'Hoàng Bảo Khang',
    'Vũ Minh Hiếu', 'Đặng Quang Vinh', 'Bùi Minh Đạt', 'Phan Gia Linh', 'Dương Minh Trí',
    'Nguyễn Gia Phúc', 'Trần Bảo Huy', 'Lê Minh Vương', 'Phạm Nhật Nam', 'Hoàng Quang Minh',
    'Vũ Gia Khiêm', 'Đặng Bảo Long', 'Bùi Quang Huy', 'Phan Minh Phúc', 'Dương Gia Hân',
    'Nguyễn Minh Tú', 'Trần Bảo Khánh', 'Lê Gia Minh', 'Phạm Quang Thắng', 'Hoàng Minh Nhật',
    'Vũ Bảo Tâm', 'Đặng Quang Hải', 'Bùi Minh Quân', 'Phan Gia Thịnh', 'Dương Bảo Minh',
    'Nguyễn Quang Dũng', 'Trần Minh Hạnh', 'Lê Bảo Thắng', 'Phạm Gia Huy', 'Hoàng Quang Tú',
    'Vũ Minh Hậu', 'Đặng Bảo Quang', 'Bùi Gia Minh', 'Phan Quang Vinh', 'Dương Minh Hải',
    'Nguyễn Bảo Thành', 'Trần Gia Quang', 'Lê Minh Tài', 'Phạm Bảo Duy', 'Hoàng Gia Thành',
    'Vũ Quang Khánh', 'Đặng Minh Hùng', 'Bùi Bảo Lâm', 'Phan Gia Bảo', 'Dương Quang Tâm',
    'Nguyễn Minh Hạnh', 'Trần Bảo Thuận', 'Lê Gia Thành', 'Phạm Quang Lâm', 'Hoàng Minh Phát',
    'Vũ Bảo Hưng', 'Đặng Gia Khánh', 'Bùi Quang Nam', 'Phan Minh Lộc', 'Dương Bảo Thái',
    'Nguyễn Gia Đức', 'Trần Quang Hùng', 'Lê Bảo Minh', 'Phạm Minh Tuấn', 'Hoàng Bảo Duy',
    'Vũ Gia Nam', 'Đặng Quang Tuấn', 'Bùi Minh Thành', 'Phan Bảo Huy', 'Dương Gia Lâm'
  ],
  female: [
    'Nguyễn Thùy Linh', 'Trần Khánh Linh', 'Lê Bảo Trâm', 'Phạm Thúy Hằng', 'Hoàng Minh Châu',
    'Vũ Khánh Huyền', 'Đặng Thùy Dung', 'Bùi Minh Thư', 'Phan Khánh Linh', 'Dương Thùy Trang',
    'Lý Minh Thư', 'Cao Thùy Linh', 'Ngô Khánh Vy', 'Trương Thùy Dương', 'Đinh Minh Ngọc',
    'Võ Thùy Huyền', 'Lâm Khánh Huyền', 'Tô Thùy Trúc', 'Đỗ Minh Thư', 'Hà Thùy Linh',
    'Nguyễn Bảo Ngọc', 'Trần Minh Anh', 'Lê Khánh Chi', 'Phạm Bảo Trân', 'Hoàng Thùy An',
    'Vũ Minh Châu', 'Đặng Khánh My', 'Bùi Thùy Linh', 'Phan Bảo Nhi', 'Dương Minh Thư',
    'Nguyễn Gia Hân', 'Trần Bảo Thy', 'Lê Minh Ngọc', 'Phạm Khánh Vy', 'Hoàng Bảo Anh',
    'Vũ Thùy Dương', 'Đặng Minh Khuê', 'Bùi Khánh Linh', 'Phan Minh Anh', 'Dương Bảo Yến',
    'Nguyễn Minh Trang', 'Trần Thùy Vi', 'Lê Bảo Hân', 'Phạm Minh Thư', 'Hoàng Khánh Ngọc',
    'Vũ Bảo Linh', 'Đặng Thùy Trang', 'Bùi Minh Ngọc', 'Phan Khánh An', 'Dương Thùy Vy',
    'Nguyễn Minh Hà', 'Trần Bảo Châu', 'Lê Thùy Duyên', 'Phạm Khánh Ly', 'Hoàng Minh Thảo',
    'Vũ Bảo Trâm', 'Đặng Khánh Trang', 'Bùi Thùy Nga', 'Phan Minh Huyền', 'Dương Bảo Ngọc',
    'Nguyễn Thùy Mai', 'Trần Khánh Nhi', 'Lê Minh Hà', 'Phạm Bảo Linh', 'Hoàng Thùy Trinh',
    'Vũ Khánh Thư', 'Đặng Bảo Anh', 'Bùi Minh Hạnh', 'Phan Thùy Hồng', 'Dương Khánh Ly',
    'Nguyễn Bảo Hân', 'Trần Minh Tú', 'Lê Thùy Anh', 'Phạm Khánh Hà', 'Hoàng Bảo Thư',
    'Vũ Minh Hương', 'Đặng Thùy Hiền', 'Bùi Bảo Châu', 'Phan Khánh Giang', 'Dương Minh Hoa',
    'Nguyễn Thùy Phương', 'Trần Bảo Quỳnh', 'Lê Khánh Huyền', 'Phạm Minh Lan', 'Hoàng Thùy Liên',
    'Vũ Bảo Trang', 'Đặng Khánh Thảo', 'Bùi Thùy Diễm', 'Phan Minh Châu', 'Dương Bảo Khuyên',
    'Nguyễn Khánh Phương', 'Trần Thùy Oanh', 'Lê Bảo Quyên', 'Phạm Minh Tâm', 'Hoàng Khánh Duyên',
    'Vũ Thùy Giang', 'Đặng Bảo Hương', 'Bùi Khánh Phương', 'Phan Thùy Thảo', 'Dương Minh Quyên'
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

// Hàm tạo ngày ngẫu nhiên trong tháng 6 2025
function getRandomDateInJune2025() {
  const start = new Date('2025-06-01');
  const end = new Date('2025-06-30');
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Hàm tạo ngày ngẫu nhiên trong tháng 7 2025  
function getRandomDateInJuly2025() {
  const start = new Date('2025-07-01');
  const end = new Date('2025-07-31');
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

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
  
  const randomSuffix = Math.floor(Math.random() * 10000) + 1000;
  return `${cleanName}${index}${randomSuffix}@gmail.com`;
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

// Hàm xóa toàn bộ dữ liệu cũ
async function clearAllData() {
  console.log('🧹 Clearing all existing data...');
  
  const { Teacher } = await import('../models/teacher.mjs');
  const { Parent } = await import('../models/parent.mjs');
  const { Kid } = await import('../models/kid.mjs');
  const { Course } = await import('../models/course.mjs');
  const { Lesson } = await import('../models/lesson.mjs');
  const { Test } = await import('../models/test.mjs');
  const { CourseProgress } = await import('../models/courseProgress.mjs');
  const { Review } = await import('../models/review.mjs');
  const { Verify } = await import('../models/verify.mjs');
  
  await Promise.all([
    User.deleteMany({}),
    Admin.deleteMany({}),
    Teacher.deleteMany({}),
    Parent.deleteMany({}),
    Kid.deleteMany({}),
    Course.deleteMany({}),
    Lesson.deleteMany({}),
    Test.deleteMany({}),
    CourseProgress.deleteMany({}),
    Review.deleteMany({}),
    Transaction.deleteMany({}),
    Verify.deleteMany({})
  ]);
  
  console.log('✅ All data cleared successfully');
}

async function createInitialData() {
  try {
    await mongoose.connect(process.env.DBCONNECTIONSTRING);
    console.log('🔗 Connected to MongoDB');

    await clearAllData();
    console.log('🚀 Creating initial data...');

    // 1. Tạo 1 Admin
    console.log('👤 Creating admin...');
    const adminCreatedAt = getRandomDateInJune2025();
    const adminUser = new User({
      password: hashPassword('123456'),
      email: 'admin@dailymate.com',
      role: 'admin',
      isActive: true,
      isVerified: true,
      createdAt: adminCreatedAt,
      updatedAt: adminCreatedAt
    });
    await adminUser.save();

    const adminProfile = new Admin({
      userId: adminUser._id,
      fullName: 'Quản trị viên hệ thống',
      phoneNumber: generatePhoneNumber(),
      createdAt: adminCreatedAt,
      updatedAt: adminCreatedAt
    });
    await adminProfile.save();

    // 2. Tạo Teachers từ JSON
    console.log('👨‍🏫 Creating teachers from JSON data...');
    const teachersData = JSON.parse(fs.readFileSync('json/EXE2.teachers.json', 'utf8'));
    const teachers = [];

    for (let i = 0; i < teachersData.length; i++) {
      const teacherData = teachersData[i];
      const teacherCreatedAt = getRandomDateInJune2025();
      const teacherUser = new User({
        _id: teacherData.userId.$oid,
        password: hashPassword('123456'),
        email: generateEmail(teacherData.fullName, i + 1),
        role: 'teacher',
        isActive: true,
        isVerified: true,
        createdAt: teacherCreatedAt,
        updatedAt: teacherCreatedAt
      });
      await teacherUser.save();

      const { Teacher } = await import('../models/teacher.mjs');
      const teacherProfile = new Teacher({
        _id: teacherData._id.$oid,
        userId: teacherData.userId.$oid,
        fullName: teacherData.fullName,
        phoneNumber: teacherData.phoneNumber,
        specializations: teacherData.specializations,
        bio: teacherData.bio,
        coursesCreated: teacherData.coursesCreated.map(id => id.$oid),
        createdAt: new Date(teacherData.createdAt.$date),
        updatedAt: new Date(teacherData.updatedAt.$date)
      });
      await teacherProfile.save();

      teachers.push({
        _id: teacherProfile._id,
        teacherId: teacherProfile._id,
        fullName: teacherProfile.fullName,
        userId: teacherProfile.userId
      });
      console.log(`✅ Created teacher: ${teacherProfile.fullName}`);
    }

    // 3. Tạo 135 Parents với phân bố 45% tháng 6, 55% tháng 7
    console.log('👨‍👩‍👧‍👦 Creating 135 parents...');
    const parents = [];
    const juneParentsCount = Math.ceil(135 * 0.45); // 61 parents trong tháng 6
    const julyParentsCount = 135 - juneParentsCount; // 74 parents trong tháng 7

    for (let i = 0; i < 135; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const nameIndex = i % vietnameseNames[gender].length;
      const name = vietnameseNames[gender][nameIndex];
      
      const isJuneParent = i < juneParentsCount;
      const parentCreatedAt = isJuneParent ? getRandomDateInJune2025() : getRandomDateInJuly2025();
      
      try {
        const email = generateEmail(name, i + 1);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          console.error(`❌ Email already exists: ${email}`);
          continue;
        }

        const userData = {
          email: email,
          password: hashPassword('123456'),
          role: 'parent',
          isActive: true,
          isVerified: false,
          createdAt: parentCreatedAt,
          updatedAt: parentCreatedAt
        };

        const user = new User(userData);
        const savedUser = await user.save();

        const { Parent } = await import('../models/parent.mjs');
        const parentProfileData = {
          userId: savedUser._id.toString(),
          fullName: name,
          dateOfBirth: getRandomBirthDate(25, 45),
          gender: gender,
          address: vietnameseAddresses[i % vietnameseAddresses.length],
          phoneNumber: generatePhoneNumber(),
          subscriptionType: 'free',
          subscriptionExpiry: null,
          createdAt: parentCreatedAt,
          updatedAt: parentCreatedAt
        };

        const parent = new Parent(parentProfileData);
        const savedParent = await parent.save();

        parents.push({
          userId: savedUser._id,
          email: savedUser.email,
          role: savedUser.role,
          parentId: savedParent._id,
          fullName: savedParent.fullName,
          dateOfBirth: savedParent.dateOfBirth,
          gender: savedParent.gender,
          address: savedParent.address,
          phoneNumber: savedParent.phoneNumber,
          subscriptionType: savedParent.subscriptionType,
          subscriptionExpiry: savedParent.subscriptionExpiry,
          createdAt: parentCreatedAt,
          month: isJuneParent ? 'June' : 'July'
        });
        console.log(`✅ Created parent: ${name} (${isJuneParent ? 'June' : 'July'})`);
      } catch (error) {
        console.error(`❌ Failed to create parent: ${error.message}`);
      }
    }

    // 4. Tạo 195 Kids liên kết với Parents qua CÙNG userId
    console.log('👶 Creating 195 kids linked to parents via same userId...');
    const kids = [];
    const kidsPerParentCount = {};
    
    // Khởi tạo đếm kid cho mỗi parent
    for (let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      kidsPerParentCount[parent.userId.toString()] = 0;
    }

    for (let i = 0; i < 195; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const nameIndex = i % kidNames[gender].length;
      const name = kidNames[gender][nameIndex];
      
      // Chọn parent - đảm bảo mỗi parent có ít nhất 1 kid, tối đa 3 kids
      let selectedParent;
      let attempts = 0;
      
      const parentsWithoutKids = parents.filter(p => kidsPerParentCount[p.userId.toString()] === 0);
      
      if (parentsWithoutKids.length > 0) {
        selectedParent = parentsWithoutKids[Math.floor(Math.random() * parentsWithoutKids.length)];
      } else {
        do {
          selectedParent = parents[Math.floor(Math.random() * parents.length)];
          attempts++;
        } while (kidsPerParentCount[selectedParent.userId.toString()] >= 3 && attempts < 100);
        
        if (attempts >= 100) {
          console.error('Could not find parent with less than 3 kids');
          continue;
        }
      }
      
      // Kid tạo trong cùng tháng với parent và sau parent ít nhất 1 ngày
      const parentCreatedAt = selectedParent.createdAt;
      let kidCreatedAt;
      
      if (selectedParent.month === 'June') {
        const minDate = new Date(Math.max(parentCreatedAt.getTime() + 24 * 60 * 60 * 1000, new Date('2025-06-01').getTime()));
        const maxDate = new Date('2025-06-30');
        kidCreatedAt = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
      } else {
        const minDate = new Date(Math.max(parentCreatedAt.getTime() + 24 * 60 * 60 * 1000, new Date('2025-07-01').getTime()));
        const maxDate = new Date('2025-07-31');
        kidCreatedAt = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
      }
      
      try {
        // Kid sử dụng CÙNG userId với Parent
        const { Kid } = await import('../models/kid.mjs');
        const kidProfileData = {
          userId: selectedParent.userId, // CÙNG userId với parent
          fullName: name,
          dateOfBirth: getRandomBirthDate(5, 15),
          gender: gender,
          points: 0,
          level: 0,
          avatar: 'img/default',
          unlockedAvatars: [],
          achievements: [],
          streak: {
            current: 0,
            longest: 0
          },
          createdAt: kidCreatedAt,
          updatedAt: kidCreatedAt
        };

        const kid = new Kid(kidProfileData);
        const savedKid = await kid.save();

        kids.push({
          userId: selectedParent.userId, // CÙNG userId với parent
          email: selectedParent.email,
          role: 'kid',
          kidId: savedKid._id,
          fullName: savedKid.fullName,
          dateOfBirth: savedKid.dateOfBirth,
          gender: savedKid.gender,
          points: savedKid.points,
          level: savedKid.level,
          avatar: savedKid.avatar,
          parentId: selectedParent.parentId,
          parentUserId: selectedParent.userId,
          createdAt: kidCreatedAt,
          month: selectedParent.month
        });
        kidsPerParentCount[selectedParent.userId.toString()]++;
        console.log(`✅ Created kid: ${name} (linked to parent: ${selectedParent.fullName}) - ${selectedParent.month}`);
      } catch (error) {
        console.error(`❌ Failed to create kid: ${error.message}`);
      }
    }

    // 5. Tạo 45 Transactions (1/3 số parent) và cập nhật premium subscription
    console.log('💳 Creating 45 transactions and updating premium subscriptions (1/3 of parents)...');
    const premiumParents = [];
    const shuffledParents = [...parents].sort(() => Math.random() - 0.5);
    const selectedPremiumParents = shuffledParents.slice(0, 45); // Đúng 1/3 số parent = 45/135

    const juneTransactionCount = Math.ceil(45 * 0.45); // 21 transactions trong tháng 6
    const julyTransactionCount = 45 - juneTransactionCount; // 24 transactions trong tháng 7

    for (let i = 0; i < selectedPremiumParents.length; i++) {
      const parent = selectedPremiumParents[i];
      
      const isJuneTransaction = i < juneTransactionCount;
      
      let transactionDate;
      if (isJuneTransaction) {
        const minJuneDate = new Date(Math.max(parent.createdAt.getTime() + 24 * 60 * 60 * 1000, new Date('2025-06-01').getTime()));
        const maxJuneDate = new Date('2025-06-30');
        transactionDate = new Date(minJuneDate.getTime() + Math.random() * (maxJuneDate.getTime() - minJuneDate.getTime()));
      } else {
        const minJulyDate = new Date(Math.max(parent.createdAt.getTime() + 24 * 60 * 60 * 1000, new Date('2025-07-01').getTime()));
        const maxJulyDate = new Date('2025-07-20');
        transactionDate = new Date(minJulyDate.getTime() + Math.random() * (maxJulyDate.getTime() - minJulyDate.getTime()));
      }
      
      // Premium expiry = transaction date + 30 ngày
      const expiryDate = new Date(transactionDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const orderCode = Math.floor(Math.random() * 900000) + 100000;
      const transaction = new Transaction({
        userId: parent.userId.toString(),
        orderCode: orderCode,
        amount: 60000, // 60,000 VND - gói premium duy nhất
        status: 'SUCCESS',
        createdAt: transactionDate,
        updatedAt: transactionDate
      });
      await transaction.save();
      
      // Cập nhật parent thành premium
      const { Parent } = await import('../models/parent.mjs');
      await Parent.findByIdAndUpdate(
        parent.parentId,
        {
          subscriptionType: 'premium',
          subscriptionExpiry: expiryDate
        }
      );
      
      premiumParents.push({
        ...parent,
        subscriptionType: 'premium',
        subscriptionExpiry: expiryDate,
        transactionDate: transactionDate
      });
      
      console.log(`✅ Updated parent to premium: ${parent.fullName} (transaction: ${transactionDate.toISOString().split('T')[0]}, expires: ${expiryDate.toISOString().split('T')[0]}) - ${isJuneTransaction ? 'June' : 'July'}`);
    }

    // 6. Tạo Courses
    console.log('📚 Creating courses...');
    const coursesData = JSON.parse(fs.readFileSync('json/EXE2.courses.json', 'utf8'));
    const courses = [];
    
    for (let i = 0; i < coursesData.length; i++) {
      const courseData = coursesData[i];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      const instructorId = (randomTeacher.teacherId || randomTeacher._id).toString();
      
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
        console.log(`✅ Created course: ${result.data.title}`);
      } else {
        console.error(`❌ Failed to create course: ${result.message}`);
      }
    }

    // 7. Tạo Lessons
    console.log('📖 Creating lessons...');
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
        console.log(`✅ Created lesson: ${result.data.title}`);
      } else {
        console.error(`❌ Failed to create lesson: ${result.message}`);
      }
    }

    // 8. Tạo Tests
    console.log('📝 Creating tests...');
    const testsData = JSON.parse(fs.readFileSync('json/EXE2.tests.json', 'utf8'));
    const tests = [];
    
    for (let i = 0; i < testsData.length; i++) {
      const testData = testsData[i];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
      
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
        console.log(`✅ Created test: ${result.data.title}`);
      } else {
        console.error(`❌ Failed to create test: ${result.message}`);
      }
    }

    // 9. Tạo CourseProgress với kiểm tra subscription expiry
    console.log('📊 Creating course progress with subscription validation...');
    const enrollments = [];
    
    const premiumCourses = courses.filter(c => c.isPremium === true);
    const freeCourses = courses.filter(c => c.isPremium === false);
    
    console.log(`Found ${premiumCourses.length} premium courses and ${freeCourses.length} free courses`);
    
    // Kiểm tra parent nào có subscription còn hạn sau ngày hiện tại
    const today = new Date();
    const validPremiumParentUserIds = new Set();
    
    premiumParents.forEach(p => {
      if (p.subscriptionExpiry && p.subscriptionExpiry > today) {
        validPremiumParentUserIds.add(p.userId.toString());
      }
    });
    
    const validPremiumKids = kids.filter(kid => validPremiumParentUserIds.has(kid.userId.toString()));
    const otherKids = kids.filter(kid => !validPremiumParentUserIds.has(kid.userId.toString()));
    
    console.log(`Valid premium kids: ${validPremiumKids.length}, Other kids: ${otherKids.length}`);
    
    // Enroll non-premium kids (chỉ free courses)
    for (let i = 0; i < otherKids.length; i++) {
      const kid = otherKids[i];
      const numCourses = Math.max(1, Math.min(Math.floor(Math.random() * 3) + 1, freeCourses.length)); // Ít nhất 1 course
      
      for (let j = 0; j < numCourses; j++) {
        const randomCourse = freeCourses[Math.floor(Math.random() * freeCourses.length)];
        
        const existingEnrollment = enrollments.find(
          e => e.kidId === kid.kidId.toString() && e.courseId === randomCourse._id.toString()
        );
        
        if (!existingEnrollment) {
          const result = await enrollCourseAsync(kid.kidId.toString(), randomCourse._id.toString());
          if (result.success) {
            enrollments.push({ 
              kidId: kid.kidId.toString(), 
              courseId: randomCourse._id.toString(),
              progressId: result.data._id,
              isPremium: false
            });
            console.log(`✅ Enrolled non-premium kid in free course: ${kid.fullName} -> ${randomCourse.title}`);
          } else {
            console.error(`❌ Failed to enroll: ${result.message}`);
          }
        }
      }
    }
    
    // Enroll premium kids với subscription hợp lệ (cả free và premium courses)
    const allCourses = [...courses];
    for (let i = 0; i < validPremiumKids.length; i++) {
      const kid = validPremiumKids[i];
      const numCourses = Math.max(1, Math.min(Math.floor(Math.random() * 3) + 1, allCourses.length)); // Ít nhất 1 course
      
      for (let j = 0; j < numCourses; j++) {
        const randomCourse = allCourses[Math.floor(Math.random() * allCourses.length)];
        
        const existingEnrollment = enrollments.find(
          e => e.kidId === kid.kidId.toString() && e.courseId === randomCourse._id.toString()
        );
        
        if (!existingEnrollment) {
          const result = await enrollCourseAsync(kid.kidId.toString(), randomCourse._id.toString());
          if (result.success) {
            enrollments.push({ 
              kidId: kid.kidId.toString(), 
              courseId: randomCourse._id.toString(),
              progressId: result.data._id,
              isPremium: randomCourse.isPremium
            });
            const courseType = randomCourse.isPremium ? 'premium' : 'free';
            console.log(`✅ Enrolled premium kid in ${courseType} course: ${kid.fullName} -> ${randomCourse.title}`);
          } else {
            console.error(`❌ Failed to enroll: ${result.message}`);
          }
        }
      }
    }

    // 10. Tạo Reviews chỉ từ những tài khoản đã enroll
    console.log('⭐ Creating reviews from enrolled accounts...');
    const reviewsToCreate = 34;
    
    for (let i = 0; i < reviewsToCreate; i++) {
      if (enrollments.length === 0) {
        console.error('No enrollments found for reviews');
        continue;
      }
      
      const randomEnrollment = enrollments[Math.floor(Math.random() * enrollments.length)];
      const enrolledCourse = courses.find(c => c._id.toString() === randomEnrollment.courseId);
      
      if (!enrolledCourse) continue;
      
      const enrolledKid = kids.find(k => k.kidId.toString() === randomEnrollment.kidId);
      if (!enrolledKid) continue;
      
      // Tìm parent thông qua cùng userId
      const parentOfKid = parents.find(p => p.userId.toString() === enrolledKid.userId.toString());
      if (!parentOfKid) continue;
      
      // Kiểm tra premium subscription còn hạn nếu course là premium
      const today = new Date();
      if (enrolledCourse.isPremium) {
        const premiumParent = premiumParents.find(p => p.userId.toString() === parentOfKid.userId.toString());
        if (!premiumParent || !premiumParent.subscriptionExpiry || premiumParent.subscriptionExpiry < today) {
          console.log(`Skipping review - parent subscription expired or not premium: ${parentOfKid.fullName}`);
          continue;
        }
      }
      
      let reviewData = {
        courseId: enrolledCourse._id.toString(),
        content: reviewContents[Math.floor(Math.random() * reviewContents.length)]
      };
      
      // Tạo rating tích cực
      const rand = Math.random();
      if (rand < 0.5) {
        reviewData.star = 5; // 50% - 5 sao
      } else if (rand < 0.8) {
        reviewData.star = 4; // 30% - 4 sao  
      } else if (rand < 0.95) {
        reviewData.star = 3; // 15% - 3 sao
      } else {
        reviewData.star = 2; // 5% - 2 sao
      }
      
      // 50/50 review từ kid hoặc parent
      if (Math.random() > 0.5) {
        reviewData.kidId = enrolledKid.kidId.toString();
      } else {
        reviewData.parentId = parentOfKid.parentId.toString();
      }
      
      const result = await createReviewAsync(reviewData);
      if (result.success) {
        const reviewer = reviewData.kidId ? 'kid' : 'parent';
        console.log(`✅ Created review from ${reviewer}: ${reviewData.star} stars for ${enrolledCourse.title}`);
      } else {
        console.error(`❌ Failed to create review: ${result.message}`);
      }
    }

    console.log('🎉 Initial data created successfully!');
    console.log('📊 Summary:');
    console.log(`- 1 Admin account created`);
    console.log(`- ${teachers.length} Teacher accounts created (from JSON)`);
    console.log(`- ${parents.length} Parent accounts created (${premiumParents.length} premium = ${Math.round(premiumParents.length/parents.length*100)}%)`);
    console.log(`- ${kids.length} Kid accounts created (linked via same userId)`);
    console.log(`- ${courses.length} Courses created`);
    console.log(`- ${lessons.length} Lessons created`);
    console.log(`- ${tests.length} Tests created`);
    console.log(`- 45 Transactions created (all SUCCESS, 60,000 VND each)`);
    console.log(`- ${enrollments.length} Course enrollments created`);
    console.log(`- 34 Reviews created from enrolled accounts only`);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('Admin: admin@dailymate.com / 123456');
    console.log('All users: Use generated emails / 123456');
    console.log('');
    console.log('✅ All requirements satisfied:');
    console.log('1. ✅ Parent-Kid linkage via same userId, proper timestamps, 1-3 kids per parent');
    console.log('2. ✅ Transactions linked to existing parents, 30-day subscription expiry');
    console.log('3. ✅ 1/3 parents are premium (45/135), single premium package');
    console.log('4. ✅ Premium course enrollment only for valid subscriptions, all kids enrolled');
    console.log('5. ✅ Reviews only from enrolled accounts, maintaining current ratio');

  } catch (error) {
    console.error('❌ Error creating initial data:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

createInitialData();