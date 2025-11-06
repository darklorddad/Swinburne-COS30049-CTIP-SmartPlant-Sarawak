import firebase_admin
from firebase_admin import credentials, firestore

# IMPORTANT: Replace with the actual path to your service account key file.
CRED_PATH = 'your-service-account-key-file.json'

try:
    cred = credentials.Certificate(CRED_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    print('--- Firestore Schema ---')
    collections = db.collections()

    for collection in collections:
        print(f'\nCollection: {collection.id}')
        docs = collection.limit(1).stream()
        
        try:
            doc = next(docs)
            print(f'  Sample Document (ID: {doc.id}):')
            data = doc.to_dict()
            for key, value in data.items():
                print(f'    - {key}: ({type(value).__name__})')
        except StopIteration:
            print('  -> No documents found.')

except Exception as e:
    print(f'An error occurred: {e}')
