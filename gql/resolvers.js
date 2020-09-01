const userController = require('../controllers/userController.js');

const resolvers = {
	Query: {
		getUser: (_, { id, username }) => userController.getUser(id, username)
	},

	Mutation: {
		register: (_, { input }) => userController.register(input),
		login: (_, { input }) => userController.login(input),
		updateAvatar: (_, { file }, ctx) => userController.updateAvatar(file, ctx),
		deleteAvatar:(_, { }, ctx) => userController.deleteAvatar(ctx)
	}
};

module.exports = resolvers;
