const camposValores = document.querySelectorAll(".valores");

camposValores.forEach(function(campo){

    campo.addEventListener("input", function(e){

        let valor = e.target.value;

        valor = valor.replace(/\D/g, "");

        valor = (valor / 100).toFixed(2);

        valor = valor.replace(".", ",");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        e.target.value = "R$ " + valor;

    });

});