const microGestures = {
  physical: [
    "Beber um copo d'água prestando atenção no caminho do líquido",
    "Alongamento de 2 minutos focando na respiração",
    "Caminhada consciente de 5 minutos sentindo os pés no chão"
  ],
  mental: [
    "Pausa de 1 minuto respirando conscientemente antes de iniciar tarefas",
    "Listar 3 prioridades essenciais do dia para esvaziar a mente",
    "Feche os olhos e conte até 10 lentamente sem julgar os pensamentos"
  ],
  spiritual: [
    "Prática de gratidão ativa: lembre-se de algo bom que aconteceu hoje",
    "3 minutos de silêncio intencional (Apenas Ser)",
    "Visualize um momento da sua vida onde sentiu paz profunda"
  ]
};

let users = [
  { 
    id: 1, name: 'Estudante', email: 'teste@teste.com', password: '123',
    history: [
      { date: '21 Mai', physical: 2, mental: 3, spiritual: 4 },
      { date: '22 Mai', physical: 3, mental: 3, spiritual: 3 },
      { date: '23 Mai', physical: 4, mental: 2, spiritual: 4 },
      { date: '24 Mai', physical: 3, mental: 4, spiritual: 5 },
      { date: '25 Mai', physical: 4, mental: 5, spiritual: 4 },
      { date: '26 Mai', physical: 4, mental: 5, spiritual: 5 },
      { date: '27 Mai', physical: 5, mental: 5, spiritual: 5 }
    ]
  }
]; // Banco de dados simulado para autenticação
let userRoutine = [];

// NOVAS FUNCIONALIDADES: Frases Diárias e Práticas Explicativas
const dailyPhrases = [
  "A paz vem de dentro. Não a procure à sua volta.",
  "O momento presente é o único tempo sobre o qual temos verdadeiro domínio.",
  "Sua mente é como um céu claro; os pensamentos ruins são apenas nuvens de passagem.",
  "Faça menos, mas faça com presença e propósito.",
  "Respirar com intenção é a âncora que nos traz de volta ao agora."
];

const practicesLibrary = [
  {
    id: 1,
    title: "Respiração Quadrada (Box Breathing)",
    duration: "2 min",
    description: "Inspire contando até 4, segure por 4, expire por 4 e mantenha os pulmões vazios por 4. Ideal para reduzir ansiedade e trazer clareza imediata.",
    category: "mental", // Ponto vai para Mental
    type: "breathing",
    totalRounds: 4,
    cycles: [
      { text: "Inspire", time: 4, action: "inhale" },
      { text: "Segure", time: 4, action: "hold" },
      { text: "Expire", time: 4, action: "exhale" },
      { text: "Mantenha o vazio", time: 4, action: "hold" }
    ]
  },
  {
    id: 2,
    title: "Respiração 4-7-8",
    duration: "4 min",
    description: "Foque no momento presente com este poderoso tranquilizante natural para o sistema nervoso. Excelente antes de dormir.",
    category: "physical", // Ponto vai para Fisico (relaxamento do corpo)
    type: "breathing",
    totalRounds: 3,
    cycles: [
      { text: "Inspire", time: 4, action: "inhale" },
      { text: "Segure a respiração", time: 7, action: "hold" },
      { text: "Expire longamente", time: 8, action: "exhale" }
    ]
  },
  {
    id: 3,
    title: "Meditação da Montanha",
    duration: "1 min",
    description: "Sente-se com firmeza. Visualize-se como uma montanha, inabalável pelos pensamentos ao seu redor.",
    category: "spiritual", // Ponto vai para Espiritual
    type: "meditation",
    totalRounds: 1,
    cycles: [
      { text: "Sinta a sua base firme no chão.", time: 10, action: "hold" },
      { text: "Respire profundamente...", time: 10, action: "inhale" },
      { text: "Você é inabalável.", time: 10, action: "hold" }
    ]
  }
];

module.exports = {
  users,
  microGestures,
  userRoutine,
  dailyPhrases,
  practicesLibrary
};
