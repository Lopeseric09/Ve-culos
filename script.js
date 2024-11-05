// Array para armazenar os veículos no estoque
let estoque = JSON.parse(localStorage.getItem('estoque')) || [];

// Função para adicionar um veículo ao estoque
document.getElementById('form-veiculo').addEventListener('submit', function(event) {
    event.preventDefault();

    const tipo = document.getElementById('tipo').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const ano = parseInt(document.getElementById('ano').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const preco = parseFloat(document.getElementById('preco').value);

    // Validações
    if (tipo === '' || modelo === '' || ano < 1900 || ano > new Date().getFullYear() || quantidade <= 0 || preco <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // Criar um novo veículo e adicionar ao estoque
    const veiculo = {
        tipo,
        modelo,
        ano,
        quantidade,
        preco
    };

    estoque.push(veiculo);
    atualizarTabela();
    atualizarTotalEstoque();

    // Salvar no localStorage
    localStorage.setItem('estoque', JSON.stringify(estoque));

    // Limpar o formulário
    document.getElementById('form-veiculo').reset();
});

// Função para exibir o estoque na tabela
function atualizarTabela(veiculos = estoque) {
    const tabela = document.getElementById('estoque-tabela').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ''; // Limpar a tabela

    veiculos.forEach(veiculo => {
        const row = tabela.insertRow();

        row.innerHTML = `
            <td>${veiculo.tipo}</td>
            <td>${veiculo.modelo}</td>
            <td>${veiculo.ano}</td>
            <td>${veiculo.quantidade}</td>
            <td>R$ ${veiculo.preco.toFixed(2)}</td>
            <td>R$ ${(veiculo.quantidade * veiculo.preco).toFixed(2)}</td>
        `;
    });
}

// Função para calcular o valor total do estoque
function atualizarTotalEstoque() {
    const total = estoque.reduce((acc, veiculo) => acc + (veiculo.quantidade * veiculo.preco), 0);
    document.getElementById('total-valor').textContent = total.toFixed(2);
}

// Função para filtrar os veículos por tipo
function filtrarPorTipo() {
    const filtro = document.getElementById('filtro-tipo').value.trim().toLowerCase();
    const veiculosFiltrados = estoque.filter(veiculo => veiculo.tipo.toLowerCase().includes(filtro));
    atualizarTabela(veiculosFiltrados);
    calcularTotalFiltrado(veiculosFiltrados);
}

// Função para calcular o valor total dos veículos filtrados
function calcularTotalFiltrado(veiculos) {
    const totalFiltrado = veiculos.reduce((acc, veiculo) => acc + (veiculo.quantidade * veiculo.preco), 0);
    console.log(`Valor total dos veículos filtrados: R$ ${totalFiltrado.toFixed(2)}`);
}

// Inicializar a tabela com os dados do localStorage
atualizarTabela();
atualizarTotalEstoque();
