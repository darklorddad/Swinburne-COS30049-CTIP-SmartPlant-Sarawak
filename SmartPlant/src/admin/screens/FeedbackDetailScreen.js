// admin/screens/FeedbackDetailScreen.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { BackIcon, TrashIcon } from '../Icons';
import { useAdminContext } from '../AdminContext';
import AdminBottomNavBar from '../components/AdminBottomNavBar';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/FirebaseConfig";
import { addNotification } from "../../firebase/notification_user/addNotification";
import { getDisplayName } from "../../firebase/UserProfile/getDisplayName";
import { getDocs, where } from "firebase/firestore";

const NAV_BOTTOM = 60; // match your bottom nav height if different adjust

const FeedbackDetailScreen = ({ route, navigation }) => {
  const { feedback: initialFeedback } = route.params;
  const { feedbacks, users, handleDeleteFeedback } = useAdminContext();
  const feedback = feedbacks.find(f => f.id === initialFeedback.id) || initialFeedback;

  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const me = auth.currentUser;
  const myId = me?.uid;
  const myName = me?.displayName || (me?.email ? me.email.split("@")[0] : "Admin");

  // listen live conversation
  useEffect(() => {
    if (!feedback?.id) { setLoading(false); return; }
    let unsub = null;
    setLoading(true);

    const listen = async () => {
      try {
        const col = collection(db, "error_reports", feedback.id, "messages");
        const q = query(col, orderBy("createdAt", "asc"));
        unsub = onSnapshot(q, (snap) => {
          const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setMessages(rows);
          // small delay to allow render then scroll
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }, (e) => {
          console.error("messages onSnapshot error", e);
        });
      } catch (e) {
        console.error("listen messages failed", e);
      } finally {
        setLoading(false);
      }
    };
    listen();
    return () => { if (unsub) unsub(); };
  }, [feedback?.id]);

  const onDelete = (id) => {
    handleDeleteFeedback(id);
    navigation.goBack();
  };

  const robustOwnerId = (f) => {
    // try common fields. adjust if your schema differs.
    return f?.user_id || f?.userUid || f?.uid || f?.ownerUid || f?.user?.uid || f?.userId || null;
  };

  // replace sendReply function in admin/screens/FeedbackDetailScreen.js
const sendReply = async () => {
  const t = String(replyText || "").trim();
  if (!t || !feedback?.id || sending) return;
  setSending(true);
  setReplyText("");

  try {
    // optimistic UI
    const localMsg = {
      id: `local-${Date.now()}`,
      from: "admin",
      senderId: myId,
      senderName: myName,
      text: t,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      _optimistic: true,
    };
    setMessages(prev => [...prev, localMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    // write message to subcollection
    const colRef = collection(db, "error_reports", feedback.id, "messages");
    await addDoc(colRef, {
      from: "admin",
      senderId: myId,
      senderName: myName,
      text: t,
      createdAt: serverTimestamp(),
    });

    // update parent doc (summary, unread flag)
    const parentRef = doc(db, "error_reports", feedback.id);
    await updateDoc(parentRef, {
      admin_notes: t,
      lastReplyAt: serverTimestamp(),
      user_unread: true,
    }).catch(()=>{});

    // === NEW: re-fetch parent doc from Firestore to get authoritative user_id/email ===
    let ownerId = null;
    try {
      const parentSnap = await getDoc(parentRef);
      if (parentSnap.exists()) {
        const pd = parentSnap.data();
        console.log("[sendReply] freshly fetched parent doc:", pd);
        // try multiple candidate fields
        ownerId =
          pd.user_id || pd.userUid || pd.uid || pd.ownerUid || pd.user?.uid || pd.userId || null;
        // also check email fields if needed
        if (!ownerId) {
          const email = pd.user_email || pd.userEmail || pd.email || null;
          if (email) {
            // lookup account by email
            try {
              const accountsCol = collection(db, "account");
              const q = query(accountsCol, where("email", "==", email));
              const snaps = await getDocs(q);
              if (!snaps.empty) {
                ownerId = snaps.docs[0].id;
                console.log("[sendReply] found ownerId by email lookup:", ownerId);
                // optional: write canonical user_id back to parent so next time it's present
                await updateDoc(parentRef, { user_id: ownerId }).catch(()=>{});
              } else {
                console.warn("[sendReply] no account doc found for email:", email);
              }
            } catch (e) {
              console.error("[sendReply] account lookup by email failed:", e);
            }
          }
        }
      } else {
        console.warn("[sendReply] parent doc missing unexpectedly:", feedback.id);
      }
    } catch (e) {
      console.error("[sendReply] failed to read parent doc:", e);
    }

    console.log("[sendReply] resolved ownerId:", ownerId, "adminId:", myId, "feedbackId:", feedback.id);

    // call addNotification only if ownerId exists and is not admin
    if (ownerId && ownerId !== myId) {
      try {
        const canonical = await getDisplayName(myId, myName);
        console.log("[sendReply] calling addNotification with userId:", ownerId);
        const notiId = await addNotification({
          userId: ownerId,
          type: "admin_reply",
          title: `${canonical} replied to your report`,
          message: t.length > 120 ? `${t.slice(0,117)}...` : t,
          payload: { reportId: feedback.id, actorId: myId, actorName: canonical, replyText: t },
        });
        console.log("[sendReply] addNotification returned id:", notiId);
      } catch (e) {
        console.error("[sendReply] addNotification threw:", e);
      }
    } else {
      console.warn("[sendReply] ownerId missing or same as admin. notification skipped.");
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  } catch (e) {
    console.error("send reply failed", e);
    Alert.alert("Failed to send reply");
    setMessages(prev => prev.filter(m => !m._optimistic));
  } finally {
    setSending(false);
  }
};
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackIcon color="#3C3633" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feedback Detail</Text>
          <TouchableOpacity onPress={() => onDelete(feedback.id)} style={styles.actionButton}>
            <TrashIcon color="#ef4444" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: NAV_BOTTOM + 140 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.card}>
            <Text style={styles.subject}>{feedback.title ?? feedback.report_type ?? 'Feedback'}</Text>
            <Text style={styles.body}>{feedback.details ?? feedback.description ?? ''}</Text>
          </View>

          <View style={styles.chatContainer}>
            {messages.length === 0 ? (
              <Text style={styles.noMsgText}>No conversation yet.</Text>
            ) : (
              messages.map(m => {
                const isMyMessage = m.senderId === myId;
                const timeText = m.createdAt?.seconds
                  ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString()
                  : m.createdAt? (new Date(m.createdAt).toLocaleTimeString?.() || "") : "";
                return (
                  <View key={m.id} style={[styles.msgRow, isMyMessage ? styles.msgRowRight : styles.msgRowLeft]}>
                    {!isMyMessage && (
                      <View style={styles.msgAvatar}>
                        <Text style={styles.msgAvatarText}>{(m.senderName || "U").charAt(0)}</Text>
                      </View>
                    )}
                    <View style={[styles.bubble, isMyMessage ? styles.bubbleRight : styles.bubbleLeft]}>
                      <Text style={styles.bubbleText}>{m.text}</Text>
                      <Text style={styles.bubbleTime}>{timeText}</Text>
                    </View>
                    {isMyMessage && (
                      <View style={styles.adminAvatar}>
                        <Text style={{ color: "#fff", fontWeight: "700" }}>YOU</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        <View style={[styles.inputBar, { bottom: NAV_BOTTOM }]}>
          <TextInput
            placeholder="Type your reply..."
            value={replyText}
            onChangeText={setReplyText}
            style={styles.input}
            multiline
            editable={!sending}
          />
          <TouchableOpacity onPress={sendReply} style={[styles.sendBtn, sending && { opacity: 0.6 }]} disabled={sending}>
            <Text style={styles.sendText}>{sending ? "Sending..." : "Send"}</Text>
          </TouchableOpacity>
        </View>

        <AdminBottomNavBar navigation={navigation} activeScreen="FeedbackManagement" />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  actionButton: { padding: 8 },

  scrollContent: { padding: 12 },
  card: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12 },
  subject: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  body: { color: '#333' },

  chatContainer: { marginTop: 8 },
  noMsgText: { textAlign: "center", color: "#666", paddingVertical: 12 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },

  msgAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D7E3D8', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  msgAvatarText: { color: '#fff', fontWeight: '700' },

  adminAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  bubble: { maxWidth: '75%', padding: 10, borderRadius: 12 },
  bubbleLeft: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  bubbleRight: { backgroundColor: '#F0FDF4', alignItems: 'flex-end' },

  bubbleText: { color: '#111' },
  bubbleTime: { fontSize: 10, color: '#666', marginTop: 6 },

  inputBar: { position: 'absolute', left: 0, right: 0, padding: 10, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#FFFBF5', flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: 'white', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  sendBtn: { backgroundColor: '#A59480', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  sendText: { color: '#fff', fontWeight: '700' },
});

export default FeedbackDetailScreen;
