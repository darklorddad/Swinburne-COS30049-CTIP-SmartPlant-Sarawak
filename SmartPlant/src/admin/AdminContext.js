import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { db } from '../firebase/FirebaseConfig';
import { Alert } from 'react-native';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { firebaseConfig } from '../firebase/FirebaseConfig';

const AdminContext = createContext();

export const useAdminContext = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [mails, setMails] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [plantIdentities, setPlantIdentities] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [favourites, setFavourites] = useState([]);
  const favouritesRef = useRef(favourites);

  useEffect(() => {
    favouritesRef.current = favourites;
  }, [favourites]);

  useEffect(() => {
    if (users.length > 0) {
      setUsers(currentUsers =>
        currentUsers.map(user => ({
          ...user,
          favourite: favourites.includes(user.id),
        }))
      );
    }
  }, [favourites]);

  const getTimeGroup = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'Older';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mailDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (mailDate.getTime() === today.getTime()) return 'Today';
    if (mailDate.getTime() === yesterday.getTime()) return 'Yesterday';

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    if (mailDate > oneWeekAgo) return 'This Week';

    return 'Older';
  };

  useEffect(() => {
    const fs = getFirestore();
    const auth = getAuth();

    let unsubscribeFavourites = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (adminUser) => {
      unsubscribeFavourites(); // Clean up old listener
      if (adminUser) {
        const prefRef = doc(fs, 'admin_preferences', adminUser.uid);
        unsubscribeFavourites = onSnapshot(prefRef, (docSnap) => {
          setFavourites(docSnap.exists() ? docSnap.data().favourite_users || [] : []);
        });
      } else {
        setFavourites([]); // Clear on logout
      }
    });

    // Accounts
    const unsubscribeUsers = onSnapshot(collection(fs, 'account'), async (snapshot) => {
      const userDocs = await getDocs(collection(fs, 'user'));
      const userMap = new Map();
      userDocs.forEach(doc => userMap.set(doc.id, doc.data()));

      const usersData = snapshot.docs.map((docSnap, index) => {
        const data = docSnap.data();
        const userData = userMap.get(data.user_id) || {};
        return {
          id: docSnap.id,
          firebase_uid: userData.firebase_uid,
          name: data.full_name || 'Unnamed User',
          status: data.is_active ? 'active' : 'inactive',
          favourite: favouritesRef.current.includes(docSnap.id),
          color: ['#fca5a5', '#16a34a', '#a3e635', '#fef08a', '#c084fc', '#60a5fa', '#f9a8d4'][index % 7],
          details: {
            ...data,
            role: data.role,
            email: data.email,
            contact: data.phone_number || 'N/A',
            address: data.address || 'N/A',
            gender: data.gender || 'N/A',
            age: data.date_of_birth
              ? new Date().getFullYear() - new Date(data.date_of_birth).getFullYear()
              : 'N/A',
            plantId: data.plantId || 0,
          },
        };
      });
      setUsers(usersData);
    });

    // Notifications / mails
    const mailQuery = query(collection(fs, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribeMails = onSnapshot(mailQuery, (snapshot) => {
      setMails(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            timeGroup: getTimeGroup(data.createdAt),
          };
        }),
      );
    });

    // --- FEEDBACKS: merge legacy `report` + new `error_reports` into one list ---

    // Helper to normalize feedback shapes for UI
    const normalizeFeedback = (docSnap, v, source) => {
      return {
        id: docSnap.id,
        // Screens expect these keys:
        report_type: v.report_type || v.title || 'Feedback',
        description: v.description || v.details || v.body || '',
        created_at: v.created_at || v.createdAt || v.time || null, // Firestore Timestamp
        admin_notes: v.admin_notes || v.reply || '',
        // Optional extras (safe to have):
        image_url: v.image_url || null,
        user_email: v.user_email || v.email || '',
        status: v.status || 'open',
        // Hidden source so actions know which collection to update
        __source: source,
      };
    };

    // Listen to legacy "report"
    const unsubscribeReport = onSnapshot(
      query(collection(fs, 'report'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const legacy = snapshot.docs.map((d) => normalizeFeedback(d, d.data() || {}, 'report'));

        // Combine with current error_reports already in state (avoid race by merging after both listeners fire)
        setFeedbacks((prev) => {
          const prevErrorReports = prev.filter((x) => x.__source === 'error_reports');
          // Merge & sort by created_at desc (nulls last)
          const combined = [...legacy, ...prevErrorReports].sort((a, b) => {
            const aMs = a.created_at?.seconds ? a.created_at.seconds * 1000 : -Infinity;
            const bMs = b.created_at?.seconds ? b.created_at.seconds * 1000 : -Infinity;
            return bMs - aMs;
          });
          return combined;
        });
      },
    );

    // Listen to new "error_reports"
    const unsubscribeErrorReports = onSnapshot(
      query(collection(fs, 'error_reports'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const current = snapshot.docs.map((d) => normalizeFeedback(d, d.data() || {}, 'error_reports'));

        setFeedbacks((prev) => {
          const prevReport = prev.filter((x) => x.__source === 'report');
          const combined = [...prevReport, ...current].sort((a, b) => {
            const aMs = a.created_at?.seconds ? a.created_at.seconds * 1000 : -Infinity;
            const bMs = b.created_at?.seconds ? b.created_at.seconds * 1000 : -Infinity;
            return bMs - aMs;
          });
          return combined;
        });
      },
    );

    // Plant identify
    const unsubscribePlantIdentities = onSnapshot(collection(fs, 'plant_identify'), (snapshot) => {
      setPlantIdentities(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUsers();
      unsubscribeMails();
      unsubscribeReport();
      unsubscribeErrorReports();
      unsubscribePlantIdentities();
      unsubscribeFavourites();
    };
  }, []);

  const showToast = (message) => {
    Alert.alert('System Message', message);
  };

  // ==== USERS ====
  const handleDeleteUser = async (userId) => {
    const fs = getFirestore();
    try {
      await deleteDoc(doc(fs, 'account', userId));
      await deleteDoc(doc(fs, 'user', userId));
      showToast('User deleted from database. Note: The user must also be deleted from the Firebase Authentication console to free up the email.');
    } catch (error) {
      showToast(`Error deleting user: ${error.message}`);
    }
  };

  const handleAddNewUser = async (newUser, password) => {
    const fs = getFirestore();
    const tempAppName = `user-creation-${Date.now()}`;
    let tempApp;
    try {
      tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(tempAuth, newUser.details.email, password);
      const user = userCredential.user;
      const firebaseuid = user.uid;

      // Generate new custom user ID (e.g., U001, A001, E001)
      const rolePrefix = newUser.details.role.charAt(0).toUpperCase();
      const userCollectionRef = collection(fs, "user");
      const snapshot = await getDocs(userCollectionRef);
      let maxNumber = 0;
      snapshot.forEach((docSnap) => {
        const id = docSnap.id;
        if (id.startsWith(rolePrefix)) {
            const numberPart = id.substring(1);
            if (numberPart && !isNaN(numberPart)) {
                const number = parseInt(numberPart, 10);
                if (number > maxNumber) {
                    maxNumber = number;
                }
            }
        }
      });
      const newUserId = rolePrefix + (maxNumber + 1).toString().padStart(3, '0');

      // Create 'user' document
      await setDoc(doc(fs, "user", newUserId), {
        user_id: newUserId,
        firebase_uid: firebaseuid,
        full_name: newUser.name,
        email: newUser.details.email,
        password: password, // Storing plain-text password is a security risk.
        role: newUser.details.role.toLowerCase(),
        is_active: newUser.status === 'active',
        created_at: serverTimestamp(),
      });

      // Create 'account' document
      await setDoc(doc(fs, "account", newUserId), {
        ...newUser.details,
        account_id: newUserId,
        user_id: newUserId,
        full_name: newUser.name,
        is_active: newUser.status === 'active',
        created_at: serverTimestamp(),
      });

      showToast('User added successfully!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showToast('Error: This email address is already in use.');
      } else {
        showToast(`Error adding user: ${error.message}`);
      }
      throw error; // rethrow for component handling
    } finally {
      if (tempApp) {
        await deleteApp(tempApp);
      }
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    const fs = getFirestore();
    const userDocRef = doc(fs, 'account', userId);
    try {
      const dataToUpdate = {
        ...updatedData,
        is_active: updatedData.status === 'active',
      };
      delete dataToUpdate.status;
      await updateDoc(userDocRef, dataToUpdate);
      showToast('User updated successfully!');
    } catch (error) {
      showToast(`Error updating user: ${error.message}`);
    }
  };

  const handleToggleUserFavourite = async (userId) => {
    const auth = getAuth();
    const adminUser = auth.currentUser;
    if (!adminUser) {
      showToast("You must be logged in to manage favourites.");
      return;
    }

    const fs = getFirestore();
    const prefRef = doc(fs, 'admin_preferences', adminUser.uid);
    const isCurrentlyFavourite = favouritesRef.current.includes(userId);

    try {
      await setDoc(
        prefRef,
        {
          favourite_users: isCurrentlyFavourite ? arrayRemove(userId) : arrayUnion(userId),
        },
        { merge: true }
      );
    } catch (error) {
      showToast(`Error updating favourites: ${error.message}`);
    }
  };

  // ==== MAILS ====
  const handleDeleteMail = async (mailId) => {
    const fs = getFirestore();
    await deleteDoc(doc(fs, 'notifications', mailId));
    showToast('Mail deleted successfully!');
  };

  const handleReplyMail = async (mailId, replyText) => {
    const fs = getFirestore();
    const mailDocRef = doc(fs, 'notifications', mailId);
    await updateDoc(mailDocRef, { reply: replyText });
    showToast('Reply sent successfully!');
  };

  const handleToggleMailRead = async (mailId, currentStatus) => {
    const fs = getFirestore();
    const mailDocRef = doc(fs, 'notifications', mailId);
    try {
      await updateDoc(mailDocRef, { read: !currentStatus });
      showToast(`Mail marked as ${!currentStatus ? 'read' : 'unread'}.`);
    } catch (error) {
      showToast(`Error updating mail status: ${error.message}`);
    }
  };

  // ==== FEEDBACKS (supports both `report` & `error_reports`) ====
  const handleDeleteFeedback = async (feedbackId) => {
    const fs = getFirestore();
    // find the item to know which collection to delete from
    const item = feedbacks.find((f) => f.id === feedbackId);
    const coll = item?.__source === 'report' ? 'report' : 'error_reports';
    await deleteDoc(doc(fs, coll, feedbackId));
    showToast('Feedback deleted successfully!');
  };

  const handleReplyFeedback = async (feedbackId, replyText) => {
    const fs = getFirestore();
    const item = feedbacks.find((f) => f.id === feedbackId);
    const coll = item?.__source === 'report' ? 'report' : 'error_reports';
    const feedbackDocRef = doc(fs, coll, feedbackId);
    await updateDoc(feedbackDocRef, { admin_notes: replyText });
    showToast('Reply sent successfully!');
  };

  // ==== AUTH ====
  const handleLogout = async (navigation) => {
    const auth = getAuth();
    try {
      await signOut(auth);
      showToast('You have been logged out.');
      navigation.navigate('UserLogin');
    } catch (error) {
      showToast(`Error logging out: ${error.message}`);
    }
  };

  const value = {
    users,
    mails,
    feedbacks,
    plantIdentities,
    toastMessage,
    handleDeleteUser,
    handleAddNewUser,
    handleUpdateUser,
    handleDeleteMail,
    handleReplyMail,
    handleToggleMailRead,
    handleDeleteFeedback,
    handleReplyFeedback,
    handleLogout,
    handleToggleUserFavourite,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
