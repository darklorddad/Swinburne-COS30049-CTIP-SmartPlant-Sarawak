// pages/PostDetail.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/Navigation";

import { auth, db } from "../firebase/FirebaseConfig";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
} from "firebase/firestore";

const NAV_HEIGHT = 60;      // height of your BottomNav
const NAV_MARGIN_TOP = 150; // its marginTop from Navigation.js

const TOP_PAD = Platform.OS === "ios" ? 56 : (StatusBar.currentHeight || 0) + 8;

const timeAgo = (dateMs) => {
  if (!dateMs) return "";
  const s = Math.max(1, Math.floor((Date.now() - dateMs) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
};

export default function PostDetail({ navigation, route }) {
  const { post } = route.params || {};

  const me = auth.currentUser;
  const myId = me?.uid ?? "anon";
  const myName = me?.displayName || (me?.email ? me.email.split("@")[0] : null) || "User";

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  const [showComposer, setShowComposer] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [comments, setComments] = useState([]);

  const [likeInFlight, setLikeInFlight] = useState(false);

  const canWrite = Boolean(post?.id);
  const postRef = canWrite ? doc(db, "plant_identify", post.id) : null;

  // Live subscribe to post for liked/saved/counts
  useEffect(() => {
    if (!postRef) return;
    const unsub = onSnapshot(postRef, (snap) => {
      if (!snap.exists()) return;
      const v = snap.data() || {};
      const likedBy = Array.isArray(v.liked_by) ? v.liked_by : [];
      const savedBy = Array.isArray(v.saved_by) ? v.saved_by : [];
      setLiked(likedBy.includes(myId));
      setSaved(savedBy.includes(myId));
      setLikeCount(typeof v.like_count === "number" ? v.like_count : likedBy.length || 0);
      setSavedCount(typeof v.saved_count === "number" ? v.saved_count : savedBy.length || 0);
    });
    return () => unsub();
  }, [postRef, myId]);

  // Live comments
  useEffect(() => {
    if (!canWrite) return;
    const col = collection(db, "plant_identify", post.id, "comments");
    const q = query(col, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => {
        const v = d.data();
        const ms =
          v?.createdAt?.toMillis?.() ??
          (v?.createdAt?.seconds ? v.createdAt.seconds * 1000 : Date.now());
        return {
          id: d.id,
          text: v?.text ?? "",
          user_id: v?.user_id ?? "anon",
          user_name: v?.user_name ?? "User",
          createdAtMs: ms,
        };
      });
      setComments(rows);
    });
    return () => unsub();
  }, [canWrite, post?.id]);

  // ❤️ Toggle like (like/unlike) atomically with a transaction
  const toggleLike = async () => {
    if (likeInFlight || !postRef) return;
    setLikeInFlight(true);

    // optimistic UI
    const optimisticNext = !liked;
    setLiked(optimisticNext);
    setLikeCount((c) => (optimisticNext ? c + 1 : Math.max(0, c - 1)));

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(postRef);
        if (!snap.exists()) return;
        const v = snap.data() || {};
        const likedBy = Array.isArray(v.liked_by) ? v.liked_by : [];
        const already = likedBy.includes(myId);

        if (already === optimisticNext) {
          // server already in same state -> nothing to do
          return;
        }
        tx.update(postRef, {
          liked_by: optimisticNext ? arrayUnion(myId) : arrayRemove(myId),
          like_count: increment(optimisticNext ? 1 : -1),
        });
      });
    } catch (e) {
      // revert on error
      setLiked(!optimisticNext);
      setLikeCount((c) => (optimisticNext ? Math.max(0, c - 1) : c + 1));
      console.log("Failed to toggle like:", e);
    } finally {
      setLikeInFlight(false);
    }
  };

  // 🔖 Save toggle
  const toggleSave = async () => {
    if (!postRef) return;
    const nextSaved = !saved;

    // optimistic UI
    setSaved(nextSaved);
    setSavedCount((c) => (nextSaved ? c + 1 : Math.max(0, c - 1)));

    try {
      await updateDoc(postRef, {
        saved_by: nextSaved ? arrayUnion(myId) : arrayRemove(myId),
        saved_count: increment(nextSaved ? 1 : -1),
      });
    } catch (e) {
      // revert
      setSaved(!nextSaved);
      setSavedCount((c) => (nextSaved ? Math.max(0, c - 1) : c + 1));
      console.log("Failed to update save:", e);
    }
  };

  const onPressCommentIcon = () => setShowComposer((s) => !s);

  const sendComment = async () => {
    const text = comment.trim();
    if (!text || !postRef) return;
    setSending(true);
    try {
      const commentsCol = collection(db, "plant_identify", post.id, "comments");
      await addDoc(commentsCol, {
        text,
        user_id: myId,
        user_name: myName,
        createdAt: serverTimestamp(),
      });
      await updateDoc(postRef, { comment_count: increment(1) }).catch(() => {});
    } catch (e) {
      console.log("Failed to add comment:", e);
    }
    setComment("");
    setShowComposer(false);
    setSending(false);
  };

  const commentCount = comments.length;

  return (
    <View style={styles.background}>
      <ScrollView
        style={styles.scroller} // NEW: cancels raised nav’s marginTop
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: TOP_PAD,
            paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16, // NEW: room for bottom nav
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.name}>{post.uploader?.name || "User"}</Text>
            <Text style={styles.meta}>1d — {post?.locality ?? "—"}</Text>
          </View>
        </View>

        {/* Details button */}
        <View style={styles.detailsRow}>
          <TouchableOpacity
            style={styles.details}
            onPress={() => navigation.navigate("PlantDetailUser", { post })}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>
        </View>

        {/* Photo */}
        {post?.image ? (
          <Image source={{ uri: post.image }} style={styles.photo} />
        ) : (
          <View style={styles.photo} />
        )}

        {/* Caption */}
        {!!post?.caption && <Text style={{ marginTop: 10 }}>{post.caption}</Text>}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={toggleLike}
            disabled={likeInFlight}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={liked ? "heart" : "heart-outline"} size={26} />
          </TouchableOpacity>
          <Text style={styles.countText}>{likeCount}</Text>

          <TouchableOpacity
            onPress={onPressCommentIcon}
            style={{ marginLeft: 18 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={26} />
          </TouchableOpacity>
          <Text style={styles.countText}>{commentCount}</Text>

          <TouchableOpacity
            onPress={toggleSave}
            style={{ marginLeft: 18 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={26} />
          </TouchableOpacity>
          <Text style={styles.countText}>{savedCount}</Text>
        </View>

        {/* Composer */}
        {showComposer && (
          <View style={styles.composer}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Write a comment…"
              placeholderTextColor="#777"
              style={styles.input}
              editable={!sending}
            />
            <TouchableOpacity
              onPress={sendComment}
              style={[styles.sendBtn, sending && { opacity: 0.6 }]}
              disabled={sending}
            >
              <Text style={styles.sendText}>{sending ? "Sending…" : "Send"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <View style={styles.commentsBlock}>
            {comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <View style={styles.commentAvatar} />
                <View style={{ flex: 1 }}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{c.user_name}</Text>
                    <Text style={styles.commentTime}>{timeAgo(c.createdAtMs)}</Text>
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8EE" },

  // NEW: lets the list scroll “under” the raised nav, so you can reach the end
  scroller: { marginBottom: -NAV_MARGIN_TOP },

  container: { flexGrow: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#D7E3D8", marginRight: 8 },
  name: { fontWeight: "700" },
  meta: { fontSize: 12, opacity: 0.7 },
  detailsRow: { marginTop: 10, alignItems: "flex-end" },
  details: { backgroundColor: "#E7F0E5", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  detailsText: { fontWeight: "700" },
  photo: { height: 320, backgroundColor: "#5A7B60", borderRadius: 10, marginTop: 12 },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  countText: { marginLeft: 6, fontSize: 14 },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    padding: 8,
  },
  input: { flex: 1, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  sendBtn: { backgroundColor: "#496D4C", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8 },
  sendText: { color: "#fff", fontWeight: "700" },
  commentsBlock: { marginTop: 14 },
  commentRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#D7E3D8" },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAuthor: { fontWeight: "700", color: "#222" },
  commentTime: { fontSize: 12, color: "#666" },
  commentText: { color: "#222", marginTop: 2 },
});
