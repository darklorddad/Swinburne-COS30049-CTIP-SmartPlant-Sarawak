// src/pages/NotificationExpert.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import BottomNav from "../components/NavigationExpert";
import { auth } from "../firebase/FirebaseConfig";
import { useNotifications } from "../firebase/notification_user/useNotification";
import { markNotificationRead } from "../firebase/notification_user/markRead";
import { deleteNotification } from "../firebase/notification_user/deleteNotification";

const NAV_HEIGHT = 60;
const NAV_MARGIN_TOP = 150;
const GREEN = "#6EA564";
const BG = "#fefae0";

export default function NotificationExpert({ navigation }) {
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const items = useNotifications(userId);
  const newItems = items.filter((n) => !n.read);
  const pastItems = items.filter((n) => n.read);

  // 设置 header（保留 NotificationUser 的样式）
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerShown: true,
      headerTitle: () => (
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#111" }}>
          Notifications
        </Text>
      ),
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: BG },
      headerTintColor: "#333",
      headerRight: () => null, // 删除 filter 菜单
    });
  }, [navigation]);

  const formatTime = (ts) => {
    try {
      if (!ts) return "";
      const d =
        ts?.toDate?.() ? ts.toDate() :
        ts?.seconds ? new Date(ts.seconds * 1000) :
        typeof ts === "number" ? new Date(ts) :
        new Date(ts);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const confirmDelete = (n) => {
    Alert.alert(
      "Delete notification?",
      "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try { await deleteNotification(n.id); }
            catch (e) { console.log("delete failed:", e); }
          },
        },
      ]
    );
  };

  const onPressRow = async (n) => {
    try { await markNotificationRead(n.id); } catch (e) { console.log("mark read failed:", e); }

    if (n.type === "verification_request") {
      const plantId =
        n?.payload?.plantId ||
        n?.payload?.identifyId ||
        n?.payload?.documentId ||
        n?.payload?.id;
      if (!plantId) {
        Alert.alert("Missing data", "This verification request has no plantId in payload.");
        return;
      }
      navigation.navigate("PlantManagementDetail", { id: plantId, fromNotification: true, notiId: n.id });
      return;
    }

    if (n.type === "verification_result") {
      navigation.navigate("PlantManagementDetail", { id: plantId, fromNotification: true, notiId: n.id });
      return;
    }

    const maybePlant =
      n?.payload?.plantId || n?.payload?.identifyId || n?.payload?.postId || n?.payload?.id;
    if (maybePlant) {
      navigation.navigate("PlantManagementDetail", { id: maybePlant, fromNotification: true, notiId: n.id });
      return;
    }

    Alert.alert(n.title || "Notification", n.message || JSON.stringify(n.payload || {}));
  };

  const renderRow = (n) => {
    const rowTitle =
      n.title ||
      (n.type === "verification_request"
        ? "Verification request"
        : n.type || "Notification");
    const rowMsg =
      n.message || (n.payload && JSON.stringify(n.payload)).slice(0, 80) || "";

    return (
      <TouchableOpacity
        key={n.id}
        style={[styles.row, n.read ? styles.rowRead : styles.rowUnread]}
        onPress={() => onPressRow(n)}
        onLongPress={() => confirmDelete(n)}
        delayLongPress={300}
        activeOpacity={0.8}
      >
        <View style={[styles.leftDot, !n.read && styles.leftDotActive]} />

        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>{rowTitle}</Text>
          <Text style={styles.rowMsg} numberOfLines={2}>{rowMsg}</Text>
          <Text style={styles.timeText}>{formatTime(n.createdAt)}</Text>
        </View>

        <Text style={styles.tag}>{tag(n.type)}</Text>

        <TouchableOpacity onPress={() => confirmDelete(n)} style={styles.trashBtn}>
          <Text style={styles.trashText}>🗑️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.background}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* New Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              {newItems.length || 0} New Notifications
            </Text>
          </View>
          <View style={styles.rowsWrap}>
            {newItems.length ? (
              newItems.map(renderRow)
            ) : (
              <Text style={styles.empty}>No new notifications</Text>
            )}
          </View>
        </View>

        {/* Past Section */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Past Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {pastItems.length ? (
              pastItems.map(renderRow)
            ) : (
              <Text style={styles.empty}>No past notifications</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const tag = (t) =>
  t === "verification_request"
    ? "Verify"
    : t === "verification_result"
    ? "Result"
    : t === "post_like"
    ? "Like"
    : t === "post_save"
    ? "Save"
    : t === "post_comment"
    ? "Comment"
    : "Info";

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: BG },
  scroller: { marginBottom: -NAV_MARGIN_TOP },
  container: { flexGrow: 1, padding: 20 },
  section: { marginTop: 10, marginBottom: 18 },
  lastSection: { marginBottom: 0 },
  sectionHeader: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderText: { color: "#fff", fontWeight: "800" },
  rowsWrap: { rowGap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  rowUnread: { borderWidth: 1.5, borderColor: GREEN },
  rowRead: { opacity: 0.65 },
  leftDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#cfcfcf",
  },
  leftDotActive: { backgroundColor: GREEN },
  rowTitle: { fontWeight: "700", color: "#111" },
  rowMsg: { color: "#444", marginTop: 2 },
  timeText: { marginTop: 6, fontSize: 12, color: "#999" },
  trashBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  trashText: { fontSize: 16 },
  tag: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#E7F0E5",
    color: "#2b2b2b",
  },
  empty: { textAlign: "center", color: "#666", paddingVertical: 10 },
});
