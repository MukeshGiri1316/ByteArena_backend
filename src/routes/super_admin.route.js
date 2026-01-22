import { Router } from 'express';
import { registerTeacher, getAllTeachers, createLanguageTemplate } from '../controllers/super_admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/role.middleware.js'

const router = Router();

router.post('/register-teacher', authenticate, authorize("SUPER_ADMIN"), registerTeacher);
router.get('/get-teachers', authenticate, authorize("SUPER_ADMIN"), getAllTeachers);
router.post('/create-languageTemplate', authenticate, authorize("SUPER_ADMIN"), createLanguageTemplate);

export default router;