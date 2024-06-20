import { Router } from "express";
import {registerUser,loginUser,logoutUser,getFavourites,getLiked,getUserProfile,getCurrentUser,refreshAccessToken,changePassword,updateAccountDetails} from '../controllers/user.controller.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router = Router()

//basic routes
router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT,logoutUser)

//get requests routes
router.route('/getFavourites').get(verifyJWT,getFavourites)
router.route('/getLiked').get(verifyJWT,getLiked)
router.route('/getUserProfile/:user').get(verifyJWT,getUserProfile)
router.route('/getCurrentUser').get(verifyJWT,getCurrentUser)

//secured routes
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT,changePassword)
router.route('/update-account').post(verifyJWT,updateAccountDetails)


export default router



