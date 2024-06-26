const User = require('./User')
const Post = require('./Post')


User.belongsToMany(Post,{through:'favorites'})
Post.belongsToMany(User,{through:'favorites'})