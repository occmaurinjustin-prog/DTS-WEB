# import face_recognition  # Removed – not needed with InsightFace
import cv2

class ImageValidationService:
    @staticmethod
    def validate_image(image_path):
        """Simple validation that ensures the file is a readable image.
        Returns (True, "Image is valid.") or (False, error_message)."""
        try:
            img = cv2.imread(image_path)
            if img is None:
                return False, "Unable to read image file."
            # Optional: check size
            if img.shape[0] < 50 or img.shape[1] < 50:
                return False, "Image too small for face processing."
            return True, "Image is valid."
        except Exception as e:
            return False, f"Error validating image: {str(e)}"
