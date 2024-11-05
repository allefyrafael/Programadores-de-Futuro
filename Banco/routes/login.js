// login.js
const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario'); // Importa o modelo de Usuário

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }

        // Retorna o perfil do usuário para redirecionamento
        res.json({ perfil: usuario.perfil });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
});

module.exports = router;
