import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppContextProvider } from "./src/context/AppContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <AppContextProvider>
        <AppNavigator />
      </AppContextProvider>
    </NavigationContainer>
  );
}
