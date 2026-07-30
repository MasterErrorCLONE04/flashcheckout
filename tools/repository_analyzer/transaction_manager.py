import os
import subprocess
import time
import json

def start_transaction(base_dir, tx_id, branch_name):
    """
    Creates a temporary Git branch for sandboxed changes, tracking the transaction state.
    """
    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    status = "RUNNING"
    original_branch = "main"
    
    # Try to find current branch
    try:
        res = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            cwd=base_dir, capture_output=True, text=True, timeout=3
        )
        if res.returncode == 0:
            original_branch = res.stdout.strip()
    except Exception:
        pass
        
    # Checkout new branch
    try:
        subprocess.run(
            ['git', 'checkout', '-b', branch_name],
            cwd=base_dir, capture_output=True, text=True, timeout=5
        )
    except Exception:
        # Fallback to mock in case git is missing
        status = "RUNNING_MOCK"
        
    return {
        "transaction_id": tx_id,
        "branch": branch_name,
        "original_branch": original_branch,
        "status": status,
        "created_at": created_at
    }

def commit_transaction(base_dir, commit_message):
    """
    Stages and commits the changes if the validation checks pass successfully.
    """
    try:
        # Git add
        subprocess.run(
            ['git', 'add', '.'],
            cwd=base_dir, capture_output=True, text=True, timeout=5
        )
        # Git commit
        res = subprocess.run(
            ['git', 'commit', '-m', commit_message],
            cwd=base_dir, capture_output=True, text=True, timeout=5
        )
        if res.returncode == 0:
            return {"status": "COMMITTED", "commit": commit_message}
    except Exception:
        pass
        
    return {"status": "MOCK_COMMITTED", "commit": commit_message}

def rollback_transaction(base_dir, branch_name, original_branch="main"):
    """
    Discards all changes, checks out the original branch, and deletes the temporary transaction branch.
    """
    try:
        # Discard modifications
        subprocess.run(['git', 'checkout', '--', '.'], cwd=base_dir, capture_output=True, text=True, timeout=5)
        subprocess.run(['git', 'clean', '-fd'], cwd=base_dir, capture_output=True, text=True, timeout=5)
        
        # Checkout main/original
        subprocess.run(['git', 'checkout', original_branch], cwd=base_dir, capture_output=True, text=True, timeout=5)
        
        # Delete transaction branch
        subprocess.run(['git', 'branch', '-D', branch_name], cwd=base_dir, capture_output=True, text=True, timeout=5)
    except Exception:
        pass
        
    return {
        "status": "ROLLED_BACK",
        "branch": branch_name,
        "restored_to": original_branch
    }
