// src/lib/i18n.ts
export type Language = "en" | "pt-BR";

const EN = {
  acts: "Acts",
  gems: "Gems",
  tracker: "Tracker",
  rewards: "Rewards",
  reset: "Reset",
  class: "Class",
  showUncompletedOnly: "Show uncompleted only",
  passivePoints: "Passive points earned (v0 estimate)",
  loading: "Loading saved progress…",
  showingGemsFor: "Showing gems for",
  gemsCountLabel: "gems",
  searchGemsPlaceholder: "Search gems… (e.g. frost, onslaught)",
  noGemsIndexedTitle: "No gems indexed for this class yet",
  noGemsIndexedHint: "Add more",
  noGemsIndexedHint2: "entries and rebuild data.",
  noMatches: "No matches.",
  rewards_allActs: "All acts",
  rewards_actLabel: "Act",
  rewards_allTypes: "All types",
  rewards_searchPlaceholder: "Search rewards… (e.g. quicksilver, book, fireball)",
  rewards_showing: "Showing",
  rewards_page: "Page",
  rewards_first: "First",
  rewards_prev: "Prev",
  rewards_next: "Next",
  rewards_last: "Last",
  rewards_noneFound: "No rewards found.",
  rewards_from: "From:",
  rewards_openQuest: "Open quest",

  // ✅ New: per-row deep-link copy button (Rewards rows)
  rewards_copyQuestLink: "Copy quest link",
  rewards_copyQuestLink_title: "Copy deep link to this quest",

  // Rewards home
  rewards_home_title: "Rewards",
  rewards_home_subtitle: "Browse rewards across the campaign.",
  rewards_home_gems_title: "Gems",
  rewards_home_gems_desc: "Find where each gem reward comes from",
  rewards_home_all_title: "All Rewards",
  rewards_home_all_desc: "Flasks, passive points, items, etc",
  // Rewards / all page
  rewards_all_title: "All Rewards",
  rewards_all_subtitle:
    "Filter by act/type and search by name. (Class-aware for gem choices.)",
  // Rewards / gems page
  rewards_gems_title: "Gems",
  rewards_gems_subtitle:
    "Filtered by your selected class. Search shows where each gem reward comes from.",
  act_optional: "Optional",
  act_noSteps: "No steps yet.",
  reward_noGemListForClass_prefix: "No gem list for class",
  reward_grantedOnCompletion: "Reward granted on completion.",
  rewards_types_all: "All types",
  rewards_types_gem_choice: "Gem choice",
  rewards_types_flask_choice: "Flask choice",
  rewards_types_book_of_skill: "Book of Skill",
  rewards_typeLabel: "Type",
  rewards_badge_gem_choice: "Gem choice",
  rewards_badge_flask_choice: "Flask choice",
  rewards_badge_book_of_skill: "Passive point",
  rewards_countLabel: "rewards",
  acts_act_notFound: "Act not found",
  acts_backToActs: "Back to acts",
  common_back: "Back",
  home_title: "Campaign Rewards & Tracker",
  home_subtitle:
    "Find where a gem/reward comes from, track passive points, and follow act-by-act progression.",
  home_card_acts_title: "Acts",
  home_card_acts_desc: "Act-by-act quest order and rewards.",
  home_card_gems_title: "Gems",
  home_card_gems_desc: "Search gems and see how to get them.",
  home_card_tracker_title: "Tracker",
  home_card_tracker_desc: "Checklist, passives count, pantheon progress.",
  tracker_title: "Tracker",
  tracker_subtitle: "Your progress is saved locally in this browser.",
  tracker_completedQuests: "Completed quests",
  tracker_resetProgress: "Reset progress",
  acts_index_title: "Acts",
  acts_index_subtitle: "Pick an act to see quests and rewards in order.",
  acts_index_questsCount: "quests",
  common_classLabel: "Class",
  common_lang_en: "English",
  common_lang_ptbr: "Português (Brasil)",
  common_reset_title: "Clears completed quests & filters",
  common_filtersCleared: "Filters cleared.",
  common_linkCopied: "Link copied!",
  common_clear: "Clear",
  rewards_copyLink: "Copy link",
  rewards_copyLink_title: "Copy current filters link",

  // ✅ New / used by TopBar + TrackerPanel
  common_progress: "Progress",
  common_complete: "Complete",
  common_campaignComplete: "Campaign Complete",
  common_actComplete: "Act Complete",
  common_levelShort: "LV",
  common_xpStyle: "XP-style",
  common_campaignProgressAria: "Campaign progress",
  common_actProgressAria: "Act progress",

  // ✅ New: Toast dismiss localization
  common_dismiss: "Dismiss",

  // ✅ TrackerPanel extra strings
  tracker_overallProgress: "Overall progress:",
  tracker_xp: "XP:",
  tracker_levelUp: "Level up! LV",
  tracker_xpGained: "XP gained",
  tracker_sinceLastVisit: "Since last visit",
} as const;

export type TKey = keyof typeof EN;

const PT: Record<TKey, string> = {
  acts: "Atos",
  gems: "Gemas",
  tracker: "Tracker",
  rewards: "Recompensas",
  reset: "Resetar",
  class: "Classe",
  showUncompletedOnly: "Mostrar apenas não concluídas",
  passivePoints: "Pontos passivos obtidos (estimativa v0)",
  loading: "Carregando progresso salvo…",
  showingGemsFor: "Mostrando gemas para",
  gemsCountLabel: "gemas",
  searchGemsPlaceholder: "Pesquisar gemas… (ex.: frost, onslaught)",
  noGemsIndexedTitle: "Nenhuma gema indexada para esta classe ainda",
  noGemsIndexedHint: "Adicione mais entradas em",
  noGemsIndexedHint2: "e reconstrua os dados.",
  noMatches: "Nenhuma correspondência.",
  rewards_allActs: "Todos os atos",
  rewards_actLabel: "Ato",
  rewards_allTypes: "Todos os tipos",
  rewards_searchPlaceholder:
    "Pesquisar recompensas… (ex.: quicksilver, book, fireball)",
  rewards_showing: "Mostrando",
  rewards_page: "Página",
  rewards_first: "Primeira",
  rewards_prev: "Anterior",
  rewards_next: "Próxima",
  rewards_last: "Última",
  rewards_noneFound: "Nenhuma recompensa encontrada.",
  rewards_from: "Origem:",
  rewards_openQuest: "Abrir missão",

  // ✅ New: per-row deep-link copy button (Rewards rows)
  rewards_copyQuestLink: "Copiar link da missão",
  rewards_copyQuestLink_title: "Copiar link direto desta missão",

  // Rewards home
  rewards_home_title: "Recompensas",
  rewards_home_subtitle: "Navegue pelas recompensas da campanha.",
  rewards_home_gems_title: "Gemas",
  rewards_home_gems_desc: "Veja de qual missão vem cada recompensa de gema",
  rewards_home_all_title: "Todas as recompensas",
  rewards_home_all_desc: "Frascos, pontos passivos, itens, etc",
  // Rewards / all page
  rewards_all_title: "Todas as recompensas",
  rewards_all_subtitle:
    "Filtre por ato/tipo e pesquise por nome. (Gemas dependem da classe.)",
  // Rewards / gems page
  rewards_gems_title: "Gemas",
  rewards_gems_subtitle:
    "Filtrado pela classe selecionada. A busca mostra de onde vem cada recompensa de gema.",
  act_optional: "Opcional",
  act_noSteps: "Sem passos ainda.",
  reward_noGemListForClass_prefix: "Sem lista de gemas para a classe",
  reward_grantedOnCompletion: "Recompensa concedida ao concluir.",
  rewards_types_all: "Todos os tipos",
  rewards_types_gem_choice: "Escolha de gema",
  rewards_types_flask_choice: "Escolha de frasco",
  rewards_types_book_of_skill: "Livro de habilidade",
  rewards_typeLabel: "Tipo",
  rewards_badge_gem_choice: "Escolha de gema",
  rewards_badge_flask_choice: "Escolha de frasco",
  rewards_badge_book_of_skill: "Ponto passivo",
  rewards_countLabel: "recompensas",
  acts_act_notFound: "Ato não encontrado",
  acts_backToActs: "Voltar para Atos",
  common_back: "Voltar",
  home_title: "Recompensas & Tracker da Campanha",
  home_subtitle:
    "Descubra de qual missão vem cada gema/recompensa, acompanhe pontos passivos e siga a progressão ato por ato.",
  home_card_acts_title: "Atos",
  home_card_acts_desc: "Ordem das missões por ato e recompensas.",
  home_card_gems_title: "Gemas",
  home_card_gems_desc: "Pesquise gemas e veja como obter cada uma.",
  home_card_tracker_title: "Tracker",
  home_card_tracker_desc: "Checklist, contagem de passivos e progresso do panteão.",
  tracker_title: "Tracker",
  tracker_subtitle: "Seu progresso é salvo localmente neste navegador.",
  tracker_completedQuests: "Missões concluídas",
  tracker_resetProgress: "Resetar progresso",
  acts_index_title: "Atos",
  acts_index_subtitle: "Escolha um ato para ver as missões e recompensas em ordem.",
  acts_index_questsCount: "missões",
  common_classLabel: "Classe",
  common_lang_en: "English",
  common_lang_ptbr: "Português (Brasil)",
  common_reset_title: "Limpa missões concluídas e filtros",
  common_filtersCleared: "Filtros limpos.",
  common_linkCopied: "Link copiado!",
  common_clear: "Limpar",
  rewards_copyLink: "Copiar link",
  rewards_copyLink_title: "Copiar link dos filtros atuais",

  // ✅ New / used by TopBar + TrackerPanel
  common_progress: "Progresso",
  common_complete: "Concluído",
  common_campaignComplete: "Campanha Concluída",
  common_actComplete: "Ato Concluído",
  common_levelShort: "NV",
  common_xpStyle: "Estilo XP",
  common_campaignProgressAria: "Progresso da campanha",
  common_actProgressAria: "Progresso do ato",

  // ✅ New: Toast dismiss localization
  common_dismiss: "Dispensar",

  // ✅ TrackerPanel extra strings
  tracker_overallProgress: "Progresso geral:",
  tracker_xp: "XP:",
  tracker_levelUp: "Subiu de nível! NV",
  tracker_xpGained: "XP ganho",
  tracker_sinceLastVisit: "Desde a última vez",
};

const DICT: Record<Language, Record<TKey, string>> = {
  en: EN,
  "pt-BR": PT,
};

export function t(lang: Language, key: TKey): string {
  return DICT[lang][key] ?? DICT.en[key];
}

/**
 * Use when the key is dynamic (e.g. comes from props).
 * Avoids `as any` at call sites.
 */
export function tAny(lang: Language, key: string): string {
  const dict = DICT[lang] as Record<string, string>;
  const fallback = DICT.en as Record<string, string>;
  return dict[key] ?? fallback[key] ?? key;
}