$(document).ready(function(){
    $(".valores").maskMoney({prefix:'R$ ', allowNegative: false, thousands:'.', decimal:',', affixesStay: false});
});

function getValorNumerico(campo) {
    let valor = document.getElementById(campo).value;
    //remover letras e simbolos
    return parseFloat(valor.replace(/[R$\s]/g, "").replace(/\./g, "").replace(/,/g, "."));
}

function calcula_price() {

    //variaveis price
    let valor_entrada = getValorNumerico("valor_entrada_price");
    let valor_financiamento = getValorNumerico("valor_financiamento_price");
    let taxa_juros = getValorNumerico("taxa_juros_price") / 100;
    let n_parcelas = getValorNumerico("num_parcelas_price");
    let valor_presente = valor_financiamento - valor_entrada;

    let valor_parcela =
        valor_presente *
        (
            (taxa_juros * ((1 + taxa_juros) ** n_parcelas)) /
            (((1 + taxa_juros) ** n_parcelas) - 1)
        );

    let parcelas = [];
    let saldo_devedor = valor_presente; 

    for (let i = 1; i <= n_parcelas; i++) {

        let juros = saldo_devedor * taxa_juros;
        let amortizacao = valor_parcela - juros;

        saldo_devedor = saldo_devedor - amortizacao;

        parcelas.push({
            parcela: i,
            valor_parcela: valor_parcela,
            amortizacao: amortizacao,
            juros: juros,
            saldo_devedor: saldo_devedor
        });
    }
  mostra_resultado("tabela_price", parcelas);

  console.log(parcelas);

}

function calcula_sac() {

    //variaveis sac
    let valor_entrada = getValorNumerico("valor_entrada_sac");
    let valor_financiamento = getValorNumerico("valor_financiamento_sac");
    let taxa_juros = getValorNumerico("taxa_juros_sac") / 100;
    let n_parcelas = getValorNumerico("num_parcelas_sac");
    let valor_presente = valor_financiamento - valor_entrada;
    parcelas = []
    for (let i = 1; i <= n_parcelas; i++) {

        let amortizacao = valor_presente / n_parcelas;
        let juros = (valor_presente - (amortizacao * (i - 1))) * taxa_juros;
        let valor_parcela = amortizacao + juros;
        let saldo_devedor = valor_presente - (amortizacao * i);
        
        parcelas.push({ 
            parcela: i, 
            valor_parcela: valor_parcela.toFixed(2), 
            amortizacao: amortizacao.toFixed(2), 
            juros: juros.toFixed(2), 
            saldo_devedor: saldo_devedor.toFixed(2)
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
    let tabela_html = document.getElementById("corpo_" + tabela);
    tabela_html.innerHTML = "";
    parcelas.forEach(function (parcela) {
        tabela_html.innerHTML += "<tr> "+
            "<td>" + parcela.parcela + "</td>" +
            "<td>" + parcela.valor_parcela + "</td>" +
            "<td>" + parcela.amortizacao + "</td>" +
            "<td>" + parcela.juros + "</td>" +
            "<td>" + parcela.saldo_devedor + "</td>" +
            "</tr>";
    });
}
