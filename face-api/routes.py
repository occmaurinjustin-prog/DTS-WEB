import os
import io
import json
from flask import request, jsonify, current_app
import insightface
import cv2
import numpy as np



# Initialize InsightFace model (run once per process)
model = insightface.app.FaceAnalysis()
model.prepare(ctx_id=0, det_size=(640, 640))

    @app.route('/api/register-face', methods=['POST'])
    def register_face():
        # ----- Validate input -----
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id missing'}), 400

        # Retrieve uploaded images (field name: images[])
        images = request.files.getlist('images[]')
        if not images:
            return jsonify({'error': 'no images supplied'}), 400

        encodings = []
        for img in images:
            if img.mimetype not in ('image/jpeg', 'image/png'):
                return jsonify({'error': f'unsupported mime {img.mimetype}'}), 415
            # Convert uploaded bytes to OpenCV image (BGR)
            img_array = np.frombuffer(img_bytes, np.uint8)
            np_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            # Detect faces and get embedding using InsightFace
            faces = model.get(np_img)
            if not faces:
                return jsonify({'error': 'no face detected in one of the images'}), 400
            encodings.append(faces[0].embedding.tolist())

        # Persist encodings (simple JSON per user)
        upload_dir = current_app.config.get('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads'))
        os.makedirs(upload_dir, exist_ok=True)
        user_file = os.path.join(upload_dir, f"{user_id}.json")
        with open(user_file, 'w') as f:
            json.dump({'encodings': encodings}, f)

        return jsonify({'message': f'user {user_id} registered successfully'}), 200
