// firebase/notification_user/updateNotificationPayload.js
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

export async function updateNotificationPayload(notiId, { imageURL, top_1, top_2, top_3 }) {
  const ref = doc(db, "notifications", notiId);
  const update = {};
  if (imageURL) update["payload.imageURL"] = imageURL;
  if (top_1)    update["payload.model_predictions.top_1"] = top_1;
  if (top_2)    update["payload.model_predictions.top_2"] = top_2;
  if (top_3)    update["payload.model_predictions.top_3"] = top_3;
  await updateDoc(ref, update);
}
