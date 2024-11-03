async function fetchCompanies(filter = {}) {
    try {
      const queryString = new URLSearchParams(filter).toString();
      const res = await fetch(`/empresas${queryString ? '?' + queryString : ''}`);
      const empresas = await res.json();
      renderTable(empresas);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  }

  function renderTable(empresas) {
    const tbody = document.querySelector('#empresa-table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    empresas.forEach((empresa) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${empresa.email}</td>
        <td>${empresa.cnpj}</td>
        <td>${empresa.nomeEmpresa}</td>
        <td>${empresa.nomeCadastrante}</td>
        <td>${empresa.cargo}</td>
        <td>${empresa.status ? 'Ativo' : 'Arquivado'}</td>
        <td>${empresa.aprovado}</td>
        <td>
          <button class="action-button approve-button" onclick="updateStatus('${empresa._id}', 'aprovado')">Aprovar</button>
          <button class="action-button reject-button" onclick="updateStatus('${empresa._id}', 'reprovado')">Reprovar</button>
          <button class="action-button archive-button" onclick="updateStatus('${empresa._id}', false)">Arquivar</button>
          <button class="action-button activate-button" onclick="updateStatus('${empresa._id}', true)">Ativar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  async function updateStatus(id, fieldValue) {
    try {
      const body = typeof fieldValue === 'boolean' 
        ? { status: fieldValue } 
        : { aprovado: fieldValue };

      await fetch(`/empresas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      fetchCompanies(); // Refresh the table
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  function filterCompanies(status) {
    fetchCompanies({ status });
  }

  function filterApproval(aprovado) {
    fetchCompanies({ aprovado });
  }

  // Fetch all companies on page load
  fetchCompanies();