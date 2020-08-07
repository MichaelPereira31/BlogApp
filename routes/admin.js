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
        console.log(categoria)
        res.render("admin/editcategorias",{categoria:categoria})
    }).catch(function(err){
        req.flash("error_msg","Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
    
})

router.get('/categorias/add', function (req, res) {
    res.render('admin/addcategorias')
})

module.exports = router