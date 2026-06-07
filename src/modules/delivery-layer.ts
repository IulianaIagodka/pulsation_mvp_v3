import { InterventionType } from "../types/domain";
import { getLocales } from "expo-localization";

type Locale = "en" | "uk";
type Guidance = { actionText: string };

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

const guidanceByLocale: Record<Locale, Record<InterventionType, Guidance>> = {
  en: {
    feet_on_ground: {
      actionText:
        "Place your feet on the ground, notice the pressure under them, take one slow breath",
    },
    find_three_things: {
      actionText: "Find 3 things",
    },
    triangle_breath: {
      actionText: "Follow a calm triangle rhythm — inhale 4, hold 2, exhale 5 (×3, ~33s total)",
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
    find_three_things: {
      actionText: "Знайди 3 речі",
    },
    triangle_breath: {
      actionText: "Дихай спокійним трикутником — вдих 4, затримка 2, видих 5 (×3, ~33 с)",
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
    intro: "Take 3 deep breaths, follow the triangle",
    phases: {
      breatheIn: "Breathe in",
      hold: "hold",
      breatheOut: "Breathe out",
    },
  },
  uk: {
    intro: "Зроби 3 цикли дихання, слідуй за трикутником",
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
    onboardingSteps: readonly [string, string, string, string];
    onboardingSpiralHint: string;
    triggerPrompt: string;
    triggerPauseMessage: string;
    triggerAccept: string;
    triggerDecline: string;
    actionDone: string;
    actionSkip: string;
    explanationContinue: string;
    keepForMe: string;
    keepForMeSaved: string;
    returnBody: string;
    returnAction: string;
    spiralHint: string;
    inactivityNotificationTitle: string;
    inactivityNotificationBody: string;
    aboutLink: string;
    aboutTitle: string;
    aboutParagraphs: readonly string[];
    aboutBack: string;
    aboutVersionPrefix: string;
    pathsLink: string;
    pathsTitle: string;
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
      "Simply exists in the background",
      "One gentle invitation",
      "One small action for you",
      "A quiet return — «you are here»",
    ] as const,
    onboardingSpiralHint: "Tap the circles — it's the button here",
    triggerPrompt: "One action for you",
    triggerPauseMessage: "Not now, you can continue gently",
    triggerAccept: "I can take this moment",
    triggerDecline: "I will stay for now",
    actionDone: "This feels complete",
    actionSkip: "Not this time",
    explanationContinue: "I will carry this with me",
    keepForMe: "Save this for me",
    keepForMeSaved: "Saved",
    returnBody: "You are here",
    returnAction: "Return to stillness",
    spiralHint: "tap to continue",
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
    pathsTitle: "Your paths",
    pathsTodayNone: "No actions for yourself yet today",
    pathsTodayCountLabel: (count) =>
      count === 1 ? "action for yourself today" : "actions for yourself today",
    pathsSavedLabel: "Saved for you",
    pathsSavedEmpty: "Nothing saved yet. After a return, tap «Save this for me» — it becomes Saved.",
    pathsRemoveSavedA11y: (label) => `Remove ${label}`,
  },
  uk: {
    onboardingLine: "Pulsation допомагає повернутися до себе",
    onboardingSubtitle: "Як це працює:",
    onboardingSteps: [
      "Просто існує у фоні",
      "Одне м’яке запрошення",
      "Одна маленька дія для тебе",
      "Коротке повернення — «ти тут»",
    ] as const,
    onboardingSpiralHint: "Торкнися кіл — це кнопка тут",
    triggerPrompt: "Одна дія для тебе",
    triggerPauseMessage: "Зараз не час. Можна просто побути",
    triggerAccept: "Можу побути в цьому моменті",
    triggerDecline: "Зараз просто побуду",
    actionDone: "Цього достатньо",
    actionSkip: "Не цього разу",
    explanationContinue: "Візьму це з собою",
    keepForMe: "Збережи це для мене",
    keepForMeSaved: "збережено",
    returnBody: "Ти тут",
    returnAction: "Повернутися до тиші",
    spiralHint: "торкнись, щоб продовжити",
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
    pathsTitle: "Твої шляхи",
    pathsTodayNone: "Сьогодні ще не було дій для себе",
    pathsTodayCountLabel: (count) => {
      const n = count % 10;
      const n100 = count % 100;
      if (n === 1 && n100 !== 11) return "дія для себе сьогодні";
      if (n >= 2 && n <= 4 && (n100 < 10 || n100 >= 20)) return "дії для себе сьогодні";
      return "дій для себе сьогодні";
    },
    pathsSavedLabel: "Збережені для тебе",
    pathsSavedEmpty: "Поки нічого збережено. Після повернення натисни «Збережи це для мене» — стане Збережено.",
    pathsRemoveSavedA11y: (label) => `Прибрати ${label}`,
  },
};

export const interventionCopy = interventionLabelsByLocale[activeLocale];
export const interventionGuidance = guidanceByLocale[activeLocale];
export const uiCopy = uiCopyByLocale[activeLocale];
export const triangleBreathCopy = triangleBreathCopyByLocale[activeLocale];

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
