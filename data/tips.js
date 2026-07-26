// SmartFridge — Dicas Anti-desperdício
// Base de dados estática

export const tipsCategories = [
  {
    id: 'storage',
    title: 'Armazenamento Correto',
    emoji: '🧊',
    description: 'Aprenda a guardar seus alimentos para que durem mais.',
    tips: [
      {
        id: 'storage-1',
        title: 'Ervas frescas como buquês',
        content: 'Trate ervas como salsinha, coentro e hortelã como se fossem flores. Corte as pontinhas do caule e coloque-os em um copo com água na geladeira (cubra frouxamente com um saquinho plástico). Elas vão durar semanas em vez de dias!',
      },
      {
        id: 'storage-2',
        title: 'Tomates fora da geladeira',
        content: 'O frio da geladeira interrompe o amadurecimento dos tomates e quebra as membranas celulares, deixando-os farinhentos. Guarde-os em temperatura ambiente, com o cabinho virado para baixo.',
      },
      {
        id: 'storage-3',
        title: 'Bananas longe de tudo',
        content: 'As bananas liberam muito gás etileno, o que faz com que as frutas ao redor amadureçam (e apodreçam) muito rápido. Guarde as bananas sozinhas, de preferência penduradas.',
      }
    ]
  },
  {
    id: 'reuse',
    title: 'Reaproveitamento Criativo',
    emoji: '♻️',
    description: 'Não jogue fora! Veja como transformar sobras em novos pratos.',
    tips: [
      {
        id: 'reuse-1',
        title: 'Caldo de legumes caseiro',
        content: 'Vá guardando cascas de cebola, pontas de cenoura, talos de salsão e outras sobras limpas em um pote no congelador. Quando o pote estiver cheio, ferva tudo com água por 1 hora. Coe e pronto: você tem um caldo delicioso, saudável e grátis para fazer risotos e sopas.',
      },
      {
        id: 'reuse-2',
        title: 'Pão amanhecido é tesouro',
        content: 'Pão duro não é lixo. Você pode ralar para fazer farinha de rosca, fatiar e assar para fazer croutons, ou fazer rabanadas e pudim de pão.',
      },
      {
        id: 'reuse-3',
        title: 'Talos e folhas',
        content: 'As folhas da cenoura, beterraba e brócolis são comestíveis e muito nutritivas. Refogue as folhas ou bata-as para fazer um pesto delicioso.',
      }
    ]
  },
  {
    id: 'planning',
    title: 'Planejamento Inteligente',
    emoji: '📝',
    description: 'Comprar melhor e gastar menos.',
    tips: [
      {
        id: 'planning-1',
        title: 'A regra do PEPS',
        content: 'PEPS significa "Primeiro que Entra, Primeiro que Sai". Ao chegar do mercado, coloque os itens novos no fundo da prateleira e puxe os antigos para frente. Assim você sempre consome o que está mais perto de vencer.',
      },
      {
        id: 'planning-2',
        title: 'Inventário antes do mercado',
        content: 'Nunca vá às compras sem antes olhar o que já tem em casa. Tire uma foto da sua geladeira antes de sair ou mantenha a sua despensa do SmartFridge atualizada.',
      }
    ]
  }
];
