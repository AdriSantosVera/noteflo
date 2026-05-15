import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#67E8F9",
        tabBarInactiveTintColor: "#7C879C",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: "#070A12",
          borderTopColor: "rgba(255,255,255,0.08)",
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="notas/index"
        options={{
          title: "Notas",
        }}
      />

      <Tabs.Screen
        name="checklists/index"
        options={{
          title: "Checklists",
        }}
      />

      <Tabs.Screen
        name="ideas/index"
        options={{
          title: "Ideas",
        }}
      />

      <Tabs.Screen
        name="notas/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="checklists/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="ideas/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
