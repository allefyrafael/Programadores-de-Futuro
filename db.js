const mongoose = require('mongoose');

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Conexão com o MongoDB bem-sucedida!");
})
.catch(err => {
  console.error("Erro ao conectar ao MongoDB:", err);
});

// Criar esquemas e modelos
const usuarioEmpresaSchema = new mongoose.Schema({
  idEmpresa: String,
  login: String,
  senha: String,
});

const empresaSchema = new mongoose.Schema({
  cnpj: String,
  email: String,
  nomeRazaoSocial: String,
  usuarios: [usuarioEmpresaSchema], // Subdocumento
});

const Empresa = mongoose.model('Empresa', empresaSchema);

const alunoSchema = new mongoose.Schema({
  idUsu: String,
  curriculo: String,
  nome: String,
  biografia: String,
  idade: Number,
  qtdFaltas: Number,
  softSkills: [String],
  hardSkills: [String],
  linkedin: String,
  github: String,
  escola: String,
  serie: String,
  notas: {
    nota1: Number,
    nota2: Number,
    nota3: Number,
  },
});

const Aluno = mongoose.model('Aluno', alunoSchema);

const professorSchema = new mongoose.Schema({
  idProfessor: String,
  nome: String,
  login: String,
  senha: String,
});

const Professor = mongoose.model('Professor', professorSchema);

// Função para criar dados
async function createData() {
  try {
    const empresa = new Empresa({
      cnpj: '12345678901234',
      email: 'empresa@email.com',
      nomeRazaoSocial: 'Empresa XYZ',
      usuarios: [
        {
          idEmpresa: '123456',
          login: 'usuarioEmpresa1',
          senha: 'senha123',
        },
        {
          idEmpresa: '123457',
          login: 'usuarioEmpresa2',
          senha: 'senha456',
        },
      ],
    });

    await empresa.save();

    const aluno = new Aluno({
      idUsu: 'usuario123',
      curriculo: 'Currículo detalhado do aluno',
      nome: 'João Silva',
      biografia: 'Breve descrição',
      idade: 20,
      qtdFaltas: 2,
      softSkills: ['Comunicação', 'Trabalho em equipe'],
      hardSkills: ['Programação', 'Banco de Dados'],
      linkedin: 'https://linkedin.com/joaosilva',
      github: 'https://github.com/joaosilva',
      escola: 'Escola ABC',
      serie: '3º ano',
      notas: {
        nota1: 8.5,
        nota2: 7.0,
        nota3: 9.2,
      },
    });

    await aluno.save();

    const professor = new Professor({
      idProfessor: 'prof123',
      nome: 'Professor Carlos',
      login: 'professor1',
      senha: 'profSenha123',
    });

    await professor.save();

    console.log('Dados inseridos com sucesso');
  } catch (error) {
    console.error("Erro ao inserir dados:", error);
  } finally {
    mongoose.connection.close(); // Fechar a conexão após a operação
  }
}

// Chamar a função
createData();
