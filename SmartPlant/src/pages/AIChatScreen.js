import React, { useState, useEffect } from "react";
import { StatusBar } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../config";
import Entypo from '@expo/vector-icons/Entypo';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';




export default function ChatScreen({ navigation }) {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: "1", sender: "ai", text: "Hello! I’m your AI plant assistant 🌱" },
  ]);
  const [input, setInput] = useState("");


  useEffect(() => {
  const newSession = uuidv4();
  setSessionId(newSession);

  return () => {
    Promise.resolve(
      fetch(`${API_URL}/end-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: newSession }),
      })
    ).catch(() => {});
  };
}, []);



  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { id: Date.now().toString() + Math.random(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Clear input
    setInput("");

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },

        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();


      const aiReply = {
        id: Date.now().toString() + Math.random(),
        sender: "ai",
        text: data.reply || data.response || JSON.stringify(data, null, 2),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      const errorMsg = {
        id: Date.now().toString(),
        sender: "ai",
        text: "⚠️ Failed to connect to the AI agent.",
      };
      console.log(error);
      setMessages((prev) => [...prev, errorMsg]);

    }
    setLoading(false);
  };

  const renderMessage = ({ item }) => (

    <View
      style={[
        styles.message,
        item.sender === "user" ? styles.userMsg : styles.aiMsg,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (


    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <StatusBar hidden={true} />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00ff3cff" />
          <Text style={{ color: "white", marginTop: 10 }}>Generating...</Text>
        </View>
      )}
      <View style={styles.topBar}>
        {/* The 'cross' icon acts as a back/close button */}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            fetch(`${API_URL}/end-session`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            }).catch(() => {});
            navigation.goBack();
          }}
        >
          <Entypo name="cross" size={32} color="black" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Plant Assistant Chat</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(87, 140, 91, 0.7)",
    // paddingHorizontal: 15,
    //paddingTop: 25,
  },
  messagesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginHorizontal: 15,
  },
  message: {
    padding: 12,
    borderRadius: 15,
    marginVertical: 6,
    maxWidth: "75%",
  },
  aiMsg: {
    backgroundColor: "#E6F3FF",
    alignSelf: "flex-start",

  },
  userMsg: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",

  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderColor: "#ddd",
    width: "100%",
    padding: 8,
    backgroundColor: "#578C5B",
    paddingBottom: 10
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 8,
    paddingVertical: 11,
  },
  sendButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  sendText: {
    color: "white",
    fontWeight: "bold"
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderColor: "#ddd",
    width: "100%",
    padding: 8,
    backgroundColor: "#fdfdfdff",
    paddingBottom: 10,
    paddingTop: 25,
  },
  topBarTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    textAlign:"center"
  },
});

