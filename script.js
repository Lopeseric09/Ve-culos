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
        `;
    });
}

// Função para remover um veículo do estoque
function removerVeiculo(index) {
    if (confirm("Tem certeza que deseja remover este veículo do estoque?")) {
        estoque.splice(index, 1); // Remove o veículo da lista
        atualizarTabela();
        atualizarTotalEstoque();
        atualizarLucro();
        
        // Salvar as alterações no localStorage
        localStorage.setItem('estoque', JSON.stringify(estoque));
    }
}

// Atualizar o número de vendidos
function atualizarVendidos(index, vendidos) {
    const veiculo = estoque[index];
    veiculo.vendidos = parseInt(vendidos);
    atualizarLucro();
    localStorage.setItem('estoque', JSON.stringify(estoque));
}

// Atualizar o preço de venda
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

