import express from "express";
import userController from "../controller/UserController.js";
import verifyRoles from "../middleware/verifyRoles.js";
import ROLE_LISTS from "../config/role_lists.js";
const router = express.Router();

router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.route("/myinfo").get(verifyRoles(ROLE_LISTS.ADMIN, ROLE_LISTS.USER), userController.myInfo);
router.route("/delete/:id").delete(verifyRoles(ROLE_LISTS.ADMIN), userController.deleteUser);
router.route("/update/:id").put(verifyRoles(ROLE_LISTS.ADMIN, ROLE_LISTS.USER), userController.updateUser);
router.route("/find/:id").get(verifyRoles(ROLE_LISTS.ADMIN), userController.findUserById);
router.route("/logout").post(verifyRoles(ROLE_LISTS.ADMIN, ROLE_LISTS.USER), userController.logout);
router.route("/introspect").get(verifyRoles(ROLE_LISTS.ADMIN, ROLE_LISTS.USER), userController.introspect);
router.route("/").get(verifyRoles(ROLE_LISTS.ADMIN),userController.index);

export default router;