import uvicorn
import sys
import os

if __name__ == "__main__":
    if len(sys.argv) > 1:
        autotrain_path = sys.argv[1]
        if os.path.isdir(autotrain_path):
            sys.path.insert(0, autotrain_path)

    from autotrain.app.app import app
    uvicorn.run(app, host="localhost", port=7861)
