const mailer = require('nodemailer');

const sendEmail = async ({from, to , subject , text, html}) =>{
    try{
        const transporter = mailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        })

        await transporter.sendMail({from,to,subject,text,html});
    }catch(err){
        console.log(err);
    }
}

module.exports ={ sendEmail };