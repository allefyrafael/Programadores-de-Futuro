async function loadUsers() {
    const filterStatus = document.getElementById('filterStatus').value;
    console.log('Carregando usuários com status:', filterStatus); // Log para depuração

    try {
        const response = await fetch(`/usuarios?status=${filterStatus}`);
        if (!response.ok) throw new Error('Erro ao buscar usuários.');

        const users = await response.json();
        console.log('Usuários recebidos:', users); // Log para depuração
        
        const userList = document.getElementById('userList');
        userList.innerHTML = '<h2>Lista de Usuários</h2>';
        
        if (users.length === 0) {
            userList.innerHTML += '<p>Nenhum usuário encontrado.</p>';
        }

        users.forEach(user => {
            userList.innerHTML += `
                <div class="section-content">
                    <p>Nome: ${user.nome}</p>
                    <p>Email: ${user.email}</p>
                    <p>Perfil: ${user.perfil}</p>
                    <p>Status: ${user.status ? 'Ativo' : 'Desativado'}</p>
                    <button onclick="editUser('${user._id}')">Editar</button>
                    <button onclick="deleteUser('${user._id}')">Excluir</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const perfil = document.getElementById('perfil').value;
    const status = document.getElementById('status').value === 'true';

    const response = await fetch('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, perfil, status })
    });

    if (response.ok) {
        alert("Usuário cadastrado com sucesso!");
        document.getElementById('userForm').reset();
        loadUsers(); // Carrega os usuários após o cadastro
    } else {
        alert("Erro ao cadastrar o usuário.");
    }
});

async function deleteUser(id) {
    await fetch(`/usuarios/${id}`, { method: 'DELETE' });
    loadUsers();
}

async function editUser(id) {
    const response = await fetch(`/usuarios/${id}`);
    const user = await response.json();

    document.getElementById('nome').value = user.nome;
    document.getElementById('email').value = user.email;
    document.getElementById('senha').value = ''; // Limpa a senha ao editar
    document.getElementById('perfil').value = user.perfil;
    document.getElementById('status').value = user.status ? 'true' : 'false';

    const submitButton = document.querySelector('#userForm button');
    submitButton.textContent = 'Atualizar Usuário';

    submitButton.onclick = async (e) => {
        e.preventDefault();

        const updatedData = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value,
            perfil: document.getElementById('perfil').value,
            status: document.getElementById('status').value === 'true'
        };

        await fetch(`/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        loadUsers();
        document.getElementById('userForm').reset();
        submitButton.textContent = 'Cadastrar Usuário';
        submitButton.onclick = null; // Remove a função de clique
    };
}

document.getElementById('filterStatus').addEventListener('change', loadUsers);
loadUsers(); // Carrega os usuários inicialmente
