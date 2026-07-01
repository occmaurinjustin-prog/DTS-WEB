from flask import Blueprint, request, jsonify, current_app
import os
import uuid
from werkzeug.utils import secure_filename
from services.ImageValidationService import ImageValidationService
from services.FaceEncodingService import FaceEncodingService
from models import FaceRegistration
from database import db

class RegisterFaceController:
    @staticmethod
    def register_face():
        try:
            if 'images[]' not in request.files:
                return jsonify({"success": False, "message": "No images provided"}), 400
                
            user_id = request.form.get('user_id')
            if not user_id:
                return jsonify({"success": False, "message": "User ID is required"}), 400
                
            files = request.files.getlist('images[]')
            
            if len(files) != 10:
                return jsonify({"success": False, "message": f"Exactly 10 images are required. Received {len(files)}"}), 400
                
            saved_paths = []
            
            # Save files and validate
            for file in files:
                if file.filename == '':
                    continue
                filename = secure_filename(f"{user_id}_{uuid.uuid4().hex}.jpg")
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                # Validate image
                is_valid, msg = ImageValidationService.validate_image(filepath)
                if not is_valid:
                    # Clean up
                    for p in saved_paths:
                        if os.path.exists(p):
                            os.remove(p)
                    os.remove(filepath)
                    return jsonify({"success": False, "message": f"Validation failed for one image: {msg}"}), 400
                    
                saved_paths.append(filepath)
                
            # Process encodings
            encodings = FaceEncodingService.get_encodings_from_images(saved_paths)
            
            if len(encodings) < len(saved_paths):
                # Clean up
                for p in saved_paths:
                    if os.path.exists(p):
                        os.remove(p)
                return jsonify({"success": False, "message": "Could not extract face encodings from all images."}), 400
                
            avg_encoding = FaceEncodingService.average_encodings(encodings)
            serialized_encoding = FaceEncodingService.serialize_encoding(avg_encoding)
            
            # Delete existing registration if exists
            existing = FaceRegistration.query.filter_by(user_id=user_id).first()
            if existing:
                existing.face_encoding = serialized_encoding
            else:
                new_reg = FaceRegistration(user_id=user_id, face_encoding=serialized_encoding)
                db.session.add(new_reg)
                
            db.session.commit()
            
            # Clean up uploaded files as we only need the encoding
            for p in saved_paths:
                if os.path.exists(p):
                    os.remove(p)
                    
            return jsonify({
                "success": True,
                "message": "Face Registered"
            })
            
        except Exception as e:
            return jsonify({"success": False, "message": str(e)}), 500
