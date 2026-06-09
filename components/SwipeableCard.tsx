import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
};

const SWIPE_THRESHOLD = -80;

export function SwipeableCard({ children, onDelete }: Props) {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_THRESHOLD) {
        runOnJS(onDelete)();
      }
      translateX.value = withSpring(0);
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
