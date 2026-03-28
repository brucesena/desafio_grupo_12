$(document).ready(function(){
    $(".valores").maskMoney({prefix:'R$ ', allowNegative: false, thousands:'.', decimal:',', affixesStay: false});
});

function getValorNumerico(campo) {
    let valor = $("#" + campo).val();
    //remover letras e simbolos
    return parseFloat(valor.replace(/[R$\s]/g, "").replace(/\./g, "").replace(/,/g, "."));
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

function calcula_price() {
    if (!$("#dados_financiamento_price").valid()) return; // <- só isso

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
    let data_base = new Date();

    for (let i = 1; i <= n_parcelas; i++) {

        let juros = saldo_devedor * taxa_juros;
        let amortizacao = valor_parcela - juros;

        saldo_devedor = saldo_devedor - amortizacao;
        let data_parcela = adicionarMeses(data_base, i); 
        if(saldo_devedor<0){
            saldo_devedor=0;
        }
        parcelas.push({
            parcela: i,
            vencimento: formatarDataBR(data_parcela),
            valor_parcela: valor_parcela,
            amortizacao: amortizacao,
            juros: juros,
            saldo_devedor: saldo_devedor
        });
    }
  mostra_resultado("tabela_price", parcelas);


}

function calcula_sac() {
    if (!$("#dados_financiamento_sac").valid()) return; 

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
        if(saldo_devedor<0){
            saldo_devedor=0;
        }
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



//regras de validação dos forms

$.validator.addMethod("menorQue", function (value, element, param) {
    return getValorNumerico(element.id) <= getValorNumerico(param);
}, "A entrada deve ser menor que o valor do financiamento.");

$("#dados_financiamento_sac").validate({
    rules: {
        valor_financiamento_sac: { required: true },
        valor_entrada_sac: {
            required: false,
            menorQue: {
                param: "valor_financiamento_sac",
                depends: function (element) { return getValorNumerico(element.id) > 0; }
            }
        },
        taxa_juros_sac:  { required: true, min: 0.01 },
        num_parcelas_sac: { required: true, min: 1 },
    },
    messages: {
        valor_financiamento_sac: "Informe o valor do financiamento.",
        valor_entrada_sac:       { menorQue: "A entrada deve ser menor que o valor do financiamento." },
        taxa_juros_sac:          { required: "Informe a taxa de juros.", min: "A taxa deve ser maior que zero." },
        num_parcelas_sac:        { required: "Informe o número de parcelas.", min: "Deve haver ao menos 1 parcela." },
    },
    errorElement: "div",
    errorClass: "invalid-feedback",
    highlight:   function (el) { $(el).addClass("is-invalid"); },
    unhighlight: function (el) { $(el).removeClass("is-invalid"); },
    errorPlacement: function (error, element) { error.insertAfter(element); },
    submitHandler: function () { return false; }
});

$("#dados_financiamento_price").validate({
    rules: {
        valor_financiamento_price: { required: true },
        valor_entrada_price: {
            required: false,
            menorQue: {
                param: "valor_financiamento_price",
                depends: function (element) { return getValorNumerico(element.id) > 0; }
            }
        },
        taxa_juros_price:  { required: true, min: 0.01 },
        num_parcelas_price: { required: true, min: 1 },
    },
    messages: {
        valor_financiamento_price: "Informe o valor do financiamento.",
        valor_entrada_price:       { menorQue: "A entrada deve ser menor que o valor do financiamento." },
        taxa_juros_price:          { required: "Informe a taxa de juros.", min: "A taxa deve ser maior que zero." },
        num_parcelas_price:        { required: "Informe o número de parcelas.", min: "Deve haver ao menos 1 parcela." },
    },
    errorElement: "div",
    errorClass: "invalid-feedback",
    highlight:   function (el) { $(el).addClass("is-invalid"); },
    unhighlight: function (el) { $(el).removeClass("is-invalid"); },
    errorPlacement: function (error, element) { error.insertAfter(element); },
    submitHandler: function () { return false; }
});
