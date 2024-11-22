document.addEventListener("DOMContentLoaded", () => {
    inicializarDashboard();
});

// Inicializa o Dashboard
function inicializarDashboard() {
    carregarDados('/empresas', renderizarTabelaEmpresas, "#empresas tbody");
    carregarDados('/usuarios', renderizarTabelaUsuarios, "#usuarios tbody");
    carregarDados('/empresas', atualizarResumo);
    carregarDados('/empresas', criarGraficoStatusEmpresas);
    carregarDados('/empresas', criarGraficoStatusAprovacao);
}

// Função genérica para carregar dados
async function carregarDados(url, callback, seletor = null) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const dados = await response.json();
        if (callback) callback(dados, seletor);
    } catch (error) {
        console.error(`Erro ao carregar dados de ${url}:`, error);
    }
}

// Renderiza a tabela de empresas
function renderizarTabelaEmpresas(empresas, seletor) {
    const tabela = document.querySelector(seletor);
    if (!tabela) return;

    tabela.innerHTML = empresas.map(empresa => `
        <tr onclick="redirecionarParaDetalhes('${empresa._id}')">
            <td>${empresa.nomeEmpresa}</td>
            <td>${empresa.cnpj}</td>
            <td>${empresa.status ? 'Ativo' : 'Arquivado'}</td>
            <td>${empresa.aprovado}</td>
        </tr>
    `).join("");
}

// Função para redirecionar ao clicar na tabela
function redirecionarParaDetalhes(id) {
    window.location.href = `/empresas/${id}`; // Redireciona para a página de detalhes
}

// Renderiza a tabela de usuários
function renderizarTabelaUsuarios(usuarios, seletor) {
    const tabela = document.querySelector(seletor);
    if (!tabela) return;

    tabela.innerHTML = usuarios.map(usuario => `
        <tr>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${usuario.perfil}</td>
            <td>${usuario.status ? 'Ativo' : 'Desativado'}</td>
            <td>
                <button class="action-button" onclick="editarUsuario('${usuario._id}')">Editar</button>
                <button class="action-button" onclick="excluirUsuario('${usuario._id}')">Excluir</button>
            </td>
        </tr>
    `).join("");
}

// Atualiza os números no resumo
function atualizarResumo(empresas) {
    const totalEmpresas = empresas.length;
    const empresasAprovadas = empresas.filter(e => e.aprovado === 'aprovado').length;
    const empresasAtivas = empresas.filter(e => e.status).length;

    document.getElementById("totalEmpresas").textContent = totalEmpresas;
    document.getElementById("empresasAprovadas").textContent = empresasAprovadas;
    document.getElementById("empresasAtivas").textContent = empresasAtivas;
}

// Primeiro Gráfico: Status de Ativação
function criarGraficoStatusEmpresas(empresas) {
    const statusAtivacao = empresas.reduce((acc, empresa) => {
        acc[empresa.status ? 'Ativo' : 'Arquivado'] = (acc[empresa.status ? 'Ativo' : 'Arquivado'] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById("statusEmpresasChart");
    if (!ctx) {
        console.error("Canvas para gráfico de status das empresas não encontrado.");
        return;
    }

    new Chart(ctx.getContext("2d"), {
        type: "pie",
        data: {
            labels: ["Ativo", "Arquivado"],
            datasets: [{
                data: [statusAtivacao["Ativo"] || 0, statusAtivacao["Arquivado"] || 0],
                backgroundColor: ["#0275d8", "#ffd700"]
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

// Segundo Gráfico: Status de Aprovação (Completo)
function criarGraficoStatusAprovacao(empresas) {
    const statusCounts = empresas.reduce((acc, empresa) => {
        acc[empresa.aprovado] = (acc[empresa.aprovado] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById("chartStatusAprovacao");
    if (!ctx) {
        console.error("Canvas para gráfico de status de aprovação não encontrado.");
        return;
    }

    new Chart(ctx.getContext("2d"), {
        type: "bar",
        data: {
            labels: ["Aprovado", "Reprovado", "Pendente"],
            datasets: [{
                data: [
                    statusCounts["aprovado"] || 1,
                    statusCounts["reprovado"] || 0,
                    statusCounts["pendente"] || 0
                ],
                backgroundColor: ["#008000", "#d9534f", "#f0ad4e"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
