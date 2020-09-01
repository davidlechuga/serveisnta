require("dotenv").config({ path: ".env" })

const AWS = require("aws-sdk");

const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
// accedemeos a s3 con las credenciales recuperadas del IAM administratos del bucket
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
});


async function awsUploadImage(file, filePath) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: `${filePath}`,
        Body: file,
        
    }

    try {
        // con upload cargaremos los archivos registrados en params
        const response = await s3.upload(params).promise();
        return response.Location;
    } catch (error) {
        console.log(error);
        throw new Error
    }


}

module.exports = awsUploadImage