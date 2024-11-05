document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const result = await response.json();
            alert('Login bem-sucedido');
            
            // Verifica o perfil do usuário e redireciona para a página apropriada
            switch (result.perfil) {
                case 'administrador':
                    window.location.href = 'administrador/dashboard.html';
                    break;
                case 'professor':
                    window.location.href = 'professor/dashboard.html';
                    break;
                case 'empresa':
                    window.location.href = 'empresa/dashboard.html';
                    break;
                default:
                    alert('Perfil de usuário desconhecido.');
                    break;
            }
        } else {
            const error = await response.json();
            alert(`Erro no login: ${error.error}`);
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login');
    }
});
