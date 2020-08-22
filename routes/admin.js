const express =  require('express');
const router = express.Router();
const mongoose = require('mongoose')
require('../models/Categoria') // importando os models
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')


const {eAdmin} = require('../helpers/eAdmin')
/*
router.get('/', function (req, res) {
    res.render('admin/index')
})*/

router.get('/posts',eAdmin, function (req, res) {
    res.send('Página Posts')
})


router.get('/categorias', eAdmin, function (req, res) {
    Categoria.find().sort({date:'desc'}).lean().then(function(categorias){
        res.render("admin/categorias",{categorias:categorias})
    }).catch(function(err){
        req.flash("erro_msg","Houve um erro ao liostar as categorias")
        res.redirect('/admin')
    })
    
})
router.get('/categorias/add',eAdmin, function(req, res){
    res.render('admin/addcategorias');
  });

router.post('/categorias/nova',eAdmin,function (req, res) {
    // Validação de formulário

    var erros =  []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug  == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length <2){
        erros.push({texto:" Nome da categoria muito pequeno "})
    }

    if(erros.length > 0){
        res.render("/admin/addcategorias",{erros : erros})
    }else{

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(function(){
            req.flash("success_msg","Categoria criado com sucesso!") // passado a mensagem para a variável
            res.redirect("/admin/categorias")
        }).catch(function(err){
            req.flash( "error_msg","Houve um erro ao salvar a categoria, tente novamente ") // passado a mensagem para a variável
            res.redirect('/admin')
        })
    }

})

router.get("/categorias/edit/:id",eAdmin,function(req,res){
    Categoria.findOne({_id:req.params.id}).lean().then(function(categoria){
        
        res.render("admin/editcategorias",{categoria:categoria})
    }).catch(function(err){
        req.flash("error_msg","Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
    
})
//Editar valor
router.post('/categorias/edit',eAdmin,function(req,res){
    Categoria.findOne({_id:req.body.id}).then(function(categoria){

        /* */
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        categoria.save().then(function(){
            req.flash("success_msg","Categoria editada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch(function(err){
            req.flash("error_msg","Houve um erro interno ao salvar a edição da categoria")
            res.redirect("/admin/categorias")

        })
    }).catch(function(err){
        req.flash("error_msg","Houve um erro ao tentar editar a categoria")
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar',eAdmin,function(req,res){
    Categoria.remove({_id: req.body.id}).then(function(){
        req.flash("success_msg","Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch(function(err){
        req.flash("error_msg","Houve erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

//Postagens
router.get('/postagens',eAdmin, function(req,res){
    Postagem.find().populate('categoria').lean().sort({data:"desc"}).then(function(postagens){
        res.render("admin/postagens",{postagens:postagens})
    }).catch(function(err){
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
    
})

router.get('/postagens/add',eAdmin,function(req,res){
    Categoria.find().lean().then(function(categorias){
        res.render("admin/addpostagem",{categorias:categorias})
    }).catch(function(err){
        req.flash("error_msg","Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
    
})

router.post('/postagens/nova',eAdmin,function(req,res){
    /*Fazer falidação */
    var erros = [];

    if(req.body.categoria == '0'){
        res.render('/admin/addpostagens',{erros:erros})
    }

    if(erros.length > 0){
        res.render('/admin/addpostagem',{erros:erros})
    }else{
    
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug

        }
        new Postagem(novaPostagem).save().then(function(){
            req.flash('success_msg','Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch(function(err){
            req.flash('error_msg','Houve um erro ao adicionar a postagem')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id',eAdmin,function(req,res){
    Postagem.findOne({_id:req.params.id}).lean().then(function(postagem){
        Categoria.find().lean().then(function(categorias){
            res.render("admin/editpostagens",{categorias:categorias, postagem:postagem})
        }).catch(function(err){
            req.flash('error_msg','Houve um erro ao carregar as categorias')
            res.redirect('/admin/postagens')
        })
    }).catch(function(err){
        req.flash('error_msg'," Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })
    
})

router.post('/postagem/edit',eAdmin,function(req,res){
    /*Fazer validação */
    Postagem.findOne({_id:req.body.id}).then(function(postagem){
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo =  req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(function(){
            req.flash('success_msg','Postagem editada com sucesso')
            res.redirect("/admin/postagens")
        }).catch(function(err){
            req.flash('error_msg','Houve um erro ao editar a postagem')
            res.redirect('/admin/postagens')
        })
    }).catch(function(err){
        req.flash('error_msg','Houve um erro ao salvar a edição')
        red.redirect('/admin/postagens')
    })
})

router.get('/postagens/deletar/:id',eAdmin,function(req,res){
    Postagem.remove({_id:req.params.id}).then(function(){
        req.flash('success_msg','Postagem deletada com sucesso')
        res.redirect('/admin/postagens')
    }).catch(function(err){
        req.flash('error_msg','Houve um ao deletar a postagem')
        req.redirect('/admin/postagens')
    })
})

module.exports = router