// Função para validar o formato do CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, ''); // Remove tudo que não for dígito

    if (cnpj.length !== 14) return false;

    // Elimina CNPJs inválidos conhecidos
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;

    return true;
}

// Função para validar o formato do e-mail
function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
}

// Função para validar o formulário
function validarFormulario(event) {
    event.preventDefault(); // Prevenir o envio automático para permitir a validação

    const email = document.getElementById("email").value;
    const cnpj = document.getElementById("cnpj").value;
    const nomeEmpresa = document.getElementById("nome-empresa").value;
    const nomeCadastrante = document.getElementById("nome-cadastrante").value;
    const cargo = document.getElementById("cargo").value;

    let erros = [];

    // Validação do email
    if (!validarEmail(email)) {
        erros.push("E-mail inválido.");
    }

    // Validação do CNPJ
    if (!validarCNPJ(cnpj)) {
        erros.push("CNPJ inválido.");
    }

    // Validação dos outros campos
    if (nomeEmpresa.trim() === "") {
        erros.push("O nome da empresa é obrigatório.");
    }

    if (nomeCadastrante.trim() === "") {
        erros.push("O nome do cadastrante é obrigatório.");
    }

    if (cargo.trim() === "") {
        erros.push("O cargo é obrigatório.");
    }

    // Exibe os erros ou envia o formulário
    if (erros.length > 0) {
        alert("Erros encontrados:\n" + erros.join("\n"));
    } else {
        // Aqui você pode enviar os dados para o banco de dados
        enviarParaBancoDeDados({
            email,
            cnpj,
            nomeEmpresa,
            nomeCadastrante,
            cargo
        });
    }
}

// Função de exemplo para enviar os dados ao banco de dados
function enviarParaBancoDeDados(dados) {
    console.log("Enviando dados para o banco de dados...", dados);
    // Aqui você pode implementar a lógica para enviar os dados para o banco via AJAX ou outra API.
}

// Adiciona um event listener ao formulário para acionar a validação
document.getElementById("form-cadastro").addEventListener("submit", validarFormulario);
