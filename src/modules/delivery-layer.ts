/**
 * In-app copy (en + uk). Edit user-facing strings here.
 *
 * - interventionLabelsByLocale — short intervention names (paths, lists)
 * - guidanceByLocale — action-screen instructions (simple interventions only)
 * - findThreeCopyByLocale — find-3 intro + bullet variant sets
 * - explanationPoolByLocale — return-screen explanations (random pick per intervention)
 * - triangleBreathCopyByLocale — triangle-breath intro + phase labels
 * - uiCopyByLocale — onboarding, trigger, return, paths, about, notifications
 */
import { SimpleInterventionType } from "../interventions/registry";
import { InterventionType } from "../types/domain";
import { getLocales } from "expo-localization";

export type Locale = "en" | "uk";
type Guidance = { actionText: string };

export type FindThreeVariant = {
  items: readonly [string, string, string];
};

function resolveActiveLocale(): Locale {
  const primaryLocale = getLocales()[0];
  const code = (primaryLocale?.languageCode ?? "en").toLowerCase();
  return code === "uk" ? "uk" : "en";
}

export const activeLocale = resolveActiveLocale();

const interventionLabelsByLocale: Record<Locale, Record<InterventionType, string>> = {
  en: {
    feet_on_ground: "Feet on the ground",
    find_three_things: "Find 3 things",
    triangle_breath: "Triangle breath",
    relax_jaw: "Relax your jaw",
    drop_shoulders: "Drop your shoulders",
    notice_three_sounds: "Notice 3 sounds",
    press_palms_together: "Press your palms together",
  },
  uk: {
    feet_on_ground: "Стопи на опорі",
    find_three_things: "Знайди 3 речі",
    triangle_breath: "Трикутне дихання",
    relax_jaw: "Розслаб щелепу",
    drop_shoulders: "Опусти плечі",
    notice_three_sounds: "Почуй 3 звуки",
    press_palms_together: "Склади долоні разом",
  },
};

const guidanceByLocale: Record<Locale, Record<SimpleInterventionType, Guidance>> = {
  en: {
    feet_on_ground: {
      actionText:
        "Place your feet on the ground, notice the pressure under them, take one slow breath",
    },
    relax_jaw: {
      actionText: "Relax your jaw, let it soften, take one slow breath",
    },
    drop_shoulders: {
      actionText: "Drop your shoulders, notice the release",
    },
    notice_three_sounds: {
      actionText: "Notice 3 sounds around you — near, far, subtle",
    },
    press_palms_together: {
      actionText: "Press your palms together gently, feel the warmth and pressure",
    },
  },
  uk: {
    feet_on_ground: {
      actionText:
        "Постав стопи на опору, відчуй тиск під ними, дихай",
    },
    relax_jaw: {
      actionText: "Розслаб щелепу, відпусти напругу, дихай",
    },
    drop_shoulders: {
      actionText: "Опусти плечі, відчуй їх вагу, дихай",
    },
    notice_three_sounds: {
      actionText: "Поміть 3 звуки навколо — близькі, далекі, ледь чутні",
    },
    press_palms_together: {
      actionText: "М'яко склади долоні разом, відчуй тепло та тиск, дихай",
    },
  },
};

/** Seven sets — shape · color · feel. */
const findThreeCopyByLocale: Record<Locale, { intro: string; variants: readonly FindThreeVariant[] }> =
  {
    en: {
      intro: "Find 3 things:",
      variants: [
        { items: ["something round", "something blue", "something soft"] },
        { items: ["something straight", "something green", "something smooth"] },
        { items: ["something still", "something dark", "something calm"] },
        { items: ["something small", "something bright", "something gentle"] },
        { items: ["something familiar", "something warm", "something comfortable"] },
        { items: ["something solid", "something natural", "something steady"] },
        { items: ["something tiny", "something cold", "something quiet"] },
      ],
    },
    uk: {
      intro: "Знайди 3 речі:",
      variants: [
        { items: ["щось кругле", "щось синє", "щось м’яке"] },
        { items: ["щось пряме", "щось зелене", "щось гладке"] },
        { items: ["щось нерухоме", "щось темне", "щось спокійне"] },
        { items: ["щось маленьке", "щось яскраве", "щось ніжне"] },
        { items: ["щось знайоме", "щось тепле", "щось зручне"] },
        { items: ["щось тверде", "щось природне", "щось стійке"] },
        { items: ["щось крихітне", "щось холодне", "щось тихе"] },
      ],
    },
  };

const explanationPoolByLocale: Record<Locale, Record<InterventionType, readonly string[]>> = {
  en: {
    feet_on_ground: [
      "Feeling the ground under your feet helps you feel grounded.",
      "Noticing pressure under your feet helps your attention return.",
      "Feeling your feet on the ground helps your mind settle.",
    ] as const,
    find_three_things: [
      "Noticing nearby objects helps calm your attention.",
      "Looking slowly around helps quiet mental noise.",
      "Simple focus on nearby things interrupts inner noise.",
    ] as const,
    triangle_breath: [
      "A slower breathing rhythm helps your body settle.",
      "Slow breathing quiets the body and creates inner space.",
      "Following a slower breath rhythm softens tension.",
    ] as const,
    relax_jaw: [
      "Releasing your jaw helps the whole body relax.",
      "Softening the jaw reduces overall tension.",
      "Loosening the jaw changes how tension feels in the body.",
    ] as const,
    drop_shoulders: [
      "Letting your shoulders drop reduces stored tension.",
      "Dropping your shoulders can make your body feel lighter.",
      "Feeling your shoulders release helps the body soften.",
    ] as const,
    notice_three_sounds: [
      "Listening to sounds around you helps focus your attention.",
      "Hearing near and far sounds helps break thought loops.",
      "Tuning into ambient sounds quiets repetitive inner noise.",
    ] as const,
    press_palms_together: [
      "Gentle pressure in your palms helps you feel grounded.",
      "Warmth and pressure between your palms bring attention back to the body.",
      "Noticing contact between your hands creates a sense of stability.",
    ] as const,
  },
  uk: {
    feet_on_ground: [
      "Відчуття опори під ногами допомагає відчути стійкість.",
      "Коли помічаєш тиск під стопами, увага повертається.",
      "Відчуття стоп на опорі допомагає заспокоїти думки.",
    ] as const,
    find_three_things: [
      "Коли помічаєш речі поруч, увага заспокоюється.",
      "Повільний погляд навколо допомагає зменшити шум у голові.",
      "Проста увага до речей поруч перериває внутрішній шум.",
    ] as const,
    triangle_breath: [
      "Повільніший ритм дихання допомагає тілу заспокоїтись.",
      "Повільне дихання заспокоює тіло й створює внутрішній простір.",
      "Слідування повільнішому ритму дихання пом'якшує напругу.",
    ] as const,
    relax_jaw: [
      "Коли відпускаєш щелепу, розслабляється все тіло.",
      "Пом'якшення щелепи зменшує загальну напругу.",
      "Розслаблення щелепи змінює відчуття напруги в тілі.",
    ] as const,
    drop_shoulders: [
      "Коли опускаєш плечі, зменшується накопичена напруга.",
      "Коли опускаєш плечі, тіло може відчути легкість.",
      "Коли відчуваєш, як плечі відпускають, тіло м'якшає.",
    ] as const,
    notice_three_sounds: [
      "Слухання звуків навколо допомагає стабілізувати увагу.",
      "Коли чуєш близькі й далекі звуки, легше вийти з кола думок.",
      "Коли вловлюєш звуки довкола, стихає повторюваний внутрішній шум.",
    ] as const,
    press_palms_together: [
      "М'який тиск у долонях дає відчуття опори.",
      "Тепло й тиск між долонями повертають увагу в тіло.",
      "Коли помічаєш контакт між долонями, з'являється відчуття стійкості.",
    ] as const,
  },
};

let lastExplanationByIntervention: Partial<Record<InterventionType, string>> = {};

export type TriangleBreathPhaseLabels = {
  breatheIn: string;
  hold: string;
  breatheOut: string;
};

const triangleBreathCopyByLocale: Record<
  Locale,
  { intro: string; phases: TriangleBreathPhaseLabels }
> = {
  en: {
    intro: "Take 3 deep breaths. Follow the rhythm.",
    phases: {
      breatheIn: "Breathe in",
      hold: "hold",
      breatheOut: "Breathe out",
    },
  },
  uk: {
    intro: "Зроби 3 глибокі вдихи. Слідуй за ритмом.",
    phases: {
      breatheIn: "Вдихни",
      hold: "затримка",
      breatheOut: "Видихни",
    },
  },
};

const uiCopyByLocale: Record<
  Locale,
  {
    onboardingLine: string;
    onboardingSubtitle: string;
    onboardingSteps: readonly [string, string, string];
    triggerPrompt: string;
    keepForMe: string;
    keepForMeSaved: string;
    returnBody: string;
    inactivityNotificationTitle: string;
    inactivityNotificationBody: string;
    aboutLink: string;
    aboutTitle: string;
    aboutParagraphs: readonly string[];
    aboutBack: string;
    aboutVersionPrefix: string;
    pathsLink: string;
    pathsTodayNone: string;
    pathsTodayCountLabel: (count: number) => string;
    pathsSavedLabel: string;
    pathsSavedEmpty: string;
    pathsRemoveSavedA11y: (label: string) => string;
  }
> = {
  en: {
    onboardingLine: "Pulsation exists to bring you back to yourself",
    onboardingSubtitle: "How it works:",
    onboardingSteps: [
      "It stays in the background",
      "It invites you from time to time",
      "Tap the circles to continue",
    ] as const,
    triggerPrompt: "One action for you",
    keepForMe: "Save this for me",
    keepForMeSaved: "Saved",
    returnBody: "You are here",
    inactivityNotificationTitle: "Pulsation",
    inactivityNotificationBody: "One action for you now?",
    aboutLink: "About",
    aboutTitle: "About Pulsation",
    aboutParagraphs: [
      "Pulsation offers short, calming micro-actions when everyday digital use feels like a lot.",
      "If you allow notifications, after some time away the app may send one quiet invitation on this device. Timing adapts gently to your rhythm. No marketing messages.",
      "Pulsation does not read or analyze your other apps.",
      "This is a wellbeing app, not a medical device or substitute for professional care.",
    ] as const,
    aboutBack: "Return",
    aboutVersionPrefix: "Version",
    pathsLink: "Show my paths",
    pathsTodayNone: "No actions for yourself yet today",
    pathsTodayCountLabel: (count) =>
      count === 1 ? "action for yourself today" : "actions for yourself today",
    pathsSavedLabel: "Saved for you:",
    pathsSavedEmpty: "Nothing saved yet. After a return, tap «Save this for me» — it becomes Saved.",
    pathsRemoveSavedA11y: (label) => `Remove ${label}`,
  },
  uk: {
    onboardingLine: "Pulsation допомагає повернутися до себе",
    onboardingSubtitle: "Як це працює:",
    onboardingSteps: [
      "Лишається у фоні",
      "Час від часу запрошує",
      "Торкни кола, щоб продовжити",
    ] as const,
    triggerPrompt: "Одна дія для тебе",
    keepForMe: "Збережи це для мене",
    keepForMeSaved: "збережено",
    returnBody: "Ти тут",
    inactivityNotificationTitle: "Pulsation",
    inactivityNotificationBody: "Одна дія для тебе зараз?",
    aboutLink: "Про застосунок",
    aboutTitle: "Про Pulsation",
    aboutParagraphs: [
      "Pulsation — короткі спокійні дії, коли цифрове навантаження стає занадто великим.",
      "Якщо дозволиш сповіщення, після деякого часу відсутності надійде одне тихе запрошення. Частота м’яко підлаштовується під твій ритм. Без реклами.",
      "Застосунок не читає й не аналізує інші додатки на телефоні.",
      "Це застосунок для добробуту, не медичний виріб і не заміна професійної допомоги.",
    ] as const,
    aboutBack: "Повернутися",
    aboutVersionPrefix: "Версія",
    pathsLink: "Мої шляхи",
    pathsTodayNone: "Сьогодні ще не було закінчених дій",
    pathsTodayCountLabel: (count) => {
      const n = count % 10;
      const n100 = count % 100;
      if (n === 1 && n100 !== 11) return "дія для себе сьогодні";
      if (n >= 2 && n <= 4 && (n100 < 10 || n100 >= 20)) return "дії для себе сьогодні";
      return "дій для себе сьогодні";
    },
    pathsSavedLabel: "Збережені для тебе:",
    pathsSavedEmpty: "Поки нема збережених дій",
    pathsRemoveSavedA11y: (label) => `Прибрати ${label}`,
  },
};

export const interventionCopy = interventionLabelsByLocale[activeLocale];
export const interventionGuidance = guidanceByLocale[activeLocale];
export const uiCopy = uiCopyByLocale[activeLocale];
export const triangleBreathCopy = triangleBreathCopyByLocale[activeLocale];
export const FIND_THREE_VARIANT_COUNT = findThreeCopyByLocale.en.variants.length;

export function getFindThreeIntro(locale: Locale = activeLocale): string {
  return findThreeCopyByLocale[locale].intro;
}

export function getFindThreeVariant(variantIndex: number, locale: Locale = activeLocale): FindThreeVariant {
  const list = findThreeCopyByLocale[locale].variants;
  const normalized = ((variantIndex % list.length) + list.length) % list.length;
  return list[normalized]!;
}

/** Pick 0..n-1, never the same as `lastIndex` when that index is valid. */
export function pickNextFindThreeVariantIndex(lastIndex: number | undefined): number {
  if (
    lastIndex === undefined ||
    lastIndex < 0 ||
    lastIndex >= FIND_THREE_VARIANT_COUNT ||
    !Number.isInteger(lastIndex)
  ) {
    return Math.floor(Math.random() * FIND_THREE_VARIANT_COUNT);
  }
  const candidates = Array.from({ length: FIND_THREE_VARIANT_COUNT }, (_, i) => i).filter(
    (i) => i !== lastIndex,
  );
  return candidates[Math.floor(Math.random() * candidates.length)]!;
}

export function getTriangleBreathPhaseLabels(): TriangleBreathPhaseLabels {
  return triangleBreathCopy.phases;
}

export function pickReturnExplanation(intervention: InterventionType): string | null {
  const pool = explanationPoolByLocale[activeLocale][intervention];
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  const last = lastExplanationByIntervention[intervention];
  const filtered = last ? pool.filter((line) => line !== last) : [...pool];
  const chosen = filtered[Math.floor(Math.random() * filtered.length)] ?? pool[0];
  lastExplanationByIntervention = {
    ...lastExplanationByIntervention,
    [intervention]: chosen,
  };
  return chosen;
}

export const __deliveryLayerCopyForTests = {
  interventionLabelsByLocale,
  guidanceByLocale,
  findThreeCopyByLocale,
  explanationPoolByLocale,
  triangleBreathCopyByLocale,
  uiCopyByLocale,
} as const;
