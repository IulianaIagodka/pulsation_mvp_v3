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
    },
    find_three_things: {
      actionText: "Find 3 things close to you",
    },
    triangle_breath: {
      actionText: "Follow a calm triangle rhythm: inhale 4, hold 2, exhale 5, hold 2 (x3, ~39s total)",
    },
  },
  uk: {
    feet_on_ground: {
      actionText:
        "Постав ноги на підлогу. Відчуй опору під ними. Зроби один повільний видих",
    },
    find_three_things: {
      actionText: "Знайди 3 речі близько",
    },
    triangle_breath: {
      actionText: "Дихай спокійним трикутником: вдих 4, затримка 2, видих 5, затримка 2 (x3, ~39 с)",
    },
  },
};

const EXPLANATION_SHOW_CHANCE = 0.65;
const MAX_CONSECUTIVE_HIDDEN_EXPLANATIONS = 2;

const explanationPoolByLocale: Record<Locale, Record<InterventionType, readonly string[]>> = {
  en: {
    triangle_breath: [
      "Slow breathing helps the body settle.",
      "A slower rhythm can quiet internal noise.",
      "A calm breath can help create space inside.",
    ] as const,
    feet_on_ground: [
      "Feeling the ground under you can help create stability.",
      "Small physical sensations help bring attention back.",
      "Noticing pressure and weight can help you settle.",
    ] as const,
    find_three_things: [
      "Looking around slowly helps attention settle.",
      "Noticing nearby things can interrupt overload.",
      "Simple sensory focus can help bring you back to the moment.",
    ] as const,
  },
  uk: {
    triangle_breath: [
      "Повільне дихання допомагає тілу стишитись.",
      "Повільніший ритм може приглушити внутрішній шум.",
      "Спокійний подих створює трохи більше простору всередині.",
    ] as const,
    feet_on_ground: [
      "Відчуття опори під ногами додає стійкості.",
      "Малі тілесні відчуття м'яко повертають увагу.",
      "Коли помічаєш тиск і вагу, легше стишитись.",
    ] as const,
    find_three_things: [
      "Повільний погляд навколо допомагає увазі заспокоїтись.",
      "Коли помічаєш речі поруч, напруга слабшає.",
      "Проста увага до відчутного м'яко повертає в цей момент.",
    ] as const,
  },
};

let lastExplanationByIntervention: Partial<Record<InterventionType, string>> = {};
let consecutiveHiddenExplanations = 0;
let hasShownAnyReturnExplanation = false;

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

export function pickReturnExplanation(intervention: InterventionType): string | null {
  const shouldHide = hasShownAnyReturnExplanation ? Math.random() > EXPLANATION_SHOW_CHANCE : false;
  if (shouldHide && consecutiveHiddenExplanations < MAX_CONSECUTIVE_HIDDEN_EXPLANATIONS) {
    consecutiveHiddenExplanations += 1;
    return null;
  }

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
  hasShownAnyReturnExplanation = true;
  consecutiveHiddenExplanations = 0;
  return chosen;
}

export function getDeliveryContent(intervention: InterventionType) {
  return {
    title: interventionCopy[intervention],
    prompt: uiCopy.triggerPrompt,
  };
}
