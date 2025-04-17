import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header} />
      <ScrollView style={styles.contentWrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>

          <Text style={styles.sectionLabel}>General</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("Devices")}
          >
            <View>
              <Text style={styles.optionTitle}>Devices</Text>
              <Text style={styles.optionSubtitle}>
                Manage connected devices
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    height: 120,
    backgroundColor: "#1c1c1d",
  },
  contentWrapper: {
    flex: 1,
    marginTop: -40,
  },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1c1c1d",
    marginBottom: 24,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1c1c1d",
    marginBottom: 10,
  },
  option: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#f5f5f3",
    borderWidth: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1d",
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#28282a",
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: "#28282a",
  },
});
