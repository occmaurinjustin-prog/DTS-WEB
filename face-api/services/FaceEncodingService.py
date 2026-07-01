# import face_recognition  # Removed – using InsightFace
import numpy as np

import insightface
import cv2

class FaceEncodingService:
    @staticmethod
    def get_encodings_from_images(image_paths):
        # Initialize InsightFace model (cached)
        if not hasattr(FaceEncodingService, '_model'):
            FaceEncodingService._model = insightface.app.FaceAnalysis()
            FaceEncodingService._model.prepare(ctx_id=-1)  # CPU
        encodings = []
        for path in image_paths:
            img = cv2.imread(path)
            if img is None:
                continue
            faces = FaceEncodingService._model.get(img)
            if faces:
                # Use the first detected face's embedding
                encodings.append(faces[0].embedding)
        return encodings

    @staticmethod
    def average_encodings(encodings):
        if not encodings:
            return None
        return np.mean(encodings, axis=0)

    @staticmethod
    def serialize_encoding(encoding):
        if encoding is None:
            return None
        return ",".join(str(x) for x in encoding)

    @staticmethod
    def deserialize_encoding(encoding_str):
        if not encoding_str:
            return None
        return np.array([float(x) for x in encoding_str.split(',')])
