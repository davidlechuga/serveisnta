const userController = require('../controllers/userController.js');
const followController = require('../controllers/follow.js');
const publicationController = require('../controllers/publication');
const commentController = require('../controllers/comment');
const resolvers = {
	Query: {
		getUser: (_, { id, username }) => userController.getUser(id, username),
		search: (_, { search }) => userController.search(search),
		isFollow: (_, { username }, ctx) => followController.isFollow(username, ctx),
		getFollowers: (_, { username }) => followController.getFollowers(username),
		getFolloweds: (_, { username }) => followController.getFolloweds(username),
		getPublications: (_, { username }) => publicationController.getPublications(username),
		getComments: (_, { idPublication }) => commentController.getComments(idPublication),
	},

	Mutation: {
		register: (_, { input }) => userController.register(input),
		login: (_, { input }) => userController.login(input),
		updateAvatar: (_, { file }, ctx) => userController.updateAvatar(file, ctx),
		deleteAvatar: (_, { }, ctx) => userController.deleteAvatar(ctx),
		updateUser: (_, { input }, ctx) => userController.updateUser(input, ctx),

		//Follow
		follow: (_, { username }, ctx) => followController.follow(username, ctx),
		unFollow: (_, { username }, ctx) => followController.unFollow(username, ctx),

		// Publish
		publish: (_, { file }, ctx) => publicationController.publish(file, ctx),

		//Comment
		addComment: (_, { input }, ctx) => commentController.addComment(input, ctx)

		//

	}
};

module.exports = resolvers;
