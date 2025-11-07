import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Button } from 'react-native';
import { BackIcon, TrashIcon } from '../Icons';
import { useAdminContext } from '../AdminContext';

const MailDetailScreen = ({ route, navigation }) => {
    const { mail } = route.params;
    const { users, handleDeleteMail, handleReplyMail, handleToggleMailRead } = useAdminContext();
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        if (mail && !mail.read) {
            handleToggleMailRead(mail.id, mail.read);
        }
    }, [mail?.id]);

    const sender = users.find(u => u.id === mail.userId);
    const senderName = sender ? sender.name : 'System';
    const mailDate = mail.createdAt && mail.createdAt.seconds ? new Date(mail.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';

    const onDelete = () => {
        handleDeleteMail(mail.id);
        navigation.goBack();
    };

    const onReply = () => {
        handleReplyMail(mail.id, replyText);
        setReplyText('');
    };

    if (!mail) {
        return (
            <View style={styles.container}>
                <Text>Mail not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.outerContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackIcon color="#3C3633" />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                    <TrashIcon color="#ef4444" />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.subject}>{mail.title}</Text>
                <View style={styles.fromContainer}>
                    <View style={styles.fromAvatar} />
                    <View style={styles.fromInfo}>
                        <Text style={styles.fromName}>{senderName}</Text>
                    </View>
                    <Text style={styles.date}>{mailDate}</Text>
                </View>
                <Text style={styles.body}>{mail.message}</Text>
                {mail.reply &&
                    <View style={styles.replyContainer}>
                        <Text style={styles.replyTitle}>Your Reply:</Text>
                        <Text style={styles.replyBody}>{mail.reply}</Text>
                    </View>
                }
            </ScrollView>
            <View style={styles.replyInputContainer}>
                <TextInput
                    style={styles.replyInput}
                    placeholder="Type your reply..."
                    value={replyText}
                    onChangeText={setReplyText}
                />
                <Button title="Send" onPress={onReply} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#FFFBF5',
    },
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    actionButton: {
        padding: 8,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    subject: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3C3633',
        marginBottom: 16,
    },
    fromContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    fromAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
        marginRight: 16,
    },
    fromInfo: {
        flex: 1,
    },
    fromName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    date: {
        fontSize: 14,
        color: '#75685a',
    },
    body: {
        marginTop: 20,
        color: '#3C3633',
        fontSize: 16,
        lineHeight: 24,
    },
    replyButtonContainer: {
        padding: 16,
    },
    replyButton: {
        width: '100%',
        backgroundColor: '#A59480',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    replyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    replyInputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#FFFBF5',
        alignItems: 'center',
    },
    replyInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        marginRight: 8,
        backgroundColor: 'white',
    },
    replyContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
    },
    replyTitle: {
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 8,
    },
    replyBody: {
        color: '#15803d',
        lineHeight: 22,
    },
});

export default MailDetailScreen;
