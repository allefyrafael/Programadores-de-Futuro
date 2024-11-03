// Função para validar o formato do CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, ''); // Remove tudo que não for dígito

    if (cnpj.length !== 14) return false;
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

    tamanho += 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return resultado == digitos.charAt(1);
}

// Função para validar o formato do e-mail
function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
}

// Função para validar se o nome contém apenas letras
function validarNomeApenasLetras(nome) {
    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/; // Aceita letras, incluindo acentos e espaços
    return regexNome.test(nome);
}

// Função para validar e enviar o formulário
function validarFormulario(event) {
    event.preventDefault(); // Prevenir o envio automático

    const email = document.getElementById("email").value;
    const cnpj = document.getElementById("cnpj").value;
    const nomeEmpresa = document.getElementById("nomeEmpresa").value;
    const nomeCadastrante = document.getElementById("nomeCadastrante").value;
    const cargo = document.getElementById("cargo").value;

    let erros = [];

    if (!validarEmail(email)) erros.push("E-mail inválido.");
    if (!validarCNPJ(cnpj)) erros.push("CNPJ inválido.");
    if (!nomeEmpresa.trim()) erros.push("O nome da empresa é obrigatório.");
    if (!nomeCadastrante.trim()) {
        erros.push("O nome do cadastrante é obrigatório.");
    } else if (!validarNomeApenasLetras(nomeCadastrante)) {
        erros.push("O nome do cadastrante deve conter apenas letras.");
    }
    if (!cargo.trim()) erros.push("O cargo é obrigatório.");

    if (erros.length > 0) {
        alert("Erros encontrados:\n" + erros.join("\n"));
    } else {
        enviarParaBancoDeDados({ email, cnpj, nomeEmpresa, nomeCadastrante, cargo });
    }
}

function enviarParaBancoDeDados(dados) {
    fetch('/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/confirmation';
        } else {
            alert("Erro ao enviar os dados.");
        }
    })
    .catch(error => console.error("Erro:", error));
}

// Adiciona o listener para o evento de envio
document.getElementById("form-cadastro").addEventListener("submit", validarFormulario);
