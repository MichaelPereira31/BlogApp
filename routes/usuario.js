const express = require('express')
const { model } = require('mongoose')
const router = express.Router()
const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

const passport = require('passport')

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')


router.get('/',function(req,res){
    res.send('usuario')
})


router.get('/registro', function(req,res){
    res.render("usuarios/registro")
})

/*Validar dados */
router.post('/registro', function(req,res){
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
        erros.push({texto: 'Nome inválido'})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null ){
        erros.push({texto: 'E-mail inválido'})
    }
    
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null ){
        erros.push({texto: 'Senha inválido'})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: 'Senha muito curta'})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'As senhas são diferentes, tente novamente'})
    }

    if(erros.length > 0){
        res.render('usuarios/registro',{erros:erros})
    }else{
        //Verificar se o e-mail já esta cadastrado
        Usuario.findOne({email:req.body.email}).then(function(usuario){
            if(usuario){
                req.flash('error_msg','Já existe uma conta vinculada a este e-mail')
                res.redirect('/usuarios/registro ')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                })

                //Deixar a senha segura
                bcrypt.genSalt(10,function(erro,salt){
                    bcrypt.hash(novoUsuario.senha,salt,function(erro, hash){
                        if(erro){
                            req.flash("error_msg","Houve um erro durante o salvamento do usuário")
                            res.redirect('/')
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(function(){
                            req.flash('success_msg','Usuário criado com sucesso')
                            res.redirect('/')
                        }).catch(function(err){
                            req.flash('error_msg',"Houve um erro ao salvar o novo usuário")

                            res.redirect('/usuario/registro')
                        })
                    })
                })
            }
        }).catch(function(err){
            
            req.flash('error_msg','Houve um erro interno')
            res.redirect('/usuarios/registro')
        })
    }

})
//Login
    router.get('/login',function(req,res){
        res.render("usuarios/login")
    })

    router.post('/login',function(req,res,next){
    passport.authenticate("local",{
        successRedirect:"/",
        failureRedirect:"/usuarios/login",
        failureFlash: true
    })(req,res,next)
    })

    router.get('/logout',function(req,res){
        req.logout()
        req.flash("success_msg","Deslogado com sucesso")
        res.redirect('/')
    })



module.exports = router