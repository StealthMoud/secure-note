import subprocess
import os
import random

def run_command(cmd):
    try:
        subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError:
        return False

def get_files():
    # Modified files
    modified = subprocess.check_output("git diff --name-only", shell=True).decode().splitlines()
    # Staged files
    staged = subprocess.check_output("git diff --name-only --cached", shell=True).decode().splitlines()
    # Untracked files
    untracked = subprocess.check_output("git ls-files --others --exclude-standard", shell=True).decode().splitlines()
    
    # Combine and de-duplicate
    all_files = list(set(modified + staged + untracked))
    return sorted(all_files)

def generate_message(filename):
    basename = os.path.basename(filename)
    name = os.path.splitext(basename)[0]
    
    actions = [
        "udpate", "fixx", "addd", "modidy", "tweak", "refactore", "chang", "impove", "corrct", "ajdust"
    ]
    
    contexts = [
        "login", "auth", "stlye", "functino", "compnent", "hook", "util", "api", "bakcend", "fronteend"
    ]
    
    action = random.choice(actions)
    
    # mix of simple messages
    templates = [
        f"{action} {name}",
        f"{action} {name} file",
        f"{action} logic for {name}",
        f"{action} in {name}",
        f"make {name} better",
        f"small {action} on {name}",
        f"wip {name} {action}",
        f"{name} {action}",
    ]
    
    return random.choice(templates).lower()

def main():
    files = get_files()
    print(f"Found {len(files)} files to commit.")
    
    count = 0
    for file in files:
        if not file.strip(): continue
        # git add
        if not run_command(f"git add '{file}'"):
            print(f"Failed to add {file}")
            continue
            
        # generate message
        msg = generate_message(file)
        
        # git commit
        if run_command(f"git commit -m '{msg}'"):
            print(f"Committed {file}: {msg}")
            count += 1
        else:
            print(f"Failed to commit {file}")
            
    print(f"Successfully committed {count} files.")

if __name__ == "__main__":
    main()
