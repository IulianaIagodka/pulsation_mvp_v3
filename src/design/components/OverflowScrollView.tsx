import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  contentOverflows,
  getVerticalContentPadding,
  shouldShowScrollOverflowHint,
} from "../overflow-scroll";
import { colors } from "../tokens";

type Props = ScrollViewProps;

const BOTTOM_FADE_HEIGHT = 36;

/** Scrolls only when content exceeds the viewport; soft bottom fade when more content hides below. */
export function OverflowScrollView({
  onLayout,
  onContentSizeChange,
  onScroll,
  showsVerticalScrollIndicator,
  scrollEnabled: scrollEnabledProp,
  bounces: bouncesProp,
  alwaysBounceVertical = false,
  overScrollMode: overScrollModeProp,
  contentContainerStyle,
  children,
  style,
  pointerEvents,
  scrollEventThrottle = 32,
  ...props
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const hasFlashedIndicatorsRef = useRef(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);
  const [nativeContentHeight, setNativeContentHeight] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const padding = getVerticalContentPadding(contentContainerStyle);
  const innerScrollableHeight = innerHeight + padding.top + padding.bottom;
  const scrollableHeight = Math.max(nativeContentHeight, innerScrollableHeight);
  const measured = viewportHeight > 0 && scrollableHeight > 0;
  const overflows = measured && contentOverflows(viewportHeight, scrollableHeight);
  const scrollEnabled = scrollEnabledProp ?? overflows;
  const showIndicator = showsVerticalScrollIndicator ?? overflows;
  const bounces = bouncesProp ?? overflows;
  const overScrollMode = overScrollModeProp ?? (overflows ? "auto" : "never");
  const showBottomHint = shouldShowScrollOverflowHint(
    overflows,
    scrollOffsetY,
    viewportHeight,
    scrollableHeight,
  );

  useEffect(() => {
    if (!overflows) {
      hasFlashedIndicatorsRef.current = false;
      return;
    }
    if (hasFlashedIndicatorsRef.current) return;
    hasFlashedIndicatorsRef.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.flashScrollIndicators?.();
    });
  }, [overflows]);

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

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollOffsetY(event.nativeEvent.contentOffset.y);
      onScroll?.(event);
    },
    [onScroll],
  );

  const handleInnerLayout = useCallback((event: LayoutChangeEvent) => {
    setInnerHeight(event.nativeEvent.layout.height);
  }, []);

  return (
    <View style={[styles.root, style]} pointerEvents={pointerEvents}>
      <ScrollView
        {...props}
        ref={scrollRef}
        style={styles.scroll}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={contentContainerStyle}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={showIndicator}
        indicatorStyle="white"
        persistentScrollbar={overflows}
        alwaysBounceVertical={alwaysBounceVertical}
        bounces={bounces}
        overScrollMode={overScrollMode}
        nestedScrollEnabled={overflows}
      >
        <View onLayout={handleInnerLayout} style={styles.innerMeasure}>
          {children}
        </View>
      </ScrollView>
      {showBottomHint ? (
        <LinearGradient
          pointerEvents="none"
          colors={["transparent", colors.backgroundPrimary]}
          style={styles.bottomFade}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  innerMeasure: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 0,
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_FADE_HEIGHT,
  },
});
