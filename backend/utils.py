from io import BytesIO
from PIL import Image

def compress_image(contents: bytes, max_width: int = 1920, quality: int = 80) -> bytes:
    """
    Compress an image from bytes.
    - Converts RGBA/P to RGB.
    - Resizes to max_width while maintaining aspect ratio if it exceeds max_width.
    - Saves as JPEG with specified quality.
    """
    try:
        img = Image.open(BytesIO(contents))
        
        # Convert to RGB to ensure we can save as JPEG
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        # Resize if width is larger than max_width
        if img.width > max_width:
            ratio = max_width / float(img.width)
            new_height = int((float(img.height) * float(ratio)))
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
        # Save compressed image
        output = BytesIO()
        img.save(output, format="JPEG", quality=quality, optimize=True)
        return output.getvalue()
    except Exception as e:
        # If Pillow fails to process (e.g. invalid image format), return original bytes
        print(f"Image compression error: {e}")
        return contents
