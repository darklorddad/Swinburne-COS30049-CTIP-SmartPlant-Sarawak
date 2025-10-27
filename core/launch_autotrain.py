import uvicorn
import sys
import os

if __name__ == "__main__":
    # This script expects one argument: the path to the directory *containing* the 'autotrain' package.
    if len(sys.argv) != 2:
        print("Usage: python launch_autotrain.py <path_to_autotrain_parent_dir>", file=sys.stderr)
        sys.exit(1)

    autotrain_parent_dir = sys.argv[1]
    
    if not os.path.isdir(autotrain_parent_dir):
        print(f"Error: Provided path is not a valid directory: {autotrain_parent_dir}", file=sys.stderr)
        sys.exit(1)

    # Add the parent directory of the 'autotrain' package to the Python path.
    sys.path.insert(0, autotrain_parent_dir)

    try:
        from autotrain.app.app import app
    except ImportError:
        print("Error: Could not import 'autotrain.app.app'.", file=sys.stderr)
        print(f"Please ensure that the 'autotrain' package is located inside '{autotrain_parent_dir}'.", file=sys.stderr)
        sys.exit(1)
        
    uvicorn.run(app, host="localhost", port=7861)
