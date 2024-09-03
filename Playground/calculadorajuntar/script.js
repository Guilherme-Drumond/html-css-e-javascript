function calcular(){

    const meses = 12;
    const tempo = document.querySelector('#anos').value;
    const valor = document.querySelector('#digito').value;
    const formula = (valor/(meses*tempo)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const valorf = (valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


    if(isNaN(tempo) || isNaN(valor) || tempo <= 0){
        alert('Por favor, insira valores válidos.')
        return;
    }

    document.querySelector('#resultado').innerHTML = "Você deve juntar "+formula+" por mês durante "+tempo+" Anos Para ter "+valorf+" Reais";
}

function calcularporcentagem(){
    const pct = 100;
    const valorporcentagem = document.querySelector('#porcentagem').value;
    const valorinserido = document.querySelector('#valorp').value;
    const formulap = (valorporcentagem/pct*(valorinserido));

    document.querySelector('#resultadoporcentagem').innerHTML = valorporcentagem+"% de "+valorinserido+" é igual a: "+formulap;
}

setTimeout(function(){ alert("teste");}, 2000);