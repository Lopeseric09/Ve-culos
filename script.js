let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
let historicoVendas = JSON.parse(localStorage.getItem('historicoVendas')) || [];
let lucroTotal = 0;

// Função para formatar números como moeda R$
function formatarMoeda(valor) {
    if (isNaN(valor)) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

// Função para adicionar um veículo ao estoque
document.getElementById('form-veiculo').addEventListener('submit', function(event) {
    event.preventDefault();

    // Captura os dados do formulário
    const tipo = document.getElementById('tipo').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const ano = parseInt(document.getElementById('ano').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const preco = parseFloat(document.getElementById('preco').value);

    // Validação
    if (tipo === '' || marca === '' || modelo === '' || ano < 1900 || ano > new Date().getFullYear() || quantidade <= 0 || preco <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // Criação do novo veículo
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

    // Adiciona o veículo ao estoque
    estoque.push(veiculo);
    localStorage.setItem('estoque', JSON.stringify(estoque)); // Salva no localStorage

    // Limpa o formulário
    document.getElementById('form-veiculo').reset();

    // Atualiza a tabela e o total do estoque
    atualizarTabela();
    atualizarTotalEstoque();
    atualizarLucro();
});

// Função para exibir o estoque na tabela
function atualizarTabela(veiculos = estoque) {
    const tabela = document.getElementById('estoque-tabela').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';  // Limpa a tabela antes de atualizar

    veiculos.forEach((veiculo, index) => {
        const row = tabela.insertRow();
        row.innerHTML = `
            <td>${veiculo.tipo}</td>
            <td>${veiculo.marca}</td>
            <td>${veiculo.modelo}</td>
            <td>${veiculo.ano}</td>
            <td>${veiculo.quantidade}</td>
            <td>${formatarMoeda(veiculo.preco)}</td>
            <td>${formatarMoeda(veiculo.quantidade * veiculo.preco)}</td>
            <td><input type="number" value="${veiculo.vendidos}" onchange="atualizarVendidos(${index}, this.value)" /></td>
            <td><input type="number" value="${veiculo.precoVenda}" onchange="atualizarPrecoVenda(${index}, this.value)" /></td>
            <td>${formatarMoeda(veiculo.vendidos * (veiculo.precoVenda - veiculo.preco))}</td>
            <td><button class="btn btn-danger btn-sm" onclick="removerVeiculo(${index})">Remover</button></td>
            <td><button class="btn btn-success btn-sm" onclick="registrarVenda(${index})">Registrar Venda</button></td>
        `;
    });
}

// Função para remover veículo do estoque
function removerVeiculo(index) {
    if (confirm("Tem certeza que deseja remover este veículo?")) {
        // Remove o veículo do estoque
        estoque.splice(index, 1);
        localStorage.setItem('estoque', JSON.stringify(estoque));  // Atualiza o localStorage
        atualizarTabela();  // Atualiza a tabela após a remoção
        atualizarTotalEstoque();  // Atualiza o total do estoque
        atualizarLucro();  // Atualiza o lucro
    }
}

// Função para registrar venda
function registrarVenda(index) {
    const quantidadeVendida = parseInt(prompt("Quantos veículos foram vendidos?"));
    
    if (isNaN(quantidadeVendida) || quantidadeVendida <= 0) {
        alert("Por favor, insira uma quantidade válida!");
        return;
    }

    const veiculo = estoque[index];

    if (quantidadeVendida > veiculo.quantidade) {
        alert("Quantidade vendida não pode ser maior que a quantidade disponível em estoque.");
        return;
    }

    // Atualiza o estoque com a quantidade vendida
    veiculo.quantidade -= quantidadeVendida;
    veiculo.vendidos += quantidadeVendida;

    // Calcula o lucro com a venda
    const lucroVenda = quantidadeVendida * (veiculo.precoVenda - veiculo.preco);

    // Adiciona a venda no histórico
    const mesAno = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    historicoVendas.push({
        veiculo: `${veiculo.marca} ${veiculo.modelo}`,
        quantidadeVendida,
        lucro: lucroVenda,
        mesAno,
        data: new Date().toLocaleDateString()
    });

    // Atualiza os dados no localStorage
    localStorage.setItem('estoque', JSON.stringify(estoque));
    localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));

    // Atualiza a tabela e o lucro total
    atualizarTabela();
    atualizarTotalEstoque();
    atualizarLucro();
    exibirHistoricoVendas();
}

// Função para atualizar o número de vendidos
function atualizarVendidos(index, vendidos) {
    const veiculo = estoque[index];
    veiculo.vendidos = parseInt(vendidos);
    atualizarLucro();
    localStorage.setItem('estoque', JSON.stringify(estoque));
}

// Função para atualizar o preço de venda
function atualizarPrecoVenda(index, precoVenda) {
    const veiculo = estoque[index];
    veiculo.precoVenda = parseFloat(precoVenda);
    atualizarLucro();
    localStorage.setItem('estoque', JSON.stringify(estoque));
}

// Atualizar o lucro total
function atualizarLucro() {
    lucroTotal = 0;
    estoque.forEach(veiculo => {
        lucroTotal += veiculo.vendidos * (veiculo.precoVenda - veiculo.preco);
    });
    document.getElementById('lucro-total').textContent = formatarMoeda(lucroTotal);
}

// Função para calcular o total do estoque
function atualizarTotalEstoque() {
    const total = estoque.reduce((acc, veiculo) => acc + (veiculo.quantidade * veiculo.preco), 0);
    document.getElementById('total-valor').textContent = formatarMoeda(total);
}

// Função para filtrar o estoque por tipo
function filtrarPorTipo() {
    const filtro = document.getElementById('filtro-tipo').value.trim().toLowerCase();
    const veiculosFiltrados = filtro ? estoque.filter(veiculo => veiculo.tipo.toLowerCase() === filtro) : estoque;
    atualizarTabela(veiculosFiltrados);
}

// Função para exibir o histórico de vendas
function exibirHistoricoVendas() {
    const historicoDiv = document.getElementById('historico-vendas');
    historicoDiv.innerHTML = '';
    
    historicoVendas.forEach(venda => {
        const div = document.createElement('div');
        div.classList.add('mb-2');
        div.innerHTML = `<strong>${venda.mesAno}:</strong> ${venda.veiculo} - Quantidade: ${venda.quantidadeVendida}, Lucro: ${formatarMoeda(venda.lucro)}, Data: ${venda.data}`;
        historicoDiv.appendChild(div);
    });
}

// Exibe o histórico de vendas ao carregar a página
exibirHistoricoVendas();
