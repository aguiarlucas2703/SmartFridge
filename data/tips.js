// SmartFridge — Dicas Anti-desperdício
// Base de dados estática

export const tipsCategories = [
  {
    id: 'storage',
    title: 'Armazenamento Correto',
    icon: require('../assets/icons/icon_fridge.png'),
    iconDark: require('../assets/icons/icon_fridge_white.png'),
    description: 'Aprenda a guardar seus alimentos para que durem mais.',
    tips: [
      {
        id: 'storage-1',
        title: 'Ervas frescas como buquês',
        content: 'Trate ervas como salsinha, coentro e hortelã como se fossem flores. Corte as pontinhas do caule e coloque-os em um copo com água na geladeira (cubra frouxamente com um saquinho plástico). Elas vão durar semanas em vez de dias!',
        relatedIngredients: ['coriander', 'parsley', 'spring onions', 'basil', 'thyme', 'rosemary'],
      },
      {
        id: 'storage-2',
        title: 'Tomates fora da geladeira',
        content: 'O frio da geladeira interrompe o amadurecimento dos tomates e quebra as membranas celulares, deixando-os farinhentos. Guarde-os em temperatura ambiente, com o cabinho virado para baixo.',
        relatedIngredients: ['tomato'],
      },
      {
        id: 'storage-3',
        title: 'Bananas longe de tudo',
        content: 'As bananas liberam muito gás etileno, o que faz com que as frutas ao redor amadureçam (e apodreçam) muito rápido. Guarde as bananas sozinhas, de preferência penduradas.',
        relatedIngredients: ['banana'],
      }
    ]
  },
  {
    id: 'reuse',
    title: 'Reaproveitamento Criativo',
    icon: require('../assets/icons/icon_recycle.png'),
    description: 'Não jogue fora! Veja como transformar sobras em novos pratos.',
    tips: [
      {
        id: 'reuse-1',
        title: 'Caldo de legumes caseiro',
        content: 'Vá guardando cascas de cebola, pontas de cenoura, talos de salsão e outras sobras limpas em um pote no congelador. Quando o pote estiver cheio, ferva tudo com água por 1 hora. Coe e pronto: você tem um caldo delicioso, saudável e grátis para fazer risotos e sopas.',
        relatedIngredients: ['onion', 'carrot', 'celery', 'leek'],
      },
      {
        id: 'reuse-2',
        title: 'Pão amanhecido é tesouro',
        content: 'Pão duro não é lixo. Você pode ralar para fazer farinha de rosca, fatiar e assar para fazer croutons, ou fazer rabanadas e pudim de pão.',
        relatedIngredients: ['bread'],
      },
      {
        id: 'reuse-3',
        title: 'Talos e folhas',
        content: 'As folhas da cenoura, beterraba e brócolis são comestíveis e muito nutritivas. Refogue as folhas ou bata-as para fazer um pesto delicioso.',
        relatedIngredients: ['carrot', 'broccoli'],
      }
    ]
  },
  {
    id: 'planning',
    title: 'Planejamento Inteligente',
    icon: require('../assets/icons/icon_tasks.png'),
    description: 'Compre melhor, cozinhe melhor, desperdice menos.',
    tips: [
      {
        id: 'planning-1',
        title: 'Regra do "Primeiro a entrar, primeiro a sair"',
        content: 'Quando chegar do mercado, coloque os produtos novos no fundo da geladeira ou despensa, e puxe os mais antigos para a frente. Assim, você consome o que está mais perto do vencimento primeiro.',
        relatedIngredients: [],
      },
      {
        id: 'planning-2',
        title: 'Dia do "Limpa Geladeira"',
        content: 'Defina um dia da semana (ex: sexta-feira) para não cozinhar nada novo. O objetivo é juntar todas as sobras da semana e criar um prato único: um mexidão, uma torta de liquidificador ou uma fritada.',
        relatedIngredients: [],
      },
      {
        id: 'planning-3',
        title: 'Congele porcionado',
        content: 'Se comprou muita carne ou fez muito molho, não congele tudo em um pote só. Divida em porções pequenas (para 1 ou 2 refeições). Você só descongela o que vai comer, evitando o ciclo de recongelamento que estraga a comida.',
        relatedIngredients: [],
      }
    ]
  }
];
