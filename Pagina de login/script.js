var teste = 'teste\nteste\nteste\n\'teste\'\xA9'; // Alguns unicodes  e quebras de parametro. \n= new line, \'\'=aspas simples, \xA9= simbolo de copyrigths
console.log(teste)

function login(){
    const user = "admin"; //Define o usuario
    const pass = "pass"; //Define a senha
    const vuser = document.querySelector('#usuario').value; //Pega o valor do input pelo id #usuario 
    const vpass = document.querySelector('#senha').value;
    if(vuser == '' || vuser == undefined || vuser == null){ //Compara se os inputs estao vazios
        document.getElementById("retorno").innerHTML = "Campos vazios";
        return; 
    }
    if(vpass == '' || vpass == undefined || vpass == null){
        document.getElementById("retorno").innerHTML = "Campos vazios";
        return; 
    } else if (vuser == user && vpass == pass){ //compara se os inputs são iguais as constantes user e pass
        document.getElementById("retorno").innerHTML = "Login bem sucedido";
        setTimeout(function redirecionar(){
        window.location.href = "home/index.html";
    }, 1000);
    } else if (vuser != user && vpass == pass){
        document.getElementById("retorno").innerHTML = "Usuário ou Senha invalídos";
    } else if (vuser == user && vpass != pass){
        document.getElementById("retorno").innerHTML = "Senha invalída";
    } else if (vuser != user && vpass != pass){
        document.getElementById("retorno").innerHTML = "Usuário ou Senha invalídos";
    }
}