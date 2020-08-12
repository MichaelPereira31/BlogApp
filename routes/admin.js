const express =  require('express');
const router = express.Router();
const mongoose = require('mongoose')
require('../models/Categoria') // importando os models
const Categoria = mongoose.model('categorias')

router.get('/', function (req, res) {
    res.render('admin/index')
})

router.get('/posts', function (req, res) {
    res.send('Página Posts')
})

router.get('/categorias',function (req, res) {
    Categoria.find().sort({date:'desc'}).lean().then(function(categorias){
        res.render("admin/categorias",{categorias:categorias})
    }).catch(function(err){
        req.flash("erro_msg","Houve um erro ao liostar as categorias")
        res.redirect('/admin')
    })
    
})

router.post('/categorias/nova',function (req, res) {
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

router.get("/categorias/edit/:id",function(req,res){
    Categoria.findOne({_id:req.params.id}).lean().then(function(categoria){
        
        res.render("admin/editcategorias",{categoria:categoria})
    }).catch(function(err){
        req.flash("error_msg","Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
    
})
//Editar valor
router.post('/categorias/edit',function(req,res){
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

router.post('/categorias/deletar',function(req,res){
    Categoria.remove({_id: req.body.id}).then(function(){
        req.flash("success_msg","Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch(function(err){
        req.flash("error_msg","Houve erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.get('/postagens',function(req,res){
    res.render("admin/postagens")
})

router.get('/postagens/add',function(req,res){
    Categoria.find().then(function(categorias){
        res.render("admin/addpostagem",{categorias:categorias})
    }).catch(function(err){
        req.flash("error_msg","Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
    
})

module.exports = router