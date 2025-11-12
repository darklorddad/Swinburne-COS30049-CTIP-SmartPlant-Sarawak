// src/pages/UserFeedbackDetail.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/FirebaseConfig";
import { TOP_PAD } from "../components/StatusBarManager";

export default function UserFeedbackDetail({ route }) {
  const { reportId } = route.params || {};
  const [report, setReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const me = auth.currentUser;
  const myId = me?.uid;
  const myName = me?.email ? me.email.split("@")[0] : "User";

  // load report meta
  useEffect(() => {
    if (!reportId) return;
    const fetch = async () => {
      const snap = await getDoc(doc(db, "error_reports", reportId));
      if (snap.exists()) setReport({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetch();
  }, [reportId]);

  // live listen to messages
  useEffect(() => {
    if (!reportId) return;
    const q = query(
      collection(db, "error_reports", reportId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(rows);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => unsub();
  }, [reportId]);

  const sendReply = async () => {
    const text = replyText.trim();
    if (!text || !reportId || sending) return;
    setSending(true);
    setReplyText("");
    try {
      const colRef = collection(db, "error_reports", reportId, "messages");
      await addDoc(colRef, {
        from: "user",
        senderId: myId,
        senderName: myName,
        text,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "error_reports", reportId), {
        lastUserReplyAt: serverTimestamp(),
        admin_unread: true,
      });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error("send reply failed", e);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.background}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: TOP_PAD, // 顶部留白
            paddingBottom: 80,   // 不贴底
          }}
        >
          <View style={styles.card}>
            <Text style={styles.subject}>{report?.title || "Report"}</Text>
            <Text style={styles.meta}>
              Submitted:{" "}
              {report?.createdAt?.seconds
                ? new Date(report.createdAt.seconds * 1000).toLocaleString()
                : "—"}
            </Text>
            <Text style={styles.label}>Details</Text>
            <Text style={styles.body}>{report?.details || "—"}</Text>
          </View>

          {/* 聊天气泡 */}
          <View style={{ marginTop: 10 }}>
            {messages.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#666" }}>
                No conversation yet.
              </Text>
            ) : (
              messages.map((m) => {
                const isUser = m.from === "user";
                return (
                  <View
                    key={m.id}
                    style={[
                      styles.msgRow,
                      isUser ? styles.msgRowRight : styles.msgRowLeft,
                    ]}
                  >
                    {!isUser && (
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>A</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.bubbleRight : styles.bubbleLeft,
                      ]}
                    >
                      <Text style={styles.bubbleText}>{m.text}</Text>
                      <Text style={styles.timeText}>
                        {m.createdAt?.seconds
                          ? new Date(
                              m.createdAt.seconds * 1000
                            ).toLocaleTimeString()
                          : ""}
                      </Text>
                    </View>
                    {isUser && (
                      <View style={styles.avatarSelf}>
                        <Text style={styles.avatarText}>U</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>

          {/* 输入框 */}
          <View style={styles.replyBox}>
            <TextInput
              style={styles.input}
              placeholder="Reply to admin..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, !replyText.trim() && { opacity: 0.5 }]}
              onPress={sendReply}
              disabled={!replyText.trim()}
            >
              <Text style={styles.sendText}>
                {sending ? "Sending..." : "Send"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFFBF5" },
  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  subject: { fontSize: 18, fontWeight: "700" },
  meta: { fontSize: 12, color: "#666", marginBottom: 6 },
  label: { fontWeight: "700", marginTop: 6 },
  body: { marginTop: 4, color: "#222" },

  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
  },
  msgRowLeft: { justifyContent: "flex-start" },
  msgRowRight: { justifyContent: "flex-end" },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#A7BDAA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  avatarSelf: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6EA564",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  avatarText: { color: "#fff", fontWeight: "700" },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
  },
  bubbleLeft: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
  bubbleRight: { backgroundColor: "#DCFCE7" },
  bubbleText: { color: "#111" },
  timeText: { fontSize: 10, color: "#666", marginTop: 4, textAlign: "right" },

  replyBox: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  input: { minHeight: 40, maxHeight: 120 },
  sendBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
    backgroundColor: "#6EA564",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sendText: { color: "#fff", fontWeight: "700" },
});
