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
        "Place your feet on the floor. Notice the pressure under them. Take one slow breath.",
      explanationText: "Noticing the floor under you helps you settle.",
    },
    find_three_things: {
      actionText:
        "Find three things around you:\n- something round\n- something soft\n- something still",
      explanationText:
        "Looking for shapes, textures or stillness\ngrounds your nervous system in the present.",
    },
    triangle_breath: {
      actionText: "Follow a calm triangle rhythm: inhale, pause, exhale, each side unhurried.",
      explanationText:
        "A simple breath pattern can quiet internal noise and help your nervous system return to balance.",
    },
  },
  uk: {
    feet_on_ground: {
      actionText:
        "Постав стопи на підлогу. Відчуй тиск під ними. Зроби один повільний вдих.",
      explanationText: "Коли відчуваєш підлогу під собою, стає легше заспокоїтись.",
    },
    find_three_things: {
      actionText:
        "Знайди три речі навколо себе:\n- щось кругле\n- щось м’яке\n- щось нерухоме",
      explanationText: "Пошук форм, текстур чи нерухомості\nм’яко заземлює нервову систему в теперішньому.",
    },
    triangle_breath: {
      actionText: "Пройди спокійний трикутник дихання: вдих, пауза, видих — повільно й м’яко.",
      explanationText:
        "Простий дихальний ритм заспокоює систему та допомагає повернути відчуття внутрішньої рівноваги.",
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
    triggerPauseMessage: "Not now. You can continue gently.",
    triggerAccept: "I can take this moment",
    triggerDecline: "I will stay for now",
    actionDone: "This feels complete",
    actionSkip: "Not this time",
    explanationContinue: "I will carry this with me",
    returnBody: "You are here. Continue when it feels right.",
    returnAction: "Return to stillness",
    spiralHint: "tap the spiral",
    aboutLink: "About",
    aboutTitle: "About Pulsation",
    aboutParagraphs: [
      "Pulsation offers short, calming micro-actions when everyday digital use feels like a lot.",
      "After onboarding, the app invites you to one gentle action and quietly picks among three micro-interventions based on your recent use, stored only on this device.",
      "Pulsation does not read or analyze your other apps.",
      "This is a wellbeing app, not a medical device or substitute for professional care.",
    ] as const,
    aboutBack: "Back",
    aboutVersionPrefix: "Version",
  },
  uk: {
    onboardingLine: "Pulsation існує, щоб повертати тебе до себе",
    triggerPrompt: "Одна дія для тебе зараз?",
    triggerPauseMessage: "Зараз не час. Можна просто побути.",
    triggerAccept: "Я можу взяти цей момент",
    triggerDecline: "Зараз я просто побуду",
    actionDone: "Цього достатньо",
    actionSkip: "Не цього разу",
    explanationContinue: "Я візьму це з собою",
    returnBody: "Ти вже тут. Продовжуй, коли відчуєш готовність.",
    returnAction: "Повернутися до тиші",
    spiralHint: "торкнись спіралі",
    aboutLink: "Про застосунок",
    aboutTitle: "Про Pulsation",
    aboutParagraphs: [
      "Pulsation пропонує короткі заспокійливі дії, коли щоденне перебування в цифрі відчувається надмірним.",
      "Після онбордингу застосунок запрошує до однієї м’якої дії й тихо обирає одну з трьох мікроінтервенцій з урахуванням недавнього досвіду — лише на цьому пристрої.",
      "Pulsation не читає й не аналізує інші твої додатки.",
      "Це застосунок для добробуту, а не медичний пристрій і не заміна професійної допомоги.",
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
