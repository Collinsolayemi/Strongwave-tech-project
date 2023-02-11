import express from "express";
import { approveSeller, createAdmin, getUsersPerRole, loginAdmin } from "../controller/admin.js";
import auth from "../middleware/auth.js";
import {checkRole} from "../middleware/checkRole.js";


const router = express.Router();

router.post('/create', createAdmin);

router.post('/login', loginAdmin)

router.patch('/approve-seller/:sellerId', auth, checkRole(['admin']), approveSeller);

router.get("/get-users-per-role", auth, checkRole(['admin']), getUsersPerRole)


export default router;