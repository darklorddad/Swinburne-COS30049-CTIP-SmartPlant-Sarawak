// src/pages/NotificationUser.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/FirebaseConfig";
import BottomNav from "../components/Navigation";
import { useNotifications } from "../firebase/notification_user/useNotification";
import { markNotificationRead } from "../firebase/notification_user/markRead";
import { deleteNotification } from "../firebase/notification_user/deleteNotification";

const NAV_HEIGHT = 60;      // bottom bar height
const NAV_MARGIN_TOP = 150; // the bar's marginTop in your Navigation.js
const GREEN = "#6EA564";
const BG = "#fefae0";

export default function NotificationsScreen({ navigation }) {
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const items = useNotifications(userId);

  // filter state (all | plant | post | admin)
  const [filter, setFilter] = React.useState("all");
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const headerText = `Notifications${filter !== "all" ? ` • ${filterLabel(filter)}` : ""}`;
    const fontSize = 23;

    navigation.setOptions({
      headerLeft: () => null,
      headerShown: true,
      headerTitle: () => (
        <Text style={{ fontSize, fontWeight: "bold", color: "#111" }} numberOfLines={1} ellipsizeMode="tail">
          {headerText}
        </Text>
      ),
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: BG },
      headerTintColor: "#333",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setMenuOpen((s) => !s)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ marginRight: 16 }}
        >
          <View style={{ flexDirection: "row", columnGap: 6 }}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, filter]);

  React.useEffect(() => {
    console.log("[NotificationUser] auth.currentUser:", auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null);
    console.log("[NotificationUser] useNotifications items count:", items.length);
  }, [items]);

  // ---------- helpers ----------
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
            catch (e) { console.log("delete failed:", e); Alert.alert("Delete failed"); }
          },
        },
      ]
    );
  };

  // filter application
  const applyFilter = (rows) => {
    switch (filter) {
      case "plant":
        return rows.filter((n) => n.type === "plant_identified" || n.type === "verification_result" || n.type === "verification_request");
      case "post":
        return rows.filter((n) => n.type === "post_like" || n.type === "post_comment" || n.type === "post_save");
      case "admin":
        return rows.filter((n) => n.type === "admin_reply");
      default:
        return rows;
    }
  };
  const filtered  = applyFilter(items);
  const newItems  = filtered.filter(n => !n.read);
  const pastItems = filtered.filter(n =>  n.read);

  // Build prediction array helper (copied/kept from your previous logic)
  const buildPrediction = (p = {}) => {
    if (p.top_1 && p.top_2 && p.top_3) {
      return [
        { class: p.top_1?.plant_species ?? "Unknown", confidence: p.top_1?.ai_score ?? 0 },
        { class: p.top_2?.plant_species ?? "Unknown", confidence: p.top_2?.ai_score ?? 0 },
        { class: p.top_3?.plant_species ?? "Unknown", confidence: p.top_3?.ai_score ?? 0 },
      ];
    }
    if (p.model_predictions?.top_1) {
      const mp = p.model_predictions;
      return [
        { class: mp.top_1?.plant_species ?? "Unknown", confidence: mp.top_1?.ai_score ?? 0 },
        { class: mp.top_2?.plant_species ?? "Unknown", confidence: mp.top_2?.ai_score ?? 0 },
        { class: mp.top_3?.plant_species ?? "Unknown", confidence: mp.top_3?.ai_score ?? 0 },
      ];
    }
    return [{ class: p.label ?? "Unknown", confidence: p.confidence ?? 0 }];
  };

  // row press handler
  const onPressRow = async (n) => {
    try {
      await markNotificationRead(n.id);
    } catch (e) {
      console.log("mark read failed:", e);
    }

    // 1) plant_identified -> IdentifyOutput (keep existing behavior)
    if (n.type === "plant_identified") {
      const p = n.payload || {};
      const prediction = buildPrediction(p);

      const imageURLs =
        Array.isArray(p.imageURLs) ? p.imageURLs :
        Array.isArray(p.ImageURLs) ? p.ImageURLs :
        p.imageURL  ? [p.imageURL]  :
        p.ImageURL  ? [p.ImageURL]  :
        p.downloadURL ? [p.downloadURL] : [];

      navigation.navigate("IdentifyOutput", {
        prediction,
        imageURI: imageURLs,
        hasImage: imageURLs.length > 0,
        fromNotification: true,
        notiId: n.id,
      });
      return;
    }

    // 2) verification_result -> try to go to PostDetail if postId present; otherwise PlantManagementDetail
    if (n.type === "verification_result") {
      const payload = n.payload || {};
      const postId = payload.postId || payload.post_id || null;
      const plantIdentifyId = payload.plantIdentifyId || payload.plantIdentifyID || payload.plantIdentifyId || payload.plantIdentify || null;

      if (postId) {
        navigation.navigate("PostDetail", { postId });
        return;
      }

      if (plantIdentifyId) {
        navigation.navigate("PlantManagementDetail", { id: plantIdentifyId, fromNotification: true, notiId: n.id });
        return;
      }

      // fallback: just show message
      Alert.alert(n.title || "Notification", n.message || JSON.stringify(payload || {}));
      return;
    }

    // 3) verification_request -> open PlantManagementDetail to verify (expert only)
    if (n.type === "verification_request") {
      const plantId =
        n?.payload?.plantIdentifyId ||
        n?.payload?.plantId ||
        n?.payload?.identifyId ||
        n?.payload?.id;
      if (!plantId) {
        Alert.alert("Missing data", "This verification request has no plantId in payload.");
        return;
      }
      navigation.navigate("PlantManagementDetail", { id: plantId, fromNotification: true, notiId: n.id });
      return;
    }

    // 4) post interactions -> open PostDetail
    if (n.type === "post_like" || n.type === "post_save" || n.type === "post_comment") {
      const postId = n?.payload?.postId;
      if (!postId) {
        Alert.alert("Missing post", "This notification has no postId.");
        return;
      }
      navigation.navigate("PostDetail", { postId });
      return;
    }

    // 5) admin replies -> open feedback detail if payload.reportId
    if (n.type === "admin_reply") {
      const reportId = n?.payload?.reportId;
      if (!reportId) {
        Alert.alert("Missing report", "This notification has no reportId.");
        return;
      }
      navigation.navigate("UserFeedbackDetail", { reportId } );
      return;
    }

    // default
    Alert.alert(n.title || "Notification", n.message || JSON.stringify(n.payload || {}));
  };

  const renderRow = (n) => {
    const top1Name =
      n?.payload?.model_predictions?.top_1?.plant_species ??
      n?.payload?.top_1?.plant_species ??
      n?.payload?.label ??
      "Unknown";

    const rowTitle = n.title || (n.type === "plant_identified" ? "Plant Identification Complete" : "Notification");
    const rowMsg =
      (n.type?.startsWith("post_") && n?.payload?.actorName && n.message
        ? n.message.replace(/^[^ ]+/, n.payload.actorName)
        : n.message) ||
      top1Name;

    return (
      <TouchableOpacity
        key={n.id}
        style={[styles.row, n.read ? styles.rowRead : styles.rowUnread]}
        onPress={() => onPressRow(n)}
        onLongPress={() => confirmDelete(n)}
        delayLongPress={300}
        activeOpacity={0.7}
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
        contentContainerStyle={[styles.container, { paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* tiny popup menu */}
        {menuOpen && (
          <>
            <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuOpen(false)} />
            <View style={styles.menu}>
              {[
                { key: "all",   label: "All" },
                { key: "plant", label: "Plant identification" },
                { key: "post",  label: "Post interactions" },
                { key: "admin", label: "Admin replies" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.menuItem, filter === opt.key && styles.menuItemActive]}
                  onPress={() => { setFilter(opt.key); setMenuOpen(false); }}
                >
                  <Text style={styles.menuItemText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* New */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{newItems.length || 0} New Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {newItems.length ? newItems.map(renderRow) : <Text style={styles.empty}>No new notifications</Text>}
          </View>
        </View>

        {/* Past */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Past Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {pastItems.length ? pastItems.map(renderRow) : <Text style={styles.empty}>No past notifications</Text>}
          </View>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const tag = (t) =>
  t === "plant_identified" ? "Plant" :
  t === "verification_result" ? "Plant" :
  t === "verification_request" ? "Verify" :
  t === "post_like"       ? "Like"  :
  t === "post_save"       ? "Save"  :
  t === "post_comment"    ? "Comment" :
  t === "admin_reply"     ? "Admin" : "Info";

const filterLabel = (f) =>
  f === "plant" ? "Plant" :
  f === "post"  ? "Post"  :
  f === "admin" ? "Admin" : "All";

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: BG },
  scroller: { marginBottom: -NAV_MARGIN_TOP },
  container: { flexGrow: 1, padding: 20 },

  titleRow: { flexDirection: "row", alignItems: "center", marginTop: 40, marginBottom: 12, position: "relative" },
  title: { fontSize: 26, fontWeight: "bold", color: "#111" },
  dots: { marginLeft: "auto", flexDirection: "row", columnGap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#e5e2db" },

  section: { marginTop: 10, marginBottom: 18 },
  lastSection: { marginBottom: 0 },
  sectionHeader: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 8, alignItems: "center", marginBottom: 12 },
  sectionHeaderText: { color: "#fff", fontWeight: "800" },

  rowsWrap: { rowGap: 10 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 12 },
  rowUnread: { borderWidth: 1.5, borderColor: GREEN },
  rowRead: { opacity: 0.65 },
  leftDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10, backgroundColor: "#cfcfcf" },
  leftDotActive: { backgroundColor: GREEN },

  rowTitle: { fontWeight: "700", color: "#111" },
  rowMsg: { color: "#444", marginTop: 2 },

  // dots button & popup
  dotsBtn: { marginLeft: "auto" , zIndex: 60 },
  menuBackdrop: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40,
  },
  menu: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 50,
  },
  menuItem: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  menuItemActive: { backgroundColor: "#E7F0E5" },
  menuItemText: { color: "#222" },

  // NEW
  timeText: { marginTop: 6, fontSize: 12, color: "#999" },
  trashBtn: { paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8, alignSelf: "flex-start" },
  trashText: { fontSize: 16 },

  tag: { marginLeft: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "#E7F0E5", color: "#2b2b2b" },
  empty: { textAlign: "center", color: "#666", paddingVertical: 10 },
});
