// Conteudo dos tutoriais BilyVet - texto direto e curto, sem enrolacao.
// Cada tutorial tem slug (URL), titulo, descricao, modulo (link), tempo e secoes (passo a passo).

export type TutorialStep = {
  title: string;
  body: string;
};

export type TutorialSection = {
  heading: string;
  steps?: TutorialStep[];
  tip?: string;
  paragraphs?: string[];
};

export type Tutorial = {
  slug: string;
  title: string;
  summary: string;
  moduleHref: string; // tela do app
  moduleLabel: string;
  minutes: number;
  order: number;
  category: "trilha" | "operacao" | "gestao";
  whenToUse: string;
  sections: TutorialSection[];
};

export const TUTORIALS: Tutorial[] = [
  // ============ TRILHA INICIAL ============
  {
    slug: "tutores",
    title: "Cadastrar tutores",
    summary: "O tutor e o dono do pet. Tudo no sistema (agenda, ficha, venda, fidelidade) referencia ele.",
    moduleHref: "/tutores",
    moduleLabel: "Abrir Tutores",
    minutes: 3,
    order: 1,
    category: "trilha",
    whenToUse: "Sempre que um cliente novo aparecer na clinica - antes de cadastrar o pet, antes de agendar e antes de vender.",
    sections: [
      {
        heading: "Passo a passo",
        steps: [
          { title: "Abra Cadastros > Tutores no menu lateral", body: "Voce ve a lista de tutores cadastrados. Vazia no primeiro acesso." },
          { title: "Clique em Novo tutor (canto superior direito)", body: "Abre o formulario de cadastro." },
          { title: "Preencha os dados", body: "Nome e o unico obrigatorio. CPF, telefone e WhatsApp sao altamente recomendados para cobranca e contato. E-mail e bom para envio de receita e lembrete." },
          { title: "Clique em Salvar", body: "Volta para a lista ja com o tutor criado. Em seguida abra ele para adicionar pets, ver historico e pontos." },
        ],
        tip: "Use o campo WhatsApp - ele e usado nos templates de lembrete de agendamento e cobranca de pacotes.",
      },
      {
        heading: "O que voce vai ver na ficha do tutor",
        paragraphs: [
          "Cadastro completo (dados, endereco, observacoes).",
          "Lista de pets - com botao para adicionar mais.",
          "Historico de atendimentos dos pets dele.",
          "Historico de compras (vendas finalizadas).",
          "Total gasto nos ultimos 10 atendimentos.",
          "Pontos de fidelidade acumulados.",
          "Contas a receber em aberto (mensalidades, parcelas).",
        ],
      },
      {
        heading: "Erros comuns",
        paragraphs: [
          "Cadastrar duas vezes o mesmo tutor: use a busca da tela de tutores antes de criar.",
          "Esquecer o telefone: dificulta a recuperacao em emergencia. Sempre preencha.",
        ],
      },
    ],
  },
  {
    slug: "pets",
    title: "Cadastrar pets",
    summary: "Cada pet pertence a um tutor. E a unidade clinica do sistema - vacinas, exames, fichas, internacoes ficam ligadas a ele.",
    moduleHref: "/pets",
    moduleLabel: "Abrir Pets",
    minutes: 3,
    order: 2,
    category: "trilha",
    whenToUse: "Depois que o tutor estiver cadastrado. Voce pode adicionar varios pets para o mesmo tutor.",
    sections: [
      {
        heading: "Passo a passo",
        steps: [
          { title: "Atalho rapido: abra o tutor e clique em Novo pet", body: "Esse caminho ja preenche o tutor automaticamente. Mais rapido que ir em Pets > Novo." },
          { title: "Alternativa: Cadastros > Pets > Novo pet", body: "Voce precisa escolher o tutor manualmente na lista." },
          { title: "Preencha especie, raca, sexo e data de nascimento", body: "A idade e calculada automaticamente nas listagens e fichas." },
          { title: "Peso atual (em kg)", body: "Necessario para calculo de doses de medicamentos e vacinas. Atualize a cada consulta." },
          { title: "Alerta medico (opcional, mas critico)", body: "Use para alergias, condicoes pre-existentes, comportamento agressivo. Aparece em vermelho na ficha do pet e durante o atendimento." },
        ],
        tip: "O campo alerta medico nao e o mesmo que observacoes. Use ALERTA para risco clinico e OBSERVACOES para preferencias e historico geral.",
      },
      {
        heading: "O que voce ve na ficha do pet",
        paragraphs: [
          "Historico clinico completo (todas as fichas com diagnostico e conduta).",
          "Historico de atendimentos (agenda + tipos).",
          "Vacinas aplicadas e proximas a vencer.",
          "Exames solicitados e resultados.",
          "Internacoes anteriores e atuais.",
        ],
      },
    ],
  },
  {
    slug: "produtos",
    title: "Cadastrar produtos",
    summary: "Tudo que voce comercializa ou usa: racao, medicamento, acessorio, higiene. Ligado ao estoque e a venda.",
    moduleHref: "/produtos",
    moduleLabel: "Abrir Produtos",
    minutes: 4,
    order: 3,
    category: "trilha",
    whenToUse: "Antes de fazer a primeira venda ou de movimentar estoque. Cadastre uma vez, atualize precos quando precisar.",
    sections: [
      {
        heading: "Antes de cadastrar produtos",
        paragraphs: [
          "Sua clinica ja vem com 4 categorias padrao prontas: Racao, Medicamento, Acessorio e Higiene. Pode usar como esta ou adicionar mais em Gestao > Cadastros > Categorias.",
          "Fornecedores tambem ficam em Gestao > Cadastros. Util para gerar contas a pagar automaticas.",
        ],
      },
      {
        heading: "Passo a passo",
        steps: [
          { title: "Cadastros > Produtos > Novo produto", body: "Abre o formulario." },
          { title: "Nome, SKU, codigo de barras e marca", body: "SKU e o seu codigo interno. Codigo de barras serve para leitor optico no PDV." },
          { title: "Categoria e fornecedor", body: "Escolha entre os ja cadastrados. Fornecedor e opcional." },
          { title: "Preco de custo e preco de venda", body: "O custo entra nos relatorios de margem. O preco de venda e o sugerido no PDV (pode ajustar na venda)." },
          { title: "Estoque minimo", body: "Quando o saldo cair abaixo desse numero, o produto aparece em Estoque baixo no dashboard." },
          { title: "Unidade (UN, KG, L, ML, CX)", body: "Padrao e UN. Importante para racao em quilos, por exemplo." },
          { title: "Controle por lote (opcional)", body: "Ative para medicamentos com validade. Permite registrar lote e data de vencimento nas movimentacoes." },
        ],
        tip: "Cadastre o estoque inicial em Estoque > Movimentacoes > Entrada apos salvar o produto.",
      },
    ],
  },
  {
    slug: "servicos",
    title: "Cadastrar servicos",
    summary: "Consulta, banho, tosa, vacina, exame, cirurgia. Tudo que voce vende como servico (nao produto).",
    moduleHref: "/configuracoes",
    moduleLabel: "Abrir Cadastros",
    minutes: 3,
    order: 4,
    category: "trilha",
    whenToUse: "Logo de cara - antes de criar a primeira agenda. Sem servicos cadastrados, a agenda mostra so o tipo (CONSULTA, BANHO_TOSA) sem detalhe.",
    sections: [
      {
        heading: "Onde fica",
        paragraphs: [
          "Servicos sao gerenciados em Gestao > Cadastros (no menu lateral, lado de baixo).",
          "Hoje a lista mostra todos os servicos do seu tenant. A criacao de novos sera feita pelo formulario que estamos lancando.",
        ],
      },
      {
        heading: "Quais servicos cadastrar primeiro",
        paragraphs: [
          "Consulta clinica geral - 30 min, valor padrao.",
          "Consulta de retorno - 20 min, valor reduzido.",
          "Banhos por porte - P, M, G com tempos e precos diferentes.",
          "Tosas - higienica e completa.",
          "Vacinas - V8/V10, antirrabica (cada uma vira um servico).",
          "Exames basicos - hemograma, ultrassom (mais detalhes em Exames).",
        ],
      },
      {
        heading: "Por que isso importa",
        paragraphs: [
          "Servico ligado ao agendamento ja calcula tempo de bloqueio na agenda.",
          "Comissao do veterinario / banhista sai do percentual do servico.",
          "Relatorios de produtividade saem por servico.",
        ],
        tip: "Ja deixe a comissao certa no cadastro do servico (% padrao). Voce pode mudar no atendimento individual depois.",
      },
    ],
  },
  {
    slug: "agenda",
    title: "Agendar atendimento",
    summary: "A agenda e o ponto de entrada do dia. Tudo nasce dela: ficha clinica, internacao, exame, venda.",
    moduleHref: "/agenda",
    moduleLabel: "Abrir Agenda",
    minutes: 4,
    order: 5,
    category: "trilha",
    whenToUse: "Sempre que marcar consulta, banho, retorno ou procedimento. Pode ser feito pelo balcao ou pelo proprio cliente (em breve - portal do tutor).",
    sections: [
      {
        heading: "Pre-requisitos",
        paragraphs: [
          "Tutor cadastrado.",
          "Pet cadastrado (vinculado ao tutor).",
          "Servico cadastrado (consulta, banho, etc).",
          "Pelo menos um usuario com perfil VETERINARIO ou BANHO_TOSA, se quiser atribuir o profissional.",
        ],
      },
      {
        heading: "Passo a passo",
        steps: [
          { title: "Atendimento > Agenda", body: "Voce ve a visualizacao semanal (padrao) ou diaria." },
          { title: "Clique em Novo agendamento", body: "Botao no canto superior direito." },
          { title: "Selecione tutor e pet", body: "Comece a digitar o nome - a lista filtra automaticamente." },
          { title: "Escolha o veterinario / profissional", body: "Opcional - pode deixar para definir na hora." },
          { title: "Defina data, hora e tipo (consulta, banho, retorno)", body: "O tipo define a cor do card e onde ele entra na esteira." },
          { title: "Adicione um ou mais servicos", body: "Cada servico soma o tempo - se voce marca banho + tosa, a agenda bloqueia o tempo total." },
          { title: "Salve", body: "O card aparece na agenda. Status inicial e AGENDADO." },
        ],
        tip: "Use a Esteira (Atendimento > Esteira) para acompanhar o pet desde a recepcao ate o pagamento - e um kanban do dia.",
      },
      {
        heading: "Fluxo apos o agendamento",
        paragraphs: [
          "Cliente chega: muda status para CONFIRMADO.",
          "Pet entra: muda para EM_ATENDIMENTO e abre a ficha clinica (Atendimento > clique no agendamento).",
          "Veterinario preenche diagnostico, conduta, prescricao.",
          "Cliente vai pagar: clique em Gerar venda do atendimento - leva direto pro PDV ja com tutor preenchido.",
          "Finalizado: muda para FINALIZADO.",
        ],
      },
    ],
  },

  // ============ OPERACAO DO DIA A DIA ============
  {
    slug: "atendimento",
    title: "Atendimento clinico e ficha",
    summary: "Onde o veterinario registra anamnese, exame, diagnostico, conduta e receita do pet.",
    moduleHref: "/atendimento",
    moduleLabel: "Abrir Atendimento",
    minutes: 5,
    order: 6,
    category: "operacao",
    whenToUse: "Quando o animal esta no consultorio. Cada agendamento vira uma ficha clinica unica.",
    sections: [
      {
        heading: "Como abrir a ficha",
        steps: [
          { title: "Atendimento (menu lateral)", body: "Lista todos os atendimentos do dia - AGENDADOS, CONFIRMADOS, EM_ATENDIMENTO." },
          { title: "Clique no card do paciente", body: "Abre a tela completa do atendimento com resumo + ficha." },
          { title: "Mude o status para EM_ATENDIMENTO", body: "Use o seletor de Pipeline no topo direito. Marca que o pet entrou." },
        ],
      },
      {
        heading: "Campos da ficha clinica",
        paragraphs: [
          "Queixa principal - o que o tutor relatou.",
          "Anamnese - historico clinico relacionado.",
          "Exame fisico - achados ao palpar, auscultar, observar.",
          "Diagnostico - hipotese ou confirmado.",
          "Conduta - tratamento proposto.",
          "Procedimentos realizados na consulta (curativos, medicacoes aplicadas).",
          "Observacoes finais.",
          "Recomendar retorno - data sugerida (aparece como agendamento futuro).",
        ],
        tip: "Salve a ficha mesmo incompleta - voce pode complementar depois. Os campos sao opcionais.",
      },
      {
        heading: "Receituario",
        paragraphs: [
          "Na ficha tem secao de Prescricoes - cada item e um medicamento.",
          "Preencha: nome do medicamento, dose, frequencia, duracao, orientacoes.",
          "Apos salvar, fica anexado a ficha e disponivel no historico clinico do pet.",
        ],
        tip: "Para emitir receita impressa, use Documentos (em breve - hoje copie o texto pra um modelo seu).",
      },
      {
        heading: "Acoes rapidas (lateral direita)",
        paragraphs: [
          "Gerar venda do atendimento - leva pro PDV ja com tutor + pet preenchidos.",
          "Solicitar exames - vai pra tela de Exames com o pet filtrado.",
          "Internar pet - abre formulario de internacao.",
        ],
      },
    ],
  },
  {
    slug: "esteira",
    title: "Esteira de atendimento (kanban)",
    summary: "Visao kanban do dia. Voce arrasta o pet pelas etapas: recepcao, triagem, consulta, exames, pagamento.",
    moduleHref: "/esteira",
    moduleLabel: "Abrir Esteira",
    minutes: 2,
    order: 7,
    category: "operacao",
    whenToUse: "Use durante o expediente para saber onde cada pet esta. Ideal para clinicas com volume.",
    sections: [
      {
        heading: "Etapas padrao",
        paragraphs: [
          "AGUARDANDO - acabou de chegar.",
          "RECEPCAO - sendo atendido pela recepcionista.",
          "TRIAGEM - aferindo sinais vitais.",
          "EM_CONSULTA - veterinario atendendo.",
          "EXAMES - coletando ou aguardando exame.",
          "BANHO_TOSA - na area de banho.",
          "INTERNACAO - internado.",
          "PAGAMENTO - aguardando o tutor pagar.",
          "FINALIZADO - liberado, tudo pago.",
        ],
      },
      {
        heading: "Como usar",
        steps: [
          { title: "Abra Atendimento > Esteira", body: "Mostra colunas das etapas com os cards do dia." },
          { title: "Arraste o card para a coluna seguinte", body: "Atualiza o status e registra hora da mudanca." },
          { title: "Clique no card para abrir a ficha", body: "Para preencher diagnostico, conduta, receita." },
        ],
        tip: "Coloque a esteira em uma TV na recepcao - todo mundo ve o status em tempo real.",
      },
    ],
  },
  {
    slug: "internacao",
    title: "Internacao e evolucao",
    summary: "Acompanhe pets internados, baias ocupadas, evolucoes diarias e altas.",
    moduleHref: "/internacao",
    moduleLabel: "Abrir Internacao",
    minutes: 4,
    order: 8,
    category: "operacao",
    whenToUse: "Quando um pet precisa ficar mais que algumas horas - pos-operatorio, observacao, tratamento intensivo.",
    sections: [
      {
        heading: "Abrir uma internacao",
        steps: [
          { title: "Atendimento > Internacao > Nova internacao", body: "Ou pela tela de Atendimento, acao rapida Internar pet." },
          { title: "Escolha o pet e o veterinario responsavel", body: "Lista mostra pets ativos do seu tenant." },
          { title: "Defina o leito (baia)", body: "Texto livre - ex: Baia 01, Box A, Canil 3." },
          { title: "Motivo e previsao de alta", body: "Motivo descritivo. Previsao orienta a equipe (nao trava nada)." },
          { title: "Salve", body: "Status fica ATIVA." },
        ],
      },
      {
        heading: "Evolucao diaria",
        paragraphs: [
          "Abra a internacao - tela de detalhe mostra historico de evolucoes.",
          "Adicione nova evolucao com: descricao do estado, sinais vitais (FC, FR, T), medicacoes administradas.",
          "Cada evolucao registra hora automaticamente.",
        ],
        tip: "Faca pelo menos uma evolucao por plantao - cria rastro clinico e protege em caso de problema.",
      },
      {
        heading: "Alta e obito",
        steps: [
          { title: "Mude o status para ALTA", body: "Marca a data de alta automaticamente." },
          { title: "Ou OBITO se necessario", body: "Mesma logica. Aparece no historico do pet." },
          { title: "Cobranca", body: "Gere venda separada para os dias de internacao + medicamentos administrados." },
        ],
      },
    ],
  },
  {
    slug: "exames",
    title: "Solicitar e registrar exames",
    summary: "Hemograma, ultrassom, raio-x, urina. Solicita, acompanha status, anexa resultado.",
    moduleHref: "/exames",
    moduleLabel: "Abrir Exames",
    minutes: 3,
    order: 9,
    category: "operacao",
    whenToUse: "Durante ou apos consulta. Permite acompanhar exames pendentes e disponibilizar resultados.",
    sections: [
      {
        heading: "Solicitar exame",
        steps: [
          { title: "Atendimento > Exames", body: "Lista todos os exames recentes." },
          { title: "Novo exame", body: "Escolha o pet (busca pelo nome do tutor) e o nome do exame." },
          { title: "Status inicial: SOLICITADO", body: "Indica que ainda nao foi coletado." },
        ],
      },
      {
        heading: "Fluxo de status",
        paragraphs: [
          "SOLICITADO - veterinario pediu, ainda nao coletou.",
          "COLETADO - amostra coletada, enviada para laboratorio.",
          "EM_ANALISE - laboratorio processando.",
          "DISPONIVEL - resultado disponivel.",
          "CANCELADO - desistiu ou nao realizado.",
        ],
        tip: "Atualize o status conforme o exame avanca. O tutor ve isso na proxima consulta.",
      },
      {
        heading: "Registrar resultado",
        steps: [
          { title: "Clique no exame na lista", body: "Abre a edicao." },
          { title: "Cole o resultado no campo Resultado", body: "Texto livre - pode colar o laudo do laboratorio." },
          { title: "Mude o status para DISPONIVEL", body: "Marca hora automaticamente." },
        ],
      },
    ],
  },
  {
    slug: "vendas-pdv",
    title: "Vender (PDV)",
    summary: "Ponto de venda - registra produtos, servicos e pagamento. Baixa estoque, gera comissao, soma fidelidade.",
    moduleHref: "/vendas",
    moduleLabel: "Abrir Vendas",
    minutes: 4,
    order: 10,
    category: "operacao",
    whenToUse: "No balcao ou na saida do atendimento. Toda saida de produto/servico passa por aqui.",
    sections: [
      {
        heading: "Atalho a partir do atendimento",
        paragraphs: [
          "Na tela de atendimento, clique em Gerar venda do atendimento.",
          "PDV abre ja com tutor + pet preenchidos. Voce so adiciona itens e finaliza.",
        ],
        tip: "Esse caminho deixa a venda ligada ao agendamento - util pra relatorios.",
      },
      {
        heading: "Venda avulsa (balcao)",
        steps: [
          { title: "Vendas > Nova venda", body: "Abre o PDV." },
          { title: "Selecione o tutor (opcional)", body: "Se nao escolher, e venda avulsa - nao soma fidelidade." },
          { title: "Adicione produtos e servicos", body: "Use a busca e clique para incluir. Quantidade ajusta com setas." },
          { title: "Aplique desconto ou acrescimo se necessario", body: "Pode ser em valor ou %." },
          { title: "Escolha a forma de pagamento", body: "Dinheiro, Pix, Credito, Debito - ja vem padrao. Adicione mais em Cadastros." },
          { title: "Numero de parcelas (cartao)", body: "Padrao 1x. Ate 12x cartao de credito." },
          { title: "Finalizar venda", body: "Imprime comprovante e baixa estoque dos produtos." },
        ],
      },
      {
        heading: "O que acontece nos bastidores",
        paragraphs: [
          "Estoque do produto e debitado automaticamente.",
          "Movimentacao de estoque registrada (tipo SAIDA_VENDA).",
          "Pontos de fidelidade somados ao tutor (1 ponto a cada R$ 10).",
          "Comissao do vendedor calculada se houver regra.",
          "Receita aparece no dashboard, financeiro e caixa do dia.",
        ],
      },
    ],
  },
  {
    slug: "caixa",
    title: "Caixa diario",
    summary: "Abertura, suprimento, sangria e fechamento do caixa fisico.",
    moduleHref: "/caixa",
    moduleLabel: "Abrir Caixa",
    minutes: 3,
    order: 11,
    category: "operacao",
    whenToUse: "Inicio e fim do expediente. Quem mexer com dinheiro precisa abrir caixa no nome dele.",
    sections: [
      {
        heading: "Abertura",
        steps: [
          { title: "Financeiro > Caixa diario", body: "Se nao tem caixa aberto, aparece botao Abrir caixa." },
          { title: "Informe o valor inicial (fundo de troco)", body: "Quanto tem na gaveta antes de comecar." },
          { title: "Confirme", body: "Caixa fica ABERTO no seu nome." },
        ],
      },
      {
        heading: "Lancamentos durante o dia",
        paragraphs: [
          "Vendas finalizadas em DINHEIRO/PIX entram automaticamente.",
          "Sangria - retirar dinheiro do caixa (deposito banco, troco grande). Use o botao Sangria.",
          "Suprimento - colocar dinheiro extra no caixa.",
          "Saida - despesa pequena paga em dinheiro (cafe, taxi).",
        ],
        tip: "Sangrias frequentes diminuem risco em caso de assalto ou erro.",
      },
      {
        heading: "Fechamento",
        steps: [
          { title: "Conte o dinheiro fisico", body: "Some todas as notas e moedas da gaveta." },
          { title: "Clique em Fechar caixa", body: "Sistema mostra o saldo esperado." },
          { title: "Informe o valor real contado", body: "Diferenca aparece - pode ser sobra ou quebra." },
          { title: "Confirme", body: "Caixa fica FECHADO e entra na lista de Caixas fechados recentes." },
        ],
      },
    ],
  },
  {
    slug: "contas-receber",
    title: "Contas a receber",
    summary: "Mensalidades, parcelamentos, convenios, atendimentos a prazo.",
    moduleHref: "/contas-receber",
    moduleLabel: "Abrir Contas a receber",
    minutes: 3,
    order: 12,
    category: "operacao",
    whenToUse: "Sempre que o cliente nao paga a vista. Tambem para mensalidades de plano vet.",
    sections: [
      {
        heading: "Criar conta a receber",
        steps: [
          { title: "Financeiro > Contas a receber", body: "Veja totais em aberto e vencidas." },
          { title: "Nova conta", body: "Botao no topo abre formulario." },
          { title: "Cliente (tutor) opcional", body: "Se for de um cliente especifico. Sem cliente vira receita generica." },
          { title: "Descricao + valor + vencimento", body: "Ex: Mensalidade plano pet - R$ 159,90 - vence dia 5." },
          { title: "Parcelamento (opcional)", body: "Use o campo Parcela ex: 1/3, 2/3 para acompanhar series." },
          { title: "Salvar", body: "Entra como ABERTA. Quando vencer sem pagar, vira VENCIDA automaticamente (em breve)." },
        ],
      },
      {
        heading: "Receber pagamento",
        steps: [
          { title: "Encontre a conta na lista", body: "Use a busca ou filtro por status." },
          { title: "Clique em Receber", body: "Confirma valor recebido (pode ser parcial)." },
          { title: "Marca como PAGA", body: "Hora e valor pago ficam registrados." },
        ],
        tip: "Para cobranca recorrente automatica via Asaas, use o painel super-admin (so para SUPER_ADMIN).",
      },
    ],
  },
  {
    slug: "contas-pagar",
    title: "Contas a pagar",
    summary: "Fornecedores, aluguel, folha, energia, agua - controle completo de saidas.",
    moduleHref: "/contas-pagar",
    moduleLabel: "Abrir Contas a pagar",
    minutes: 3,
    order: 13,
    category: "operacao",
    whenToUse: "Toda despesa que tem data de vencimento. Use centro de custo para relatorios depois.",
    sections: [
      {
        heading: "Criar conta a pagar",
        steps: [
          { title: "Financeiro > Contas a pagar > Nova conta", body: "Formulario lateral abre." },
          { title: "Fornecedor (opcional) ou Categoria", body: "Fornecedor liga ao cadastro. Categoria e livre: Aluguel, Energia, Folha, Marketing." },
          { title: "Descricao + valor + vencimento", body: "Detalhe que aparece na lista." },
          { title: "Recorrente?", body: "Marque para aluguel, folha, internet - sera lancada todo mes (em breve)." },
          { title: "Centro de custo (opcional)", body: "Ex: Matriz, Filial Zona Sul. Aparece nos relatorios." },
          { title: "Salvar", body: "Entra como ABERTA." },
        ],
        tip: "Cadastre fornecedores em Gestao > Cadastros - permite agrupar e ver historico de cada um.",
      },
      {
        heading: "Pagar",
        paragraphs: [
          "Clique em Pagar na linha da conta.",
          "Sistema marca como PAGA e registra a data.",
          "Em breve: gerar boleto/PIX direto pelo sistema via integracao bancaria.",
        ],
      },
    ],
  },
  {
    slug: "estoque",
    title: "Estoque, transferencias e inventario",
    summary: "Controle de saldo por unidade, entradas, saidas, transferencias entre lojas e contagem fisica.",
    moduleHref: "/estoque",
    moduleLabel: "Abrir Estoque",
    minutes: 5,
    order: 14,
    category: "operacao",
    whenToUse: "Recebimento de mercadoria, ajuste apos venda, perda, transferencia entre unidades.",
    sections: [
      {
        heading: "Tipos de movimentacao",
        paragraphs: [
          "ENTRADA - recebimento de compra. Aumenta saldo.",
          "SAIDA_VENDA - automatico ao finalizar venda. Diminui saldo.",
          "SAIDA_USO - uso interno (banho da casa, brinde). Diminui.",
          "TRANSFERENCIA - entre unidades. Diminui na origem, aumenta no destino.",
          "PERDA - validade, quebra, roubo. Diminui sem cobrar.",
          "AJUSTE - correcao de saldo apos contagem.",
          "DEVOLUCAO - cliente devolveu produto. Aumenta saldo.",
          "XML - importacao via XML de nota fiscal (em breve).",
        ],
      },
      {
        heading: "Lancar entrada (recebimento)",
        steps: [
          { title: "Estoque > Movimentacoes", body: "Tela com formulario + historico." },
          { title: "Produto + unidade + quantidade", body: "Escolha tipo ENTRADA." },
          { title: "Motivo (opcional)", body: "Ex: NF 12345 - Royal Pet Distribuidora." },
          { title: "Salvar", body: "Saldo atualiza imediatamente." },
        ],
      },
      {
        heading: "Transferencia entre unidades",
        steps: [
          { title: "Estoque > Transferencias", body: "Tela dedicada." },
          { title: "Selecione produto, unidade origem e destino", body: "Sistema valida se a origem tem saldo suficiente." },
          { title: "Quantidade", body: "Em unidades do produto." },
          { title: "Salvar", body: "Cria duas movimentacoes (saida origem + entrada destino) automaticamente." },
        ],
      },
      {
        heading: "Inventario (contagem fisica)",
        paragraphs: [
          "Estoque > Inventario mostra posicao consolidada por produto e unidade.",
          "Valor total em custo aparece no topo - util para balanco.",
          "Para corrigir divergencia, use Movimentacoes com tipo AJUSTE.",
        ],
        tip: "Faca contagem mensal para identificar perdas e melhorar o calculo de margem.",
      },
    ],
  },
  {
    slug: "pacotes",
    title: "Pacotes e fidelidade",
    summary: "Venda 10 banhos com desconto. Acumule pontos a cada compra. Resgate em servicos.",
    moduleHref: "/pacotes",
    moduleLabel: "Abrir Pacotes",
    minutes: 3,
    order: 15,
    category: "operacao",
    whenToUse: "Para fidelizar clientes recorrentes (banho/tosa) e aumentar ticket medio.",
    sections: [
      {
        heading: "Pacotes de servico",
        paragraphs: [
          "Cliente compra X servicos por valor unico com desconto.",
          "Ex: 10 banhos porte M por R$ 540 (em vez de 10 x R$ 80 = R$ 800).",
          "Cada uso debita 1 do saldo. Quando zerar, fim do pacote.",
          "Validade configuravel (ex: 120 dias).",
        ],
        tip: "Ofereca pacotes na primeira consulta - converte cliente novo em recorrente.",
      },
      {
        heading: "Fidelidade",
        paragraphs: [
          "Regra padrao: 1 ponto a cada R$ 10 gastos.",
          "Pontos somam automaticamente ao finalizar venda (se tutor estiver vinculado).",
          "Para resgatar, use o cadastro de Servicos com preco em pontos (em breve - hoje use desconto manual).",
        ],
      },
      {
        heading: "Acompanhamento",
        paragraphs: [
          "Comercial > Fidelidade mostra ranking dos tutores e movimentacoes recentes.",
          "Comercial > Pacotes mostra todos vendidos, saldo, validade.",
          "Ficha do tutor tambem mostra pontos atuais.",
        ],
      },
    ],
  },

  // ============ GESTAO ============
  {
    slug: "relatorios",
    title: "Relatorios e Dashboard",
    summary: "Receita 30d, top itens, top clientes, estoque baixo, validade. Tudo exportavel em CSV.",
    moduleHref: "/relatorios",
    moduleLabel: "Abrir Relatorios",
    minutes: 3,
    order: 16,
    category: "gestao",
    whenToUse: "Tomada de decisao mensal, fechamento gerencial, planejamento de compras.",
    sections: [
      {
        heading: "O que o Dashboard mostra (tempo real)",
        paragraphs: [
          "Vendas e atendimentos do dia.",
          "Internacoes ativas e estoque baixo.",
          "Contas a receber e a pagar.",
          "Vacinas a vencer.",
          "Mix de pagamentos e receita 7 dias.",
          "Agenda do dia com status.",
        ],
      },
      {
        heading: "O que tem em Relatorios (30 dias)",
        paragraphs: [
          "Receita por dia (grafico linha).",
          "Top itens vendidos (produtos e servicos).",
          "Curva ABC de clientes - top 10 que mais compram.",
          "Estoque baixo - produtos abaixo do minimo.",
          "Produtos proximos do vencimento (60 dias).",
        ],
        tip: "Use o botao Exportar CSV em cada relatorio - abre direto no Excel.",
      },
      {
        heading: "Em breve",
        paragraphs: [
          "Filtros por periodo, unidade, profissional.",
          "DRE completo com categorias.",
          "Comissao por veterinario/vendedor.",
          "Producao por setor.",
          "Auditoria de preco.",
        ],
      },
    ],
  },
  {
    slug: "usuarios",
    title: "Usuarios e permissoes",
    summary: "Crie acessos para sua equipe. Voce escolhe exatamente quais modulos cada um pode ver e usar.",
    moduleHref: "/usuarios",
    moduleLabel: "Abrir Usuarios",
    minutes: 4,
    order: 17,
    category: "gestao",
    whenToUse: "Quando entrar funcionario novo. Tambem para desativar quem sair ou ajustar permissoes.",
    sections: [
      {
        heading: "Perfis sugeridos",
        paragraphs: [
          "ADMIN - dono da clinica. Acesso total exceto super-admin (nao pode ser customizado).",
          "GESTOR - acesso amplo mas sem mexer em usuarios.",
          "VETERINARIO - foco em ficha, agenda, internacao, exames.",
          "RECEPCAO - agenda, esteira, vendas, caixa, contas.",
          "FINANCEIRO - contas, caixa, relatorios.",
          "ESTOQUE - produtos, movimentacoes, inventario, transferencias.",
          "BANHO_TOSA - agenda, esteira, pets e tutores.",
          "VENDEDOR - vendas, pacotes, fidelidade.",
        ],
        tip: "O perfil e apenas um ponto de partida - voce pode liberar/bloquear modulos individuais em cada usuario.",
      },
      {
        heading: "Criar usuario novo",
        steps: [
          { title: "Gestao > Usuarios > Novo usuario", body: "Botao no topo direito." },
          { title: "Preencha nome, e-mail e escolha o perfil", body: "Ao escolher o perfil, as permissoes padrao dele aparecem ja marcadas." },
          { title: "Clique em Personalizar permissoes (opcional)", body: "Expande a matriz com todos os modulos agrupados por area. Marque/desmarque livremente." },
          { title: "Salvar", body: "Sistema cria o usuario e envia email com link para ele definir a propria senha (24h de validade)." },
        ],
        tip: "Se o email nao chegar, o link aparece na propria tela para voce encaminhar manualmente.",
      },
      {
        heading: "Personalizar permissoes",
        paragraphs: [
          "Modulos sao organizados em 7 grupos: Geral, Cadastros, Atendimento, Comercial, Financeiro, Estoque, Gestao.",
          "Cada checkbox libera ou bloqueia um modulo especifico (ex: Caixa, Relatorios, Estoque).",
          "Use os botoes Marcar todos / Limpar / Padrao do perfil para velocidade.",
          "O label 'padrao' ao lado do modulo mostra o que o perfil daria por padrao.",
        ],
        tip: "Exemplos uteis: Recepcionista que tambem ve relatorios. Veterinario que tambem cobra. Estoquista que tambem faz vendas.",
      },
      {
        heading: "Editar usuario existente",
        steps: [
          { title: "Clique no lapis ao lado do usuario", body: "Abre edicao inline de perfil e unidade." },
          { title: "Linha extra mostra a matriz de permissoes", body: "Marque/desmarque ali mesmo." },
          { title: "Botao verde de check salva", body: "Mudancas valem no proximo login do usuario." },
        ],
        tip: "Se o usuario ja esta logado, peca para ele sair e entrar de novo para refletir as novas permissoes no menu.",
      },
      {
        heading: "Desativar usuario",
        paragraphs: [
          "Clique no botao de Power ao lado do usuario.",
          "O usuario fica inativo - nao consegue mais logar mas o historico fica preservado.",
          "Para reativar, mesma acao - o sistema pergunta antes.",
          "Voce nao pode desativar a si mesmo (evita lock-out).",
        ],
      },
    ],
  },
  {
    slug: "configuracoes",
    title: "Cadastros e configuracoes",
    summary: "Servicos, formas de pagamento, maquinas de cartao, categorias, fornecedores, comissoes.",
    moduleHref: "/configuracoes",
    moduleLabel: "Abrir Cadastros",
    minutes: 2,
    order: 18,
    category: "gestao",
    whenToUse: "Configuracao inicial e ajustes periodicos. Mexa pouco apos estabilizar.",
    sections: [
      {
        heading: "O que esta aqui",
        paragraphs: [
          "Servicos - catalogo de tudo que voce vende como servico.",
          "Formas de pagamento - Dinheiro, Pix, Credito, Debito (ja vem padrao).",
          "Maquinas de cartao - operadora, taxas debito/credito, prazo de recebimento.",
          "Categorias de produto - Racao, Medicamento etc (ja vem padrao).",
          "Fornecedores - parceiros para contas a pagar.",
          "Regras de comissao - por servico ou produto, por funcionario.",
        ],
        tip: "Taxas das maquinas afetam o custo real da venda no cartao - mantenha atualizadas para nao perder margem.",
      },
    ],
  },
];

export function getTutorial(slug: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.slug === slug);
}

export function sortedTutorials(): Tutorial[] {
  return [...TUTORIALS].sort((a, b) => a.order - b.order);
}

export function tutorialsByCategory() {
  const all = sortedTutorials();
  return {
    trilha: all.filter((t) => t.category === "trilha"),
    operacao: all.filter((t) => t.category === "operacao"),
    gestao: all.filter((t) => t.category === "gestao"),
  };
}
