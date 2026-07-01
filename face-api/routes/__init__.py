from flask import Blueprint
from controllers.RegisterFaceController import RegisterFaceController
from controllers.VerifyFaceController import VerifyFaceController
from controllers.HealthController import HealthController

def register_routes(app):
    api = Blueprint('api', __name__)
    
    api.route('/register-face', methods=['POST'])(RegisterFaceController.register_face)
    api.route('/verify-face', methods=['POST'])(VerifyFaceController.verify_face)
    api.route('/health', methods=['GET'])(HealthController.check_health)
    
    app.register_blueprint(api, url_prefix='/api')
