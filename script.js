document.addEventListener('DOMContentLoaded', () => {
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

    // Função para atualizar a tabela
    function atualizarTabela() {
        const tabela = document.getElementById('estoque-tabela').getElementsByTagName('tbody')[0];
        tabela.innerHTML = '';

        estoque.forEach((veiculo, index) => {
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
                <td>
                    <button class="btn btn-danger" onclick="removerVeiculo(${index})">Remover</button>
                    <button class="btn btn-success" onclick="registrarVenda(${index})">Registrar Venda</button>
                </td>
            `;
        });
    }

    // Função para remover um veículo
    function removerVeiculo(index) {
        estoque.splice(index, 1);
        localStorage.setItem('estoque', JSON.stringify(estoque));
        atualizarTabela();
        atualizarTotalEstoque();
        atualizarLucro();
    }

    // Função para registrar uma venda
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
        historicoVendas.push({
            veiculo: `${veiculo.marca} ${veiculo.modelo}`,
            quantidadeVendida,
            lucro: lucroVenda,
            data: new Date().toLocaleDateString()
        });

        localStorage.setItem('estoque', JSON.stringify(estoque));
        localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));

        atualizarTabela();
        atualizarTotalEstoque();
        atualizarLucro();
    }

    // Função para atualizar o número de vendidos
    function atualizarVendidos(index, vendidos) {
        estoque[index].vendidos = parseInt(vendidos);
        localStorage.setItem('estoque', JSON.stringify(estoque));
        atualizarLucro();
    }

    // Função para atualizar o preço de venda
    function atualizarPrecoVenda(index, precoVenda) {
        estoque[index].precoVenda = parseFloat(precoVenda);
        localStorage.setItem('estoque', JSON.stringify(estoque));
        atualizarLucro();
    }

    // Função para atualizar o lucro total
    function atualizarLucro() {
        lucroTotal = estoque.reduce((total, veiculo) => {
            return total + (veiculo.vendidos * (veiculo.precoVenda - veiculo.preco));
        }, 0);
        document.getElementById('lucro-total').textContent = formatarMoeda(lucroTotal);
    }

    // Função para calcular o valor total do estoque
    function atualizarTotalEstoque() {
        const total = estoque.reduce((acc, veiculo) => acc + (veiculo.quantidade * veiculo.preco), 0);
        document.getElementById('total-valor').textContent = formatarMoeda(total);
    }

    // Função para filtrar por tipo
    function filtrarPorTipo() {
        const filtro = document.getElementById('filtro-tipo').value.trim().toLowerCase();
        const veiculosFiltrados = filtro ? estoque.filter(veiculo => veiculo.tipo.toLowerCase() === filtro) : estoque;
        atualizarTabela(veiculosFiltrados);
    }

    // Exibir histórico de vendas
    function exibirHistoricoVendas() {
        const historicoDiv = document.getElementById('historico-vendas');
        historicoDiv.innerHTML = '';

        historicoVendas.forEach(venda => {
            const div = document.createElement('div');
            div.classList.add('mb-2');
            div.innerHTML = `<strong>${venda.data}:</strong> ${venda.veiculo} - Quantidade: ${venda.quantidadeVendida}, Lucro: ${formatarMoeda(venda.lucro)}`;
            historicoDiv.appendChild(div);
        });
    }

    // Chamada inicial para atualizar a tabela e o histórico
    atualizarTabela();
    atualizarTotalEstoque();
    atualizarLucro();
    exibirHistoricoVendas();
});



