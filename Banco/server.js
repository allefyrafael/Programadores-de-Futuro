const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Importa jwt para autenticação
const port = 3019;

const app = express();

const cors = require('cors');

// Configuração do CORS
app.use(cors());

// Configurações do Express
app.use(express.static(path.join(__dirname, '../')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Chave secreta para o JWT
const JWT_SECRET = 'sua_chave_secreta_aqui'; // Defina uma chave secreta segura

// Conexão com o MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/SistemaPGF', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('Conexão com o MongoDB realizada com sucesso.');
});

// Definição do esquema e modelo Mongoose para Usuários
const userSchema = new mongoose.Schema({
  nome: String,
  email: String,
  senha: String,
  perfil: { type: String, enum: ['administrador', 'empresa', 'professor'] },
  status: Boolean,
});
const Usuario = mongoose.model('Usuario', userSchema);

// Definição do esquema e modelo Mongoose para Empresas
const cadastroEmpresaSchema = new mongoose.Schema({
  email: { type: String, required: true },
  cnpj: { type: String, required: true },
  nomeEmpresa: { type: String, required: true },
  nomeCadastrante: { type: String, required: true },
  cargo: { type: String, required: true },
  status: { type: Boolean, default: true },
  aprovado: { type: String, enum: ['aprovado', 'reprovado', 'pendente'], default: 'pendente' },
});
const Empresa = mongoose.model('Empresa', cadastroEmpresaSchema);

// Função para criptografar a senha
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Função para verificar a senha
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    // Verifica a senha
    const senhaValida = await verifyPassword(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    // Gera o token JWT
    const token = jwt.sign({ id: usuario._id, perfil: usuario.perfil }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Retorna o token e o perfil do usuário
    res.json({ message: 'Login bem-sucedido', token, perfil: usuario.perfil });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).send('Erro ao fazer login.');
  }
});

// Middleware para verificar o token JWT
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Rota de redirecionamento de dashboard
app.get('/dashboard', autenticar, (req, res) => {
  const { perfil } = req.user;

  if (perfil === 'administrador') {
    res.redirect('/usuarios/administrador/gerenciador.html');
  } else if (perfil === 'empresa') {
    res.redirect('/usuarios/empresa/viewEmpresas.html');
  } else if (perfil === 'professor') {
    res.redirect('/usuarios/professor/paginaProfessor.html');
  } else {
    res.status(403).send('Perfil de usuário não autorizado.');
  }
});

// Rota para a página HTML do gerenciador de usuários
app.get('/usuarios/gerenciador', (req, res) => {
  res.sendFile(path.join(__dirname, '../usuarios/administrador/gerenciador.html'));
});

// CRUD para Usuários
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, perfil, status } = req.body;
    const hashedPassword = await hashPassword(senha);

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: hashedPassword,
      perfil,
      status,
    });

    await novoUsuario.save();
    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).send('Erro ao criar usuário.');
  }
});

app.get('/usuarios', async (req, res) => {
  const { status } = req.query;
  const query = status ? { status: status === 'true' } : {};

  try {
    const usuarios = await Usuario.find(query);
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).send('Erro ao buscar usuários.');
  }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).send('Erro ao buscar usuário.');
  }
});

app.put('/usuarios/:id', async (req, res) => {
  try {
    const { nome, email, senha, perfil, status } = req.body;
    const updateData = { nome, email, perfil, status };

    if (senha) {
      updateData.senha = await hashPassword(senha);
    }

    const usuarioAtualizado = await Usuario.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(usuarioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).send('Erro ao atualizar usuário.');
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).send('Erro ao excluir usuário.');
  }
});

// Rota para a página de cadastro de empresas
app.get('/empresas/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, '../usuarios/empresa/cadastroEmpresa.html'));
});

// CRUD para Empresas
app.post('/empresas', async (req, res) => {
  try {
    const { email, cnpj, nomeEmpresa, nomeCadastrante, cargo } = req.body;

    if (!email || !cnpj || !nomeEmpresa || !nomeCadastrante || !cargo) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const novaEmpresa = new Empresa({
      email,
      cnpj,
      nomeEmpresa,
      nomeCadastrante,
      cargo,
      status: true,
      aprovado: 'pendente',
    });

    await novaEmpresa.save();
    console.log('Empresa cadastrada:', novaEmpresa);
    res.redirect('/empresas/confirmation');
  } catch (error) {
    console.error('Erro ao salvar os dados:', error);
    res.status(500).send('Erro ao salvar os dados: ' + error.message);
  }
});

app.get('/empresas/confirmation', (req, res) => {
  res.sendFile(path.join(__dirname, '../usuarios/empresa/confirmation.html'));
});

app.get('/empresas/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../usuarios/empresa/viewEmpresas.html'));
});

app.get('/empresas', async (req, res) => {
  const { aprovado, status } = req.query;
  const query = {};

  if (aprovado) query.aprovado = aprovado;
  if (status !== undefined) query.status = status === 'true';

  try {
    const empresas = await Empresa.find(query);
    res.json(empresas);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).send('Erro ao buscar empresas.');
  }
});

app.put('/empresas/:id', async (req, res) => {
  const { id } = req.params;
  const { aprovado, status } = req.body;

  try {
    const update = {};
    if (status !== undefined) update.status = status;
    if (aprovado) update.aprovado = aprovado;

    const empresaAtualizada = await Empresa.findByIdAndUpdate(id, update, { new: true });
    res.json(empresaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar status da empresa:', error);
    res.status(500).send('Erro ao atualizar status da empresa.');
  }
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});



