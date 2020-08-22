//Carregando módulos
    const express = require('express');
    const handlebars = require("express-handlebars");
    const bodyParser = require('body-parser')
    const app = express();
    const mongoose = require('mongoose');
    const session = require('express-session')
    const flash = require('connect-flash') // mensagens curtas

    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')

    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')

    const passport = require('passport')
    require('./config/auth')(passport)



    const usuarios = require('./routes/usuario')
    //Recebendo Rotas
        const admin = require('./routes/admin')
    //Trabalhar com diretórios
        const path = require('path');
    



//Configurações
    //Sessão
        app.use(session({
            secret: 'Cursodenode',
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //Middleware
        app.use(function(req,res,next){
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null 
            next()
        })
    //Body Parser
        app.use(bodyParser.urlencoded({extended:true}))
        app.use(bodyParser.json())
    //Handlebars
        app.engine('handlebars',handlebars({defaultLayout: 'main'}))
        app.set('view engine','handlebars')
    //Mongoose
    mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/blogapp').then(function(){
            console.log('Conectado ao MongoDB')
        }).catch(function(err){
            console.log('Erro ao se conectar: '+err)
        })
    //Arquivos estáticos public
        app.use(express.static(path.join(__dirname,'public')))



//Rotas

    app.get('/',function(req,res){
        Postagem.find().populate().sort({data: 'desc'}).lean().then(function(postagens){
            res.render('index',{postagens:postagens})
        }).catch(function(err){
            req.flash('error_msg','Houve um erro ao lista as postagens')
            res.redirect('/404')
        })
        
    })

    app.get('/postagem/:slug',function(req,res){
        Postagem.findOne({slug: req.params.slug}).lean().then(function(postagem){
            if(postagem){
                res.render("postagem/index",{postagem: postagem})
            }else{
                req.flash("error_msg",'Esta postagem não existe')
                res.redirect('/')
            }
        }).catch(function(err){
             req.flash("error_msg",'Houve um erro interno')
             res.redirect('/')
        })
    })

    app.get('/categorias',function(req,res){
        Categoria.find().lean().then(function(categorias){
            res.render('categorias/index',{categorias:categorias})
        }).catch(function(err){
            console.log(err)
            req.flash('error_msg','Houve um erro interno ao listar categorias')
            res.redirect('/')
        })
    })

    app.get("/categorias/:slug",function(req,res){
        Categoria.findOne({slug: req.params.slug}).lean().then(function(categoria){
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then(function(postagens){
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch(function(err){
                    req.flash('error_msg','Houve um erro ao listar os posts!')
                    res.redirect('/')
                })
            }else{
                req.flash('error_msg','Esta categoria não existe')
                res.redirect('/')
            }
        }).catch(function(err){
            console.log(err)
            req.flash('error_msg','Houve um erro interno ao carregar a página desta categoria')
            res.redirect('/')
        })
    })




    app.get('/404',function(req,res){
        res.send('Erro 4040!')
    })

    app.use('/admin',admin)
    
    app.use('/usuarios',usuarios)



    //Outros
    const PORT = 8081;
    app.listen(PORT,function(){
        console.log('Servidor rodando!')
    })