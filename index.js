console.log("Blaze Monitoramento do Foguetinho v1.0.0")

// CONFIGURAÇÕES INICIAIS
const bancaInicial = 100 //100
const multiplicador = 2 // Valor do multiplicador que você está apostando
const valorDaAposta = 1 

const ApostaId = null // ID da aposta que você deseja ter as estatisticas

const bancasHTML = document.getElementById("bancas")
const listaJogadoresApostasHTML = document.getElementById("lista-jogadores-apostas")

// ##########################################################
// WEBSOCKET para buscar os dados em tempo real do gráfico do foguetinho
// ##########################################################

const URL = "wss://api-v2.blaze.com/replication/?EIO=3&transport=websocket"
const webSocket = new WebSocket(URL);

const getCrashTickPayload = (data) => {
  const dataId = !!data && !!data[1] && data[1].id
  const CRASH_TICK_ID = "crash.tick"
  if (CRASH_TICK_ID == dataId) {
    return data[1].payload
  }
  return false
}

const showCrashPoint = (crashTickData) => {
  if (!!crashTickData.crash_point) {
    console.log("Crash em: ", crashTickData.crash_point)
  } else {
    console.log("Ainda não crashou")
  }
}

const startMonitoring = (data) => {
  if (!!getCrashTickPayload(data)) {
    showCrashPoint(getCrashTickPayload(data))
  }
}

const isJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

webSocket.onmessage = (event) => {
  const removing42ToString = event.data.slice(2, event.data.length)
  if (isJsonString(removing42ToString)) {
    const dataJSON = JSON.parse(removing42ToString)
    startMonitoring(dataJSON)
  }
}

webSocket.onopen = () => {
  const authenticate = ["cmd",{id: "authenticate", payload: {token: "SEU_TOKEN_AQUI"}}] 
  webSocket.send("420"+JSON.stringify(authenticate))
  webSocket.send("421"+JSON.stringify(["cmd",{id: "subscribe",payload:{room: "crash_v2"}}]))
  webSocket.send("423"+JSON.stringify(authenticate))
}

// ##########################################################
// Requisição HTTP para buscar os dados das ultimas partidas do foguetinho
// ##########################################################

const apostasComMultiplicadorMaiorQue2 = (records) => records.filter(record => record.crash_point > 2)
const apostasComMultiplicadorMaiorQue1ponto5EMenorQue2 = (records) => records.filter(record => record.crash_point <= 2 && record.crash_point > 1.5)
const apostasComMultiplicadorMenorQue1ponto5 = (records) => records.filter(record => record.crash_point <= 1.5)

// Essa função usei para calcular a médias dos resultados e também quantos resultados tinham por intervalo
// TAMBEM USEI PARA CALCULAR LUCRO/PREJUIZOS DA BLAZE

// fetch("https://blaze.com/api/crash_games/history?startDate=2023-05-15T17:39:02.703Z&endDate=2023-06-14T17:39:02.703Z", { method: 'GET' }) //&page=1
//   .then(data => {
//     return data.json()
//   }).then(data => {
//     const { records } = data

//     // ################################################
//     // INICIO DO CÓDIGO QUE CALCULA O GANHO/PERDA DA BLAZE NAS ULTIMAS 300 RODADAS LEVANDO EM CONTA APENAS AS TOP 10 APOSTAS
//     // ################################################
//     const URLApostaEspecifica = `https://blaze.com/api/crash_games/`

//     const promisesDeTodasAs300Rodadas = records.map(record => {
//       return fetch(`${URLApostaEspecifica}${record.id}?page=1`).then(value => value.json())
//     })

//     Promise.all(promisesDeTodasAs300Rodadas)
//       .then(listaDeApostas => {
//         let saldoBlaze = 0
//         listaDeApostas.forEach(apostas => {
//           listaJogadoresApostasHTML.innerHTML += `<h3>Rodada com Multiplicador de ${apostas.crash_point}x com o total de apostas de ${apostas.total_bets_placed}</h3>`
//           const { faturamento, prejuizo } = calculaFaturamentoEPrejuizoBlaze(apostas.bets)
//           saldoBlaze += faturamento - prejuizo
//         })

//         listaJogadoresApostasHTML.innerHTML += `<h3>Ao final de 300 rodadas o saldo da Blaze foi de ${saldoBlaze} e média de ganho por rodada foi de ${saldoBlaze/300}</h3>`
//       })

//     // ################################################
//     // FIM DO CÓDIGO QUE CALCULA O GANHO/PERDA DA BLAZE NAS ULTIMAS 300 RODADAS LEVANDO EM CONTA APENAS AS TOP 10 APOSTAS
//     // ################################################
    
//     // const listaDeMultiplicadoresMaioresQue100 = records.filter(record => record.crash_point >= 100)

//     // console.log("Quantidade de multiplicadores maiores que 100 ", listaDeMultiplicadoresMaioresQue100.length)
//     // const requisicoesDosApostadoresDaListaDeMultiplicadoresMaioresQue100 = listaDeMultiplicadoresMaioresQue100.map(multiplicador => {
//     //   return fetch(`${URLApostaEspecifica}${multiplicador.id}?page=1`).then(value => value.json())
//     // })

//     // Promise.all(requisicoesDosApostadoresDaListaDeMultiplicadoresMaioresQue100)
//     //   .then((listaDeApostas) => {
//     //     // const listaDeApostas = unificarTodasApostasEmUnicaLista(bets)
        
//     //     listaDeApostas.forEach(aposta => {
//     //       listaJogadoresApostasHTML.innerHTML += `<h3>Rodada com Multiplicador de ${aposta.crash_point}x com o total de apostas de ${aposta.total_bets_placed}</h3>`
//     //       adicionaTabelaOrdenadaMultiplicadorEValor(ordenarTodasApostasRealizadasPorMaiorMultiplicador(aposta.bets))
//     //     })
        
//     //     // calculaFaturamentoEPrejuizoBlaze(listaDeApostas)
//     //   })


// //     const greaterThan2 = records.filter(record => record.crash_point > 2) 
// //     const greaterThan1dot5 = records.filter(record => record.crash_point <= 2 && record.crash_point > 1.5) 
// //     const lessThan1dot5 = records.filter(record => record.crash_point <= 1.5)

//     // console.log("Maior que 2: ", greaterThan2)
//     // console.log("Maior que 1.5 e menor que 2: ", greaterThan1dot5)
//     // console.log("Menor que 1.5: ", lessThan1dot5)

//     // const mediaMaior2 = greaterThan2.reduce((accumulator, currentValue) => accumulator + Number(currentValue.crash_point), 0) / greaterThan2.length
//     // const mediaMaior1dot5 = greaterThan1dot5.reduce((accumulator, currentValue) => accumulator + Number(currentValue.crash_point), 0) / greaterThan1dot5.length
//     // const mediaMenor1dot5 = lessThan1dot5.reduce((accumulator, currentValue) => accumulator + Number(currentValue.crash_point), 0) / lessThan1dot5.length

//     // console.log("Media dos maiores que 2: ", mediaMaior2)
//     // console.log("Media dos maiores que 1.5: ", mediaMaior1dot5)
//     // console.log("Media dos menores que 1.5: ", mediaMenor1dot5)
  // })

const buscarResultadosBlaze = () => {
  const URLHistory = "https://blaze.com/api/crash_games/history?startDate=2023-05-15T17:39:02.703Z&endDate=2023-06-14T17:39:02.703Z"
  Promise.all([
    fetch(URLHistory+"&page=1", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=2", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=3", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=4", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=5", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=6", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=7", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=8", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=9", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=10", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=11", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=12", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=13", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=14", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=15", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=16", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=17", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=18", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=19", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=20", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=21", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=22", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=23", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=24", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=25", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=26", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=27", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=28", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=29", { method: 'GET' }).then(value => value.json()),
    fetch(URLHistory+"&page=30", { method: 'GET' }).then(value => value.json()),
  ]).then(items => {
    items.forEach(item => { 
      simularBanca(item)
    })
    bancasHTML.innerHTML += `
      <h2>Simulação Cumulativa de todos os períodos</h2>
    `
    simularBancaComSuperPeriodo(items)
  }).catch(error => {
    console.log("ERRO AO BUSCAR HISTORICO: ", error)
  })
}
  
const simularBancaComSuperPeriodo = (items) => {
  const superPeriodo = []

  items.forEach(item => {
    superPeriodo.push(...item.records)
  })

  // ############################################### 
  // Retirar os comentarios caso queira a tabela dos apostadores de todas as rodadas que tiveram multiplicador acima de 100
  // ############################################### 

  // const listaDeMultiplicadoresMaioresQue100 = superPeriodo.filter(record => record.crash_point >= 100)
  // const URLApostaEspecifica = `https://blaze.com/api/crash_games/`

  // console.log("Quantidade de multiplicadores maiores que 100 dos 9000 casos", listaDeMultiplicadoresMaioresQue100.length)

  // const requisicoesDosApostadoresDaListaDeMultiplicadoresMaioresQue100 = listaDeMultiplicadoresMaioresQue100.map(multiplicador => {
  //   return fetch(`${URLApostaEspecifica}${multiplicador.id}?page=1`).then(value => value.json())
  // })

  // Promise.all(requisicoesDosApostadoresDaListaDeMultiplicadoresMaioresQue100)
  //   .then((listaDeApostas) => {
  //     // const listaDeApostas = unificarTodasApostasEmUnicaLista(bets)
      
  //     listaDeApostas.forEach(aposta => {
  //       listaJogadoresApostasHTML.innerHTML += `<h3>Rodada com Multiplicador de ${aposta.crash_point}x com o total de apostas de ${aposta.total_bets_placed}</h3>`
  //       adicionaTabelaOrdenadaMultiplicadorEValor(ordenarTodasApostasRealizadasPorMaiorMultiplicador(aposta.bets))
  //     })
      
  //     // calculaFaturamentoEPrejuizoBlaze(listaDeApostas)
  //   })

  console.log("########## SUPER LISTA #############")
  simularBanca({records: superPeriodo})
}

const simularBanca = (data) => {
  const { records } = data
  let banca = bancaInicial;
  let menorValor = bancaInicial; 
  let maiorValor = bancaInicial; 
  let retirarApostaEm = multiplicador

  const multiplicadoresMaiorQue2 = apostasComMultiplicadorMaiorQue2(records)
  const multiplicadoresMaiorQue1ponto5EMenorQue2 = apostasComMultiplicadorMaiorQue1ponto5EMenorQue2(records)
  const multiplicadoresMenorQue1ponto5 = apostasComMultiplicadorMenorQue1ponto5(records)

  records.forEach(record => {
    const crashPoint = Number(record.crash_point)
    if (crashPoint >= retirarApostaEm) {
      banca += valorDaAposta * retirarApostaEm - valorDaAposta;
    } else {
      banca -= valorDaAposta
    }

    if (banca < menorValor) {
      menorValor = banca
    }

    if (banca > maiorValor) {
      maiorValor = banca
    }
  });

  console.log("============================")
  console.log("VALOR FINAL: ", banca)
  console.log("MENOR VALOR: ", menorValor)
  console.log("MAIOR VALOR: ", maiorValor)
  console.log("============================")

  adicionarTabelaDasBancas(banca, menorValor, maiorValor)
  adicionarTabelaDasEstatisticas(multiplicadoresMaiorQue2.length, multiplicadoresMaiorQue1ponto5EMenorQue2.length, multiplicadoresMenorQue1ponto5.length)
}

const atualizaBancaInicialEMultiplicador = (bancaSelecionada, multiplicadorSelecionado, valorDaAposta) => {
  const bancaInicialHTML = document.getElementById("banca-inicial")
  const multiplicadorHTML = document.getElementById("multiplicador")
  const valorDaApostaHTML = document.getElementById("valor-aposta")

  bancaInicialHTML.innerHTML = bancaSelecionada
  multiplicadorHTML.innerHTML = multiplicadorSelecionado
  valorDaApostaHTML.innerHTML = valorDaAposta
}

const adicionarTabelaDasBancas = (banca, menorValor, maiorValor) => {
  if (!!bancasHTML) {
    bancasHTML.innerHTML += `<table>
    <thead>
      <th>Valor final</th>
      <th>Menor Valor</th>
      <th>Maior Valor</th>
    </thead>
    <tbody>
      <td>R$ ${banca}</td>
      <td>R$ ${menorValor}</td>
      <td>R$ ${maiorValor}</td>
    </tbody>
  </table>`
  }
}

const adicionarTabelaDasEstatisticas = (multiplicadorMaiorQue2, multiplicadorMaiorQue1ponto5, multiplicadorMenorQue1ponto5) => {
  if (!!bancasHTML) {
    const totalDeApostas = multiplicadorMaiorQue2 + multiplicadorMaiorQue1ponto5 + multiplicadorMenorQue1ponto5
    const multiplicadorEmPorcentagem = (multiplicador) => {
      const porcentagem = (multiplicador / totalDeApostas) * 100
      return `(${porcentagem.toFixed(2)}%)`
    }
    bancasHTML.innerHTML += `<table class="tabela-estatistica">
    <thead>
      <th>Multiplicador maior que 2</th>
      <th>Multiplicador entre 2 e 1.5</th>
      <th>Multiplicador menor que 1.5</th>
    </thead>
    <tbody>
      <td>${multiplicadorMaiorQue2} ${multiplicadorEmPorcentagem(multiplicadorMaiorQue2)}</td>
      <td>${multiplicadorMaiorQue1ponto5} ${multiplicadorEmPorcentagem(multiplicadorMaiorQue1ponto5)}</td>
      <td>${multiplicadorMenorQue1ponto5} ${multiplicadorEmPorcentagem(multiplicadorMenorQue1ponto5)}</td>
    </tbody>
  </table>`
  }
}

atualizaBancaInicialEMultiplicador(bancaInicial, multiplicador, valorDaAposta)
buscarResultadosBlaze()

// TODO: SCRIPT para calcular quem conseguiu o maior Multiplicador e quem fez a maior aposta no Foguetinho na Rodada, também calcula
// quanto que Blaze lucrou e pagou para os jogadores

const buscarTodasApostasRealizadasEmDeterminadaRodada = () => {
  fetch(`https://blaze.com/api/crash_games/${ApostaId}`, { method: 'GET' }) // ?page=2
    .then(items => items.json())
    .then(items => {
      const quantidadePaginas = items.totalBetPages
      const URLApostaEspecifica = `https://blaze.com/api/crash_games/${ApostaId}`
      const listaDeRequisicoes = []

      // PEGA TODAS AS APOSTAS REALIZADAS REQUISIÇÕES DAQUELA RODADA
      // for (let i = 0; i < quantidadePaginas; i++) {
      //   listaDeRequisicoes.push(fetch(`${URLApostaEspecifica}?page=${i + 1}`).then(value => value.json()))
      // }

      // Apenas a primeira pagina
      listaDeRequisicoes.push(fetch(`${URLApostaEspecifica}?page=1`).then(value => value.json()))
      
      resolverPromisesDasApostas(listaDeRequisicoes)

    })
    .catch(console.log)
}

const unificarTodasApostasEmUnicaLista = (betsPayload) => {
  const listaDeApostas = []
  betsPayload.forEach(betPayload => {
    listaDeApostas.push(...betPayload.bets)
  })

  return listaDeApostas
}

const resolverPromisesDasApostas = (listaDeRequisicoes) => {
  Promise.all(listaDeRequisicoes)
  .then(bets => {
    console.log("Bets: ", bets)

    listaJogadoresApostasHTML.innerHTML += "<h3>O Grafico crashou em: " + bets[0].crash_point + "</h3>"

    const listaDeApostas = unificarTodasApostasEmUnicaLista(bets)
    const listaOrdenadaPorMultiplicador = ordenarTodasApostasRealizadasPorMaiorMultiplicador(listaDeApostas)
    const listaOrdenadaPorMaiorAposta = ordenarTodasApostasRealizadasPorMaiorAposta(listaDeApostas)

    console.log("listaOrdenadaPorMultiplicador: ", listaOrdenadaPorMultiplicador)
    console.log("listaOrdenadaPorMaiorAposta: ", listaOrdenadaPorMaiorAposta)

    listaJogadoresApostasHTML.innerHTML += "<h2>Tabela ordenada por Multiplicador (Apenas 10 registros)</h2>"
    adicionaTabelaOrdenadaMultiplicadorEValor(listaOrdenadaPorMultiplicador)

    listaJogadoresApostasHTML.innerHTML += "<h2>Tabela ordenada por Maior Aposta (Apenas 10 registros)</h2>"
    adicionaTabelaOrdenadaMultiplicadorEValor(listaOrdenadaPorMaiorAposta)

    calculaFaturamentoEPrejuizoBlaze(listaDeApostas)
  })
}

const ordenarTodasApostasRealizadasPorMaiorMultiplicador = (listaDeRequisicoes) => {
  return [...listaDeRequisicoes].sort((a, b) => b.cashed_out_at - a.cashed_out_at)
}

const ordenarTodasApostasRealizadasPorMaiorAposta = (listaDeRequisicoes) => {
  return [...listaDeRequisicoes].sort((a, b) => b.amount - a.amount)
}

const calculaFaturamentoEPrejuizoBlaze = (listaDeApostas) => {
  let faturamento = 0
  let prejuizo = 0
  listaDeApostas.forEach(aposta => {
    if (aposta.status == "win") {
      prejuizo += aposta.amount * aposta.cashed_out_at
    } else {
      faturamento += aposta.amount
    }
  })

  listaJogadoresApostasHTML.innerHTML += `<h3>A Blaze faturou: R$ ${faturamento.toFixed(2)} e pagou R$ ${prejuizo.toFixed(2)} na rodada de id ${ApostaId}, uma diferença de ${faturamento.toFixed(2) - prejuizo.toFixed(2)}`
  return { faturamento, prejuizo }
}

const adicionaTabelaOrdenadaMultiplicadorEValor = (listaAposta) => {

  const linhasTabela = listaAposta.map((aposta, index) => {
    if (index < 10) {
      return `
        <tr>
          <td>${aposta.cashed_out_at || "Perdeu" }</td>
          <td>${aposta.amount}</td>
        </tr>
      `
    }
  })

  listaJogadoresApostasHTML.innerHTML += `
    <table class="tabela-estatistica">
    <thead>
      <th>Multiplicador</th>
      <th>Valor da aposta</th>
    </thead>
    <tbody>
      ${linhasTabela.map(linha => linha)}
    </tbody>
  </table>
  `
}

if (!!ApostaId) {
  buscarTodasApostasRealizadasEmDeterminadaRodada()
}


// {
//   "data": {
//     "id": "crash.tick",
//     "payload": {
//       "crash_point": null,
//       "id": "RlvYd4aWkj",
//       "status": "waiting",
//       "updated_at": "2023-06-15T19:14:16.389Z"
//     }
//   } 
// }

// {
//   "data": {
//     "id": "crash.tick",
//     "payload": {
//       "crash_point": null,
//       "id": "RlvYd4aWkj",
//       "status": "graphing",
//       "updated_at": "2023-06-15T19:14:21.397Z"
//     }
//   } 
// }
// {
//   "data": {
//     "id": "crash.tick",
//     "payload": {
//       "id": "LknDx8LVr3",
//       "updated_at": "2023-06-15T19:14:11.375Z",
//       "status": "complete",
//       "crash_point": "12.97"
//     }
//   } 
// }



