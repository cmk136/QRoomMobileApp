import React, { useEffect, useRef } from "react";
import { AppState, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AppContextProvider } from "./src/context/AppContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("🔄 App has come to the foreground");
        // TODO: Trigger logic here when app resumes
        // e.g., refresh unlock status, refresh token, recheck user session
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
      </AppContextProvider>
    </NavigationContainer>
  );
}
