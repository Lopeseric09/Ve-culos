let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
let historicoVendas = JSON.parse(localStorage.getItem('historicoVendas')) || [];
let lucroTotal = 0;

// Função para formatar números como moeda R$
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para registrar a venda e adicionar no histórico de vendas
function registrarVenda(veiculoIndex, quantidadeVendida) {
    const veiculo = estoque[veiculoIndex];
    const precoVenda = veiculo.precoVenda;

    // Verifica se a quantidade vendida é maior que a quantidade em estoque
    if (quantidadeVendida > veiculo.quantidade) {
        alert('Quantidade vendida não pode ser maior que o estoque disponível!');
        return;
    }

    // Atualiza o estoque do veículo após a venda
    veiculo.quantidade -= quantidadeVendida;
    veiculo.vendidos += quantidadeVendida;

    // Calcula o lucro da venda
    const lucroVenda = (precoVenda - veiculo.preco) * quantidadeVendida;

    // Registra a venda no histórico com a data
    const dataVenda = new Date().toLocaleDateString('pt-BR');
    const vendaRegistro = {
        tipo: veiculo.tipo,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        quantidadeVendida,
        precoVenda: formatarMoeda(precoVenda),
        lucro: formatarMoeda(lucroVenda),
        dataVenda
    };

    // Adiciona o registro ao histórico de vendas
    historicoVendas.push(vendaRegistro);

    // Atualiza o histórico no localStorage
    localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));

    // Atualiza o estoque no localStorage
    localStorage.setItem('estoque', JSON.stringify(estoque));

    // Atualiza a tabela e os totais
    atualizarTabela();
    atualizarTotalEstoque();
    atualizarLucro();
    exibirHistoricoVendas();
}

// Função para exibir o histórico de vendas mensal
function exibirHistoricoVendas() {
    const historicoDiv = document.getElementById('historico-vendas');
    historicoDiv.innerHTML = '';

    // Organiza as vendas por mês
    let vendasPorMes = {};

    historicoVendas.forEach(venda => {
        const mesAno = venda.dataVenda.split('/').slice(1).join('/'); // Mês/Ano (ex: 04/2024)
        if (!vendasPorMes[mesAno]) {
            vendasPorMes[mesAno] = [];
        }
        vendasPorMes[mesAno].push(venda);
    });

    // Exibe as vendas agrupadas por mês
    for (let mesAno in vendasPorMes) {
        const mesDiv = document.createElement('div');
        mesDiv.classList.add('mb-4');
        mesDiv.innerHTML = `<strong>${mesAno}:</strong>`;
        historicoDiv.appendChild(mesDiv);

        vendasPorMes[mesAno].forEach(venda => {
            const vendaDiv = document.createElement('div');
            vendaDiv.classList.add('mb-2');
            vendaDiv.innerHTML = `
                <p><strong>Veículo:</strong> ${venda.marca} ${venda.modelo} - ${venda.tipo}</p>
                <p><strong>Quantidade Vendida:</strong> ${venda.quantidadeVendida}</p>
                <p><strong>Preço de Venda:</strong> ${venda.precoVenda}</p>
                <p><strong>Lucro:</strong> ${venda.lucro}</p>
                <p><strong>Data da Venda:</strong> ${venda.dataVenda}</p>
                <hr>
            `;
            mesDiv.appendChild(vendaDiv);
        });
    }
}

// Função para exibir a tabela do estoque e atualizar os valores totais
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
            <td><button class="btn btn-success btn-sm" onclick="registrarVenda(${index}, prompt('Quantos veículos foram vendidos?'))">Registrar Venda</button></td>
        `;
    });
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

    // Atualiza o lucro do mês
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

// Função para registrar as vendas no histórico
function registrarVendaNoHistorico(lucro) {
    const dataAtual = new Date();
    const mesAno = `${dataAtual.getMonth() + 1}-${dataAtual.getFullYear()}`;

    let registroMes = historicoVendas.find(venda => venda.mesAno === mesAno);

    if (!registroMes) {
        registroMes = { mesAno, lucro: 0 };
        historicoVendas.push(registroMes);
    }

    registroMes.lucro += lucro;
    localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));

    exibirHistoricoVendas();
}

// Função para exibir o histórico de vendas mensal
function exibirHistoricoVendas() {
    const historicoDiv = document.getElementById('historico-vendas');
    historicoDiv.innerHTML = '';

    historicoVendas.forEach(venda => {
        const div = document.createElement('div');
        div.classList.add('mb-2');
        div.innerHTML = `<strong>${venda.mesAno}:</strong> ${formatarMoeda(venda.lucro)}`;
        historicoDiv.appendChild(div);
    });
}

// Exibir o histórico de vendas ao carregar a página
exibirHistoricoVendas();
