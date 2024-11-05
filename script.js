let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
let historicoVendas = JSON.parse(localStorage.getItem('historicoVendas')) || [];
let historicoMensal = JSON.parse(localStorage.getItem('historicoMensal')) || {}; // Lucros mensais
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

    const tipo = document.getElementById('tipo').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const ano = parseInt(document.getElementById('ano').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const preco = parseFloat(document.getElementById('preco').value);

    if (tipo === '' || marca === '' || modelo === '' || ano < 1900 || ano > new Date().getFullYear() || quantidade <= 0 || preco <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

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
    localStorage.setItem('estoque', JSON.stringify(estoque));

    document.getElementById('form-veiculo').reset();

    atualizarTabela();
    atualizarTotalEstoque();
    atualizarLucro();
});

// Função para atualizar a tabela de estoque
function atualizarTabela(veiculos = estoque) {
    const tabela = document.getElementById('estoque-tabela').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';

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
    estoque.splice(index, 1);
    localStorage.setItem('estoque', JSON.stringify(estoque));
    atualizarTabela();
    atualizarTotalEstoque();
    atualizarLucro();
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

    veiculo.quantidade -= quantidadeVendida;
    veiculo.vendidos += quantidadeVendida;

    const lucroVenda = quantidadeVendida * (veiculo.precoVenda - veiculo.preco);
    const mesAno = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!historicoMensal[mesAno]) {
        historicoMensal[mesAno] = 0;
    }
    historicoMensal[mesAno] += lucroVenda;

    historicoVendas.push({
        veiculo: `${veiculo.marca} ${veiculo.modelo}`,
        quantidadeVendida,
        lucro: lucroVenda,
        mesAno,
        data: new Date().toLocaleDateString()
    });

    localStorage.setItem('estoque', JSON.stringify(estoque));
    localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));
    localStorage.setItem('historicoMensal', JSON.stringify(historicoMensal));

    atualizarTabela();
    atualizarTotalEstoque();
    atualizarLucro();
    exibirHistoricoVendas();
    exibirLucroMensal();
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

// Função para atualizar o lucro total
function atualizarLucro() {
    lucroTotal = 0;
    estoque.forEach(veiculo => {
        lucroTotal += veiculo.vendidos * (veiculo.precoVenda - veiculo.preco);
    });
    document.getElementById('lucro-total').textContent = formatarMoeda(lucroTotal);
}

// Função para exibir o lucro mensal
function exibirLucroMensal() {
    const lucroMensalDiv = document.getElementById('lucro-mensal');
    lucroMensalDiv.innerHTML = '';

    const mesesOrdenados = Object.keys(historicoMensal).sort((a, b) => new Date(b) - new Date(a));

    mesesOrdenados.forEach(mes => {
        const div = document.createElement('div');
        div.classList.add('mb-2');
        div.innerHTML = `<strong>${mes}:</strong> Lucro Total: ${formatarMoeda(historicoMensal[mes])}`;
        lucroMensalDiv.appendChild(div);
    });
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

// Função para filtrar o estoque por tipo
function filtrarPorTipo() {
    const filtro = document.getElementById('filtro-tipo').value.trim().toLowerCase();
    const veiculosFiltrados = filtro ? estoque.filter(veiculo => veiculo.tipo.toLowerCase() === filtro) : estoque;
    atualizarTabela(veiculosFiltrados);
}
// Função para remover uma venda específica do histórico
function removerVenda(index) {
    const confirmacao = confirm("Você tem certeza que deseja remover esta venda?");
    
    if (confirmacao) {
        historicoVendas.splice(index, 1);
        localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas)); // Atualiza o localStorage
        exibirHistoricoVendas(); // Atualiza o histórico na interface
    }
}

// Função para limpar todo o histórico de vendas
function limparHistoricoVendas() {
    const confirmacao = confirm("Tem certeza de que deseja remover todo o histórico de vendas?");
    
    if (confirmacao) {
        historicoVendas = [];
        localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas)); // Limpa o localStorage
        exibirHistoricoVendas(); // Atualiza o histórico na interface
    }
}

// Exibir histórico de vendas com a opção de remover
function exibirHistoricoVendas() {
    const historicoDiv = document.getElementById('historico-vendas');
    historicoDiv.innerHTML = '';

    if (historicoVendas.length === 0) {
        historicoDiv.innerHTML = '<p>Não há vendas registradas.</p>';
    } else {
        historicoVendas.forEach((venda, index) => {
            const div = document.createElement('div');
            div.classList.add('mb-2');
            div.innerHTML = `
                <strong>${venda.mesAno}:</strong> ${venda.veiculo} - Quantidade: ${venda.quantidadeVendida}, Lucro: ${formatarMoeda(venda.lucro)}, Data: ${venda.data}
                <button class="btn-danger" onclick="removerVenda(${index})">Remover</button>
            `;
            historicoDiv.appendChild(div);
        });
    }
}

// Adicionar botão para limpar todo o histórico
document.getElementById('historico-vendas').innerHTML += `
    <button class="btn-danger" onclick="limparHistoricoVendas()">Limpar Histórico</button>
`;
