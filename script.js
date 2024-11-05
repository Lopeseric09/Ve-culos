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
        event.preventDefault(); // Impede o envio do formulário, evitando recarregar a página

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
    function atualizarTabela() {
        const tabela = document.getElementById('estoque-tabela').getElementsByTagName('tbody')[0];
        tabela.innerHTML = '';  // Limpa a tabela antes de atualizar

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
                <td><button class="btn btn-danger" onclick="removerVeiculo(${index})">Remover</button></td>
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

    // Atualiza a tabela no início
    atualizarTabela();
    atualizarTotalEstoque();
    atualizarLucro();
});


