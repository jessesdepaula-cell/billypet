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
  whenToUse: string;
  sections: TutorialSection[];
};

export const TUTORIALS: Tutorial[] = [
  {
    slug: "tutores",
    title: "Cadastrar tutores",
    summary: "O tutor e o dono do pet. Tudo no sistema (agenda, ficha, venda, fidelidade) referencia ele.",
    moduleHref: "/tutores",
    moduleLabel: "Abrir Tutores",
    minutes: 3,
    order: 1,
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
];

export function getTutorial(slug: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.slug === slug);
}

export function sortedTutorials(): Tutorial[] {
  return [...TUTORIALS].sort((a, b) => a.order - b.order);
}
