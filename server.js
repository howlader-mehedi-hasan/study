import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve uploaded files
app.use(express.static(path.join(__dirname, 'dist'))); // Serve frontend build

// Ensure Data Directory Exists
const dataDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dataDir)) {
    console.log("Creating data directory...");
    fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure Public Directories Exist
['materials', 'notices'].forEach(dir => {
    const publicPath = path.join(__dirname, 'public', dir);
    if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
    }
});

// Audit Log Helper
const logAudit = (action, username, details) => {
    const logsPath = path.join(__dirname, 'src', 'data', 'audit_logs.json');
    try {
        let logs = [];
        if (fs.existsSync(logsPath)) {
            logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
        }
        const newLog = {
            id: `log-${Date.now()}-${Math.round(Math.random() * 1000)}`,
            date: new Date().toISOString(),
            action,
            username: username || 'Unknown',
            details
        };
        logs.unshift(newLog); // Add to top
        // Limit logs to last 1000 to prevent infinite growth
        if (logs.length > 1000) logs = logs.slice(0, 1000);

        fs.writeFileSync(logsPath, JSON.stringify(logs, null, 4));
        console.log(`[AUDIT] Logged: ${action} by ${username}`);
    } catch (e) {
        console.error("Audit Log Error:", e);
    }
};

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const courseId = req.body.courseId;
        const uploadPath = path.join(__dirname, 'public', 'materials', courseId);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// GET courses
app.get('/api/courses', (req, res) => {
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');
    try {
        if (fs.existsSync(coursesPath)) {
            const data = fs.readFileSync(coursesPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to read courses' });
    }
});

// GET Audit Logs
app.get('/api/admin/logs', (req, res) => {
    const logsPath = path.join(__dirname, 'src', 'data', 'audit_logs.json');
    try {
        if (fs.existsSync(logsPath)) {
            res.json(JSON.parse(fs.readFileSync(logsPath, 'utf8')));
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// DELETE Single Log
app.delete('/api/admin/logs/:id', (req, res) => {
    const { id } = req.params;
    const logsPath = path.join(__dirname, 'src', 'data', 'audit_logs.json');
    try {
        if (!fs.existsSync(logsPath)) return res.status(404).json({ error: 'Logs not found' });

        let logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
        const newLogs = logs.filter(l => l.id !== id);

        if (logs.length === newLogs.length) return res.status(404).json({ error: 'Log not found' });

        fs.writeFileSync(logsPath, JSON.stringify(newLogs, null, 4));
        res.json({ success: true, message: 'Log deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete log' });
    }
});

// DELETE All Logs (Clear)
app.delete('/api/admin/logs', (req, res) => {
    const logsPath = path.join(__dirname, 'src', 'data', 'audit_logs.json');
    try {
        fs.writeFileSync(logsPath, JSON.stringify([], null, 4));
        // Log this action (create a new log after clearing)
        logAudit('CLEAR_LOGS', req.body.username || 'Admin', 'Cleared all activity logs');
        res.json({ success: true, message: 'All logs cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear logs' });
    }
});

// POST Batch Delete Logs
app.post('/api/admin/logs/batch-delete', (req, res) => {
    const { ids } = req.body;
    const logsPath = path.join(__dirname, 'src', 'data', 'audit_logs.json');
    try {
        if (!fs.existsSync(logsPath)) return res.status(404).json({ error: 'Logs not found' });
        if (!Array.isArray(ids)) return res.status(400).json({ error: 'Invalid IDs format' });

        let logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
        const originalCount = logs.length;
        logs = logs.filter(l => !ids.includes(l.id));

        fs.writeFileSync(logsPath, JSON.stringify(logs, null, 4));
        res.json({ success: true, message: `Deleted ${originalCount - logs.length} logs` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to batch delete logs' });
    }
});

// POST new course or update existing
// POST new course or update existing
app.post('/api/courses', upload.array('files'), (req, res) => {
    const { courseId, courseName, instructor, username } = req.body; // Expect username in body
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');

    try {
        let courses = [];
        if (fs.existsSync(coursesPath)) {
            courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        }

        let course = courses.find(c => c.id === courseId);
        let isNewCourse = false;

        if (!course) {
            isNewCourse = true;
            course = {
                id: courseId,
                name: courseName,
                instructor: instructor,
                files: []
            };
            courses.push(course);
        } else {
            // Update details if course exists
            course.name = courseName;
            course.instructor = instructor;
        }

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const ext = path.extname(file.originalname).toLowerCase();
                const fileType = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'].includes(ext) ? 'image' : 'pdf';

                const newFile = {
                    id: `file-${Date.now()}-${Math.round(Math.random() * 1000)}`,
                    name: file.originalname,
                    type: fileType,
                    path: `/materials/${courseId}/${file.originalname}`,
                    uploadedBy: username, // Metadata
                    uploadDate: new Date().toISOString() // Metadata
                };
                course.files.push(newFile);
                logAudit('UPLOAD_FILE', username, `Uploaded ${file.originalname} to ${courseId}`);
            });
        }

        if (isNewCourse) logAudit('CREATE_COURSE', username, `Created course ${courseId}`);
        else logAudit('UPDATE_COURSE', username, `Updated course ${courseId}`);

        fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));
        res.json({ success: true, message: 'Course updated successfully', course });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save course data' });
    }
});

// DELETE file from course
app.delete('/api/courses/:courseId/files/:fileId', (req, res) => {
    const { courseId, fileId } = req.params;
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');

    try {
        if (!fs.existsSync(coursesPath)) {
            return res.status(404).json({ error: 'Courses data not found' });
        }

        let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        const course = courses.find(c => c.id === courseId);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const fileIndex = course.files.findIndex(f => f.id === fileId);
        if (fileIndex === -1) {
            return res.status(404).json({ error: 'File not found' });
        }

        const fileToDelete = course.files[fileIndex];
        const filePath = path.join(__dirname, 'public', fileToDelete.path);

        // Remove from array
        course.files.splice(fileIndex, 1);

        // Update JSON
        fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));

        // Delete actual file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // We can't easily get username here without changing API signature or reading headers
        // For simplicity, we might need the frontend to pass user info in headers or query
        // But since this is a delete op, it might come from Deletion Requests which we handle separately
        // OR direct delete if admin. Let's assume admin direct delete effectively.

        // HOWEVER: Standard DELETE doesn't carry body well. 
        // We will skip logging direct deletes here IF they are covered by deletion requests logic
        // OR we should parse user from header if valid. 

        // For this immediate step, let's log as 'System/Admin' if not provided
        logAudit('DELETE_FILE', 'Admin', `Deleted file ${fileToDelete.name} from ${courseId}`);

        res.json({ success: true, message: 'File deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// POST Add Exam to Course
app.post('/api/courses/:id/exams', (req, res) => {
    const courseId = req.params.id;
    const { title, date, time, syllabus } = req.body;
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');

    try {
        if (!fs.existsSync(coursesPath)) {
            return res.status(404).json({ error: 'Courses data not found' });
        }

        let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        const course = courses.find(c => c.id === courseId);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (!course.exams) {
            course.exams = [];
        }

        const newExam = {
            id: `exam-${Date.now()}`,
            title,
            date,
            time,
            syllabus: syllabus || ''
        };

        course.exams.push(newExam);

        course.exams.push(newExam);

        fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));
        logAudit('ADD_EXAM', req.body.username, `Added exam ${title} to ${courseId}`); // Require username in body
        res.json({ success: true, message: 'Exam added successfully', exam: newExam });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add exam' });
    }
});

// GET Complaints
app.get('/api/complaints', (req, res) => {
    const complaintsPath = path.join(__dirname, 'src', 'data', 'complaints.json');
    if (fs.existsSync(complaintsPath)) {
        res.json(JSON.parse(fs.readFileSync(complaintsPath, 'utf8')));
    } else {
        res.json([]);
    }
});

// POST Complaint
app.post('/api/complaints', (req, res) => {
    const { subject, department, description, anonymous } = req.body;
    const complaintsPath = path.join(__dirname, 'src', 'data', 'complaints.json');
    let complaints = [];

    if (fs.existsSync(complaintsPath)) {
        complaints = JSON.parse(fs.readFileSync(complaintsPath, 'utf8'));
    }

    const newComplaint = {
        id: `comp-${Date.now()}`,
        subject,
        department,
        description,
        anonymous,
        date: new Date().toISOString().split('T')[0]
    };

    complaints.push(newComplaint);
    fs.writeFileSync(complaintsPath, JSON.stringify(complaints, null, 4));
    res.json({ success: true, complaint: newComplaint });
});

// GET Opinions
app.get('/api/opinions', (req, res) => {
    const opinionsPath = path.join(__dirname, 'src', 'data', 'opinions.json');
    if (fs.existsSync(opinionsPath)) {
        res.json(JSON.parse(fs.readFileSync(opinionsPath, 'utf8')));
    } else {
        res.json([]);
    }
});

// POST Opinion
app.post('/api/opinions', (req, res) => {
    const { rating, feedback } = req.body;
    const opinionsPath = path.join(__dirname, 'src', 'data', 'opinions.json');
    let opinions = [];

    if (fs.existsSync(opinionsPath)) {
        opinions = JSON.parse(fs.readFileSync(opinionsPath, 'utf8'));
    }

    const newOpinion = {
        id: `op-${Date.now()}`,
        rating,
        feedback,
        date: new Date().toISOString().split('T')[0]
    };

    opinions.unshift(newOpinion); // Add to top
    fs.writeFileSync(opinionsPath, JSON.stringify(opinions, null, 4));
    res.json({ success: true, opinion: newOpinion });
});

// DELETE Exam from Course
app.delete('/api/courses/:id/exams/:examId', (req, res) => {
    const { id, examId } = req.params;
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');

    try {
        if (!fs.existsSync(coursesPath)) {
            return res.status(404).json({ error: 'Courses data not found' });
        }

        let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        const course = courses.find(c => c.id === id);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.exams) {
            course.exams = course.exams.filter(e => e.id !== examId);
            fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));
        }

        res.json({ success: true, message: 'Exam deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete exam' });
    }
});

// PUT Update Exam in Course
app.put('/api/courses/:id/exams/:examId', (req, res) => {
    const { id, examId } = req.params;
    const { title, date, time, syllabus } = req.body;
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');

    try {
        if (!fs.existsSync(coursesPath)) {
            return res.status(404).json({ error: 'Courses data not found' });
        }

        let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        const course = courses.find(c => c.id === id);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.exams) {
            const examIndex = course.exams.findIndex(e => e.id === examId);
            if (examIndex !== -1) {
                course.exams[examIndex] = { ...course.exams[examIndex], title, date, time, syllabus };
                fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));
                logAudit('UPDATE_EXAM', req.body.username, `Updated exam ${title} in ${id}`);
                res.json({ success: true, message: 'Exam updated successfully', exam: course.exams[examIndex] });
            } else {
                res.status(404).json({ error: 'Exam not found' });
            }
        } else {
            res.status(404).json({ error: 'Exam not found' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update exam' });
    }
});

// POST Reorder Courses
app.post('/api/courses/reorder', (req, res) => {
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');
    const { courses } = req.body;

    try {
        if (!Array.isArray(courses)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));
        res.json({ success: true, message: 'Courses reordered successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reorder courses' });
    }
});

// DELETE entire course
app.delete('/api/courses/:id', (req, res) => {
    const courseId = req.params.id;
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');
    const courseFolder = path.join(__dirname, 'public', 'materials', courseId);

    try {
        if (!fs.existsSync(coursesPath)) {
            return res.status(404).json({ error: 'Courses data not found' });
        }

        let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        const courseIndex = courses.findIndex(c => c.id === courseId);

        if (courseIndex === -1) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Remove from array
        courses.splice(courseIndex, 1);

        // Update JSON
        fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));

        // Delete course folder and all files
        if (fs.existsSync(courseFolder)) {
            fs.rmSync(courseFolder, { recursive: true, force: true });
        }

        res.json({ success: true, message: 'Course deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

// --- Syllabus API ---

// GET Syllabus
app.get('/api/syllabus', (req, res) => {
    const syllabusPath = path.join(__dirname, 'src', 'data', 'syllabus.json');
    try {
        if (fs.existsSync(syllabusPath)) {
            const data = fs.readFileSync(syllabusPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch syllabus' });
    }
});

// POST Syllabus (Add/Update)
app.post('/api/syllabus', (req, res) => {
    const syllabusPath = path.join(__dirname, 'src', 'data', 'syllabus.json');
    const newCourse = req.body;

    try {
        let syllabus = [];
        if (fs.existsSync(syllabusPath)) {
            syllabus = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
        }

        const index = syllabus.findIndex(c => c.code === newCourse.code);
        if (index !== -1) {
            syllabus[index] = newCourse; // Update
        } else {
            syllabus.push(newCourse); // Add
        }

        fs.writeFileSync(syllabusPath, JSON.stringify(syllabus, null, 4));
        logAudit('UPDATE_SYLLABUS', newCourse.username || 'Admin', `Updated syllabus for ${newCourse.code}`);
        res.json({ success: true, message: 'Syllabus updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update syllabus' });
    }
});

// DELETE Syllabus Item
app.delete('/api/syllabus/:code', (req, res) => {
    const { code } = req.params;
    const syllabusPath = path.join(__dirname, 'src', 'data', 'syllabus.json');

    try {
        if (!fs.existsSync(syllabusPath)) {
            return res.status(404).json({ error: 'Syllabus data not found' });
        }

        let syllabus = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
        const newSyllabus = syllabus.filter(c => c.code !== code);

        if (syllabus.length === newSyllabus.length) {
            return res.status(404).json({ error: 'Course not found' });
        }

        fs.writeFileSync(syllabusPath, JSON.stringify(newSyllabus, null, 4));
        res.json({ success: true, message: 'Course deleted from syllabus' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete course from syllabus' });
    }
});

// POST Syllabus PDF Upload
// Configure Multer for Syllabus Upload
const syllabusStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const type = req.query.type;
        if (type === '4-1') {
            cb(null, 'syllabus-4-1.pdf');
        } else {
            cb(null, 'syllabus.pdf');
        }
    }
});
const syllabusUpload = multer({ storage: syllabusStorage });

// POST Syllabus PDF Upload
app.post('/api/syllabus/pdf', syllabusUpload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ success: true, message: 'Syllabus PDF updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload syllabus PDF' });
    }
});

// --- Notice Board API ---

// Configure Multer for Notice PDF Upload
const noticeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public', 'notices');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Unique filename: notice-{timestamp}{ext}
        cb(null, `notice-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const noticeUpload = multer({ storage: noticeStorage });

// GET Notices
app.get('/api/notices', (req, res) => {
    const noticesPath = path.join(__dirname, 'src', 'data', 'notices.json');
    try {
        if (fs.existsSync(noticesPath)) {
            const data = fs.readFileSync(noticesPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
});

// POST Notice (Add/Update)
app.post('/api/notices', (req, res) => {
    const noticesPath = path.join(__dirname, 'src', 'data', 'notices.json');
    const newNotice = req.body;

    try {
        let notices = [];
        if (fs.existsSync(noticesPath)) {
            notices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));
        }

        const index = notices.findIndex(n => n.id === newNotice.id);
        if (index !== -1) {
            notices[index] = newNotice; // Update
        } else {
            notices.unshift(newNotice); // Add to top
        }

        fs.writeFileSync(noticesPath, JSON.stringify(notices, null, 4));
        logAudit(index !== -1 ? 'UPDATE_NOTICE' : 'CREATE_NOTICE', newNotice.username || 'Admin', `Notice: ${newNotice.title}`);
        res.json({ success: true, message: 'Notice saved successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save notice' });
    }
});

// DELETE Notice
app.delete('/api/notices/:id', (req, res) => {
    const { id } = req.params;
    const noticesPath = path.join(__dirname, 'src', 'data', 'notices.json');

    try {
        if (!fs.existsSync(noticesPath)) {
            return res.status(404).json({ error: 'Notices data not found' });
        }

        let notices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));
        const noticeToDelete = notices.find(n => n.id === id);
        const newNotices = notices.filter(n => n.id !== id);

        if (notices.length === newNotices.length) {
            return res.status(404).json({ error: 'Notice not found' });
        }

        // Optional: Delete associated PDF if it exists
        if (noticeToDelete && noticeToDelete.pdfPath) {
            const pdfFullPath = path.join(__dirname, 'public', noticeToDelete.pdfPath);
            if (fs.existsSync(pdfFullPath)) {
                fs.unlinkSync(pdfFullPath);
            }
        }

        fs.writeFileSync(noticesPath, JSON.stringify(newNotices, null, 4));
        res.json({ success: true, message: 'Notice deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete notice' });
    }
});

// POST Notice PDF Upload
app.post('/api/notices/pdf', noticeUpload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Return the relative path for the frontend to store in the JSON
        const relativePath = `/notices/${req.file.filename}`;
        res.json({ success: true, filePath: relativePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload notice PDF' });
    }
});

// --- Schedule API ---

// GET Schedule
app.get('/api/schedule', (req, res) => {
    const schedulePath = path.join(__dirname, 'src', 'data', 'schedule.json');
    try {
        if (fs.existsSync(schedulePath)) {
            const data = fs.readFileSync(schedulePath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// PUT Toggle Schedule Cancellation
app.put('/api/schedule/:id/cancel', (req, res) => {
    const { id } = req.params;
    const { isCancelled } = req.body;
    const schedulePath = path.join(__dirname, 'src', 'data', 'schedule.json');

    try {
        if (!fs.existsSync(schedulePath)) {
            return res.status(404).json({ error: 'Schedule data not found' });
        }

        let schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
        const index = schedule.findIndex(item => item.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Schedule item not found' });
        }

        schedule[index].isCancelled = isCancelled;

        fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 4));
        logAudit('UPDATE_SCHEDULE', req.body.username || 'Admin', `Set cancellation to ${isCancelled} for schedule ${id}`);
        res.json({ success: true, message: 'Schedule updated successfully', item: schedule[index] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

// --- Routine Image Upload ---
const routineStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'routine.png'); // Always overwrite same file
    }
});
const routineUpload = multer({ storage: routineStorage });

app.post('/api/schedule/routine', routineUpload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        // Return success with timestamp to force frontend refresh
        res.json({ success: true, timestamp: Date.now() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload routine image' });
    }
});

// --- Holiday Management API ---

// GET Holidays
app.get('/api/holidays', (req, res) => {
    const holidaysPath = path.join(__dirname, 'src', 'data', 'holidays.json');
    try {
        if (fs.existsSync(holidaysPath)) {
            const data = fs.readFileSync(holidaysPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
});

// POST Holiday (Add New)
app.post('/api/holidays', (req, res) => {
    const holidaysPath = path.join(__dirname, 'src', 'data', 'holidays.json');
    const { date, title, note } = req.body;

    try {
        let holidays = [];
        if (fs.existsSync(holidaysPath)) {
            holidays = JSON.parse(fs.readFileSync(holidaysPath, 'utf8'));
        }

        const newHoliday = {
            id: `hol-${Date.now()}`,
            date,
            title,
            type: 'custom',
            isCancelled: false,
            note: note || ""
        };

        holidays.push(newHoliday);
        // Sort by date
        holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

        fs.writeFileSync(holidaysPath, JSON.stringify(holidays, null, 4));
        logAudit('CREATE_HOLIDAY', req.body.username || 'Admin', `Added holiday: ${title} on ${date}`);
        res.json({ success: true, message: 'Holiday added successfully', holiday: newHoliday });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add holiday' });
    }
});

// PUT Holiday (Update/Toggle Cancel)
app.put('/api/holidays/:id', (req, res) => {
    const { id } = req.params;
    const { isCancelled, note } = req.body; // allow updating cancellation status and note
    const holidaysPath = path.join(__dirname, 'src', 'data', 'holidays.json');

    try {
        if (!fs.existsSync(holidaysPath)) {
            return res.status(404).json({ error: 'Holidays data not found' });
        }

        let holidays = JSON.parse(fs.readFileSync(holidaysPath, 'utf8'));
        const index = holidays.findIndex(h => h.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Holiday not found' });
        }

        if (isCancelled !== undefined) holidays[index].isCancelled = isCancelled;
        if (note !== undefined) holidays[index].note = note;

        fs.writeFileSync(holidaysPath, JSON.stringify(holidays, null, 4));
        logAudit('UPDATE_HOLIDAY', req.body.username || 'Admin', `Updated holiday ${id}`);
        res.json({ success: true, message: 'Holiday updated successfully', holiday: holidays[index] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update holiday' });
    }
});

// DELETE Holiday (Only custom or logic to hide default)
app.delete('/api/holidays/:id', (req, res) => {
    const { id } = req.params;
    const holidaysPath = path.join(__dirname, 'src', 'data', 'holidays.json');

    try {
        if (!fs.existsSync(holidaysPath)) {
            return res.status(404).json({ error: 'Holidays data not found' });
        }

        let holidays = JSON.parse(fs.readFileSync(holidaysPath, 'utf8'));
        const holidayToDelete = holidays.find(h => h.id === id);

        if (!holidayToDelete) {
            return res.status(404).json({ error: 'Holiday not found' });
        }

        // For default holidays, maybe we don't want to delete, just cancel? 
        // But admin might want to remove mistakes. Let's allow delete.

        const newHolidays = holidays.filter(h => h.id !== id);
        fs.writeFileSync(holidaysPath, JSON.stringify(newHolidays, null, 4));

        logAudit('DELETE_HOLIDAY', req.body.username || 'Admin', `Deleted holiday ${holidayToDelete.title}`);
        res.json({ success: true, message: 'Holiday deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete holiday' });
    }
});

// --- Users & Auth API ---

// LOGIN
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const usersPath = path.join(__dirname, 'src', 'data', 'users.json');

    try {
        if (!fs.existsSync(usersPath)) {
            // Seed default admin if missing
            const seed = [{ id: 'admin-seed', username: 'admin', password: 'admin123', name: 'Super Admin', role: 'admin' }];
            fs.writeFileSync(usersPath, JSON.stringify(seed, null, 4));
        }

        // Check Env Vars for Admin Override
        const envAdminUser = process.env.VITE_ADMIN_USERNAME;
        const envAdminPass = process.env.VITE_ADMIN_PASSWORD;

        if (envAdminUser && envAdminPass && username === envAdminUser && password === envAdminPass) {
            return res.json({
                success: true,
                user: {
                    id: 'env-admin',
                    username: envAdminUser,
                    name: 'Super Admin (Env)',
                    role: 'admin',
                    permissions: {
                        courses_edit: true,
                        syllabus_edit: true,
                        schedule_edit: true,
                        welcome_message_edit: true,
                        notices_edit: true,
                        deletion_requests_edit: true,
                        exams_edit: true,
                        exams_edit: true,
                        course_materials_edit: true,
                        breaking_news_edit: true
                    }
                }
            });
        }

        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Return user info (exclude password)
            const { password, ...userInfo } = user;
            res.json({ success: true, user: userInfo });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET USERS (Admin only - simplification: frontend checks role, backend just returns for now)
app.get('/api/users', (req, res) => {
    const usersPath = path.join(__dirname, 'src', 'data', 'users.json');
    try {
        if (fs.existsSync(usersPath)) {
            const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
            // Return full user objects including passwords for Admin Dashboard
            res.json(users);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// CREATE USER
app.post('/api/users', (req, res) => {
    const usersPath = path.join(__dirname, 'src', 'data', 'users.json');
    const { username, password, name, role, permissions } = req.body;

    try {
        let users = [];
        if (fs.existsSync(usersPath)) {
            users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        }

        if (users.some(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password,
            name,
            role: role || 'editor',
            permissions: permissions || {
                courses_edit: false,
                syllabus_edit: false,
                schedule_edit: false,
                notices_edit: false,
                deletion_requests_edit: false,
                messages_view: false,
                complaints_view: false,
                opinions_view: false,
                class_cancellation_edit: false,
                welcome_message_edit: false,
                exams_edit: false,
                exams_edit: false,
                course_materials_edit: false,
                breaking_news_edit: false
            }
        };

        users.push(newUser);
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 4));

        res.json({ success: true, message: 'User created' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// DELETE USER
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const usersPath = path.join(__dirname, 'src', 'data', 'users.json');

    try {
        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const newUsers = users.filter(u => u.id !== id);

        if (users.length === newUsers.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deleting the last admin
        if (!newUsers.some(u => u.role === 'admin')) {
            return res.status(400).json({ error: 'Cannot delete the last admin' });
        }

        fs.writeFileSync(usersPath, JSON.stringify(newUsers, null, 4));
        res.json({ success: true, message: 'User deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// UPDATE PASSWORD
app.put('/api/users/:id/password', (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    const usersPath = path.join(__dirname, 'src', 'data', 'users.json');

    try {
        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ error: 'Password too short' });
        }

        users[index].password = newPassword;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 4));

        logAudit('CHANGE_PASSWORD', 'Admin', `Changed password for ${users[index].username}`);

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// UPDATE USER (Name, Username, Password)
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, username, password } = req.body;
    const usersPath = path.join(__dirname, 'src', 'data', 'users.json');

    try {
        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check availability if username is changing
        if (username && username !== users[index].username) {
            const usernameExists = users.some(u => u.username === username);
            if (usernameExists) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }

        // Update fields
        if (name) users[index].name = name;
        if (username) users[index].username = username;
        if (password) users[index].password = password;

        fs.writeFileSync(usersPath, JSON.stringify(users, null, 4));

        logAudit('UPDATE_USER', 'Admin', `Updated user ${users[index].username} (${id})`);

        res.json({ success: true, message: 'User updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// UPDATE PERMISSIONS
app.put('/api/users/:id/permissions', (req, res) => {
    const { id } = req.params;
    const { permissions } = req.body;
    const usersPath = path.join(__dirname, 'src', 'data', 'users.json');

    try {
        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Merge permissions
        users[index].permissions = { ...users[index].permissions, ...permissions };

        fs.writeFileSync(usersPath, JSON.stringify(users, null, 4));
        res.json({ success: true, message: 'Permissions updated', user: users[index] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update permissions' });
    }
});
// POST Schedule (Add/Update)
app.post('/api/schedule', (req, res) => {
    const schedulePath = path.join(__dirname, 'src', 'data', 'schedule.json');
    const newEntry = req.body;

    try {
        let schedule = [];
        if (fs.existsSync(schedulePath)) {
            schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
        }

        const index = schedule.findIndex(s => s.id === newEntry.id);
        if (index !== -1) {
            schedule[index] = newEntry; // Update
        } else {
            schedule.push(newEntry); // Add
        }

        fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 4));
        logAudit('UPDATE_SCHEDULE', newEntry.username || 'Admin', `Schedule event: ${newEntry.courseName || 'Event'}`);
        res.json({ success: true, message: 'Schedule updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

// DELETE Schedule Item
app.delete('/api/schedule/:id', (req, res) => {
    const { id } = req.params;
    const schedulePath = path.join(__dirname, 'src', 'data', 'schedule.json');

    try {
        if (!fs.existsSync(schedulePath)) {
            return res.status(404).json({ error: 'Schedule data not found' });
        }

        let schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
        const newSchedule = schedule.filter(s => s.id !== id);

        if (schedule.length === newSchedule.length) {
            return res.status(404).json({ error: 'Schedule entry not found' });
        }

        fs.writeFileSync(schedulePath, JSON.stringify(newSchedule, null, 4));
        res.json({ success: true, message: 'Schedule entry deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete schedule entry' });
    }
});

// --- Settings API ---

// GET Settings
app.get('/api/settings', (req, res) => {
    const settingsPath = path.join(__dirname, 'src', 'data', 'settings.json');
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            // Default settings if file doesn't exist
            res.json({ visibleDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// POST Settings (Update)
app.post('/api/settings', (req, res) => {
    const settingsPath = path.join(__dirname, 'src', 'data', 'settings.json');
    const newSettings = req.body;

    try {
        fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 4));
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// --- System Cleanup API ---

// POST Cleanup Junk Files
app.post('/api/cleanup', (req, res) => {
    try {
        const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');
        const noticesPath = path.join(__dirname, 'src', 'data', 'notices.json');
        const materialsDir = path.join(__dirname, 'public', 'materials');
        const noticesDir = path.join(__dirname, 'public', 'notices');

        let validPaths = new Set();

        // 1. Collect valid paths from Courses
        if (fs.existsSync(coursesPath)) {
            const courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
            courses.forEach(course => {
                if (course.files) {
                    course.files.forEach(file => {
                        // Ensure path starts with /materials/
                        if (file.path && file.path.startsWith('/materials/')) {
                            // Normalize to absolute path for comparison
                            // file.path matches URL structure: /materials/CourseID/filename
                            // On disk: public/materials/CourseID/filename
                            validPaths.add(path.join(__dirname, 'public', file.path));
                        }
                    });
                }
            });
        }

        // 2. Collect valid paths from Notices
        if (fs.existsSync(noticesPath)) {
            const notices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));
            notices.forEach(notice => {
                if (notice.pdfPath) {
                    // pdfPath: /notices/filename
                    validPaths.add(path.join(__dirname, 'public', notice.pdfPath));
                }
            });
        }

        let deletedFiles = [];
        let deletedCount = 0;

        // Helper to scan directory
        const scanAndDelete = (dir) => {
            if (!fs.existsSync(dir)) return;

            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanAndDelete(fullPath);
                    // Remove empty directories
                    if (fs.readdirSync(fullPath).length === 0) {
                        fs.rmdirSync(fullPath);
                    }
                } else {
                    // It's a file. Check if it's valid.
                    // We need to match exact paths.
                    if (!validPaths.has(fullPath)) {
                        // Special check: ignore syllabus PDFs as they are not in JSONs but fixed names
                        const filename = path.basename(fullPath);
                        if (filename !== 'syllabus.pdf' && filename !== 'syllabus-4-1.pdf') {
                            fs.unlinkSync(fullPath);
                            deletedFiles.push(path.relative(path.join(__dirname, 'public'), fullPath));
                            deletedCount++;
                        }
                    }
                }
            });
        };

        // Scan both directories
        scanAndDelete(materialsDir);
        scanAndDelete(noticesDir);

        res.json({
            success: true,
            message: `Cleanup complete. Removed ${deletedCount} files.`,
            deletedCount,
            deletedFiles
        });

    } catch (error) {
        console.error('Cleanup failed:', error);
        res.status(500).json({ error: 'Failed to perform system cleanup' });
    }
});

// --- Deletion Request System ---

const DELETION_REQUESTS_FILE = path.join(__dirname, 'src', 'data', 'deletion_requests.json');

// Helper: Get requests
const getDeletionRequests = () => {
    if (fs.existsSync(DELETION_REQUESTS_FILE)) {
        return JSON.parse(fs.readFileSync(DELETION_REQUESTS_FILE, 'utf8'));
    }
    return [];
};

// Helper: Save requests
const saveDeletionRequests = (requests) => {
    fs.writeFileSync(DELETION_REQUESTS_FILE, JSON.stringify(requests, null, 4));
};

// Internal Deletion Functions
const deleteCourseInternal = (courseId) => {
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');
    const courseFolder = path.join(__dirname, 'public', 'materials', courseId);

    if (!fs.existsSync(coursesPath)) throw new Error('Courses data not found');

    let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex === -1) throw new Error('Course not found');

    courses.splice(courseIndex, 1);
    fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));

    if (fs.existsSync(courseFolder)) {
        fs.rmSync(courseFolder, { recursive: true, force: true });
    }
    return true;
};

const deleteFileInternal = (courseId, fileId) => {
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');
    if (!fs.existsSync(coursesPath)) throw new Error('Courses data not found');

    let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    const fileIndex = course.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) throw new Error('File not found');

    const fileToDelete = course.files[fileIndex];
    const filePath = path.join(__dirname, 'public', fileToDelete.path);

    course.files.splice(fileIndex, 1);
    fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return true;
};

const deleteExamInternal = (courseId, examId) => {
    const coursesPath = path.join(__dirname, 'src', 'data', 'courses.json');
    if (!fs.existsSync(coursesPath)) throw new Error('Courses data not found');

    let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    if (course.exams) {
        course.exams = course.exams.filter(e => e.id !== examId);
        fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 4));
    }
    return true;
};

const deleteScheduleInternal = (id) => {
    const schedulePath = path.join(__dirname, 'src', 'data', 'schedule.json');
    if (!fs.existsSync(schedulePath)) throw new Error('Schedule data not found');

    let schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    const newSchedule = schedule.filter(s => s.id !== id);

    if (schedule.length === newSchedule.length) throw new Error('Schedule entry not found');

    fs.writeFileSync(schedulePath, JSON.stringify(newSchedule, null, 4));
    return true;
};

const deleteSyllabusInternal = (code) => {
    const syllabusPath = path.join(__dirname, 'src', 'data', 'syllabus.json');
    if (!fs.existsSync(syllabusPath)) throw new Error('Syllabus data not found');

    let syllabus = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
    const newSyllabus = syllabus.filter(c => c.code !== code);

    if (syllabus.length === newSyllabus.length) throw new Error('Syllabus entry not found');

    fs.writeFileSync(syllabusPath, JSON.stringify(newSyllabus, null, 4));
    return true;
};

const deleteNoticeInternal = (id) => {
    const noticesPath = path.join(__dirname, 'src', 'data', 'notices.json');
    if (!fs.existsSync(noticesPath)) throw new Error('Notices data not found');

    let notices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));
    const noticeToDelete = notices.find(n => n.id === id);
    const newNotices = notices.filter(n => n.id !== id);

    if (notices.length === newNotices.length) throw new Error('Notice not found');

    if (noticeToDelete && noticeToDelete.pdfPath) {
        const pdfFullPath = path.join(__dirname, 'public', noticeToDelete.pdfPath);
        if (fs.existsSync(pdfFullPath)) fs.unlinkSync(pdfFullPath);
    }

    fs.writeFileSync(noticesPath, JSON.stringify(newNotices, null, 4));
    return true;
};


// GET Deletion Requests (Admin)
app.get('/api/admin/deletion-requests', (req, res) => {
    try {
        const requests = getDeletionRequests();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// POST Deletion Request
app.post('/api/deletion-requests', (req, res) => {
    const { type, resourceId, details, requestedBy } = req.body;
    try {
        const requests = getDeletionRequests();
        const newRequest = {
            id: `req-${Date.now()}`,
            type, // 'course', 'file', 'exam', 'schedule', 'syllabus', 'notice'
            resourceId,
            details, // can include { courseId, fileId } for files
            requestedBy,
            date: new Date().toISOString(),
            status: 'pending'
        };
        requests.push(newRequest);
        saveDeletionRequests(requests);
        res.json({ success: true, message: 'Deletion request sent to Admin' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// POST Approve Deletion Request
app.post('/api/admin/deletion-requests/:id/approve', (req, res) => {
    const { id } = req.params;
    try {
        const requests = getDeletionRequests();
        const requestIndex = requests.findIndex(r => r.id === id);

        if (requestIndex === -1) return res.status(404).json({ error: 'Request not found' });

        const request = requests[requestIndex];

        // Execute Deletion Logic based on Type
        switch (request.type) {
            case 'course':
                deleteCourseInternal(request.resourceId);
                break;
            case 'file':
                deleteFileInternal(request.details.courseId, request.resourceId); // resourceId is fileId
                break;
            case 'exam':
                deleteExamInternal(request.details.courseId, request.resourceId); // resourceId is examId
                break;
            case 'schedule':
                deleteScheduleInternal(request.resourceId);
                break;
            case 'syllabus':
                deleteSyllabusInternal(request.resourceId);
                break;
            case 'notice':
                deleteNoticeInternal(request.resourceId);
                break;
            default:
                return res.status(400).json({ error: 'Unknown request type' });
        }

        // Remove request after successful deletion
        requests.splice(requestIndex, 1);
        saveDeletionRequests(requests);

        logAudit('APPROVE_DELETION', 'Admin', `Approved deletion of ${request.type} (${request.resourceId}) requested by ${request.requestedBy}`);

        res.json({ success: true, message: 'Request approved and item deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to approve request: ${error.message}` });
    }
});

// DELETE Rejection Request
app.delete('/api/admin/deletion-requests/:id', (req, res) => {
    const { id } = req.params;
    try {
        const requests = getDeletionRequests();
        const newRequests = requests.filter(r => r.id !== id);

        if (requests.length === newRequests.length) return res.status(404).json({ error: 'Request not found' });

        saveDeletionRequests(newRequests);
        res.json({ success: true, message: 'Request rejected/deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete request' });
    }
});


// --- Contact Message System ---

const MESSAGES_FILE = path.join(__dirname, 'src', 'data', 'messages.json');

// GET Messages (Admin)
app.get('/api/admin/messages', (req, res) => {
    try {
        if (fs.existsSync(MESSAGES_FILE)) {
            const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
            res.json(messages);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST Message (Public)
app.post('/api/messages', (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        let messages = [];
        if (fs.existsSync(MESSAGES_FILE)) {
            messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
        }

        const newMessage = {
            id: `msg-${Date.now()}-${Math.round(Math.random() * 1000)}`,
            name,
            email,
            subject,
            message,
            date: new Date().toISOString()
        };

        messages.unshift(newMessage);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 4));

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// DELETE Message (Admin)
app.delete('/api/admin/messages/:id', (req, res) => {
    const { id } = req.params;
    try {
        if (!fs.existsSync(MESSAGES_FILE)) return res.status(404).json({ error: 'Messages not found' });

        let messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
        const newMessages = messages.filter(m => m.id !== id);

        if (messages.length === newMessages.length) return res.status(404).json({ error: 'Message not found' });

        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(newMessages, null, 4));

        logAudit('DELETE_MESSAGE', 'Admin', `Deleted contact message (${id})`);

        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// --- Complaints System ---

const COMPLAINTS_FILE = path.join(__dirname, 'src', 'data', 'complaints.json');

// GET Complaints (Admin)
app.get('/api/admin/complaints', (req, res) => {
    try {
        if (fs.existsSync(COMPLAINTS_FILE)) {
            const complaints = JSON.parse(fs.readFileSync(COMPLAINTS_FILE, 'utf8'));
            res.json(complaints);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// POST Complaint (Public)
app.post('/api/complaints', (req, res) => {
    const { subject, department, description, anonymous } = req.body;
    try {
        let complaints = [];
        if (fs.existsSync(COMPLAINTS_FILE)) {
            complaints = JSON.parse(fs.readFileSync(COMPLAINTS_FILE, 'utf8'));
        }

        const newComplaint = {
            id: `comp-${Date.now()}-${Math.round(Math.random() * 1000)}`,
            subject,
            department,
            description,
            anonymous,
            date: new Date().toISOString()
        };

        complaints.unshift(newComplaint);
        fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 4));

        res.json({ success: true, message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit complaint' });
    }
});

// DELETE Complaint (Admin)
app.delete('/api/admin/complaints/:id', (req, res) => {
    const { id } = req.params;
    try {
        if (!fs.existsSync(COMPLAINTS_FILE)) return res.status(404).json({ error: 'Complaints not found' });

        let complaints = JSON.parse(fs.readFileSync(COMPLAINTS_FILE, 'utf8'));
        const newComplaints = complaints.filter(c => c.id !== id);

        if (complaints.length === newComplaints.length) return res.status(404).json({ error: 'Complaint not found' });

        fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(newComplaints, null, 4));

        logAudit('DELETE_COMPLAINT', 'Admin', `Deleted complaint (${id})`);

        res.json({ success: true, message: 'Complaint deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete complaint' });
    }
});

// --- Opinions/Feedback System ---

const OPINIONS_FILE = path.join(__dirname, 'src', 'data', 'opinions.json');

// GET Opinions (Public & Admin)
app.get('/api/opinions', (req, res) => {
    try {
        if (fs.existsSync(OPINIONS_FILE)) {
            const opinions = JSON.parse(fs.readFileSync(OPINIONS_FILE, 'utf8'));
            res.json(opinions);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch opinions' });
    }
});

// POST Opinion (Public)
app.post('/api/opinions', (req, res) => {
    const { rating, feedback } = req.body;
    try {
        let opinions = [];
        if (fs.existsSync(OPINIONS_FILE)) {
            opinions = JSON.parse(fs.readFileSync(OPINIONS_FILE, 'utf8'));
        }

        const newOpinion = {
            id: `op-${Date.now()}-${Math.round(Math.random() * 1000)}`,
            rating,
            feedback,
            date: new Date().toISOString().split('T')[0] // Simple date for feed
        };

        opinions.unshift(newOpinion);
        fs.writeFileSync(OPINIONS_FILE, JSON.stringify(opinions, null, 4));

        res.json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// DELETE Opinion (Admin)
app.delete('/api/admin/opinions/:id', (req, res) => {
    const { id } = req.params;
    try {
        if (!fs.existsSync(OPINIONS_FILE)) return res.status(404).json({ error: 'Opinions not found' });

        let opinions = JSON.parse(fs.readFileSync(OPINIONS_FILE, 'utf8'));
        const newOpinions = opinions.filter(o => o.id !== id);

        if (opinions.length === newOpinions.length) return res.status(404).json({ error: 'Opinion not found' });

        fs.writeFileSync(OPINIONS_FILE, JSON.stringify(newOpinions, null, 4));

        logAudit('DELETE_OPINION', 'Admin', `Deleted opinion (${id})`);

        res.json({ success: true, message: 'Opinion deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete opinion' });
    }
});

// CANCEL CLASS (Toggle)
app.put('/api/schedule/:id/cancel', (req, res) => {
    const { id } = req.params;
    const { isCancelled, username } = req.body;
    const schedulePath = path.join(__dirname, 'src', 'data', 'schedule.json');

    try {
        if (!fs.existsSync(schedulePath)) return res.status(404).json({ error: 'Schedule data not found' });

        let schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
        const index = schedule.findIndex(s => s.id === parseInt(id) || s.id === id); // Handle string/int id mismatch

        if (index === -1) return res.status(404).json({ error: 'Class not found' });

        // Update status
        schedule[index].isCancelled = isCancelled;
        fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 4));

        logAudit('UPDATE_SCHEDULE', username || 'System', `Set class ${id} cancelled status to ${isCancelled}`);

        res.json({ success: true, message: 'Class status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
