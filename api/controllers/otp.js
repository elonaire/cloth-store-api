let generateOTP = () => {
    let OTP = '';
    for(let i = 0; i < 6; i++) {
        with(Math) {
            OTP += floor(random() * 10).toString();
        }
    }

    return OTP;
}

module.exports = generateOTP;