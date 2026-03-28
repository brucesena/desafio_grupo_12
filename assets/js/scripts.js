$(document).ready(function () {
    $(".valores").maskMoney({ prefix: 'R$ ', allowNegative: false, thousands: '.', decimal: ',', affixesStay: false });
});

//Função agora evita NaN 
function getValorNumerico(campo) {
    let valor = $("#" + campo).val();

    if (!valor) return 0;

    return parseFloat(
        valor
            .replace(/[R$\s]/g, "")
            .replace(/\./g, "")
            .replace(/,/g, ".")
    ) || 0;
}
function formatarDataBR(data) {
    return data.toLocaleDateString('pt-BR');
}
function adicionarMeses(dataBase, meses) {
    const diaOriginal = dataBase.getDate();

    let novaData = new Date(
        dataBase.getFullYear(),
        dataBase.getMonth() + meses,
        1
    );

    let ultimoDiaMes = new Date(
        novaData.getFullYear(),
        novaData.getMonth() + 1,
        0
    ).getDate();

    novaData.setDate(Math.min(diaOriginal, ultimoDiaMes));

    return novaData;
}

function limparTabela(tabela) {
    $("#corpo_" + tabela).html("");
}

function calcula_price() {

    limparTabela("tabela_price");

    let select = document.querySelector('#periodo_juros');
    let periodo_juros = select.value;

    //variaveis price
    let valor_entrada = getValorNumerico("valor_entrada_price");
    let valor_financiamento = getValorNumerico("valor_financiamento_price");
    let taxa_juros = getValorNumerico("taxa_juros_price") / 100;
    let n_parcelas = getValorNumerico("num_parcelas_price");

    //validadores
    if (!valor_financiamento || !n_parcelas) {
        alert("Preencha os campos corretamente!");
        return;
    }

    if (valor_entrada > valor_financiamento) {
        alert("A entrada não pode ser maior que o financiamento");
        return;
    }
    if (periodo_juros == "trimestral") {
        taxa_juros = (1 + taxa_juros) ** 3 - 1;
    } else if (periodo_juros == "semestral") {
        taxa_juros = (1 + taxa_juros) ** 6 - 1;
    }

    let valor_presente = valor_financiamento - valor_entrada;

    //valida se a taxa de juros é >= 0 
    if (taxa_juros === 0) {
        valor_parcela = valor_presente / n_parcelas;
    } else {
        valor_parcela =
            valor_presente *
            (
                (taxa_juros * ((1 + taxa_juros) ** n_parcelas)) /
                (((1 + taxa_juros) ** n_parcelas) - 1)
            );
    }
    let parcelas = [];
    let saldo_devedor = valor_presente;
    let data_base = new Date();

    let incremento = 1;
    if (periodo_juros == "trimestral") incremento = 3;
    else if (periodo_juros == "semestral") incremento = 6;

    for (let i = 1; i <= n_parcelas; i++) {

        let juros = saldo_devedor * taxa_juros;
        let amortizacao = valor_parcela - juros;

        saldo_devedor = saldo_devedor - amortizacao;
        let data_parcela = adicionarMeses(data_base, i * incremento);

        parcelas.push({
            parcela: i,
            vencimento: formatarDataBR(data_parcela),
            valor_parcela: valor_parcela,
            amortizacao: amortizacao,
            juros: juros,
            saldo_devedor: saldo_devedor < 0 ? 0 : saldo_devedor
        });
    }

    mostra_resultado("tabela_price", parcelas);
}


function calcula_sac() {

    //variaveis sac
    let valor_entrada = getValorNumerico("valor_entrada_sac");
    let valor_financiamento = getValorNumerico("valor_financiamento_sac");
    let taxa_juros = getValorNumerico("taxa_juros_sac") / 100;
    let n_parcelas = getValorNumerico("num_parcelas_sac");
    let valor_presente = valor_financiamento - valor_entrada;
    parcelas = []
    let data_base = new Date();

    for (let i = 1; i <= n_parcelas; i++) {

        let amortizacao = valor_presente / n_parcelas;
        let juros = (valor_presente - (amortizacao * (i - 1))) * taxa_juros;
        let valor_parcela = amortizacao + juros;
        let saldo_devedor = valor_presente - (amortizacao * i);
        let data_parcela = adicionarMeses(data_base, i);

        parcelas.push({
            parcela: i,
            valor_parcela: valor_parcela,
            vencimento: formatarDataBR(data_parcela),
            amortizacao: amortizacao,
            juros: juros,
            saldo_devedor: saldo_devedor
        });
    }

    mostra_resultado("tabela_sac", parcelas);

}

/**
 *
 * @param {*} tabela Nome do objeto html que vai recebar o resultado
 * @param {*} parcelas Parcelas geradas no metodo calcula_price ou calcula_sac
 */
function mostra_resultado(tabela, parcelas) {
    tabela_html = $("#corpo_" + tabela)
    tabela_html.empty();
    parcelas.forEach(function (parcela) {
        tabela_html.append(`<tr>
                <td>${parcela.parcela}</td>
                <td>${(parcela.valor_parcela).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>${(parcela.amortizacao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>${(parcela.juros).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>${(parcela.saldo_devedor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>${parcela.vencimento}</td>
                </tr>
            `)
    });
}
