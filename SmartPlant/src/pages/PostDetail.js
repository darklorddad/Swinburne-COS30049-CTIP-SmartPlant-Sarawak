// pages/PostDetail.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/Navigation";

// notifications
import { addNotification } from "../firebase/notification_user/addNotification";

import { auth, db } from "../firebase/FirebaseConfig";
import { getDisplayName } from "../firebase/UserProfile/getDisplayName";
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
  getDoc,
  getDocs,
} from "firebase/firestore";
import ImageSlideshow from "../components/ImageSlideShow";

const colors = ['#fca5a5', '#16a34a', '#a3e635', '#fef08a', '#c084fc', '#60a5fa', '#f9a8d4'];
const getColorForId = (id) => {
  if (!id) return colors[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const NAV_HEIGHT = 60;      // height of your BottomNav
const NAV_MARGIN_TOP = 150; // its marginTop from Navigation.js

import { TOP_PAD, EXTRA_TOP_SPACE } from "../components/StatusBarManager";

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
  const { postId } = route.params || {};

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  const me = auth.currentUser;
  const myId = me?.uid ?? "anon";

  const [myName, setMyName] = useState(
    me?.displayName || (me?.email ? me.email.split("@")[0] : null) || "User"
  );
  useEffect(() => {
    (async () => {
      const canonical = await getDisplayName(myId, myName);
      setMyName(canonical);
    })();
  }, [myId]);

  const [showComposer, setShowComposer] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [comments, setComments] = useState([]);
  const [userProfiles, setUserProfiles] = useState(new Map());

  const [likeInFlight, setLikeInFlight] = useState(false);

  const postRef = postId ? doc(db, "plant_identify", postId) : null;

  // Live subscribe to post for liked/saved/counts + keep header/meta in sync
  useEffect(() => {
    if (!postRef) return;
    const unsub = onSnapshot(postRef, async (snap) => {
      if (!snap.exists()) {
        setPost(null);
        setLoading(false);
        return;
      };
      const postData = snap.data() || {};
      
      let uploader = {};
      if (postData.user_id) {
        const userRef = doc(db, "account", postData.user_id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          uploader = {
            id: postData.user_id,
            name: userData.full_name || userData.email || "Unknown Uploader",
            profile_picture: userData.profile_pic || null,
          };
        }
      }

      // Construct the final post object
      const imageURIs = Array.isArray(postData.ImageURLs) && postData.ImageURLs.length > 0
        ? postData.ImageURLs
        : (postData.ImageURL ? [postData.ImageURL] : []);

      const fullPost = {
        id: snap.id,
        ...postData,
        uploader,
        author: uploader.name || postData.author_name || "User",
        authorProfilePic: uploader.profile_picture,
        imageURIs: imageURIs,
        time: postData.createdAt?.toMillis?.() ?? (postData.createdAt?.seconds ? postData.createdAt.seconds * 1000 : null),
        liked_by: Array.isArray(postData.liked_by) ? postData.liked_by : [],
        saved_by: Array.isArray(postData.saved_by) ? postData.saved_by : [],
        like_count: typeof postData.like_count === "number" ? postData.like_count : (postData.liked_by?.length || 0),
        saved_count: typeof postData.saved_count === "number" ? postData.saved_count : (postData.saved_by?.length || 0),
      };
      
      setPost(fullPost);
      setLiked(fullPost.liked_by.includes(myId));
      setSaved(fullPost.saved_by.includes(myId));
      setLikeCount(fullPost.like_count);
      setSavedCount(fullPost.saved_count);
      setLoading(false);
    });
    return () => unsub();
  }, [postId, myId]);

  // Fetch user profiles for comments
  useEffect(() => {
    if (!comments.length) return;

    const fetchProfiles = async () => {
      const userIds = [...new Set(comments.map(c => c.user_id).filter(id => !userProfiles.has(id)))];
      if (!userIds.length) return;

      const newProfiles = new Map(userProfiles);
      await Promise.all(userIds.map(async id => {
        const userRef = doc(db, "account", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          newProfiles.set(id, userSnap.data());
        }
      }));
      setUserProfiles(newProfiles);
    };

    fetchProfiles();
  }, [comments]);

  // Live comments
  useEffect(() => {
    if (!postId) return;
    const col = collection(db, "plant_identify", postId, "comments");
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
  }, [postId]);

  // ❤️ Toggle like (like/unlike) atomically with a transaction
  const toggleLike = async () => {
    if (likeInFlight || !postRef) return;
    setLikeInFlight(true);

    // optimistic UI
    const optimisticNext = !liked;
    setLiked(optimisticNext);

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(postRef);
        if (!snap.exists()) return;
        const v = snap.data() || {};
        const likedBy = Array.isArray(v.liked_by) ? v.liked_by : [];
        const already = likedBy.includes(myId);

        if (already === optimisticNext) return;

        tx.update(postRef, {
          liked_by: optimisticNext ? arrayUnion(myId) : arrayRemove(myId),
          like_count: increment(optimisticNext ? 1 : -1),
        });
      });
      if (optimisticNext) {
        notifyOwner("post_like", `${myName} liked your post`, {
          likeCountAfter: likeCount + 1,
        });
      }
    } catch {
      // revert on error
      setLiked(!optimisticNext);
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

    try {
      await updateDoc(postRef, {
        saved_by: nextSaved ? arrayUnion(myId) : arrayRemove(myId),
        saved_count: increment(nextSaved ? 1 : -1),
      });
      if (nextSaved) {
        notifyOwner("post_save", `${myName} saved your post`, {
          savedCountAfter: savedCount + 1,
        });
      }
    } catch {
      // revert
      setSaved(!nextSaved);
      console.log("Failed to update save:", e);
    }
  };

  const onPressCommentIcon = () => setShowComposer((s) => !s);

  const sendComment = async () => {
    const text = comment.trim();
    if (!text || !postId) return;
    setSending(true);
    try {
      const commentsCol = collection(db, "plant_identify", postId, "comments");
      await addDoc(commentsCol, {
        text,
        user_id: myId,
        user_name: myName,
        createdAt: serverTimestamp(),
      });
      await updateDoc(postRef, { comment_count: increment(1) }).catch(() => {});
      notifyOwner("post_comment", `${myName} commented: ${text}`, {
        commentId: ref.id,
        commentText: text,
      });
    } catch {
      // silent
    }
    setComment("");
    setShowComposer(false);
    setSending(false);
  };

    if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: TOP_PAD + EXTRA_TOP_SPACE,
            paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {post.authorProfilePic ? (
              <Image source={{ uri: post.authorProfilePic }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: getColorForId(post.user_id) }]}>
                <Text style={styles.avatarText}>{(post.author || "U").charAt(0)}</Text>
              </View>
            )}
            <View>
              <Text style={styles.name}>{post.author}</Text>
              <Text style={styles.meta}>
                {post.time ? `${timeAgo(post.time)} — ${post.locality || "—"}` : post.locality || "—"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.details}
            onPress={() =>
              navigation.navigate("PlantDetailUser", {
                post: post,
              })
            }
          >
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>
        </View>

        {/* Photo */}
        {post.imageURIs && post.imageURIs.length > 0 ? (
          <ImageSlideshow imageURIs={post.imageURIs} style={styles.photo} />
        ) : (
          <View style={styles.photo} />
        )}

        {/* Caption */}
        {!!post.caption && <Text style={{ marginTop: 10 }}>{post.caption}</Text>}

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
          <Text style={styles.countText}>{comments.length}</Text>

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
            {comments.map((c) => {
              const userProfile = userProfiles.get(c.user_id) || {};
              return (
                <View key={c.id} style={styles.commentRow}>
                  {userProfile.profile_pic ? (
                    <Image source={{ uri: userProfile.profile_pic }} style={styles.commentAvatar} />
                  ) : (
                    <View style={[styles.commentAvatar, { backgroundColor: getColorForId(c.user_id) }]}>
                      <Text style={styles.avatarText}>{(userProfile.full_name || c.user_name || "U").charAt(0)}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{(userProfile && userProfile.full_name) || c.user_name || "User"}</Text>
                      <Text style={styles.commentTime}>{timeAgo(c.createdAtMs)}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8EE" },
  scroller: { marginBottom: -NAV_MARGIN_TOP },
  container: { flexGrow: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#D7E3D8", marginRight: 8, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontSize: 14, fontWeight: "bold" },
  name: { fontWeight: "700" },
  meta: { fontSize: 12, opacity: 0.7, marginBottom: 10 },
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
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#D7E3D8", alignItems: "center", justifyContent: "center" },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAuthor: { fontWeight: "700", color: "#222" },
  commentTime: { fontSize: 12, color: "#666" },
  commentText: { color: "#222", marginTop: 2 },
});
