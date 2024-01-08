function calcular(){
    // Captura os valores inseridos
    var emprestimo = parseFloat(document.querySelector('#amountloan').value);
    var juros = parseFloat(document.querySelector('#percentagetax').value);
    var tempo = parseFloat(document.querySelector('#years').value);
    
    const taxamensal = juros/100; // Transforma o juros anual em mensal.
    const meses = tempo*12; // Transforma os anos/tempo em meses.

    const totalpayment = emprestimo*taxamensal*tempo+emprestimo; 
    const totaljuros = totalpayment-emprestimo;
    const pagamentomensal = totalpayment/meses;


    // Mostra o resultado do calculo na interface
    document.getElementById("monthly").innerHTML = "Monthly payments: "+pagamentomensal.toFixed(2);
    document.getElementById("totalpayment").innerHTML = "Total payment:"+totalpayment.toFixed(2);
    document.getElementById("totalinterest").innerHTML = "Total interest:"+totaljuros.toFixed(2);

}