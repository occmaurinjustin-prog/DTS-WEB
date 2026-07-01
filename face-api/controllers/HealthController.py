from flask import jsonify

class HealthController:
    @staticmethod
    def check_health():
        return jsonify({
            "success": True,
            "message": "Face API is running",
            "status": "ok"
        })
