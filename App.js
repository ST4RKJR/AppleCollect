import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const BASKET_WIDTH = 110;
const BASKET_HEIGHT = 70;
const APPLE_SIZE = 44;
const FALL_SPEED = 4.5;
const SPAWN_INTERVAL = 1400;

export default function App() {
  const [basketX, setBasketX] = useState((screenWidth - BASKET_WIDTH) / 2);
  const [apples, setApples] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(60);
    const subscription = Accelerometer.addListener(({ x }) => {
      if (gameOver) return;
      const tilt = x * 38;
      setBasketX((prev) => {
        const newX = prev + tilt;
        return Math.max(0, Math.min(screenWidth - BASKET_WIDTH, newX));
      });
    });
    return () => subscription.remove();
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setApples((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * (screenWidth - APPLE_SIZE - 40) + 20,
          y: -APPLE_SIZE,
        },
      ]);
    }, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setApples((current) =>
        current
          .map((a) => ({ ...a, y: a.y + FALL_SPEED }))
          .filter((apple) => {
            const appleBottom = apple.y + APPLE_SIZE;
            const basketTop = screenHeight - BASKET_HEIGHT - 30;
            const basketLeft = basketX;
            const basketRight = basketX + BASKET_WIDTH;

            if (
              appleBottom >= basketTop &&
              apple.x + APPLE_SIZE > basketLeft &&
              apple.x < basketRight
            ) {
              scoreRef.current += 1;
              setScore(scoreRef.current);
              return false;
            }

            if (appleBottom >= screenHeight) {
              setGameOver(true);
              return false;
            }
            return true;
          })
      );
    }, 30);
    return () => clearInterval(interval);
  }, [basketX, gameOver]);

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    setApples([]);
    setBasketX((screenWidth - BASKET_WIDTH) / 2);
  };

  if (gameOver) {
    return (
      <TouchableWithoutFeedback onPress={restartGame}>
        <View style={styles.container}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <Text style={styles.finalScore}>Score: {score}</Text>
          <Text style={styles.tapToRestart}>Tap to Restart</Text>
          <StatusBar style="light" />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>Score: {score}</Text>
      <Text style={styles.instruction}>Tilt phone to move</Text>

      {apples.map((apple) => (
        <View
          key={apple.id}
          style={[styles.apple, { left: apple.x, top: apple.y }]}
        >
          <View style={styles.appleStem} />
          <View style={styles.appleHighlight} />
        </View>
      ))}

      <View style={[styles.basket, { left: basketX }]}>
        <View style={styles.basketRim} />
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  scoreText: {
    position: "absolute",
    top: 50,
    left: 20,
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    fontFamily: "System",
    zIndex: 10,
  },
  instruction: {
    position: "absolute",
    top: 90,
    alignSelf: "center",
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  basket: {
    position: "absolute",
    bottom: 30,
    width: BASKET_WIDTH,
    height: BASKET_HEIGHT,
    backgroundColor: "#D2691E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 6,
    borderColor: "#8B4513",
    borderBottomWidth: 0,
  },
  basketRim: {
    position: "absolute",
    top: -12,
    left: 10,
    right: 10,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#A0522D",
    borderWidth: 4,
    borderColor: "#654321",
  },
  apple: {
    position: "absolute",
    width: APPLE_SIZE,
    height: APPLE_SIZE,
    backgroundColor: "#FF2D00",
    borderRadius: APPLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  appleStem: {
    position: "absolute",
    top: 4,
    width: 4,
    height: 10,
    backgroundColor: "#8B4513",
    borderRadius: 2,
  },
  appleHighlight: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 12,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 6,
  },
  gameOverText: {
    position: "absolute",
    top: screenHeight / 2 - 90,
    alignSelf: "center",
    fontSize: 56,
    fontWeight: "bold",
    color: "#FFF",
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
  },
  finalScore: {
    position: "absolute",
    top: screenHeight / 2 - 10,
    alignSelf: "center",
    fontSize: 36,
    color: "#FFFF00",
    fontWeight: "bold",
  },
  tapToRestart: {
    position: "absolute",
    top: screenHeight / 2 + 50,
    alignSelf: "center",
    fontSize: 20,
    color: "#FFF",
    opacity: 0.9,
  },
});