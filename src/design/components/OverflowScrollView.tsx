import { useCallback, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from "react-native";
import { contentOverflows, getVerticalContentPadding } from "../overflow-scroll";

type Props = ScrollViewProps;

/** Scrolls only when content exceeds the viewport; otherwise a fixed View (no drift / indicator). */
export function OverflowScrollView({
  onLayout,
  onContentSizeChange,
  showsVerticalScrollIndicator,
  scrollEnabled: scrollEnabledProp,
  bounces: bouncesProp,
  alwaysBounceVertical = false,
  overScrollMode: overScrollModeProp,
  contentContainerStyle,
  children,
  style,
  pointerEvents,
  ...props
}: Props) {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);
  const [nativeContentHeight, setNativeContentHeight] = useState(0);
  const padding = getVerticalContentPadding(contentContainerStyle);
  const innerScrollableHeight = innerHeight + padding.top + padding.bottom;
  const scrollableHeight = Math.max(nativeContentHeight, innerScrollableHeight);
  const measured = viewportHeight > 0 && scrollableHeight > 0;
  const overflows = measured && contentOverflows(viewportHeight, scrollableHeight);
  const scrollEnabled = scrollEnabledProp ?? overflows;
  const showIndicator = showsVerticalScrollIndicator ?? overflows;
  const bounces = bouncesProp ?? overflows;
  const overScrollMode = overScrollModeProp ?? (overflows ? "auto" : "never");

  const handleLayout = useCallback<NonNullable<ScrollViewProps["onLayout"]>>(
    (event) => {
      setViewportHeight(event.nativeEvent.layout.height);
      onLayout?.(event);
    },
    [onLayout],
  );

  const handleContentSizeChange = useCallback<NonNullable<ScrollViewProps["onContentSizeChange"]>>(
    (width, height) => {
      setNativeContentHeight(height);
      onContentSizeChange?.(width, height);
    },
    [onContentSizeChange],
  );

  const handleInnerLayout = useCallback((event: LayoutChangeEvent) => {
    setInnerHeight(event.nativeEvent.layout.height);
  }, []);

  return (
    <ScrollView
      {...props}
      style={style}
      pointerEvents={pointerEvents}
      onLayout={handleLayout}
      onContentSizeChange={handleContentSizeChange}
      contentContainerStyle={contentContainerStyle}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={showIndicator}
      alwaysBounceVertical={alwaysBounceVertical}
      bounces={bounces}
      overScrollMode={overScrollMode}
      nestedScrollEnabled={overflows}
    >
      <View onLayout={handleInnerLayout} style={styles.innerMeasure}>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  innerMeasure: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 0,
  },
});
