import otpGenerator from 'otp-generator';

export const otpgenerate=()=>{
    const result = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    return typeof result === 'string' ? result : result.otp;
}