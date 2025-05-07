const SENHA = "1234"; // senha simples de segurança

function iniciarSessao() {
    const senha = prompt("Digite a senha para iniciar a sessão:");
    if (senha !== SENHA) {
        alert("Senha incorreta.");
        return;
    }

    const sessao = document.getElementById('sessaoInput').value.trim();
    if (!sessao) {
        alert('Digite o número da sessão.');
        return;
    }

    let votos = JSON.parse(localStorage.getItem('votos')) || {};

    if (votos[sessao]) {
        const confirmar = confirm(`A sessão ${sessao} já existe. Deseja reiniciá-la? Isso apagará os votos anteriores.`);
        if (!confirmar) return;
    }

    votos[sessao] = {
        inicio: new Date().toISOString(),
        votos: [],
        zeresima: {
            candidatos: {
                "10": 0,
                "20": 0,
                "30": 0
            }
        }
    };

    localStorage.setItem('votos', JSON.stringify(votos));
    sessionStorage.setItem('sessaoAtual', sessao);

    // Esconder o formulário de início
    document.getElementById('formSessao').style.display = 'none';

    // Exibir o botão de encerrar
    document.getElementById('btnEncerrarSessao').style.display = 'inline-block';

    // Exibir a tela de votação
    document.getElementById('telaVotacao').style.display = 'block';

    document.getElementById('sessaoAtual').innerText = `Sessão atual: ${sessao}`;
    alert(`Sessão ${sessao} iniciada com sucesso.`);
}

function encerrarSessao() {
    const senha = prompt("Digite a senha para encerrar a sessão:");
    if (senha !== SENHA) {
        alert("Senha incorreta.");
        return;
    }

    const sessao = sessionStorage.getItem('sessaoAtual');
    if (!sessao) {
        alert("Nenhuma sessão ativa.");
        return;
    }

    const votosData = JSON.parse(localStorage.getItem('votos')) || {};
    const sessaoData = votosData[sessao];

    if (!sessaoData || !sessaoData.votos) {
        alert("Erro ao recuperar os votos.");
        return;
    }

    // Contagem dos votos
    const contagem = { "10": 0, "20": 0, "30": 0 };
    sessaoData.votos.forEach(v => {
        const n = String(v.numero);
        if (contagem[n] !== undefined) contagem[n]++;
    });

    // Exibe resumo
    let resumo = `RESULTADO FINAL - SESSÃO ${sessao}\n\n`;
    resumo += `Início da sessão: ${new Date(sessaoData.inicio).toLocaleString()}\n`;
    resumo += `Término da sessão: ${new Date().toLocaleString()}\n\n`;
    resumo += `Total de votos:\n`;
    resumo += `Candidato 10: ${contagem["10"]} votos\n`;
    resumo += `Candidato 20: ${contagem["20"]} votos\n`;
    resumo += `Candidato 30: ${contagem["30"]} votos\n`;

    alert(resumo);

    // Gerar e baixar o arquivo XLS
    gerarXLS(sessao, votosData);

    // Encerrar sessão
    sessionStorage.removeItem('sessaoAtual');
    document.getElementById('sessaoAtual').innerText = "";
    document.getElementById('formSessao').style.display = 'block';  // Exibe novamente o formulário
    document.getElementById('btnEncerrarSessao').style.display = 'none';  // Esconde o botão de encerrar
    document.getElementById('telaVotacao').style.display = 'none'; // Oculta a tela de votação
}

function votar(numero) {
    const sessao = sessionStorage.getItem('sessaoAtual');
    if (!sessao) {
        alert("Nenhuma sessão ativa.");
        return;
    }

    let votos = JSON.parse(localStorage.getItem('votos')) || {};

    if (!votos[sessao]) {
        alert("Sessão não iniciada corretamente.");
        return;
    }

    votos[sessao].votos.push({
        numero: numero,
        horario: new Date().toLocaleString()
    });

    localStorage.setItem('votos', JSON.stringify(votos));

    // Exibe o modal com a escolha do voto
    mostrarModalVoto(numero);
}


function gerarXLS(sessao, votosData) {
    const votosSessao = votosData[sessao];

    // Preparando os dados para o XLS
    const dados = [
        ['Sessão', 'Voto Número', 'Horário do Voto'],
    ];

    // Adicionando os votos um por um na planilha
    votosSessao.votos.forEach(v => {
        dados.push([sessao, v.numero, v.horario || "Não registrado"]);
    });

    // Criando a planilha a partir dos dados
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados da Sessão');

    // Gerar e baixar o arquivo XLS
    XLSX.writeFile(wb, `resultados_sessao_${sessao}.xlsx`);
}

function mostrarModalVoto(numeroVoto) {
    const modal = document.getElementById('modalVoto');
    const votoEscolhido = document.getElementById('votoEscolhido');

    // Exibe a escolha do voto
    votoEscolhido.textContent = `Você escolheu o candidato ${numeroVoto}`;

    // Mostra o modal
    modal.style.display = 'flex';

    // Fecha o modal após 5 segundos
    setTimeout(function () {
        modal.style.display = 'none';
    }, 5000); // 5000ms = 5 segundos
}
