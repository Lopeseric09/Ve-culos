// Array para armazenar os veículos no estoque
let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
let lucroTotal = 0; // Variável para armazenar o lucro total do mês

// Função para adicionar um veículo ao estoque
document.getElementById('form-veiculo').addEventListener('submit', function(event) {
    event.preventDefault();

    const tipo = document.getElementById('tipo').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const ano = parseInt(document.getElementById('ano').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const preco = parseFloat(document.getElementById('preco').value);

    // Validações
    if (tipo === '' || marca === '' || modelo === '' || ano < 1900 || ano > new Date().getFullYear() || quantidade <= 0 || preco <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // Criar um novo veículo e adicionar ao estoque
    const veiculo = {
        tipo,
        marca,
        modelo,
        ano,
        quantidade,
        preco,
        vendidos: 0,
        precoVenda: 0
    };

    estoque.push(veiculo);
    atualizarTabela();
    atualizarTotalEstoque();
    atualizarLucro();

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
            <td>${veiculo.marca}</td>
            <td>${veiculo.modelo}</td>
            <td>${veiculo.ano}</td>
            <td>${veiculo.quantidade}</td>
            <td>R$ ${veiculo.preco.toFixed(2)}</td>
            <td>R$ ${(veiculo.quantidade * veiculo.preco).toFixed(2)}</td>
            <td>
                <input type="number" class="form-control" value="${veiculo.vendidos}" min="0" max="${veiculo.quantidade}" 
                onchange="registrarVenda(${estoque.indexOf(veiculo)}, this.value)">
            </td>
            <td>
                <input type="number" class="form-control" value="${veiculo.precoVenda}" min="0" 
                onchange="registrarPrecoVenda(${estoque.indexOf(veiculo)}, this.value)">
            </td>
            <td>R$ ${(veiculo.vendidos * (veiculo.precoVenda - veiculo.preco)).toFixed(2)}</td>
        `;
    });
}

// Função para registrar a quantidade de veículos vendidos
function registrarVenda(index, vendidos) {
    const veiculo = estoque[index];
    veiculo.vendidos = parseInt(vendidos);

    // Atualiza o lucro com a venda
    atualizarLucro();
    localStorage.setItem('estoque', JSON.stringify(estoque));
}

// Função para registrar o preço de venda
function registrarPrecoVenda(index, precoVenda) {
    const veiculo = estoque[index];
    veiculo.precoVenda = parseFloat(precoVenda);

    // Atualiza o lucro com a nova venda
    atualizarLucro();
    localStorage.setItem('estoque', JSON.stringify(estoque));
}

// Função para calcular o lucro do mês
function atualizarLucro() {
    lucroTotal = 0;
    estoque.forEach(veiculo => {
        lucroTotal += veiculo.vendidos * (veiculo.precoVenda - veiculo.preco);
    });
    document.getElementById('lucro-total').textContent = lucroTotal.toFixed(2);
}

// Função para calcular o valor total do estoque
function atualizarTotalEstoque() {
    const total = estoque.reduce((acc, veiculo) => acc + (veiculo.quantidade * veiculo.preco), 0);
    document.getElementById('total-valor').textContent = total.toFixed(2);
}

// Função para filtrar os veículos por tipo
function filtrarPorTipo() {
    const filtro = document.getElementById('filtro-tipo').value.trim().toLowerCase();
    
    // Se não for selecionado nenhum tipo, mostrar todos os veículos
    if (!filtro) {
        atualizarTabela(estoque);
        atualizarTotalEstoque();
        atualizarLucro();
        return;
    }

    const veiculosFiltrados = estoque.filter(veiculo => veiculo.tipo.toLowerCase() === filtro);
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
atualizarLucro();
