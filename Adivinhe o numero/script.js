var num = [0, 9, 3, 5]
console.log(num)
// a variavel acima possui um array(Mais de um valor), com 4 objetos(valores dentro da array)


const teste = {x:1, y:2}
console.log(teste)
//acima um inicializador de objetos

// essa é uma linha de comentário e não é interpretada
/* isso tambem é um comentario.
Mas pode ter mais de uma linha. */

var calc = (20-10)
console.log(calc)

var calc = (30*10)
console.log("A área do retangulo é igual a: "+calc)

var joao = (6+8/2)
console.log("A nota média de joãozinho é "+joao)

function verificar() {
    var numero = document.getElementById("digito").value;
    if (numero == 17) {
    alert("Acertou");
    } else if (numero > 17) {
        alert("Menos");
    } else if (numero < 17){
    alert("Mais");
    }
}
