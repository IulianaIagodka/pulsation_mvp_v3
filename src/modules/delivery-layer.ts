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
        "Place your feet on the floor. Notice the pressure under them. Take one slow breath",
    },
    find_three_things: {
      actionText: "Find 3 things close to you",
    },
    triangle_breath: {
      actionText: "Follow a calm triangle rhythm: inhale 4, hold 2, exhale 5 (x3, ~33s total)",
    },
    relax_jaw: {
      actionText: "Relax your jaw. Let it soften. Take one slow breath",
    },
    drop_shoulders: {
      actionText: "Drop your shoulders. Notice the release",
    },
    notice_three_sounds: {
      actionText: "Notice 3 sounds around you — near, far, subtle",
    },
    press_palms_together: {
      actionText: "Press your palms together gently. Feel the warmth and pressure",
    },
  },
  uk: {
    feet_on_ground: {
      actionText:
        "Постав стопи на підлогу. Відчуй тиск під ними. Дихай",
    },
    find_three_things: {
      actionText: "Знайди 3 речі поруч",
    },
    triangle_breath: {
      actionText: "Дихай спокійним трикутником: вдих 4, затримка 2, видих 5 (x3, ~33 с)",
    },
    relax_jaw: {
      actionText: "Розслаб щелепу. Відпусти напругу. Дихай",
    },
    drop_shoulders: {
      actionText: "Опусти плечі. Відчуй їх вагу. Дихай",
    },
    notice_three_sounds: {
      actionText: "Поміть 3 звуки навколо — близькі, далекі, ледь чутні",
    },
    press_palms_together: {
      actionText: "М'яко склади долоні разом. Відчуй тепло та тиск. Дихай",
    },
  },
};

const explanationPoolByLocale: Record<Locale, Record<InterventionType, readonly string[]>> = {
  en: {
    feet_on_ground: [
      "Feeling the ground under your feet helps you feel grounded.",
      "Noticing pressure under your feet helps your attention return.",
      "Feeling your feet on the floor helps your mind settle.",
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
      "Відчуття стоп на підлозі допомагає заспокоїти думки.",
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
    intro: "Take 3 deep breaths. Follow the triangle.",
    phases: {
      breatheIn: "Breathe in",
      hold: "hold",
      breatheOut: "Breathe out",
    },
  },
  uk: {
    intro: "Зроби 3 цикли дихання. Слідуй за трикутником.",
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
    extendedIntroBody: string;
    extendedFlowLine: string;
    extendedSamplePrompt: string;
    triggerPrompt: string;
    triggerPauseMessage: string;
    triggerAccept: string;
    triggerDecline: string;
    actionDone: string;
    actionSkip: string;
    explanationContinue: string;
    keepForMe: string;
    keepForMeHint: string;
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
    pathsTodayLabel: string;
    pathsTodayNone: string;
    pathsTodayCount: (count: number) => string;
    pathsKeptLabel: string;
    pathsKeptEmpty: string;
  }
> = {
  en: {
    onboardingLine: "Pulsation exists to bring you back to yourself",
    extendedIntroBody:
      "When everything around you feels like too much, Pulsation invites you to one small action — grounding, breath, or noticing what's near.",
    extendedFlowLine: "One gentle prompt. One moment for yourself. A quiet return.",
    extendedSamplePrompt: "tap the spiral",
    triggerPrompt: "One action for you now?",
    triggerPauseMessage: "Not now. You can continue gently",
    triggerAccept: "I can take this moment",
    triggerDecline: "I will stay for now",
    actionDone: "This feels complete",
    actionSkip: "Not this time",
    explanationContinue: "I will carry this with me",
    keepForMe: "Save this for me",
    keepForMeHint: "Saves your preference",
    returnBody: "You are here",
    returnAction: "Return to stillness",
    spiralHint: "tap the spiral",
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
    aboutBack: "Back",
    aboutVersionPrefix: "Version",
    pathsLink: "Show my paths",
    pathsTitle: "Your paths",
    pathsTodayLabel: "Today",
    pathsTodayNone: "No gentle actions yet today",
    pathsTodayCount: (count) =>
      count === 1 ? "1 gentle action today" : `${count} gentle actions today`,
    pathsKeptLabel: "Kept for you",
    pathsKeptEmpty: "Nothing kept yet. After a return, tap «Save this for me».",
  },
  uk: {
    onboardingLine: "Pulsation допомагає повернутися до себе",
    extendedIntroBody:
      "Коли всього навколо стає забагато, Pulsation запрошує до однієї маленької дії — опора, дихання або увага до того, що поруч.",
    extendedFlowLine: "Одне м'яке запрошення. Один момент для себе. Тихе повернення.",
    extendedSamplePrompt: "торкнись спіралі",
    triggerPrompt: "Одна дія для тебе зараз?",
    triggerPauseMessage: "Зараз не час. Можна просто побути",
    triggerAccept: "Можу побути в цьому моменті",
    triggerDecline: "Зараз просто побуду",
    actionDone: "Цього достатньо",
    actionSkip: "Не цього разу",
    explanationContinue: "Візьму це з собою",
    keepForMe: "Збережи це для мене",
    keepForMeHint: "Збереже твоє вподобання",
    returnBody: "Ти тут",
    returnAction: "Повернутися до тиші",
    spiralHint: "торкнись спіралі",
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
    aboutBack: "Назад",
    aboutVersionPrefix: "Версія",
    pathsLink: "Мої шляхи",
    pathsTitle: "Твої шляхи",
    pathsTodayLabel: "Сьогодні",
    pathsTodayNone: "Сьогодні ще не було м'яких дій",
    pathsTodayCount: (count) => {
      const n = count % 10;
      const n100 = count % 100;
      if (n === 1 && n100 !== 11) return "1 м'яка дія сьогодні";
      if (n >= 2 && n <= 4 && (n100 < 10 || n100 >= 20)) return `${count} м'які дії сьогодні`;
      return `${count} м'яких дій сьогодні`;
    },
    pathsKeptLabel: "Залишені для тебе",
    pathsKeptEmpty: "Поки нічого. Після повернення натисни «Збережи це для мене».",
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
