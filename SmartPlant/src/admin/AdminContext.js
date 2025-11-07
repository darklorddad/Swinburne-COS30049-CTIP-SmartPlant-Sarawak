import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase/FirebaseConfig';
import { Alert } from 'react-native';
import { getFirestore, collection, onSnapshot, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';


const AdminContext = createContext();

export const useAdminContext = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [mails, setMails] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [plantIdentities, setPlantIdentities] = useState([]);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const db = getFirestore();
        const unsubscribeUsers = onSnapshot(collection(db, "account"), (snapshot) => {
            const usersData = snapshot.docs.map((doc, index) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.full_name || "Unnamed User",
                    status: data.is_active ? 'active' : 'inactive',
                    favourite: false, // Default value
                    color: ['#fca5a5', '#16a34a', '#a3e635', '#fef08a', '#c084fc', '#60a5fa', '#f9a8d4'][index % 7],
                    details: {
                        ...data, 
                        role: data.role,
                        email: data.email,
                        contact: data.phone_number || 'N/A',
                        address: data.address || 'N/A',
                        gender: data.gender || 'N/A',
                        age: data.date_of_birth ? new Date().getFullYear() - new Date(data.date_of_birth).getFullYear() : 'N/A',
                        plantId: data.plantId || 0
                    }
                };
            });
            setUsers(usersData);
        });

        const unsubscribeMails = onSnapshot(collection(db, "notifications"), (snapshot) => {
            setMails(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubscribeFeedbacks = onSnapshot(collection(db, "report"), (snapshot) => {
            setFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubscribePlantIdentities = onSnapshot(collection(db, "plant_identify"), (snapshot) => {
            setPlantIdentities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribeUsers();
            unsubscribeMails();
            unsubscribeFeedbacks();
            unsubscribePlantIdentities();
        };
    }, []);

    const showToast = (message) => {
        Alert.alert("System Message", message);
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteDoc(doc(db, "account", userId));
            showToast("User deleted successfully!");
        } catch (error) {
            showToast(`Error deleting user: ${error.message}`);
        }
    };

    const handleAddNewUser = async (newUser, password) => {
        const auth = getAuth();
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.details.email, password);
            const user = userCredential.user;

            // Save user details in Firestore
            await setDoc(doc(db, "account", user.uid), {
                ...newUser.details,
                full_name: newUser.name, 
                is_active: newUser.status === 'active',
                user_id: user.uid,
            });

            showToast("User added successfully!");
        } catch (error) {
            // Use a more specific error message if possible
            if (error.code === 'auth/email-already-in-use') {
                showToast('Error: This email address is already in use.');
            } else {
                showToast(`Error adding user: ${error.message}`);
            }
            throw error; // Re-throw the error to be caught in the component
        }
    };

    const handleUpdateUser = async (userId, updatedData) => {
        const userDocRef = doc(db, "account", userId);
        try {
            // The 'status' field comes in as 'active'/'inactive'
            // We convert it to a boolean for Firestore
            const dataToUpdate = {
                ...updatedData,
                is_active: updatedData.status === 'active',
            };
            
            // We don't want to save the 'status' string in Firestore, just the boolean
            delete dataToUpdate.status;
            
            await updateDoc(userDocRef, dataToUpdate);
            showToast("User updated successfully!");
        } catch (error) {
            showToast(`Error updating user: ${error.message}`);
        }
    };

    const handleDeleteMail = async (mailId) => {
        await deleteDoc(doc(db, "notifications", mailId));
        showToast("Mail deleted successfully!");
    };

    const handleReplyMail = async (mailId, replyText) => {
        const mailDocRef = doc(db, "notifications", mailId);
        await updateDoc(mailDocRef, { reply: replyText });
        showToast("Reply sent successfully!");
    };

    const handleDeleteFeedback = async (feedbackId) => {
        await deleteDoc(doc(db, "report", feedbackId));
        showToast("Feedback deleted successfully!");
    };

    const handleReplyFeedback = async (feedbackId, replyText) => {
        const feedbackDocRef = doc(db, "report", feedbackId);
        await updateDoc(feedbackDocRef, { admin_notes: replyText });
        showToast("Reply sent successfully!");
    };

    const handleLogout = async (navigation) => {
        const auth = getAuth();
        try {
            await signOut(auth);
            showToast("You have been logged out.");
            navigation.navigate("UserLogin");
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
        handleDeleteFeedback,
        handleReplyFeedback,
        handleLogout,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};