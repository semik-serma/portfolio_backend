import { Admin } from "mongodb";
import { otpmodel } from "../models/otpModel.js";
import User from "../models/userModels.js";
import { hashthepassword } from "../utils/bcrypt.js";
import { otpgenerate } from "../utils/generateOtp.js";
import { tokengenerate } from "../utils/generatetoken.js";
import { sendmail } from "../utils/mailer.js";
import { errorResponse, successResponse } from "../utils/response.js";
import bcrypt from 'bcrypt'

// export const register = async (req, res) => {
//     try {
//         // Validate req.body exists before destructuring
//         if (!req.body) {
//             return errorResponse(res, 'Request body is required');
//         }

//         const { firstname, lastname, email, password } = req.body;

//         if (!email) return errorResponse(res, 'pls enter your email');
//         if (!password) return errorResponse(res, 'pls enter your password');
//         if (!firstname) return errorResponse(res, 'pls enter your first name');
//         if (!lastname) return errorResponse(res, 'pls enter your last name');

//         const existing = await User.findOne({ email });
//         if (existing) {
//             return errorResponse(res, 'user already registered');
//         }

//         const hash = await hashthepassword(password.trim());
//         await User.create({
//             email,
//             password: hash,
//             firstname,
//             lastname
//         });

//         successResponse(res, 'user created successfully');
//     } catch (error) {
//         errorResponse(res, 'error at register', 500, error.message);
//     }
// };

export const registerSecond = async (req, res) => {
    try {
        console.log(`[REGISTER] body:`, req.body)
        const email = req.body.email?.trim().toLowerCase()
        console.log(`[REGISTER] normalized email: "${email}"`)
        if (!email) {
            return errorResponse(res, 'email required')
        }
        const userfound = await User.findOne({ email: new RegExp('^' + email + '$', 'i') })
        if (userfound) {
            return errorResponse(res, 'user already registered')
        }
        // Delete any existing OTPs for this email (used or unused) to always allow retry
        await otpmodel.deleteMany({ email: email })
        const otp = otpgenerate()
        await otpmodel.create({
            email: email,
            otp: String(otp)
        })
        await sendmail(email, otp)
        // Return OTP in response so it's visible even if email sending fails
        successResponse(res, 'OTP sent! It expires in 5 minutes.', otp)
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'error at register second',
            error: error.message
        })
    }
}

export const verifyuser = async (req, res) => {
    try {
        // Validate req.body exists before destructuring
        if (!req.body) {
            return errorResponse(res, 'Request body is required');
        }

        const { password, otp, firstname, lastname } = req.body
        const email = req.body.email?.trim().toLowerCase()

        if (!email) {
            return errorResponse(res, 'pls enter your email')
        }
        if (!password) {
            return errorResponse(res, 'pls enter your password')
        }
        if (!otp) {
            return errorResponse(res, 'enter your otp')
        }
        const otpString = String(otp).trim().replace(/\s/g, '')

        let findemail = await otpmodel.findOne({ 
            email: email,
            isUsed: false 
        })

        if (!findemail || String(findemail.otp).trim() !== otpString) {
            const reason = !findemail ? 'No OTP found' : 'OTP value mismatch'
            return errorResponse(res, `Invalid or expired OTP code. Please request a new one. (${reason})`)
        }
        const hash = await hashthepassword(password)
        await otpmodel.findByIdAndUpdate(findemail._id, { isUsed: true })
        await User.create({
            email: email,
            password: hash,
            firstname: firstname,
            lastname: lastname
        })
        console.log(`[VERIFY] User created successfully: "${email}"`)
        successResponse(res, 'user created successfully')

    } catch (error) {
        res.status(400).json({
            message: "error at verifyuser",
            error: error.message
        })
    }
}

export const login = async (req, res) => {
    try {
        if (!req.body) {
            return errorResponse(res, 'Request body is required');
        }

        const { email, password } = req.body
        console.log(`[LOGIN] raw email: "${email}", password: ${password ? 'provided' : 'missing'}`)
        if (!email) {
            return errorResponse(res, 'pls enter your email')
        }
        if (!password) {
            return errorResponse(res, 'pls enter your password')
        }
        const normalizedEmail = email.trim().toLowerCase()
        console.log(`[LOGIN] searching for: "${normalizedEmail}"`)
        const emailfind = await User.findOne({ email: new RegExp('^' + normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') })
        console.log(`[LOGIN] found: ${emailfind ? emailfind.email : 'null'}`)
        if (!emailfind) {
            // Check total user count to see if DB has any users at all
            const count = await User.countDocuments()
            console.log(`[LOGIN] total users in DB: ${count}`)
            return errorResponse(res, 'couldnt find your email')
        }
        const passwordhash = await bcrypt.compare(password.trim(), emailfind.password)

        console.log(passwordhash, emailfind.password, password)
        if (!passwordhash) {
            return errorResponse(res, 'password not matched')
        }
        const payload = {
            email: emailfind.email,
            firstname: emailfind.firstname,
            role: emailfind.role,
            lastname: emailfind.lastname,
        }
        const token = tokengenerate(payload)


        successResponse(res, 'logined successfully', { data: payload, token })
    } catch (error) {
        errorResponse(res, 'error at login', 500, error.message)
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token')
        successResponse(res, 'logged out successfully')
    } catch (error) {
        errorResponse(res, 'error at logout', 500, error.message)
    }
}