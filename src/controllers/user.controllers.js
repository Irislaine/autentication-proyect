const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');

const getAll = catchError(async(req, res) => {
    const results = await User.findAll({include:[Post]});
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const { password } =req.body
    const hashedPassword = await bcrypt.hash(password,10)
    const result = await User.create({...req.body, password: hashedPassword});
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id, {include:[Post]});
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.destroy({ where: {id} });
    if(!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;

    delete req.body.password
    delete req.body.email // 3er paso para evitar q se devuelva el password, force true tambien
    const result = await User.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const login = catchError(async(req, res)=> {
    const {email, password } = req.body

    const user = await User.findOne({where: {email}})
    if(!user) return res.sendStatus(401).json({error: 'Invalid Credentials'})// es valido el usuario?
    
    const isValid = await bcrypt.compare(password, user.password)
    if(!isValid) return res.sendStatus(401).json({error: 'Invalid Credentials'})// es valido la contrase;a?

    //JWT, 1 importar libreria, 2 en login , crear variable token al user, 3ero EN .envexample crear el TOKEN_SECRET, en terminal node, y poner lo (require('crypto').randomBytes(64).toString('hex')), el token generado va en .env. y example, esto listo ahora trarmos eo  TOKEN , 4to midleware en utils, colocar en las rutas,
    const token = jwt.sign(
        {user},
        process.env.TOKEN_SECRET, {expiresIn:'1d'}
    )

    return res.json({user, token})
     
}); // 4to paso clase bcrypt, 1ero de login despues de hacerlo en postman//3er pasp del login rellenarlo con la logica hasta antes de JWT

const logged = catchError(async(req,res)=>{
    const user = req.user
    return res.json(user)
});

const setPosts = catchError(async(req,res)=>{
    const { id } =req.params
    const user = await User.findByPk(id)
    await user.setPosts(req.body)
    const posts = await user.getPosts()
    return res.json(posts)
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    login,
    logged,
    setPosts
}