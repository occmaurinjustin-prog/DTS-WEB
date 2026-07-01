from flask import request, jsonify, current_app
import os
import uuid
from werkzeug.utils import secure_filename
from services.ImageValidationService import ImageValidationService
from services.FaceVerificationService import FaceVerificationService
from models import FaceRegistration

class VerifyFaceController:
    @staticmethod
    def verify_face():
        filepath = None
        try:
            if 'image' not in request.files:
                return jsonify({"success": False, "message": "No image provided"}), 400
                
            user_id = request.form.get('user_id')
            if not user_id:
                return jsonify({"success": False, "message": "User ID is required"}), 400
                
            file = request.files['image']
            if file.filename == '':
                return jsonify({"success": False, "message": "Empty file"}), 400
                
            registration = FaceRegistration.query.filter_by(user_id=user_id).first()
            if not registration:
                return jsonify({"success": False, "message": "User face is not registered"}), 404
                
            filename = secure_filename(f"verify_{user_id}_{uuid.uuid4().hex}.jpg")
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Basic validation
            is_valid, msg = ImageValidationService.validate_image(filepath)
            if not is_valid:
                os.remove(filepath)
                return jsonify({"success": False, "message": msg}), 400
                
            # Verification
            match, msg = FaceVerificationService.verify_face(registration.face_encoding, filepath)
            
            os.remove(filepath)
            
            if match:
                return jsonify({
                    "success": True,
                    "message": "Face matched successfully"
                })
            else:
                return jsonify({
                    "success": False,
                    "message": msg
                }), 401
                
        except Exception as e:
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"success": False, "message": str(e)}), 500
