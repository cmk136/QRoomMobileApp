import React, { useEffect, useRef } from "react";
import { AppState, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AppContextProvider } from "./src/context/AppContext";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast from 'react-native-toast-message';

export default function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground");
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <AppContextProvider>
        <AppNavigator />
        <Toast />
      </AppContextProvider>
    </NavigationContainer>
  );
}
