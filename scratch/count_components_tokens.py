import os
import sys

# Try to import tiktoken
try:
    import tiktoken
    has_tiktoken = True
except ImportError:
    has_tiktoken = False

def count_tokens(text, encoding_name="cl100k_base"):
    if has_tiktoken:
        try:
            encoder = tiktoken.get_encoding(encoding_name)
            return len(encoder.encode(text, disallowed_special=()))
        except Exception as e:
            pass
    # Fallback to characters // 4
    return max(1, len(text) // 4) if text else 0

def main():
    target_dir = r"c:\Users\david\flashcheckout\components"
    if not os.path.exists(target_dir):
        print(f"Error: Directory {target_dir} does not exist.")
        sys.exit(1)
        
    print(f"Analyzing tokens in: {target_dir}")
    print(f"Using tiktoken: {has_tiktoken}")
    if has_tiktoken:
        print("Note: Using cl100k_base encoding.")
    else:
        print("Note: tiktoken not found. Using fallback of approx. 4 characters per token.")
    print("-" * 80)
    
    total_files = 0
    total_chars = 0
    total_tokens = 0
    
    # We want to list details of files sorted by token count
    file_details = []
    
    for root, dirs, files in os.walk(target_dir):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        
        for file in files:
            if file.startswith('.'):
                continue
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, target_dir)
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()
            except Exception as e:
                print(f"Skipping {rel_path} due to error: {e}")
                continue
                
            chars = len(content)
            tokens = count_tokens(content)
            
            file_details.append({
                'rel_path': rel_path,
                'chars': chars,
                'tokens': tokens
            })
            
            total_files += 1
            total_chars += chars
            total_tokens += tokens
            
    # Sort files by token count descending
    file_details.sort(key=lambda x: x['tokens'], reverse=True)
    
    print(f"{'File Path':<50} | {'Characters':<12} | {'Tokens':<10}")
    print("-" * 80)
    for detail in file_details:
        print(f"{detail['rel_path']:<50} | {detail['chars']:<12,} | {detail['tokens']:<10,}")
    print("-" * 80)
    print(f"Total Files:  {total_files}")
    print(f"Total Chars:  {total_chars:,}")
    print(f"Total Tokens: {total_tokens:,}")

if __name__ == "__main__":
    main()
