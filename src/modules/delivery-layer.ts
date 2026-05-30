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
      actionText: "Follow a calm triangle rhythm: inhale 4, hold 2, exhale 5, hold 2 (x3, ~39s total)",
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
        "Постав стопи на підлогу. Відчуй тиск під стопами. Зроби один повільний видих",
    },
    find_three_things: {
      actionText: "Знайди 3 речі поруч",
    },
    triangle_breath: {
      actionText: "Дихай спокійним трикутником: вдих 4, затримка 2, видих 5, затримка 2 (x3, ~39 с)",
    },
    relax_jaw: {
      actionText: "Розслаб щелепу. Відпусти напругу. Зроби один повільний видих",
    },
    drop_shoulders: {
      actionText: "Опусти плечі. Відчуй, як відпускає",
    },
    notice_three_sounds: {
      actionText: "Почуй 3 звуки навколо — близькі, далекі, ледь чутні",
    },
    press_palms_together: {
      actionText: "М'яко склади долоні разом. Відчуй тепло та тиск",
    },
  },
};

const explanationPoolByLocale: Record<Locale, Record<InterventionType, readonly string[]>> = {
  en: {
    feet_on_ground: [
      "Feeling the ground beneath you creates stability. Contact brings your attention back to the body.",
      "Noticing pressure under your feet steadies you. Physical contact helps attention return.",
      "The floor supports you. Sensation in your feet helps your mind settle.",
    ] as const,
    find_three_things: [
      "Noticing nearby objects helps settle attention. It eases mental overwhelm.",
      "Looking slowly at things around you steadies attention. It quiets the noise in your head.",
      "Simple focus on what's nearby helps attention settle. It interrupts inner chatter.",
    ] as const,
    triangle_breath: [
      "A slower breathing rhythm helps the body settle. It helps your nervous system settle.",
      "Slow breathing helps the body quiet down. A calmer rhythm creates space inside.",
      "Following a slower breath rhythm helps the body settle. It softens tension inside.",
    ] as const,
    relax_jaw: [
      "Releasing jaw tension can quiet the rest of the body. A small release in the jaw can ease tension throughout.",
      "Softening the jaw helps your whole body settle. A small release in the face shifts overall tension.",
      "Letting the jaw loosen helps the body settle. It can change how tension feels in the body.",
    ] as const,
    drop_shoulders: [
      "Letting shoulders drop reduces stored physical tension. The body can soften.",
      "Dropping the shoulders eases stored tension. You may feel a little lighter.",
      "Feeling the shoulders release eases tension you're holding there. The body moves toward ease.",
    ] as const,
    notice_three_sounds: [
      "Listening to surrounding sounds steadies attention. It interrupts looping thoughts.",
      "Hearing sounds near and far steadies attention. It breaks looping mental patterns.",
      "Tuning into ambient sounds settles attention. It quiets repetitive inner noise.",
    ] as const,
    press_palms_together: [
      "Gentle pressure in the hands helps you feel grounded. It brings attention back into the body.",
      "Feeling warmth and pressure between the palms helps you feel grounded. It brings attention into the body.",
      "Noticing contact between the hands creates stability. Attention returns through physical sensation.",
    ] as const,
  },
  uk: {
    feet_on_ground: [
      "Відчуття опори під ногами додає стійкості. Увага повертається через контакт із підлогою.",
      "Коли помічаєш тиск під стопами, легше стояти на землі. Тіло м'яко повертає увагу.",
      "Підлога тримає. Відчуття в стопах допомагає заспокоїтись.",
    ] as const,
    find_three_things: [
      "Коли помічаєш речі поруч, увага заспокоюється. Це зменшує зайвий шум у голові.",
      "Повільний погляд на речі навколо повертає увагу. Це полегшує розгулянулість.",
      "Проста увага до речей поруч заспокоює. Це перериває внутрішній шум.",
    ] as const,
    triangle_breath: [
      "Повільний ритм дихання допомагає тілу заспокоїтись. Це дає простір нервовій системі.",
      "Повільне дихання допомагає тілу заспокоїтись. Спокійніший ритм створює простір всередині.",
      "Коли слідуєш повільнішому ритму дихання, тіло заспокоюється. Це пом'якшує внутрішню напругу.",
    ] as const,
    relax_jaw: [
      "Коли відпускає напруга в щелепі, решта тіла заспокоюється. Маленьке розслаблення в обличчі зменшує загальну напругу.",
      "Коли щелепа пом'якшується, все тіло заспокоюється. Невелике розслаблення в обличчі змінює напругу в тілі.",
      "Коли щелепа розслаблюється, тіло заспокоюється. Розслаблення в обличчі змінює відчуття напруги.",
    ] as const,
    drop_shoulders: [
      "Коли плечі опускаються, зникає накопичена напруга. Тіло стає легшим.",
      "Коли опускаєш плечі, відпускає накопичена напруга. Тіло може перейти в м'якший стан.",
      "Коли відчуваєш, як плечі відпускають, зменшується напруга в них. Тіло відпускає.",
    ] as const,
    notice_three_sounds: [
      "Слухання звуків навколо повертає увагу. Це перериває зациклені думки.",
      "Коли чуєш звуки близько і далеко, увага фіксується. Це збиває хід думок.",
      "Коли вловлюєш звуки навколо, увага заспокоюється. Це перериває внутрішній монолог.",
    ] as const,
    press_palms_together: [
      "М'який тиск у долонях дає відчуття опори. Увага повертається в тіло.",
      "Коли відчуваєш тепло і тиск між долонями, з'являється опора. Увага повертається в тіло.",
      "Коли помічаєш контакт між долонями, з'являється стійкість. Увага повертається через тілесне відчуття.",
    ] as const,
  },
};

let lastExplanationByIntervention: Partial<Record<InterventionType, string>> = {};

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
      "If you allow notifications, after some time away the app may send one quiet invitation on this device. Timing adapts gently to your rhythm. No marketing messages.",
      "Pulsation does not read or analyze your other apps.",
      "This is a wellbeing app, not a medical device or substitute for professional care.",
    ] as const,
    aboutBack: "Back",
    aboutVersionPrefix: "Version",
  },
  uk: {
    onboardingLine: "Pulsation допомагає повернутися до себе",
    triggerPrompt: "Одна дія для тебе зараз?",
    triggerPauseMessage: "Зараз не час. Можна просто побути",
    triggerAccept: "Можу побути в цьому моменті",
    triggerDecline: "Зараз просто побуду",
    actionDone: "Цього достатньо",
    actionSkip: "Не цього разу",
    explanationContinue: "Візьму це з собою",
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
  },
};

export const interventionCopy = interventionLabelsByLocale[activeLocale];
export const interventionGuidance = guidanceByLocale[activeLocale];
export const uiCopy = uiCopyByLocale[activeLocale];

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

export function getDeliveryContent(intervention: InterventionType) {
  return {
    title: interventionCopy[intervention],
    prompt: uiCopy.triggerPrompt,
  };
}
