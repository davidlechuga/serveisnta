const User = require('../db/models/user.js');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const awsUploadImage = require('../utils/aws-upload-image');
require('dotenv').config({ path: '.env' });

function createToken(user, SECRET_KEY, expiresIn) {
	const { id, name, username, email } = user;
	const payload = {
		id,
		name,
		username,
		email
	};
	return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

async function register(input) {
	// dando formato lowerCase a los campos instroduciodos por los usuarios
	const newUser = input;
	newUser.email = newUser.email.toLowerCase();
	newUser.username = newUser.username.toLowerCase();
	console.log(newUser);
	const { email, username, password } = newUser;

	// revisar si ya alguien hizo login con este correo electrónico
	const foundEmail = await User.findOne({ email });
	if (foundEmail) throw new Error('El email ya está en uso');
	// revisar si ya alguien hizo login con este username
	const foundUserName = await User.findOne({ username });
	if (foundUserName) throw new Error('El nombre de usuario ya está en uso');

	// Encriptación del password del usuario
	const salt = await bcryptjs.genSaltSync(10);
	newUser.password = await bcryptjs.hash(password, salt);

	try {
		// creamos un nuevo documento Usuario guardando en mongoDB nuestro objeto newUser
		const user = new User(newUser);
		user.save();
		return user;
	} catch (error) {
		console.log(error);
	}
}

async function login(input) {
	const { email, password } = input;
	// console.log("Email:" + email);
	// console.log("Password:" + password);
	const userFound = await User.findOne({ email: email.toLowerCase() });
	if (!userFound) throw new Error('Error en el email o contraseña');
	// console.log(userFound);
	const passwordSucess = await bcryptjs.compare(password, userFound.password);
	if (!passwordSucess) throw new Error('Error en el email o contraseña');
	// console.log(createToken(userFound, process.env._KEY, "24h" ));

	return {
		token: createToken(userFound, process.env.SECRET_KEY, '400h')
	};
}

async function getUser(id, username) {
	let user = null;
	if (id) user = await User.findById(id);
	if (username) user = await User.findOne({ username });
	if (!user) throw new Error('El usuario no existe');

	return user;
}

async function updateAvatar(file, ctx) {
	// console.log(file);
	//listos para subir la imagena aws s3con await porque debvulve el promise con datos
	const { id } = ctx.user;
	const { createReadStream, mimetype } = await file;
	const extension = mimetype.split('/')[1];
	const imageName = `avatar/${id}.${extension}`;
	const fileData = createReadStream();

	try {
		const result = await awsUploadImage(fileData, imageName);
		// console.log(result);
		await User.findByIdAndUpdate(id, { avatar: result });
		return {
			status: true,
			urlAvatar: result
		};
	} catch (error) {
		return {
			status: false,
			urlAvatar: null
		};
	}
	// console.log("ejecutando avatar");
	// console.log(ctx);
}

async function deleteAvatar(ctx) {
	const { id } = ctx.user;
	try {
		await User.findByIdAndUpdate(id, { avatar: '' });
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

async function updateUser(input, ctx) {
	const { id } = ctx.user;
	try {
		if (input.currentPassword && input.newPassword) {
			const userFound = await User.findById(id);
			const passwordSuccess = await bcryptjs.compare(input.currentPassword, userFound.password);
			if (!passwordSuccess) throw new Error('Constraseña Incorrecta');
			const salt = await bcryptjs.genSaltSync(10);
			const newPasswordCrypt = await bcryptjs.hash(input.newPassword, salt);

			await User.findByIdAndUpdate(id, { password: newPasswordCrypt });
		} else {
			await User.findByIdAndUpdate(id, input);
		}
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

async function search(search) {
	const users = await User.find({
		name: { $regex: search, $options: 'i' }
	});
	return users;
}



module.exports = {
	register,
	login,
	getUser,
	updateAvatar,
	deleteAvatar,
	updateUser,
	search
};
