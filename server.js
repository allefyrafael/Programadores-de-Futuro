const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 3019;

const app = express();
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com o MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/SistemaPGF', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => {
  console.log('Mongodb connection successful');
});

// Esquema do Mongoose para Empresa
const CadastroEmpresa = new mongoose.Schema({
  email: String,
  cnpj: String,
  nomeEmpresa: String,
  nomeCadastrante: String,
  cargo: String,
  status: { type: Boolean, default: true }, // Ativo ou Arquivado
  aprovado: { type: String, enum: ['aprovado', 'reprovado', 'pendente'], default: 'pendente' },
});

const Empresa = mongoose.model('empresa', CadastroEmpresa);

// Rota para servir a página de cadastro
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cadastroEmpresa.html'));
});

// Rota POST para salvar os dados do formulário de cadastro
app.post('/post', async (req, res) => {
  try {
    const { email, cnpj, nomeEmpresa, nomeCadastrante, cargo } = req.body;

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
    res.redirect('/confirmation.html'); // Redireciona para a página confirmation.html
  } catch (error) {
    console.error('Erro ao salvar os dados:', error);
    res.status(500).send('Erro ao salvar os dados.');
  }
});

// Rota para servir a página de visualização das empresas
app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, 'viewEmpresas.html'));
});

// Rota GET para buscar empresas com filtro opcional para o status e aprovação
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

// Rota PUT para atualizar o status de uma empresa (para aprovar, reprovar ou arquivar)
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

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
