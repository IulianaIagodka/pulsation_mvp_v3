import { StyleSheet, View } from "react-native";
import { getCappedFontScale } from "../accessibility";
import { uiCopy } from "../../modules/delivery-layer";
import { openFeedbackMail } from "../../services/open-feedback";
import { AboutFooterLink } from "./AboutFooterLink";

const FOOTER_LINK_COUNT = 2;

/** Reserved height for the stacked feedback + back footer on secondary screens. */
export function getSecondaryFooterHeight(fontScale = getCappedFontScale()): number {
  const row = Math.min(Math.max(44 * fontScale, 44), 132);
  return row * FOOTER_LINK_COUNT;
}

type Props = {
  onBack: () => void;
};

/** Shared footer for About / Paths: send feedback, then return. */
export function SecondaryScreenFooter({ onBack }: Props) {
  return (
    <View style={styles.pinnedFooter}>
      <View style={styles.footerStack}>
        <AboutFooterLink
          label={uiCopy.feedbackLink}
          onPress={() => {
            void openFeedbackMail(uiCopy.feedbackMailSubject);
          }}
        />
        <AboutFooterLink label={uiCopy.aboutBack} onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pinnedFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    width: "100%",
  },
  footerStack: {
    alignItems: "center",
    width: "100%",
  },
});
