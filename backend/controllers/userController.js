const { admin } = require("../firebase/firebaseConfig");

const deleteUser = async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).json({ error: "User UID is required." });
  }

  try {
    await admin.auth().deleteUser(uid);
    res.status(200).json({ message: `Successfully deleted user ${uid}` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user.", details: error.message });
  }
};

module.exports = { deleteUser };
