const camposValores = document.querySelectorAll(".valores");
let valor_presente = document.getElementById("valor_financiamento")
    


camposValores.forEach(function (campo) {

    campo.addEventListener("input", function (e) {

        let valor = e.target.value;

        valor = valor.replace(/\D/g, "");

        valor = (valor / 100).toFixed(2);

        valor = valor.replace(".", ",");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        e.target.value = "R$ " + valor;

    });

});

function calcula_price() {
    parcelas = [];
    // calculo do valor das parcelas
    parcelas.push({ parcela: 1, valor_parcela: 1000, amortizacao: 500, juros: 500, saldo_devedor: 5000 });
    parcelas.push({ parcela: 2, valor_parcela: 500, amortizacao: 250, juros: 250, saldo_devedor: 2500 });
    parcelas.push({ parcela: 3, valor_parcela: 250, amortizacao: 125, juros: 125, saldo_devedor: 1250 });
    mostra_resultado("tabela_price", parcelas);

    /* 
    parcelas = valor_presente *
        (
            (taxa_juros * ((1 + taxa_juros) ** n_parcelas)) /
            (((1 + taxa_juros) ** n_parcelas) - 1)
        )
 */ 
}

function calcula_sac() {
    parcelas = [];
    parcelas.push({ parcela: 1, valor_parcela: 1000, amortizacao: 500, juros: 500, saldo_devedor: 5000 });
    parcelas.push({ parcela: 2, valor_parcela: 500, amortizacao: 250, juros: 250, saldo_devedor: 2500 });
    parcelas.push({ parcela: 3, valor_parcela: 250, amortizacao: 125, juros: 125, saldo_devedor: 1250 });
    mostra_resultado("tabela_sac", parcelas);

}

/**
 * 
 * @param {*} tabela Nome do objeto html que vai recebar o resultado
 * @param {*} parcelas Parcelas geradas no metodo calcula_price ou calcula_sac
 */
function mostra_resultado(tabela, parcelas) {
    let tabela_html = document.getElementById(tabela);
    tabela_html.innerHTML = "";
    parcelas.forEach(function (parcela) {
        tabela_html.innerHTML += "<tr>" +
            "<td>" + parcela.parcela + "</td>" +
            "<td>" + parcela.valor_parcela + "</td>" +
            "<td>" + parcela.amortizacao + "</td>" +
            "<td>" + parcela.juros + "</td>" +
            "<td>" + parcela.saldo_devedor + "</td>" +
            "</tr>";
    });



}
