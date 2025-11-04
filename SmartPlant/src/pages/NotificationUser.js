// pages/NotificationUser.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import BottomNav from "../components/Navigation";
import { useNotifications } from "../firebase/notification_user/useNotification";
import { markNotificationRead } from "../firebase/notification_user/markRead";
import { deleteNotification } from "../firebase/notification_user/deleteNotification";
import { auth } from "../firebase/FirebaseConfig";

const NAV_HEIGHT = 60;      // bottom bar height
const NAV_MARGIN_TOP = 150; // the bar's marginTop in your Navigation.js

export default function NotificationsScreen({ navigation }) {
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const items = useNotifications(userId);

  const newItems  = items.filter(n => !n.read);
  const pastItems = items.filter(n =>  n.read);

  // ---------- helpers ----------
  const formatTime = (ts) => {
    try {
      if (!ts) return "";
      const d =
        ts?.toDate?.() ? ts.toDate() :
        ts?.seconds     ? new Date(ts.seconds * 1000) :
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

  const renderRow = (n) => {
    // Build a prediction array for identify_output regardless of payload shape
    const buildPrediction = (p = {}) => {
      // payload has top_1/2/3 directly
      if (p.top_1 && p.top_2 && p.top_3) {
        return [
          { class: p.top_1?.plant_species ?? "Unknown", confidence: p.top_1?.ai_score ?? 0 },
          { class: p.top_2?.plant_species ?? "Unknown", confidence: p.top_2?.ai_score ?? 0 },
          { class: p.top_3?.plant_species ?? "Unknown", confidence: p.top_3?.ai_score ?? 0 },
        ];
      }
      // payload.model_predictions.{top_1,top_2,top_3}
      if (p.model_predictions?.top_1) {
        const mp = p.model_predictions;
        return [
          { class: mp.top_1?.plant_species ?? "Unknown", confidence: mp.top_1?.ai_score ?? 0 },
          { class: mp.top_2?.plant_species ?? "Unknown", confidence: mp.top_2?.ai_score ?? 0 },
          { class: mp.top_3?.plant_species ?? "Unknown", confidence: mp.top_3?.ai_score ?? 0 },
        ];
      }
      // legacy: label + confidence only
      return [{ class: p.label ?? "Unknown", confidence: p.confidence ?? 0 }];
    };

    // Better list text: prefer payload top-1 when message/title is missing
    const top1Name =
      n?.payload?.model_predictions?.top_1?.plant_species ??
      n?.payload?.top_1?.plant_species ??
      n?.payload?.label ??
      "Unknown";

    const rowTitle = n.title || "Plant Identification Complete";
    const rowMsg   = n.message || top1Name;

    const onPressRow = async () => {
      try { await markNotificationRead(n.id); }
      catch (e) { console.log("mark read failed:", e); }

      if (n.type === "plant_identified") {
        const p = n.payload || {};
        const prediction = buildPrediction(p);
        if (!prediction?.length) {
          Alert.alert("Missing data", "This notification has no prediction data.");
          return;
        }

        // Accept multiple possible keys for uploaded image URL
        const imageURL = p.imageURL || p.ImageURL || p.downloadURL || null;
        const isHttpUrl = (u) => typeof u === "string" && /^https?:\/\//.test(u);


        // Use uploaded image if present; otherwise pass a 1x1 transparent placeholder
        const placeholder =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

        navigation.navigate("IdentifyOutput", {
        prediction,
        imageURI: imageURL || null,
        hasImage: isHttpUrl(imageURL),  // ✅ 新增這個
        fromNotification: true,
        notiId: n.id,
      });

        return;
      }

      // add more types here later...
    };

    return (
      <TouchableOpacity
        key={n.id}
        style={[styles.row, n.read ? styles.rowRead : styles.rowUnread]}
        onPress={onPressRow}
        onLongPress={() => confirmDelete(n)}  // long-press to delete
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

        {/* tiny trash button (alt to long-press) */}
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
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.dots}><View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} /></View>
        </View>

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
  t === "post_like"       ? "Like"  :
  t === "post_comment"    ? "Comment" :
  t === "admin_reply"     ? "Admin" : "Info";

/* ---------- styles ---------- */
const GREEN = "#6EA564";
const BG = "#fefae0";

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: BG },
  scroller: { marginBottom: -NAV_MARGIN_TOP },
  container: { flexGrow: 1, padding: 20 },

  titleRow: { flexDirection: "row", alignItems: "center", marginTop: 40, marginBottom: 12 },
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

  // NEW
  timeText: { marginTop: 6, fontSize: 12, color: "#999" },
  trashBtn: { paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8, alignSelf: "flex-start" },
  trashText: { fontSize: 16 },

  tag: { marginLeft: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "#E7F0E5", color: "#2b2b2b" },
  empty: { textAlign: "center", color: "#666", paddingVertical: 10 },
});
