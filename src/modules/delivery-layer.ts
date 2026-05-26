import { InterventionType } from "../types/domain";
import { getLocales } from "expo-localization";

type Locale = "en" | "uk";
type Guidance = { actionText: string; explanationText: string };

function resolveActiveLocale(): Locale {
  const primaryLocale = getLocales()[0];
  const code = (primaryLocale?.languageCode ?? "en").toLowerCase();
  return code === "uk" ? "uk" : "en";
}

export const activeLocale = resolveActiveLocale();

const interventionLabelsByLocale: Record<Locale, Record<InterventionType, string>> = {
  en: {
    feet_on_ground: "Feet on ground",
    find_three_things: "Find 3 things",
    triangle_breath: "Triangle breath",
  },
  uk: {
    feet_on_ground: "Стопи на опорі",
    find_three_things: "Знайди 3 речі",
    triangle_breath: "Трикутне дихання",
  },
};

const guidanceByLocale: Record<Locale, Record<InterventionType, Guidance>> = {
  en: {
    feet_on_ground: {
      actionText:
        "Place your feet on the floor. Notice the pressure under them. Take one slow breath",
      explanationText: "Noticing the floor under you helps you settle",
    },
    find_three_things: {
      actionText:
        "Find three things around you:\n- something round\n- something soft\n- something still",
      explanationText:
        "Looking for shapes, textures or stillness\ngrounds your nervous system in the present",
    },
    triangle_breath: {
      actionText: "Follow a calm triangle rhythm: inhale, pause, exhale, each side unhurried",
      explanationText:
        "A simple breath pattern can quiet internal noise and help your nervous system return to balance",
    },
  },
  uk: {
    feet_on_ground: {
      actionText:
        "Постав ноги на підлогу. Відчуй опору під ними. Зроби один повільний видих",
      explanationText: "Коли відчуваєш підлогу, легше заспокоїтись",
    },
    find_three_things: {
      actionText:
        "Знайди поруч три речі:\n- щось кругле\n- щось м’яке\n- щось нерухоме",
      explanationText: "Коли шукаєш форми, фактури чи нерухомість,\nнервова система м’яко повертається в теперішнє",
    },
    triangle_breath: {
      actionText: "Дихай спокійним трикутником: вдих, пауза, видих — без поспіху",
      explanationText: "Простий ритм дихання заспокоює й повертає відчуття рівноваги",
    },
  },
};

const uiCopyByLocale: Record<
  Locale,
  {
    onboardingLine: string;
    triggerPrompt: string;
    triggerPauseMessage: string;
    triggerAccept: string;
    triggerDecline: string;
    actionDone: string;
    actionSkip: string;
    explanationContinue: string;
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
  }
> = {
  en: {
    onboardingLine: "Pulsation exists to bring you back to yourself",
    triggerPrompt: "One action for you now?",
    triggerPauseMessage: "Not now. You can continue gently",
    triggerAccept: "I can take this moment",
    triggerDecline: "I will stay for now",
    actionDone: "This feels complete",
    actionSkip: "Not this time",
    explanationContinue: "I will carry this with me",
    returnBody: "You are here",
    returnAction: "Return to stillness",
    spiralHint: "tap the spiral",
    inactivityNotificationTitle: "Pulsation",
    inactivityNotificationBody: "One action for you now?",
    aboutLink: "About",
    aboutTitle: "About Pulsation",
    aboutParagraphs: [
      "Pulsation offers short, calming micro-actions when everyday digital use feels like a lot.",
      "If you allow notifications, after about 20 minutes away the app may send one quiet reminder on this device. No marketing messages.",
      "Pulsation does not read or analyze your other apps.",
      "This is a wellbeing app, not a medical device or substitute for professional care.",
    ] as const,
    aboutBack: "Back",
    aboutVersionPrefix: "Version",
  },
  uk: {
    onboardingLine: "Pulsation допомагає повернутися до себе",
    triggerPrompt: "Одна дія зараз?",
    triggerPauseMessage: "Зараз не час. Можна просто побути",
    triggerAccept: "Можу взяти цей момент",
    triggerDecline: "Зараз просто побуду",
    actionDone: "Цього достатньо",
    actionSkip: "Не цього разу",
    explanationContinue: "Візьму це з собою",
    returnBody: "Ти тут",
    returnAction: "Повернутися до тиші",
    spiralHint: "торкнись спіралі",
    inactivityNotificationTitle: "Pulsation",
    inactivityNotificationBody: "Одна дія зараз?",
    aboutLink: "Про застосунок",
    aboutTitle: "Про Pulsation",
    aboutParagraphs: [
      "Pulsation — короткі спокійні дії, коли цифрове навантаження стає занадто великим.",
      "Якщо дозволиш сповіщення, після близько 20 хвилин відсутності надійде одне тихе нагадування. Без реклами.",
      "Застосунок не читає й не аналізує інші додатки на телефоні.",
      "Це застосунок для добробуту, не медичний виріб і не заміна професійної допомоги.",
    ] as const,
    aboutBack: "Назад",
    aboutVersionPrefix: "Версія",
  },
};

export const interventionCopy = interventionLabelsByLocale[activeLocale];
export const interventionGuidance = guidanceByLocale[activeLocale];
export const uiCopy = uiCopyByLocale[activeLocale];

export function getDeliveryContent(intervention: InterventionType) {
  return {
    title: interventionCopy[intervention],
    prompt: uiCopy.triggerPrompt,
  };
}
