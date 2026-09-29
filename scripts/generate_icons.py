import os
from PIL import Image

SRC_IMG = r"C:\Users\sparl\.gemini\antigravity-ide\brain\ecf59172-9809-45d9-964a-705544e73604\operaviva_app_icon_1790600054082.jpg"
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def generate():
    im = Image.open(SRC_IMG).convert("RGBA")
    
    # 1. Create build directory
    build_dir = os.path.join(ROOT_DIR, "build")
    os.makedirs(build_dir, exist_ok=True)
    
    # 2. build/icon.png (512x512) and (1024x1024)
    icon_512 = im.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(os.path.join(build_dir, "icon.png"), format="PNG")
    
    # 3. build/icon.ico (standard multi-size Windows icon)
    ico_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    icon_512.save(
        os.path.join(build_dir, "icon.ico"),
        format="ICO",
        sizes=ico_sizes
    )
    print("Saved build/icon.ico and build/icon.png")

    # 4. Web Public folder
    public_dir = os.path.join(ROOT_DIR, "public")
    os.makedirs(public_dir, exist_ok=True)
    
    icon_512.save(
        os.path.join(public_dir, "favicon.ico"),
        format="ICO",
        sizes=[(64, 64), (32, 32), (16, 16)]
    )
    icon_512.save(os.path.join(public_dir, "icon-512.png"), format="PNG")
    
    icon_192 = im.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(public_dir, "icon-192.png"), format="PNG")
    
    icon_32 = im.resize((32, 32), Image.Resampling.LANCZOS)
    icon_32.save(os.path.join(public_dir, "favicon.png"), format="PNG")
    print("Saved public/ favicon and icons")

    # 5. Android mipmaps
    res_dir = os.path.join(ROOT_DIR, "android", "app", "src", "main", "res")
    android_sizes = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }
    
    for folder, (sz, fsz) in android_sizes.items():
        folder_path = os.path.join(res_dir, folder)
        if os.path.exists(folder_path):
            img_sz = im.resize((sz, sz), Image.Resampling.LANCZOS)
            img_sz.save(os.path.join(folder_path, "ic_launcher.png"), format="PNG")
            img_sz.save(os.path.join(folder_path, "ic_launcher_round.png"), format="PNG")
            
            img_fsz = im.resize((fsz, fsz), Image.Resampling.LANCZOS)
            img_fsz.save(os.path.join(folder_path, "ic_launcher_foreground.png"), format="PNG")
            print(f"Updated Android {folder}")

if __name__ == "__main__":
    generate()
