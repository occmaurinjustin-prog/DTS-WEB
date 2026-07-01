# import face_recognition  # Removed – using InsightFace
import numpy as np
from services.FaceEncodingService import FaceEncodingService

class FaceVerificationService:
    def verify_face(known_encoding_str, unknown_image_path, tolerance=0.5):
        """Verify an unknown image against a known encoding.
        Returns (True, message) if match within tolerance, else (False, message).
        Tolerance is a distance threshold on the embedding vectors.
        """
        try:
            known_encoding = FaceEncodingService.deserialize_encoding(known_encoding_str)
            if known_encoding is None:
                return False, "Invalid known encoding."
            # Get embedding for unknown image using InsightFace
            unknown_encodings = FaceEncodingService.get_encodings_from_images([unknown_image_path])
            if not unknown_encodings:
                return False, "No face found in the image."
            unknown_encoding = unknown_encodings[0]
            # Compute Cosine Similarity between embeddings
            known_np = np.array(known_encoding)
            unknown_np = np.array(unknown_encoding)
            
            norm_known = np.linalg.norm(known_np)
            norm_unknown = np.linalg.norm(unknown_np)
            
            if norm_known == 0 or norm_unknown == 0:
                return False, "Invalid face embedding norm (0)."
                
            similarity = np.dot(known_np, unknown_np) / (norm_known * norm_unknown)
            
            # InsightFace typical threshold for cosine similarity is ~0.4 - 0.5
            similarity_threshold = 0.4
            
            if similarity >= similarity_threshold:
                return True, f"Face matched successfully. (Sim: {similarity:.2f})"
            else:
                return False, f"Face did not match. Similarity: {similarity:.2f}"
        except Exception as e:
            return False, str(e)
